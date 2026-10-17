# 작업 지시서 05 — 다단원 구조 + 콘텐츠 파이프라인 + Lesson 2

작성: Claude (계획·검수) / 실행: Antigravity / 작성일: 2026-10-17

## 0. 목표와 완료 기준
Lesson 2(pp.32–55)를 Lesson 1과 같은 품질로 추가한다. 이후 L3~L5를 "JSON 파일 추가 + 검증 통과"만으로 늘릴 수 있는 구조를 만든다.

완료 기준(모두 충족해야 제출):
1. `pipeline/verify.py content/lesson-01.json` → 원문 미검증 문장 0건 (화이트리스트 필드 제외)
2. `pipeline/verify.py content/lesson-02.json` → 원문 미검증 문장 0건, 정답 대조 불일치 0건
3. `npm ci && npm run build && npm test` 클린 환경에서 통과, 단원 2개 모두 zod 검증 통과
4. E2E: L1·L2 각각 8개 코너 × 360px/1280px, 페이지 오류 0, 화면에 `undefined` 0건, 코너별 원문 문장 1개 이상 표시
5. `scripts/test-dist-bundle.py`가 L1·L2 전체 문장 대조 → dist에 교과서 문장 0건

## 1. 사전 작업
- 수정 04 변경분(미커밋 10개 파일)을 먼저 커밋한다.

## 2. 다단원 구조 (코드에 박힌 Lesson 1 제거)
- `App.tsx`: `/api/lesson?id=lesson-01`, `getProgressAsync(user, 1)`, `lessonNumber={1}` → 선택된 단원 id/번호 사용
- 단원 선택 화면(홈) 추가: 단원 카드(번호·제목·주제·진도율). URL에 단원 반영(`?lesson=02` 또는 `/lesson/02`), 새로고침해도 유지
- `Navbar.tsx` "Lesson 1 Digital Well-being", `ReadView.tsx` "Lesson 1 Main Text", `WritingView.tsx` "Six Strings" 주석 등 단원 고정 문구 → 데이터에서 읽기
- 코너 탭 제목·부제는 데이터(`corner.title`)에서 읽는다. 8번째 코너는 단원마다 다르다(L1 Go Global, L2 Work Together) → `CornerIdSchema`에 `work_together` 추가 또는 8번째 코너를 `extension`으로 일반화

## 3. 스키마 일반화 (가장 중요)
현재 스키마와 화면은 L1 전용 활동 id(`texting_abbreviations`, `comm_write_talk` 등)로 찾는다. L2는 활동 형태가 다르므로 **활동 유형(type) 기반**으로 바꾼다.
- 화면은 `activityId`가 아니라 `type`으로 컴포넌트를 고른다. 같은 type은 어느 단원이든 같은 컴포넌트.
- 최소 유형: `video_watch`, `dialogue`(대화+문항), `mcq`(텍스트/이미지 보기), `tf`, `choose_word`(A/B 중 고르기), `word_box_fill`(보기 상자 빈칸), `match`(그림↔설명), `vocab_fill`, `discussion`(토의·의견 쓰기), `interactive_reader`, `reading_skill`, `read_further`, `word_uses`, `common_phrases`, `grammar_transform`, `process_writing`(STEP1~4), `editing_practice`, `group_project`(Work Together), `self_check`
- 알 수 없는 type → 해당 활동 자리에 "지원하지 않는 활동 유형: <type>" 표시(앱 전체는 계속 동작)
- L1 JSON도 새 스키마로 변환하고, L1 E2E가 그대로 통과해야 한다

## 4. 콘텐츠 파이프라인 `pipeline/`
AI가 JSON을 직접 지어내는 방식을 끝낸다. 원문은 스크립트가 뽑고, AI는 구조화만, 검증은 스크립트가 한다.
- `pipeline/lessons.json`: 단원별 쪽 범위 — 본문 / Scripts / Answers / Sources
  - L1: 본문 8–31, Scripts 142–143, Answers 152–154
  - L2: 본문 32–55, Scripts 143–145(p.146 상단까지 확인), Answers 154–156(p.157부터 L3), Sources 168–171
- `pipeline/extract.py <lesson>`: 쪽별 원문 텍스트 → `pipeline/raw/<lesson>/p<쪽>.txt` (pdftotext, `-layout` 판과 일반 판 둘 다). 쪽 이미지 → `pdftoppm -r 150`으로 렌더링 후 작품·삽화 영역을 잘라 `content/assets/<lesson>/`에 저장
- `pipeline/verify.py <json>`:
  1. zod 스키마 검증(node 스크립트 호출)
  2. 영어 문자열(4단어 이상) 전부가 해당 단원 원문(raw)에 존재하는지 대조. 여백 질문(Q1~)이 문장 중간에 끼는 경우를 고려해 5단어 단위 겹침 비율 80% 이상이면 일치로 본다. 화이트리스트(`ko`, `translation`, `explanation`, `feedback`, UI 라벨)는 제외
  3. 정답 대조: 활동별 `answer`를 Answers 쪽 원문과 비교
  4. 모든 활동에 `page`(원문 쪽 번호) 필수, 영상·외부 자료에 `sourceRef`(Sources 쪽의 원문 줄) 필수
  5. 결과를 `pipeline/reports/<lesson>.md`로 출력(미검증 문장 목록, 정답 불일치, 누락 코너)
- **먼저 L1에 돌려 0건이 나오는 것을 확인한 뒤** L2를 만든다

## 5. Lesson 2 콘텐츠 (교과서 원문 그대로, 새로 짓기 금지)
| 코너 | 쪽 | 활동 | 유의점 |
|---|---|---|---|
| Introduction | 32–33 | Topic Question, 해시태그, Lesson Flow | |
| Communicate | 34–35 | A Watch and Think, B Dialogue 1·2, C Listen and Write, D Match and Talk | Dialogue 1 보기는 **그림**(이미지 MCQ). C는 보기 상자 빈칸(그래프 아님). D는 그림↔설명 매칭. Watch and Think 출처는 sprouts **웹페이지**(YouTube 아님) — 영상 대신 출처 링크 + 대본 |
| Read | 36–42, 45 | Background Check(작품 보고 토의), Vocabulary Check, 본문 3부(Robin Yayla / Rob Gonsalves / Vincent Bal) + Q1~Q11, Reading Tip, Read Further(Su Blackwell, p.45) | 본문의 작품 이미지와 캡션(▲Canal Volley 등) 포함. 소제목은 교과서 표기만 |
| After Read | 43–44 | Summary(보기 상자), Details(**단어 고르기**, T/F 아님), Reading Skill(낱말 뜻 추론) | |
| Share Thoughts | 46–47 | STEP 1 영상(Boston 25 News, YouTube `bEp3KTbGu08`, Sources p.169) + 문항, STEP 2~3 창의적 인물·작품 찾기 | |
| Language Focus | 48–49 | Word Uses `draw`, Common Phrases, Grammar in Context(whatever/whoever 등) | |
| Write & Present | 50–52 | Model Writing *The Dancing House*, STEP 1~4, Editing Practice(대명사 일치) | 모델 글과 부록 예시답안을 혼동하지 말 것 |
| Work Together | 53 | Making an Artwork with a Scenic Photo (3인 모둠) | 결과물 업로드는 P3 범위. 이번엔 단계 안내 + 개인 메모까지 |
| Wrap Up / Summary | 54–55 | Wrap Up A~C, Lesson Summary self-check | |

- 대본: Scripts pp.143–145의 L2 부분을 축약 없이
- 정답: Answers pp.154–156의 L2 부분
- 한국어 해석·어휘 주석은 AI 작성 허용(검증 대상 아님). 단, 영어 원문은 한 글자도 바꾸지 않는다

## 6. 이미지 보호
- 교과서 이미지는 `public/`에 두지 않는다. `content/assets/<lesson>/`에 두고 인증된 API(`/api/asset?lesson=02&name=...`)로만 제공(`api/lesson.ts`와 같은 토큰 검증, `vercel.json` includeFiles에 assets 포함)
- 이미지마다 `alt`(한국어 설명) 작성

## 7. 이월 확인 사항 (L1)
- L1 Share Your Thoughts 출처는 Sources p.169 기준 GCFGlobal **웹페이지**다. 현재 JSON의 YouTube ID `ybCoDEZ8sP8`는 근거가 없으므로, 근거를 찾지 못하면 영상 대신 출처 링크로 바꾼다

## 8. 금지 사항
- 교과서에 없는 영어 문장·문항·선택지 생성 금지
- 테스트를 통과시키려고 기대값을 데이터에 맞춰 고치는 것 금지(원문과 다르면 데이터를 고친다)
- 요청 범위 밖 리팩토링·새 라이브러리 추가 금지(추가 시 사유를 보고서에 적는다)
- 에뮬레이터·E2E 등 실행하지 않은 테스트를 통과로 보고 금지

## 9. 제출물
- 커밋(작업 단위별), `pipeline/reports/lesson-01.md`, `pipeline/reports/lesson-02.md`
- 클린 설치 후 build/test/E2E 실행 로그
- L2 각 코너 스크린샷(360px)
