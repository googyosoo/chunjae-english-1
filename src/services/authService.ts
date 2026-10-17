import type { User } from 'firebase/auth';
import { getFirebase, isFirebaseConfigured } from './firebase';
import { UserProfile, ALLOWED_EMAIL_DOMAIN, UserRole } from '../types/auth';

export class AuthService {
  /**
   * 이메일 도메인이 @simin.hs.kr 인지 검증
   */
  static isValidSchoolEmail(email: string | null | undefined): boolean {
    if (!email) return false;
    const parts = email.trim().toLowerCase().split('@');
    return parts.length === 2 && parts[1] === ALLOWED_EMAIL_DOMAIN;
  }

  /**
   * 학생 이메일에서 학년/반/번호 동적 파싱 (예: s10315 -> 1학년 3반 15번)
   */
  static parseStudentInfo(email: string): { grade: number; classNumber: number; studentNumber: number } {
    const username = email.split('@')[0].toLowerCase();
    const match = username.match(/^s?([1-3])([0-1][0-9])([0-9]{2})$/);
    if (match) {
      return {
        grade: parseInt(match[1], 10),
        classNumber: parseInt(match[2], 10),
        studentNumber: parseInt(match[3], 10),
      };
    }
    return { grade: 1, classNumber: 1, studentNumber: 1 };
  }

  /**
   * Firestore teachers 컬렉션을 매번 직접 조회하여 교사 권한 확인 (localStorage 신뢰 금지)
   */
  static async checkIsTeacher(uid: string): Promise<boolean> {
    try {
      const { db } = await getFirebase();
      const { doc, getDoc } = await import('firebase/firestore');
      const teacherRef = doc(db, 'teachers', uid);
      const snap = await getDoc(teacherRef);
      return snap.exists();
    } catch {
      return false;
    }
  }

  /**
   * Firebase Google 로그인 실행 (Mock 우회 코드 완전 제거)
   */
  static async loginWithGoogle(): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    if (!isFirebaseConfigured()) {
      return {
        success: false,
        message: 'Firebase 환경 설정이 완료되지 않았습니다. .env 설정(.env.example 참조)을 확인해주세요.',
      };
    }

    try {
      const { auth, googleProvider } = await getFirebase();
      const { signInWithPopup, signOut } = await import('firebase/auth');

      const cred = await signInWithPopup(auth, googleProvider);
      const firebaseUser = cred.user;

      if (!this.isValidSchoolEmail(firebaseUser.email)) {
        await signOut(auth);
        return {
          success: false,
          message: `비인가 계정입니다. 심인고등학교 공식 도메인(@${ALLOWED_EMAIL_DOMAIN}) 계정으로만 로그인할 수 있습니다.`,
        };
      }

      // Firestore teachers 컬렉션을 실시간 조회하여 교사 권한 확인
      const isTeacher = await this.checkIsTeacher(firebaseUser.uid);
      const role: UserRole = isTeacher ? 'teacher' : 'student';
      const info = this.parseStudentInfo(firebaseUser.email!);

      const profile: UserProfile = {
        uid: firebaseUser.uid,
        email: firebaseUser.email!.trim().toLowerCase(),
        name: firebaseUser.displayName || '심인고 학생',
        role: role,
        grade: info.grade,
        classNumber: info.classNumber,
        studentNumber: info.studentNumber,
        domain: ALLOWED_EMAIL_DOMAIN,
        photoURL: firebaseUser.photoURL || undefined,
      };

      return { success: true, user: profile };
    } catch (e: any) {
      return {
        success: false,
        message: `로그인 실패: ${e.message || '인증 중 문제가 발생했습니다.'}`,
      };
    }
  }

  /**
   * Firebase 세션 기반 실시간 인증 상태 구독 (onAuthStateChanged)
   * localStorage의 role을 신뢰하지 않고, 세션 발생 시마다 매번 Firestore teachers 컬렉션을 조회하여 프로필을 생성함
   */
  static async subscribeAuthState(
    onUserChange: (user: UserProfile | null) => void,
    onError?: (err: Error) => void
  ): Promise<() => void> {
    if (!isFirebaseConfigured()) {
      onUserChange(null);
      if (onError) onError(new Error('Firebase 설정이 누락되었습니다.'));
      return () => {};
    }

    try {
      const { auth } = await getFirebase();
      const { onAuthStateChanged, signOut } = await import('firebase/auth');

      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser: User | null) => {
          if (!firebaseUser) {
            onUserChange(null);
            return;
          }

          if (!this.isValidSchoolEmail(firebaseUser.email)) {
            await signOut(auth);
            onUserChange(null);
            return;
          }

          // 세션 복원 시에도 Firestore teachers 컬렉션을 매번 새로 조회
          const isTeacher = await this.checkIsTeacher(firebaseUser.uid);
          const role: UserRole = isTeacher ? 'teacher' : 'student';
          const info = this.parseStudentInfo(firebaseUser.email!);

          const profile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email!.trim().toLowerCase(),
            name: firebaseUser.displayName || '심인고 구성원',
            role: role,
            grade: info.grade,
            classNumber: info.classNumber,
            studentNumber: info.studentNumber,
            domain: ALLOWED_EMAIL_DOMAIN,
            photoURL: firebaseUser.photoURL || undefined,
          };

          onUserChange(profile);
        },
        (error) => {
          if (onError) onError(error);
        }
      );

      return unsubscribe;
    } catch (err: any) {
      if (onError) onError(err);
      return () => {};
    }
  }

  /**
   * 백엔드 API 호출을 위한 Firebase ID 토큰 획득
   */
  static async getIdToken(): Promise<string | null> {
    if (!isFirebaseConfigured()) return null;
    try {
      const { auth } = await getFirebase();
      const user = auth.currentUser;
      if (!user) return null;
      return await user.getIdToken();
    } catch {
      return null;
    }
  }

  /**
   * 로그아웃
   */
  static async logout(): Promise<void> {
    if (!isFirebaseConfigured()) return;
    try {
      const { auth } = await getFirebase();
      const { signOut } = await import('firebase/auth');
      await signOut(auth);
    } catch {}
  }
}
