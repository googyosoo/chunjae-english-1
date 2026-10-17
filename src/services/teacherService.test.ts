import { describe, it, expect } from 'vitest';
import { TeacherService } from './teacherService';
import { StudentRosterItem, ObservationExportItem } from '../types/teacher';
import { StudentProgress } from './storageService';

describe('TeacherService Core Logic (Phase 3 TDD Suite)', () => {
  describe('1. CSV Roster Parsing & Validation (반 명단 등록)', () => {
    it('한글 헤더가 포함된 정상 CSV 데이터를 올바르게 파싱한다', () => {
      const csvData = `학년,반,번호,이름,이메일
1,1,1,김심인,s10101@simin.hs.kr
1,1,2,이대구,s10102@simin.hs.kr
1,1,15,박영수,s10115@simin.hs.kr`;

      const result = TeacherService.parseRosterCsv(csvData, 'g1_c1');

      expect(result.totalParsed).toBe(3);
      expect(result.successCount).toBe(3);
      expect(result.errorCount).toBe(0);
      expect(result.validStudents).toHaveLength(3);

      const first = result.validStudents[0];
      expect(first.name).toBe('김심인');
      expect(first.grade).toBe(1);
      expect(first.classNumber).toBe(1);
      expect(first.studentNumber).toBe(1);
      expect(first.email).toBe('s10101@simin.hs.kr');
      expect(first.role).toBe('student');
      expect(first.status).toBe('active');
    });

    it('이메일 컬럼이 비어있으면 심인고 규칙(s+학년+반(2자리)+번호(2자리)@simin.hs.kr)으로 자동 생성한다', () => {
      const csvData = `grade,classNumber,studentNumber,name,email
1,3,7,최수학,
1,12,25,강영어,`;

      const result = TeacherService.parseRosterCsv(csvData, 'g1_c3');

      expect(result.successCount).toBe(2);
      expect(result.validStudents[0].email).toBe('s10307@simin.hs.kr');
      expect(result.validStudents[1].email).toBe('s11225@simin.hs.kr');
    });

    it('심인고 도메인(@simin.hs.kr)이 아니거나 유효하지 않은 이메일은 오류로 분류한다', () => {
      const csvData = `학년,반,번호,이름,이메일
1,1,1,정상학생,s10101@simin.hs.kr
1,1,2,외부메일,hacker@gmail.com
1,1,3,잘못된형식,invalid-email-address`;

      const result = TeacherService.parseRosterCsv(csvData, 'g1_c1');

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(2);
      expect(result.invalidRows).toHaveLength(2);
      expect(result.invalidRows[0].reason).toContain('simin.hs.kr');
    });

    it('학년(1~3), 반(1~20), 번호(1~60) 범위를 벗어난 데이터는 오류로 분류한다', () => {
      const csvData = `학년,반,번호,이름,이메일
4,1,1,고4학생,s40101@simin.hs.kr
1,25,1,반초과,s12501@simin.hs.kr
1,1,0,번호미달,s10100@simin.hs.kr
1,1,99,번호초과,s10199@simin.hs.kr`;

      const result = TeacherService.parseRosterCsv(csvData, 'g1_c1');

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(4);
    });

    it('동일 학급 내 중복 번호 및 중복 이메일은 오류로 탐지한다', () => {
      const csvData = `학년,반,번호,이름,이메일
1,1,5,홍길동,s10105@simin.hs.kr
1,1,5,김복제,s10105@simin.hs.kr`;

      const result = TeacherService.parseRosterCsv(csvData, 'g1_c1');

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(1);
      expect(result.invalidRows[0].reason).toContain('중복');
    });
  });

  describe('2. Class Progress Analytics & Dashboard (학급 진도 및 미제출자)', () => {
    const mockRoster: StudentRosterItem[] = [
      {
        email: 's10101@simin.hs.kr',
        name: '김학생',
        grade: 1,
        classNumber: 1,
        studentNumber: 1,
        role: 'student',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        email: 's10102@simin.hs.kr',
        name: '이학생',
        grade: 1,
        classNumber: 1,
        studentNumber: 2,
        role: 'student',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
      {
        email: 's10103@simin.hs.kr',
        name: '박학생',
        grade: 1,
        classNumber: 1,
        studentNumber: 3,
        role: 'student',
        status: 'active',
        createdAt: new Date().toISOString(),
      },
    ];

    const allCorners = ['introduction', 'communicate', 'read', 'after_read', 'share_thoughts', 'language_focus', 'write_present', 'go_global'];

    it('학급 학생들의 진도를 집계하여 평균 진도율, 코너별 통계, 미제출자 목록을 정확히 계산한다', () => {
      const progressMap: Record<string, StudentProgress> = {
        's10101@simin.hs.kr': {
          lessonNumber: 1,
          completedCorners: ['introduction', 'communicate', 'read', 'after_read', 'share_thoughts', 'language_focus', 'write_present', 'go_global'],
          quizScores: {},
          topicAnswers: {},
          writingDrafts: {},
          observedLogs: [],
        },
        's10102@simin.hs.kr': {
          lessonNumber: 1,
          completedCorners: ['introduction', 'communicate'],
          quizScores: {},
          topicAnswers: {},
          writingDrafts: {},
          observedLogs: [],
        },
        // s10103@simin.hs.kr 은 진도 데이터 없음 (미제출)
      };

      const summary = TeacherService.calculateClassProgressSummary(
        'g1_c1',
        1,
        mockRoster,
        progressMap,
        allCorners
      );

      expect(summary.totalStudents).toBe(3);
      expect(summary.completedAllCount).toBe(1); // 1번 학생 완주
      // 1번: 8/8 (100%), 2번: 2/8 (25%), 3번: 0/8 (0%) => 평균 (100 + 25 + 0) / 3 = 41.7%
      expect(summary.averageProgressPercent).toBeCloseTo(41.7, 1);

      // 코너별 통계 확인
      const introStat = summary.cornerStats.find(c => c.cornerId === 'introduction');
      expect(introStat?.completedCount).toBe(2); // 1번, 2번
      expect(introStat?.completionRatePercent).toBeCloseTo(66.7, 1);

      // 미제출자(모든 코너를 완료하지 않은 학생) 확인
      expect(summary.unsubmittedStudents).toHaveLength(2); // 2번, 3번
      const student3 = summary.unsubmittedStudents.find(s => s.studentNumber === 3);
      expect(student3?.missingCorners).toHaveLength(8);
    });
  });

  describe('3. Lesson Control & Corner Locking (수업 운영 및 코너 잠금)', () => {
    it('특정 코너를 잠금/해제할 수 있고 상태가 정확히 반환된다', () => {
      const initialLocked = TeacherService.isCornerLocked(1, 'write_present', []);
      expect(initialLocked).toBe(false);

      const locks = TeacherService.toggleCornerLock(1, 'write_present', true, '수업 시간 전 과제 유출 방지', []);
      expect(TeacherService.isCornerLocked(1, 'write_present', locks)).toBe(true);

      const unlocked = TeacherService.toggleCornerLock(1, 'write_present', false, undefined, locks);
      expect(TeacherService.isCornerLocked(1, 'write_present', unlocked)).toBe(false);
    });
  });

  describe('4. Subjective Writing Review & Feedback (서술형 검토 및 승인)', () => {
    it('학생 서술형 답변에 피드백 코멘트와 승인 여부를 반영한다', () => {
      const originalProgress: StudentProgress = {
        lessonNumber: 1,
        completedCorners: ['write_present'],
        quizScores: {},
        topicAnswers: {},
        writingDrafts: {
          draft: 'I practiced digital detox by leaving my phone in the living room.',
          teacherApproved: false,
        },
        observedLogs: [],
      };

      const updated = TeacherService.applyTeacherFeedback(
        originalProgress,
        '구체적인 실천 사례를 영어로 잘 묘사함. 전치사 활용이 우수함.',
        true
      );

      expect(updated.writingDrafts.teacherApproved).toBe(true);
      expect(updated.writingDrafts.teacherComment).toBe('구체적인 실천 사례를 영어로 잘 묘사함. 전치사 활용이 우수함.');
    });
  });

  describe('5. NEIS SETEK Observation Export (세특 관찰기록 CSV 내보내기)', () => {
    it('학급 전체 관찰 기록을 UTF-8 BOM 규격 CSV로 변환하고 특수문자를 안전하게 이스케이프한다', () => {
      const observations: ObservationExportItem[] = [
        {
          timestamp: '2026-03-20T10:30:00.000Z',
          grade: 1,
          classNumber: 1,
          studentNumber: 1,
          studentName: '김심인',
          lessonNumber: 1,
          action: '서술형 작성',
          detail: '디지털 디톡스 실천 후 "JOMO"의 가치에 대해 300단어 에세이를 작성함.',
          teacherApproved: true,
          teacherNotes: 'NEIS 세특 기재 추천',
        },
        {
          timestamp: '2026-03-20T11:00:00.000Z',
          grade: 1,
          classNumber: 1,
          studentNumber: 2,
          studentName: '이대구',
          lessonNumber: 1,
          action: '코너 완료',
          detail: 'Language Focus 문법 퀴즈 전 문항 만점 이수.',
          teacherApproved: false,
        },
      ];

      // 1. 전체 내보내기
      const allCsv = TeacherService.generateObservationsCsv(observations, false);
      expect(allCsv.startsWith('\uFEFF')).toBe(true); // UTF-8 BOM
      expect(allCsv).toContain('김심인');
      expect(allCsv).toContain('이대구');
      expect(allCsv).toContain('""JOMO""'); // 큰따옴표 이스케이프

      // 2. 승인된 것만 필터링 내보내기
      const approvedOnlyCsv = TeacherService.generateObservationsCsv(observations, true);
      expect(approvedOnlyCsv).toContain('김심인');
      expect(approvedOnlyCsv).not.toContain('이대구');
    });
  });
});
