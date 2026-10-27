import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const lessonData1 = JSON.parse(
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

test.describe('Book Spread (Two-Page Spread) & Grammar Book Modal E2E 검증', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    await page.route('**/api/lesson*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData1),
      });
    });
  });

  test('1. ReadView: Book Spread ↔ Single Page 전환 검증', async ({ page }) => {
    await page.goto('/?lesson=01');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

    // 본문 리더(read) 코너로 이동
    const readTab = page.locator('[data-testid="corner-tab-read"]');
    await expect(readTab).toBeVisible({ timeout: 10000 });
    await readTab.click();

    // 초기 상태: Single Page 버튼이 존재
    const spreadButton = page.locator('button:has-text("Book Spread")');
    const singleButton = page.locator('button:has-text("Single Page")');
    await expect(spreadButton).toBeVisible({ timeout: 8000 });
    await expect(singleButton).toBeVisible({ timeout: 8000 });

    // Book Spread 버튼 클릭
    await spreadButton.click();

    // Book Spread 뷰어 레이아웃 검증 (Left Page & Right Page)
    await expect(page.locator('text=Two-Page Book Spread')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Left Page')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('text=Right Page')).toBeVisible({ timeout: 5000 });

    // 다시 Single Page 버튼 클릭
    await singleButton.click();
    await expect(page.locator('text=Two-Page Book Spread')).toBeHidden({ timeout: 5000 });
  });

  test('2. 상단 네비게이션바: Grammar Book 버튼 클릭 시 모달 열기 및 iframe 임베딩 검증', async ({ page }) => {
    await page.goto('/?lesson=01');
    await expect(page.locator('main')).toBeVisible({ timeout: 10000 });

    // Navbar 우측의 Grammar Book 버튼 클릭
    const grammarBookBtn = page.locator('button[aria-label="영문법 그림책 열기"]');
    await expect(grammarBookBtn).toBeVisible({ timeout: 8000 });
    await grammarBookBtn.click();

    // Grammar Picture Book Modal 노출 확인
    const modalTitle = page.locator('text=Illustrated English Grammar');
    await expect(modalTitle).toBeVisible({ timeout: 8000 });
    await expect(page.locator('text=笑える英文法 絵本 Vol. 1')).toBeVisible({ timeout: 5000 });

    // iframe 존재 확인
    const iframe = page.locator('iframe[title="笑える英文法 絵本 - Illustrated English Grammar"]');
    await expect(iframe).toBeAttached({ timeout: 5000 });

    // 모달 닫기
    const closeBtn = page.locator('button[title="닫기"]');
    await closeBtn.click();
    await expect(modalTitle).toBeHidden({ timeout: 5000 });
  });
});
