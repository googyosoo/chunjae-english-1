import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const lessonData = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'content/lesson-01.json'), 'utf-8')
);

const MOCK_STUDENT_USER = {
  uid: 'e2e_student_01',
  email: 'student1@simin.hs.kr',
  name: '심인고학생1',
  role: 'student',
  grade: 1,
  classNumber: 1,
  studentNumber: 15,
};

const CORNERS = [
  { id: 'introduction', name: '1. 도입' },
  { id: 'communicate', name: '2. 듣기·말하기' },
  { id: 'read', name: '3. 본문 리더' },
  { id: 'after_read', name: '4. 읽기 후' },
  { id: 'share_thoughts', name: '5. 생각 나누기' },
  { id: 'language_focus', name: '6. 언어 탐구' },
  { id: 'write_present', name: '7. 쓰기 스튜디오' },
  { id: 'go_global', name: '8. 총괄 평가' },
];

test.describe('학생 로그인 및 8개 학습 코너 탭 순회 E2E 검증', () => {
  test('학생 로그인 상태에서 8개 탭을 모두 클릭 시 페이지 에러 0건 및 본문 텍스트 200자 이상 유지', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    // 페이지 및 콘솔 오류 실시간 수집 (Strict Zero Error)
    page.on('pageerror', (err) => {
      pageErrors.push(err.message);
    });

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        // 네트워크 관련 일시적 경고 제외, 실제 컴포넌트 렌더링/JS 런타임 오류 포착
        if (!text.includes('favicon') && !text.includes('net::ERR_')) {
          consoleErrors.push(text);
        }
      }
    });

    // 1. 학생 사용자 세션 주입
    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    // 2. 교과서 API 응답 Mocking (content/lesson-01.json 반환)
    await page.route('**/api/lesson*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData),
      });
    });

    await page.route('**/content/lesson-01.json', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData),
      });
    });

    // 3. 페이지 로드
    await page.goto('/');

    // 메인 컨테이너 및 교과서 데이터 로드 완료 대기
    const mainLocator = page.locator('main');
    await expect(mainLocator).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=인증된 교과서 데이터를 안전하게 불러오는 중입니다...')).toBeHidden({ timeout: 10000 });

    // 4. 8개 탭을 순차적으로 클릭하며 오류 0건 및 본문 텍스트 200자 이상 검증
    for (const corner of CORNERS) {
      // 탭 버튼 찾기 (data-testid 기반)
      const tabButton = page.locator(`[data-testid="corner-tab-${corner.id}"]`);
      await expect(tabButton).toBeVisible();

      // 클릭 수행
      await tabButton.click();

      // UI 렌더링 및 텍스트 200자 이상 도달 대기 (expect.poll 활용)
      await expect.poll(async () => {
        const text = (await mainLocator.innerText()).trim();
        return text.length;
      }, {
        message: `[${corner.id}] ${corner.name} 탭 본문 텍스트가 200자 이상이어야 합니다`,
        timeout: 7000,
        intervals: [200, 400, 600],
      }).toBeGreaterThanOrEqual(200);

      const mainText = (await mainLocator.innerText()).trim();
      console.log(`[탭 검증 통과] [${corner.id}] ${corner.name}: 본문 텍스트 길이 = ${mainText.length}자`);

      // 검증 기준 2: 페이지 런타임 오류 0건
      expect(pageErrors).toHaveLength(0);
      expect(consoleErrors).toHaveLength(0);
    }
  });
});
