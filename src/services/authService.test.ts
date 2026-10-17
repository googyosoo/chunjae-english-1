import { describe, it, expect } from 'vitest';
import { AuthService } from './authService';
import { ALLOWED_EMAIL_DOMAIN } from '../types/auth';

describe('AuthService - 학교 Google 계정 인가 가드 테스트', () => {
  it('시민고등학교 도메인(@simin.hs.kr) 계정만 정확히 허용해야 한다', () => {
    expect(AuthService.isValidSchoolEmail(`student@${ALLOWED_EMAIL_DOMAIN}`)).toBe(true);
    expect(AuthService.isValidSchoolEmail(`s10315@${ALLOWED_EMAIL_DOMAIN}`)).toBe(true);
    expect(AuthService.isValidSchoolEmail('teacher@simin.hs.kr')).toBe(true);

    // 타 도메인 차단
    expect(AuthService.isValidSchoolEmail('student@gmail.com')).toBe(false);
    expect(AuthService.isValidSchoolEmail('student@naver.com')).toBe(false);
    expect(AuthService.isValidSchoolEmail('student@other.hs.kr')).toBe(false);
    expect(AuthService.isValidSchoolEmail('')).toBe(false);
  });

  it('학생 이메일 패턴(s + 학년 + 반 + 번호)을 올바르게 파싱해야 한다', () => {
    const info = AuthService.parseStudentInfo('s10315@simin.hs.kr');
    expect(info.grade).toBe(1);
    expect(info.classNumber).toBe(3);
    expect(info.studentNumber).toBe(15);

    const info2 = AuthService.parseStudentInfo('s11102@simin.hs.kr');
    expect(info2.grade).toBe(1);
    expect(info2.classNumber).toBe(11);
    expect(info2.studentNumber).toBe(2);
  });
});
