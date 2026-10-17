import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const lessonData1 = JSON.parse(
  fs.readFileSync(path.resolve(process.cwd(), 'content/lesson-01.json'), 'utf-8')
);

const MOCK_TEACHER_USER = {
  uid: 'e2e_teacher_kim',
  email: 'teacher.kim@simin.hs.kr',
  name: '김선생',
  role: 'teacher',
  grade: 1,
  classNumber: 1,
  studentNumber: 0,
};

const MOCK_STUDENT_USER = {
  uid: 'e2e_student_lee',
  email: 's10115@simin.hs.kr',
  name: '이학생',
  role: 'student',
  grade: 1,
  classNumber: 1,
  studentNumber: 15,
};

test.describe('Phase 3: 교사용 학급 운영 스튜디오 E2E 브라우저 테스트', () => {
  test('1. 교사 로그인 시 상단 네비게이션바에 [교사 대시보드] 버튼이 노출되고 모달이 열린다', async ({ page }) => {
    page.on('pageerror', (err) => console.log('PAGE ERROR:', err.message));
    page.on('console', (msg) => console.log(`CONSOLE [${msg.type()}]:`, msg.text()));

    // 1. 교과서 모의 응답 API 가로채기
    await page.route('**/api/lesson*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData1),
      });
    });

    // 2. 교사 사용자 주입
    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_TEACHER_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');

    const bodyHtml = await page.innerHTML('body');
    console.log('CURRENT BODY HTML:', bodyHtml.substring(0, 1000));

    // 3. 교사 대시보드 버튼 확인 및 클릭
    const dashboardBtn = page.getByRole('button', { name: '교사용 대시보드 열기' });
    await expect(dashboardBtn).toBeVisible({ timeout: 10000 });
    await dashboardBtn.click();
    await page.waitForTimeout(1000);
    const afterClickHtml = await page.innerHTML('body');
    console.log('AFTER CLICK HTML:', afterClickHtml.includes('교사용 학급 운영 스튜디오') ? 'MODAL FOUND' : 'MODAL NOT FOUND');

    // 4. 모달 헤더 및 5대 탭 확인
    await expect(page.getByText('교사용 학급 운영 스튜디오')).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: '반 대시보드' })).toBeVisible();
    await expect(page.getByRole('button', { name: '반 명단 등록' })).toBeVisible();
    await expect(page.getByRole('button', { name: '수업 운영 & 코너 잠금' })).toBeVisible();
    await expect(page.getByRole('button', { name: '서술형 검토 & 승인' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'NEIS 세특 내보내기' })).toBeVisible();
  });

  test('2. 반 명단 등록 탭에서 CSV 파싱, 유효성 검증 및 학생 등록이 정상 동작한다', async ({ page }) => {
    await page.route('**/api/lesson*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData1),
      });
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_TEACHER_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');

    const dashboardBtn = page.getByRole('button', { name: '교사용 대시보드 열기' });
    await expect(dashboardBtn).toBeVisible({ timeout: 10000 });
    await dashboardBtn.click();

    await expect(page.getByText('교사용 학급 운영 스튜디오')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: '반 명단 등록' }).click();

    // CSV 직접 입력 텍스트영역에 유효한 학생과 오류 행 입력
    const testCsv = `학년,반,번호,이름,이메일
1,1,1,김심인,s10101@simin.hs.kr
1,1,2,이대구,s10102@simin.hs.kr
1,1,99,오류학생,invalid@gmail.com`;

    const textarea = page.locator('textarea[placeholder*="학년,반,번호"]');
    await textarea.fill(testCsv);

    // 검증 결과 확인: 정상 2건, 오류 1건
    await expect(page.getByText('정상 2건')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('오류 1건')).toBeVisible({ timeout: 5000 });

    // 명단 등록 확정 버튼 클릭
    const submitBtn = page.getByRole('button', { name: '명단 시스템에 등록하기' });
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // 성공 메시지 및 명단 테이블에 학생 등록 확인
    await expect(page.getByText('성공: 2명의 학생 명단이 등록되었습니다.')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('김심인')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('이대구')).toBeVisible({ timeout: 5000 });
  });

  test('3. 수업 운영 탭에서 코너를 잠그면 학생 화면에 잠금 카드와 자물쇠가 표시된다', async ({ page }) => {
    // 1) 교사 계정으로 코너 잠금 설정
    await page.route('**/api/lesson*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData1),
      });
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_TEACHER_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');

    const dashboardBtn = page.getByRole('button', { name: '교사용 대시보드 열기' });
    await expect(dashboardBtn).toBeVisible({ timeout: 10000 });
    await dashboardBtn.click();

    await expect(page.getByText('교사용 학급 운영 스튜디오')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: '수업 운영 & 코너 잠금' }).click();

    // 7번째 코너 (Writing) 잠그기 클릭
    const lockWritingBtn = page.getByRole('button', { name: 'Writing: 글쓰기 & 표현 잠금 전환' });
    await lockWritingBtn.click();
    await expect(lockWritingBtn).toHaveText('잠금 해제', { timeout: 5000 });

    // 모달 닫기
    await page.getByRole('button', { name: '대시보드 닫기' }).click();
    await expect(page.getByText('교사용 학급 운영 스튜디오')).toBeHidden({ timeout: 5000 });

    // 2) 학생 사용자로 전환하여 페이지 갱신 (addInitScript로 유지)
    await page.addInitScript((mockStudent) => {
      (window as any).__E2E_USER__ = mockStudent;
    }, MOCK_STUDENT_USER);

    await page.evaluate((mockStudent) => {
      (window as any).__E2E_USER__ = mockStudent;
    }, MOCK_STUDENT_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');

    // 코너 탭 중 write_present 탭에 (잠김) 표시 확인
    const writingTab = page.locator('[data-testid="corner-tab-write_present"]');
    await expect(writingTab).toContainText('(잠김)', { timeout: 10000 });

    // 잠긴 코너 확실히 evaluate로 클릭
    await writingTab.scrollIntoViewIfNeeded().catch(() => {});
    await writingTab.evaluate((el: HTMLElement) => el.click());

    // 잠긴 코너 안내 화면 확인
    await expect(page.getByText('선생님이 현재 이 코너를 잠가두었습니다')).toBeVisible({ timeout: 5000 });
    await expect(page.getByText('수업 진도 및 공정한 평가를 위해 교사가 일시적으로 접근을 통제하고 있습니다.')).toBeVisible({ timeout: 5000 });
  });

  test('4. NEIS 세특 내보내기 탭에서 다운로드 버튼이 정상 렌더링된다', async ({ page }) => {
    await page.route('**/api/lesson*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json; charset=utf-8',
        body: JSON.stringify(lessonData1),
      });
    });

    await page.addInitScript((mockUser) => {
      (window as any).__E2E_USER__ = mockUser;
    }, MOCK_TEACHER_USER);

    await page.goto('/?lesson=01');
    await page.waitForLoadState('domcontentloaded');

    const dashboardBtn = page.getByRole('button', { name: '교사용 대시보드 열기' });
    await expect(dashboardBtn).toBeVisible({ timeout: 10000 });
    await dashboardBtn.click();

    await expect(page.getByText('교사용 학급 운영 스튜디오')).toBeVisible({ timeout: 10000 });
    await page.getByRole('button', { name: 'NEIS 세특 내보내기' }).click();

    await expect(page.getByRole('button', { name: '전체 활동기록 CSV 다운로드' })).toBeVisible({ timeout: 5000 });
    await expect(page.getByRole('button', { name: '승인본만 CSV 다운로드' })).toBeVisible({ timeout: 5000 });
  });
});
