import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const lessonData1 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'content/lesson-01.json'), 'utf-8')
);

const MOCK_STUDENT_USER = {
  uid: 'e2e_student_lee',
  email: 's10115@simin.hs.kr',
  name: '이학생',
  role: 'student',
  grade: 1,
  classNumber: 1,
  studentNumber: 15,
};

const MOCK_TEACHER_USER = {
  uid: 'e2e_teacher_kim',
  email: 'teacher.kim@simin.hs.kr',
  name: '김선생',
  role: 'teacher',
  grade: 1,
  classNumber: 1,
  studentNumber: 0,
};

test.describe('Phase 4: AI 특화 기능 E2E 브라우저 테스트', () => {
  test.beforeEach(async ({ page }) => {
    // 공통 교과서 데이터 가로채기
    await page.route('**/api/lesson*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData1),
      });
    });
  });

  test('1. Communicate 코너: 대화 롤플레이 회화 모달 열기, 발화 및 AI 코칭 팁 확인', async ({ page }) => {
    // 롤플레이 API 모의 응답 가로채기
    await page.route('**/api/ai/roleplay', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          replyEn: 'Great! What kind of movies do you enjoy the most?',
          replyKo: '좋아요! 어떤 종류의 영화를 가장 즐겨 보시나요?',
          pronunciationTip: "'kind of'를 발음할 때 '카인다'처럼 부드럽게 연음해보세요.",
          suggestedResponses: ['I love action movies.', 'I prefer sci-fi films.'],
        }),
      });
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');
    await expect(page.getByText('심인고등학교')).toBeVisible({ timeout: 15000 });

    // Communicate 코너 이동
    const commTab = page.getByRole('button', { name: 'Communicate' });
    await expect(commTab).toBeVisible({ timeout: 10000 });
    await commTab.click();

    // 롤플레이 버튼 확인 및 클릭 (aria-label: AI 롤플레이 회화 연습 열기)
    const roleplayBtn = page.getByRole('button', { name: 'AI 롤플레이 회화 연습 열기' });
    await expect(roleplayBtn).toBeVisible({ timeout: 10000 });
    await roleplayBtn.click();

    // 롤플레이 모달 확인 (실제 헤더: AI 대화 롤플레이 파트너)
    await expect(page.getByText('AI 대화 롤플레이 파트너')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText(/I'm your AI speaking partner/i)).toBeVisible({ timeout: 10000 });

    // 메시지 입력 및 전송
    const input = page.getByPlaceholder(/영어로 답변을 입력하세요/i);
    await expect(input).toBeVisible({ timeout: 10000 });
    await input.fill('I want to go to the cinema.');
    await page.keyboard.press('Enter');

    // AI 응답 및 연음 팁 확인
    await expect(page.getByText('Great! What kind of movies do you enjoy the most?')).toBeVisible({ timeout: 10000 });
    await expect(page.getByText('좋아요! 어떤 종류의 영화를 가장 즐겨 보시나요?')).toBeVisible();
    await expect(page.getByText(/연음해보세요/i)).toBeVisible();

    // 모달 닫기
    const closeBtn = page.getByRole('button', { name: '롤플레이 모달 닫기' });
    await closeBtn.click();
    await expect(page.getByText('AI 대화 롤플레이 파트너')).not.toBeVisible();
  });

  test('2. Language Focus 코너: AI 문법 변형 퀴즈 모달 풀이 및 해설 확인', async ({ page }) => {
    // 문법 변형 API 모의 응답 가로채기
    await page.route('**/api/ai/grammar-variants', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          questions: [
            {
              id: 'gv-1',
              type: 'choice',
              difficulty: 'basic',
              question: '다음 문장의 빈칸에 들어갈 가장 알맞은 표현을 고르시오.',
              passageSnippet: 'He (must have / should have) left early, but he stayed.',
              options: ['must have', 'should have'],
              correctAnswer: 1,
              explanation: '~했어야 했는데 하지 못했다는 후회를 나타냅니다.',
              targetGrammar: '조동사 + have p.p.',
            },
          ],
        }),
      });
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');

    // Language Focus 코너 이동
    const langTab = page.getByRole('button', { name: 'Language Focus' });
    await expect(langTab).toBeVisible({ timeout: 10000 });
    await langTab.click();

    // AI 문법 변형 문제 버튼 클릭
    const variantBtn = page.getByRole('button', { name: /AI 문법 변형 문제/i }).first();
    await expect(variantBtn).toBeVisible({ timeout: 5000 });
    await variantBtn.click();

    // 모달 헤더 확인 (실제 컴포넌트 헤더: AI 문법 실전 변형 문제)
    await expect(page.getByText('AI 문법 실전 변형 문제')).toBeVisible({ timeout: 5000 });

    // 새로운 변형 문제 출제받기 클릭 (title="새 문제 생성")
    const fetchBtn = page.getByTitle('새 문제 생성');
    await fetchBtn.click();

    // 문제 렌더링 확인
    await expect(page.getByText('다음 문장의 빈칸에 들어갈 가장 알맞은 표현을 고르시오.')).toBeVisible({ timeout: 5000 });

    // 보기 선택 (aria-label="문항 1 보기: should have")
    const optionBtn = page.getByRole('button', { name: '문항 1 보기: should have' });
    await optionBtn.click();

    // 정답 제출 및 채점하기 클릭
    const submitBtn = page.getByRole('button', { name: '정답 제출 및 채점하기' });
    await expect(submitBtn).toBeEnabled({ timeout: 5000 });
    await submitBtn.click();

    // 채점 결과 및 해설 확인
    await expect(page.getByText('정답').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('~했어야 했는데 하지 못했다는 후회를 나타냅니다.')).toBeVisible();

    // 모달 닫기 (aria-label: 문법 변형 모달 닫기)
    const closeBtn = page.getByRole('button', { name: '문법 변형 모달 닫기' });
    await closeBtn.click();
    await expect(page.getByText('AI 문법 실전 변형 문제')).not.toBeVisible();
  });

  test('3. 교사용 스튜디오: AI 전역 On/Off 토글 및 AI 내신 문항 제작소 시험지 출제 확인', async ({ page }) => {
    // 내신 문항 생성 API 모의 응답 가로채기
    await page.route('**/api/ai/exam-generator', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify({
          item: {
            id: 'exam-item-e2e',
            type: 'grammar_error',
            typeKo: '어법상 어색한 것 고르기',
            questionText: '다음 글의 밑줄 친 ①~⑤ 중, 어법상 틀린 것은?',
            passageText: 'Sports psychology is a fascinating field ① that helps athletes maximize performance.',
            options: ['①', '②', '③', '④', '⑤'],
            correctAnswer: '③',
            explanation: '선행사가 사람이 아니므로 관계대명사 which 또는 that을 써야 합니다.',
          },
        }),
      });
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_TEACHER_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');

    // 교사 대시보드 열기
    const dashboardBtn = page.getByRole('button', { name: '교사용 대시보드 열기' });
    await expect(dashboardBtn).toBeVisible({ timeout: 10000 });
    await dashboardBtn.click();

    // 교사 대시보드 모달 확인
    await expect(page.getByText('교사용 학급 운영 스튜디오')).toBeVisible({ timeout: 5000 });

    // 헤더의 AI 전역 토글 버튼 확인 및 토글
    const aiToggleBtn = page.getByRole('button', { name: 'AI 기능 전역 토글' });
    await expect(aiToggleBtn).toBeVisible();
    await expect(aiToggleBtn).toContainText('AI ON');

    // AI 끄기 클릭
    await aiToggleBtn.click();
    await expect(aiToggleBtn).toContainText('AI OFF');
    await expect(page.getByText(/AI 기능이 전역 비활성화되었습니다/i)).toBeVisible();

    // AI 다시 켜기
    await aiToggleBtn.click();
    await expect(aiToggleBtn).toContainText('AI ON');

    // 6번째 탭: AI 내신 문항 제작소 클릭
    const examTab = page.getByRole('button', { name: 'AI 내신 문항 제작소' });
    await expect(examTab).toBeVisible();
    await examTab.click();

    // AI 내신 문항 제작소 화면 요소 확인
    await expect(page.getByText('AI 내신 지필평가 문항 제작소')).toBeVisible();

    // 출제 지문 입력 (지문이 있어야 생성 버튼이 활성화됨)
    const passageInput = page.locator('#exam-passage-input');
    await passageInput.fill('Sports psychology is a fascinating field that helps athletes maximize performance.');

    // 문항 생성하기 버튼 클릭
    const generateBtn = page.getByRole('button', { name: '내신 문항 생성하기' });
    await expect(generateBtn).toBeEnabled({ timeout: 5000 });
    await generateBtn.click();

    // 생성된 문항 카드 확인
    await expect(page.getByText('다음 글의 밑줄 친 ①~⑤ 중, 어법상 틀린 것은?').first()).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('어법상 어색한 것 고르기').first()).toBeVisible();

    // 정답 및 해설 열람 확인
    const answerToggle = page.getByRole('button', { name: /정답 및 해설 열람/i }).first();
    await answerToggle.click();
    await expect(page.getByText('선행사가 사람이 아니므로 관계대명사 which 또는 that을 써야 합니다.').first()).toBeVisible();
  });
});
