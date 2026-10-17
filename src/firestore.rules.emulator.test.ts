import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment } from '@firebase/rules-unit-testing';
import * as fs from 'fs';
import * as path from 'path';
import * as http from 'http';

/**
 * 로컬 Firestore Emulator 실행 여부 확인 헬퍼
 */
async function isFirestoreEmulatorAlive(host = '127.0.0.1', port = 8080): Promise<boolean> {
  return new Promise((resolve) => {
    const req = http.get(`http://${host}:${port}/`, (res) => {
      resolve(res.statusCode !== undefined);
    });
    req.on('error', () => resolve(false));
    req.setTimeout(500, () => {
      req.destroy();
      resolve(false);
    });
  });
}

describe('Firebase Emulator 기반 Firestore Security Rules 단위 테스트 (@firebase/rules-unit-testing)', () => {
  const rulesPath = path.resolve(__dirname, '../firestore.rules');
  const rules = fs.readFileSync(rulesPath, 'utf-8');
  let testEnv: RulesTestEnvironment | null = null;
  let emulatorRunning = false;

  beforeAll(async () => {
    emulatorRunning = await isFirestoreEmulatorAlive();
    if (emulatorRunning) {
      testEnv = await initializeTestEnvironment({
        projectId: 'demo-simin-aidt',
        firestore: {
          rules,
          host: '127.0.0.1',
          port: 8080,
        },
      });
    }
  });

  afterAll(async () => {
    if (testEnv) {
      await testEnv.cleanup();
    }
  });

  it('규칙 파일에 @firebase/rules-unit-testing 검증 대상 핵심 규칙(타 학생 격리, teacherApproved 위변조 방지)이 명시되어 있어야 함', () => {
    expect(rules).toContain('isStudent(studentId)');
    expect(rules).toContain('request.auth.uid == studentId');
    expect(rules).toContain('request.resource.data.teacherApproved == false');
    expect(rules).toContain('request.resource.data.teacherApproved == resource.data.teacherApproved');
  });

  describe('Emulator Live Tests (에뮬레이터 구동 시 자동 실행, 미구동 시 건너뜀)', () => {
    it('1. 학생(student_A)은 다른 학생(student_B)의 데이터를 읽거나 쓸 수 없음 (완벽한 격리)', async (ctx) => {
      if (!emulatorRunning || !testEnv) {
        ctx.skip();
        return;
      }

      // student_A 컨텍스트
      const studentAContext = testEnv.authenticatedContext('student_A', {
        email: 'student_a@simin.hs.kr',
        email_verified: true,
      });

      const studentBDocRef = studentAContext.firestore().collection('classes').doc('g1_c1').collection('students').doc('student_B');

      // student_B 문서 읽기 실패 확인
      await assertFails(studentBDocRef.get());

      // student_B 문서 쓰기 실패 확인
      await assertFails(studentBDocRef.set({
        uid: 'student_B',
        email: 'student_b@simin.hs.kr',
        name: '학생B',
        grade: 1,
        classNumber: 1,
        studentNumber: 2,
        role: 'student',
      }));
    });

    it('2. 학생은 세특 관찰기록의 teacherApproved를 true로 생성하거나 수정할 수 없음', async (ctx) => {
      if (!emulatorRunning || !testEnv) {
        ctx.skip();
        return;
      }

      const studentAContext = testEnv.authenticatedContext('student_A', {
        email: 'student_a@simin.hs.kr',
        email_verified: true,
      });

      const obsRef = studentAContext.firestore()
        .collection('classes').doc('g1_c1')
        .collection('students').doc('student_A')
        .collection('observations').doc('obs_1');

      // teacherApproved: true 로 생성 시도 -> 차단 확인
      await assertFails(obsRef.set({
        lessonNumber: 1,
        action: '서술형 작성',
        detail: 'AI 교과서 디지털 시민의식 챕터 작성',
        teacherApproved: true,
      }));
    });

    it('3. 교사(teacher_1)만 teacherApproved를 true로 승인할 수 있음', async (ctx) => {
      if (!emulatorRunning || !testEnv) {
        ctx.skip();
        return;
      }

      const teacherContext = testEnv.authenticatedContext('teacher_1', {
        email: 'teacher@simin.hs.kr',
        email_verified: true,
      });

      const obsRef = teacherContext.firestore()
        .collection('classes').doc('g1_c1')
        .collection('students').doc('student_A')
        .collection('observations').doc('obs_1');

      // 교사의 승인은 성공 확인
      await assertSucceeds(obsRef.set({
        lessonNumber: 1,
        action: '교사 검토 및 승인',
        detail: 'NEIS 세특 기재 적합 확인',
        teacherApproved: true,
      }));
    });
  });
});
