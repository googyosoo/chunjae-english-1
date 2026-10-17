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

// 8개 코너별 필수 검증 교과서 원문 문장 (지시 03 기준)
const CORNERS_WITH_CANONICAL_SENTENCES = [
  {
    id: 'introduction',
    name: '1. 도입',
    requiredText: 'How can we promote our digital well-being?',
  },
  {
    id: 'communicate',
    name: '2. 듣기·말하기',
    requiredText: 'Kids on the pressures of having a cell phone',
  },
  {
    id: 'read',
    name: '3. 본문 리더',
    requiredText: 'I check my phone while I eat.',
  },
  {
    id: 'after_read',
    name: '4. 읽기 후',
    requiredText: 'Before digital detox',
  },
  {
    id: 'share_thoughts',
    name: '5. 생각 나누기',
    requiredText: 'Being a good digital citizen',
  },
  {
    id: 'language_focus',
    name: '6. 언어 탐구',
    requiredText: 'to think carefully and deeply',
  },
  {
    id: 'write_present',
    name: '7. 쓰기 스튜디오',
    requiredText: 'Six Strings',
  },
  {
    id: 'go_global',
    name: '8. 총괄 평가',
    requiredText: 'ill CU l8r',
  },
];

const VIEWPORTS = [
  { name: 'Mobile (360px)', width: 360, height: 740 },
  { name: 'Desktop (1280px)', width: 1280, height: 800 },
];

for (const vp of VIEWPORTS) {
  test.describe(`8개 학습 코너 탭 교과서 원문 매칭 및 undefined 0건 검증 [${vp.name}]`, () => {
    test.use({ viewport: { width: vp.width, height: vp.height } });

    test(`학생 로그인 상태에서 8개 탭 순회 시 원문 문장 노출 및 undefined 0건`, async ({ page }) => {
      const pageErrors: string[] = [];
      const consoleErrors: string[] = [];

      page.on('pageerror', (err) => {
        pageErrors.push(err.message);
      });

      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          if (!text.includes('favicon') && !text.includes('net::ERR_')) {
            consoleErrors.push(text);
          }
        }
      });

      // 1. 학생 사용자 세션 주입 (테스트 모드용)
      await page.addInitScript((mockUser) => {
        (window as any).__E2E_USER__ = mockUser;
      }, MOCK_STUDENT_USER);

      // 2. 인증된 교과서 API 응답 Mocking (/api/lesson?id=lesson-01)
      await page.route('**/api/lesson*', async (route) => {
        await route.fulfill({
          status: 200,
          contentType: 'application/json; charset=utf-8',
          body: JSON.stringify(lessonData),
        });
      });

      // 3. 페이지 접속
      await page.goto('/');

      const mainLocator = page.locator('main');
      await expect(mainLocator).toBeVisible({ timeout: 10000 });
      await expect(page.locator('text=인증된 교과서 데이터를 안전하게 불러오는 중입니다...')).toBeHidden({ timeout: 10000 });

      // 4. 8개 코너 순차 검증
      for (const corner of CORNERS_WITH_CANONICAL_SENTENCES) {
        const tabButton = page.locator(`[data-testid="corner-tab-${corner.id}"]`);
        await expect(tabButton).toBeVisible({ timeout: 5000 });
        await tabButton.click();

        // (A) 코너별 필수 교과서 원문 문장이 화면에 렌더링되는지 확인
        await expect.poll(async () => {
          const content = await mainLocator.innerText();
          return content.includes(corner.requiredText);
        }, {
          message: `[${corner.id}] ${corner.name} 탭에 교과서 원문 "${corner.requiredText}"이(가) 나타나야 합니다.`,
          timeout: 8000,
          intervals: [200, 400, 600],
        }).toBe(true);

        // (B) 화면 내 'undefined' 문자열이 0건이어야 함 (엄격 무결성)
        const fullContent = await mainLocator.innerText();
        expect(fullContent, `[${corner.id}] 화면에 'undefined' 문자열이 포함되어서는 안 됩니다`).not.toContain('undefined');

        console.log(`[검증 통과 - ${vp.name}] [${corner.id}] 교과서 원문 확인: "${corner.requiredText}" | undefined: 0건`);
      }

      // (C) 런타임 오류 0건 검증
      expect(pageErrors, '페이지 런타임 오류가 발생하지 않아야 합니다').toEqual([]);
      expect(consoleErrors, '브라우저 콘솔 오류가 발생하지 않아야 합니다').toEqual([]);
    });
  });
}
