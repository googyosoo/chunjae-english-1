/**
 * 심인고등학교 Google 계정 인증 및 권한 타입 정의
 * 보안 정책: @simin.hs.kr 도메인 소속 학생 및 교사만 인가
 * 역할 분리: Firestore의 teachers 컬렉션에 등록된 UID만 교사 권한 취득
 */

export type UserRole = 'student' | 'teacher';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  grade: number; // e.g. 1
  classNumber: number; // e.g. 3
  studentNumber: number; // e.g. 15
  domain: string;
  photoURL?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: UserProfile | null;
  errorMessage: string | null;
  loading: boolean;
}

export const ALLOWED_EMAIL_DOMAIN = 'simin.hs.kr';
export const SCHOOL_NAME = '심인고등학교';
