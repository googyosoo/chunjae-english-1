import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const lessonData1 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'content/lesson-01.json'), 'utf-8')
);

const lessonData2 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'content/lesson-02.json'), 'utf-8')
);

const lessonData3 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'content/lesson-03.json'), 'utf-8')
);

const lessonData4 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'content/lesson-04.json'), 'utf-8')
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

// Lesson 1: 8개 코너별 필수 검증 교과서 원문 문장
const L1_CORNERS = [
  { id: 'introduction', name: '1. 도입', requiredText: 'How can we promote our digital well-being?' },
  { id: 'communicate', name: '2. 듣기·말하기', requiredText: 'Kids on the pressures of having a cell phone' },
  { id: 'read', name: '3. 본문 리더', requiredText: 'I check my phone while I eat.' },
  { id: 'after_read', name: '4. 읽기 후', requiredText: 'Before digital detox' },
  { id: 'share_thoughts', name: '5. 생각 나누기', requiredText: 'Being a good digital citizen' },
  { id: 'language_focus', name: '6. 언어 탐구', requiredText: 'to think carefully and deeply' },
  { id: 'write_present', name: '7. 쓰기 스튜디오', requiredText: 'Six Strings' },
  { id: 'go_global', name: '8. 총괄 평가', requiredText: 'ill CU l8r' },
];

// Lesson 2: 8개 코너별 필수 검증 교과서 원문 문장
const L2_CORNERS = [
  { id: 'introduction', name: '1. 도입', requiredTexts: ['How can you come up with creative ideas?'] },
  { id: 'communicate', name: '2. 듣기·말하기', requiredTexts: ['Imagine you are hungry and all you have at home is a coconut'] },
  { id: 'read', name: '3. 본문 리더', requiredTexts: ['Robin Yayla', 'Fun Shadows'] },
  { id: 'after_read', name: '4. 읽기 후', requiredTexts: ['Robin Yayla creates his art by'] },
  { id: 'share_thoughts', name: '5. 생각 나누기', requiredTexts: ['Tom Bob'] },
  { id: 'language_focus', name: '6. 언어 탐구', requiredTexts: ['Whatever is begun in anger'] },
  { id: 'write_present', name: '7. 쓰기 스튜디오', requiredTexts: ['The Dancing House'] },
  { id: 'work_together', name: '8. 모둠 프로젝트 & Wrap Up', requiredTexts: ['patbingsu', 'What is the purpose of the man’s call?', 'I learned about how creativity enriches our lives.'] },
];

// Lesson 3: 8개 코너별 필수 검증 교과서 원문 문장
const L3_CORNERS = [
  { id: 'introduction', name: '1. 도입', requiredTexts: ['How can we make our food culture sustainable?'] },
  { id: 'communicate', name: '2. 듣기·말하기', requiredTexts: ['We need to feed more and more people globally.', 'Dialogue 1'] },
  { id: 'read', name: '3. 본문 리더', requiredTexts: ['The Future of Food', 'Lab-grown meat is animal flesh'] },
  { id: 'after_read', name: '4. 읽기 후', requiredTexts: ['Plant-based food production accounts for most', 'laboratory'] },
  { id: 'share_thoughts', name: '5. 생각 나누기', requiredTexts: ['Food Upcycling', 'Turning Food Waste Into a Fine Dining Experience'] },
  { id: 'language_focus', name: '6. 언어 탐구', requiredTexts: ['yield', 'Over a 15-year period'] },
  { id: 'write_present', name: '7. 쓰기 스튜디오', requiredTexts: ['Proposing Eco-friendly School Meals', 'too much food waste'] },
  { id: 'go_global', name: '8. 친환경 요리 & Wrap Up', requiredTexts: ['Bibimbap with Crispy Tofu', 'Vegan Burritos', 'Spring Rolls'] },
];

// Lesson 4: 8개 코너별 필수 검증 교과서 원문 문장
const L4_CORNERS = [
  { id: 'introduction', name: '1. 도입', requiredTexts: ['How do we coexist with animals around us?'] },
  { id: 'communicate', name: '2. 듣기·말하기', requiredTexts: ['Earth is full of life', 'Dialogue 1'] },
  { id: 'read', name: '3. 본문 리더', requiredTexts: ['A World on the Wing', 'half-brain sleep'] },
  { id: 'after_read', name: '4. 읽기 후', requiredTexts: ['Why do migratory birds travel at night?', 'fewer predators'] },
  { id: 'share_thoughts', name: '5. 생각 나누기', requiredTexts: ['Hamsters in Urban Areas', 'smashing into windows'] },
  { id: 'language_focus', name: '6. 언어 탐구', requiredTexts: ['scale', 'strip away'] },
  { id: 'write_present', name: '7. 쓰기 스튜디오', requiredTexts: ['Animal Information Report', 'Giant pandas'] },
  { id: 'work_together', name: '8. 모둠 인포그래픽 & Wrap Up', requiredTexts: ['Making an Infographic on an Endangered Animal', 'African elephants'] },
];

test.describe('Lesson 1 및 Lesson 2 8개 코너 교과서 원문 매칭 및 undefined 0건 검증', () => {
  test('Lesson 1: 8개 탭 순회 시 원문 문장 노출 및 undefined 0건', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (err) => pageErrors.push(err.message));
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('net::ERR_') && !text.includes('X-Frame-Options') && !text.includes('youtube.com')) {
          consoleErrors.push(text);
        }
      }
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    await page.route('**/api/lesson*', async (route) => {
      const url = route.request().url();
      const body = url.includes('lesson-02') ? lessonData2 : lessonData1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(body),
      });
    });

    await page.goto('/?lesson=01');
    const mainLocator = page.locator('main');
    await expect(mainLocator).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=인증된 교과서 데이터를 안전하게 불러오는 중입니다...')).toBeHidden({ timeout: 10000 });

    for (const corner of L1_CORNERS) {
      const tabButton = page.locator(`[data-testid="corner-tab-${corner.id}"]`);
      await expect(tabButton).toBeAttached({ timeout: 10000 });
      await tabButton.scrollIntoViewIfNeeded();
      await tabButton.click({ force: true });

      await expect.poll(async () => {
        const content = await mainLocator.innerText();
        return content.includes(corner.requiredText);
      }, {
        message: `[L1-${corner.id}] ${corner.name} 탭에 교과서 원문 "${corner.requiredText}"이(가) 나타나야 합니다.`,
        timeout: 8000,
        intervals: [200, 400, 600],
      }).toBe(true);

      const fullContent = await mainLocator.innerText();
      expect(fullContent, `[L1-${corner.id}] 화면에 'undefined' 문자열이 포함되어서는 안 됩니다`).not.toContain('undefined');

      // 교과서 이미지 전면 배제 검증: 화면 내 <img> 태그는 반드시 0개여야 함
      await expect(page.locator('img'), `[L1-${corner.id}] 화면에 <img> 태그가 0개여야 합니다`).toHaveCount(0);
    }

    expect(pageErrors, '페이지 런타임 오류가 발생하지 않아야 합니다').toEqual([]);
    expect(consoleErrors, '브라우저 콘솔 오류가 발생하지 않아야 합니다').toEqual([]);
  });

  test('Lesson 2: 8개 탭 순회 시 원문 문장 노출 및 undefined 0건', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (err) => {
      console.log('>>> [BROWSER PAGE ERROR]', err.message);
      pageErrors.push(err.message);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('net::ERR_') && !text.includes('X-Frame-Options') && !text.includes('youtube.com')) {
          console.log('>>> [BROWSER CONSOLE ERROR]', text);
          consoleErrors.push(text);
        }
      }
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    await page.route('**/api/lesson*', async (route) => {
      const url = route.request().url();
      const body = url.includes('lesson-03') ? lessonData3 : url.includes('lesson-02') ? lessonData2 : lessonData1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(body),
      });
    });

    await page.goto('/?lesson=02');
    const mainLocator = page.locator('main');
    await expect(mainLocator).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=인증된 교과서 데이터를 안전하게 불러오는 중입니다...')).toBeHidden({ timeout: 10000 });

    for (const corner of L2_CORNERS) {
      const tabButton = page.locator(`[data-testid="corner-tab-${corner.id}"]`);
      await expect(tabButton).toBeAttached({ timeout: 10000 });
      await tabButton.scrollIntoViewIfNeeded();
      await tabButton.click({ force: true });

      for (const reqText of corner.requiredTexts) {
        await expect.poll(async () => {
          const content = await mainLocator.innerText();
          return content.includes(reqText);
        }, {
          message: `[L2-${corner.id}] ${corner.name} 탭에 교과서 원문 "${reqText}"이(가) 나타나야 합니다.`,
          timeout: 8000,
          intervals: [200, 400, 600],
        }).toBe(true);
      }

      const fullContent = await mainLocator.innerText();
      expect(fullContent, `[L2-${corner.id}] 화면에 'undefined' 문자열이 포함되어서는 안 됩니다`).not.toContain('undefined');

      // 교과서 이미지 전면 배제 검증: 화면 내 <img> 태그는 반드시 0개여야 함
      await expect(page.locator('img'), `[L2-${corner.id}] 화면에 <img> 태그가 0개여야 합니다`).toHaveCount(0);
    }

    expect(pageErrors, '페이지 런타임 오류가 발생하지 않아야 합니다').toEqual([]);
    expect(consoleErrors, '브라우저 콘솔 오류가 발생하지 않아야 합니다').toEqual([]);
  });

  test('Lesson 3: 8개 탭 순회 시 원문 문장 노출 및 undefined 0건', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (err) => {
      console.log('>>> [BROWSER PAGE ERROR]', err.message);
      pageErrors.push(err.message);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('net::ERR_') && !text.includes('X-Frame-Options') && !text.includes('youtube.com')) {
          console.log('>>> [BROWSER CONSOLE ERROR]', text);
          consoleErrors.push(text);
        }
      }
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    await page.route('**/api/lesson*', async (route) => {
      const url = route.request().url();
      const body = url.includes('lesson-03') ? lessonData3 : url.includes('lesson-02') ? lessonData2 : lessonData1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(body),
      });
    });

    await page.goto('/?lesson=03');
    const mainLocator = page.locator('main');
    await expect(mainLocator).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=인증된 교과서 데이터를 안전하게 불러오는 중입니다...')).toBeHidden({ timeout: 10000 });

    for (const corner of L3_CORNERS) {
      const tabButton = page.locator(`[data-testid="corner-tab-${corner.id}"]`);
      await expect(tabButton).toBeAttached({ timeout: 10000 });
      await tabButton.scrollIntoViewIfNeeded();
      await tabButton.click({ force: true });

      for (const reqText of corner.requiredTexts) {
        await expect.poll(async () => {
          const content = await mainLocator.innerText();
          return content.includes(reqText);
        }, {
          message: `[L3-${corner.id}] ${corner.name} 탭에 교과서 원문 "${reqText}"이(가) 나타나야 합니다.`,
          timeout: 8000,
          intervals: [200, 400, 600],
        }).toBe(true);
      }

      const fullContent = await mainLocator.innerText();
      expect(fullContent, `[L3-${corner.id}] 화면에 'undefined' 문자열이 포함되어서는 안 됩니다`).not.toContain('undefined');

      // 교과서 이미지 전면 배제 검증: 화면 내 <img> 태그는 반드시 0개여야 함
      await expect(page.locator('img'), `[L3-${corner.id}] 화면에 <img> 태그가 0개여야 합니다`).toHaveCount(0);
    }

    expect(pageErrors, '페이지 런타임 오류가 발생하지 않아야 합니다').toEqual([]);
    expect(consoleErrors, '브라우저 콘솔 오류가 발생하지 않아야 합니다').toEqual([]);
  });

  test('Lesson 4: 8개 탭 순회 시 원문 문장 노출 및 undefined 0건', async ({ page }) => {
    const pageErrors: string[] = [];
    const consoleErrors: string[] = [];

    page.on('pageerror', (err) => {
      console.log('>>> [BROWSER PAGE ERROR]', err.message);
      pageErrors.push(err.message);
    });
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        const text = msg.text();
        if (!text.includes('favicon') && !text.includes('net::ERR_') && !text.includes('X-Frame-Options') && !text.includes('youtube.com')) {
          console.log('>>> [BROWSER CONSOLE ERROR]', text);
          consoleErrors.push(text);
        }
      }
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_STUDENT_USER);

    await page.route('**/api/lesson*', async (route) => {
      const url = route.request().url();
      const body = url.includes('lesson-04') ? lessonData4 : url.includes('lesson-03') ? lessonData3 : url.includes('lesson-02') ? lessonData2 : lessonData1;
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(body),
      });
    });

    await page.goto('/?lesson=04');
    const mainLocator = page.locator('main');
    await expect(mainLocator).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=인증된 교과서 데이터를 안전하게 불러오는 중입니다...')).toBeHidden({ timeout: 10000 });

    for (const corner of L4_CORNERS) {
      const tabButton = page.locator(`[data-testid="corner-tab-${corner.id}"]`);
      await expect(tabButton).toBeAttached({ timeout: 10000 });
      await tabButton.scrollIntoViewIfNeeded();
      await tabButton.click({ force: true });

      for (const reqText of corner.requiredTexts) {
        await expect.poll(async () => {
          const content = await mainLocator.innerText();
          return content.includes(reqText);
        }, {
          message: `[L4-${corner.id}] ${corner.name} 탭에 교과서 원문 "${reqText}"이(가) 나타나야 합니다.`,
          timeout: 8000,
          intervals: [200, 400, 600],
        }).toBe(true);
      }

      const fullContent = await mainLocator.innerText();
      expect(fullContent, `[L4-${corner.id}] 화면에 'undefined' 문자열이 포함되어서는 안 됩니다`).not.toContain('undefined');

      // 교과서 이미지 전면 배제 검증: 화면 내 <img> 태그는 반드시 0개여야 함
      await expect(page.locator('img'), `[L4-${corner.id}] 화면에 <img> 태그가 0개여야 합니다`).toHaveCount(0);
    }

    expect(pageErrors, '페이지 런타임 오류가 발생하지 않아야 합니다').toEqual([]);
    expect(consoleErrors, '브라우저 콘솔 오류가 발생하지 않아야 합니다').toEqual([]);
  });
});
