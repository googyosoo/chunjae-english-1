import admin from 'firebase-admin';

// Initialize firebase-admin only once
if (!admin.apps.length) {
  // If FIREBASE_SERVICE_ACCOUNT or GOOGLE_APPLICATION_CREDENTIALS exists in environment
  const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
  if (serviceAccountJson) {
    try {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      });
    } catch {
      admin.initializeApp();
    }
  } else {
    admin.initializeApp();
  }
}

// In-memory rate limiting cache for daily limits per user (student)
// Format: Map<uid, { count: number; date: string }>
const dailyCallLimits = new Map<string, { count: number; date: string }>();
const MAX_CALLS_PER_DAY = 50;

export interface AuthenticatedUser {
  uid: string;
  email: string;
  name?: string;
  role: 'student' | 'teacher';
}

export async function verifyAuthToken(req: any): Promise<AuthenticatedUser> {
  const authHeader = req.headers.authorization || req.headers.Authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('인증 토큰(Bearer Token)이 누락되었습니다.');
  }

  const idToken = authHeader.split('Bearer ')[1].trim();

  // Verify Firebase ID Token
  const decodedToken = await admin.auth().verifyIdToken(idToken);

  // 1. Check school email domain: @simin.hs.kr
  const email = decodedToken.email;
  if (!email || !email.endsWith('@simin.hs.kr')) {
    throw new Error('심인고등학교 공식 도메인(@simin.hs.kr) 계정만 접근할 수 있습니다.');
  }

  // 2. Check email_verified
  if (!decodedToken.email_verified) {
    throw new Error('이메일 인증이 완료되지 않은 계정입니다.');
  }

  // 3. Determine role via Firestore teachers collection
  let role: 'student' | 'teacher' = 'student';
  try {
    const teacherDoc = await admin.firestore().collection('teachers').doc(decodedToken.uid).get();
    if (teacherDoc.exists) {
      role = 'teacher';
    }
  } catch {
    // Default to student if firestore lookup fails
  }

  // 4. Rate Limiting for students (Firestore usage/{uid}_{date} 영구 이전)
  if (role === 'student') {
    const today = new Date().toISOString().split('T')[0];
    const usageDocId = `${decodedToken.uid}_${today}`;
    const usageRef = admin.firestore().collection('usage').doc(usageDocId);

    try {
      await admin.firestore().runTransaction(async (transaction) => {
        const doc = await transaction.get(usageRef);
        if (doc.exists) {
          const currentCount = doc.data()?.count || 0;
          if (currentCount >= MAX_CALLS_PER_DAY) {
            throw new Error(`일일 AI 호출 한도(${MAX_CALLS_PER_DAY}회)를 초과했습니다. 내일 다시 이용해주세요.`);
          }
          transaction.update(usageRef, {
            count: admin.firestore.FieldValue.increment(1),
            lastCallAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        } else {
          transaction.set(usageRef, {
            uid: decodedToken.uid,
            date: today,
            count: 1,
            lastCallAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        }
      });
    } catch (err: any) {
      if (err.message?.includes('일일 AI 호출 한도')) {
        throw err;
      }
      // Firestore 에뮬레이터 또는 네트워크 불가 시 인메모리 fallback
      const userLimit = dailyCallLimits.get(decodedToken.uid);
      if (userLimit && userLimit.date === today) {
        if (userLimit.count >= MAX_CALLS_PER_DAY) {
          throw new Error(`일일 AI 호출 한도(${MAX_CALLS_PER_DAY}회)를 초과했습니다. 내일 다시 이용해주세요.`);
        }
        userLimit.count += 1;
      } else {
        dailyCallLimits.set(decodedToken.uid, { count: 1, date: today });
      }
    }
  }

  return {
    uid: decodedToken.uid,
    email,
    name: decodedToken.name,
    role,
  };
}
