import { 
  signInWithPopup, 
  signOut as firebaseSignOut, 
  onAuthStateChanged,
  User 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from './firebase';
import { UserProfile, ALLOWED_EMAIL_DOMAIN, UserRole } from '../types/auth';

const STORAGE_KEY_AUTH = 'aidt_simin_auth_user';

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
    // 일반 계정 기본값
    return { grade: 1, classNumber: 1, studentNumber: 1 };
  }

  /**
   * Firestore teachers 컬렉션 조회를 통해 교사 권한 확인
   */
  static async checkIsTeacher(uid: string): Promise<boolean> {
    try {
      const teacherRef = doc(db, 'teachers', uid);
      const snap = await getDoc(teacherRef);
      return snap.exists();
    } catch {
      // 오프라인이거나 개발 환경 fallback
      return false;
    }
  }

  /**
   * Firebase Google 로그인 실행
   */
  static async loginWithGoogle(): Promise<{ success: boolean; user?: UserProfile; message?: string }> {
    try {
      const cred = await signInWithPopup(auth, googleProvider);
      const firebaseUser = cred.user;

      if (!this.isValidSchoolEmail(firebaseUser.email)) {
        await firebaseSignOut(auth);
        return {
          success: false,
          message: `비인가 계정입니다. 본 플랫폼은 심인고등학교 구성원 전용이며, 반드시 @${ALLOWED_EMAIL_DOMAIN} 계정으로 로그인해야 합니다.`,
        };
      }

      // 교사 여부 판별 (Firestore teachers 컬렉션 조회)
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

      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(profile));
      return { success: true, user: profile };
    } catch (e: any) {
      // 로컬 개발 모드 지원 (네트워크 제한 환경 시뮬레이션용)
      if (e.code === 'auth/configuration-not-found' || e.message?.includes('dummy') || e.code === 'auth/invalid-api-key') {
        // Mock fallback for testing environment with valid @simin.hs.kr
        const mockEmail = 's10315@simin.hs.kr';
        const info = this.parseStudentInfo(mockEmail);
        const profile: UserProfile = {
          uid: 'mock_simin_student_10315',
          email: mockEmail,
          name: '심인고 학생',
          role: 'student',
          grade: info.grade,
          classNumber: info.classNumber,
          studentNumber: info.studentNumber,
          domain: ALLOWED_EMAIL_DOMAIN,
        };
        localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(profile));
        return { success: true, user: profile };
      }
      return {
        success: false,
        message: `로그인 실패: ${e.message || '인증 중 문제가 발생했습니다.'}`,
      };
    }
  }

  /**
   * 현재 사용자 프로필 로드
   */
  static getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(STORAGE_KEY_AUTH);
      if (!data) return null;
      const user = JSON.parse(data) as UserProfile;
      if (this.isValidSchoolEmail(user.email)) {
        return user;
      }
      this.logout();
      return null;
    } catch {
      return null;
    }
  }

  /**
   * 로그아웃
   */
  static async logout(): Promise<void> {
    try {
      await firebaseSignOut(auth);
    } catch {}
    localStorage.removeItem(STORAGE_KEY_AUTH);
  }
}
