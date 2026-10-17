# 수정 지시 06 — Lesson 2 검수 반영 + QA 자가 검수 도입

작성: Claude (검수) / 실행: Antigravity / 작성일: 2026-10-17 (이미지 정책 변경 반영)

## 0. 새 작업 규칙: 보고 전에 반드시 `qa/audit.py`를 직접 돌린다
- `qa/audit.py`는 Claude가 만든 **독립 검수 스크립트**다. Antigravity는 이 파일과 `qa/` 폴더를 **수정하지 않는다**(오탐이라고 판단되면 보고서에 사유를 적고 Claude에게 넘긴다).
- `package.json` scripts에 추가: `"qa": "python qa/audit.py --all --dist dist"`, `"verify:all": "npm run build && npm test && npm run qa"`
- 작업 루프: 수정 → `npm run verify:all` → ERROR가 있으면 고치고 다시 실행 → **ERROR 0건이 된 뒤에만** 완료 보고
- 보고서 `qa/reports/lesson-XX.md`를 커밋에 포함. WARN은 고치거나, 고치지 않는 이유를 보고서 아래에 한 줄씩 적는다
- `pipeline/lessons.json`의 `pdfPath`를 실제 PDF 위치로 고칠 것(현재 PDF를 못 찾아 원문 대조가 `raw-fallback`으로 돌아감). PyMuPDF(`fitz`)가 설치된 환경에서 실행

현재 실행 결과(raw-fallback 기준): lesson-01 ERROR 1 / WARN 2, lesson-02 ERROR 11 / WARN 12

## A. 이미지 정책 변경: 교과서 이미지는 넣지 않는다
1. `content/assets/` 폴더, `api/asset.ts`, JSON의 `asset` 필드, 화면의 `<img>`를 모두 삭제. `vercel.json`의 includeFiles는 `content/**`를 유지
2. 그림이 필요한 자리는 **쪽수 안내**로 바꾼다. 데이터에 `pageRef`(숫자)와 `figureNote`(한국어 한 줄)를 두고, 화면에 "📖 교과서 p.38의 그림을 보세요"처럼 표시
   - Dialogue 1(p.34) 보기: "교과서 p.34의 그림 a·b·c를 보고 고르세요" + a/b/c 버튼
   - Match and Talk(p.35), 펭귄 광고(p.35), Background Check 작품(p.36), 본문 작품(pp.37–42), Read Further(p.45), Dancing House(p.50), Work Together 사진(p.53)도 같은 방식
   - 작품 캡션(▲Canal Volley 등)은 텍스트로만 표시 가능(원문 그대로)

## B. 반드시 수정 (qa ERROR 항목)
3. **빠진 코너:** Wrap Up(p.54 A~C)과 Lesson Summary(p.55 self-check). 8번째 코너(Work Together) 안, 모둠 활동 뒤에 넣는다
4. **근거 없는 영상:**
   - L2 Watch and Think의 `0hX0_8e64cE`는 출처가 아니다(Sources p.169: sprouts **웹페이지**). 영상 플레이어를 빼고 출처 링크와 대본을 보여준다. 출처 표기에 섞인 "Pew Research" 삭제
   - L1 Share Your Thoughts의 `ybCoDEZ8sP8`도 GCFGlobal 웹페이지 링크로 바꾼다
5. **정답 노출:** Grammar 2(p.49) 3문항 모두 `prompt`에 정답이 들어 있다. 교과서처럼 빈칸 + 괄호 단어로 바꾼다
   - 예: `For a healthy life, [blank] eat fresh vegetables and work out regularly. ( to / do / all / we / have / is )`
6. **답할 수 없는 문항:** Vocabulary Check(p.36) 문항에 `options`가 없어 버튼이 안 나온다. `wordBox`를 보기로 쓰도록 화면 수정

## C. WARN 항목
7. 지어낸 소제목 삭제: "Dialogue 1: Unique Composition", "Dialogue 2: René Magritte Exhibition", "Robin Yayla: Digital Storyteller", "Rob Gonsalves: Magic Realism", "Conclusion: The Power of Imagination", "Connecting Separate Things"
   - 교과서 표기("Dialogue 1", "Beyond the Scene", "Fun Shadows")만 쓴다. 교과서에 제목이 없는 곳은 제목 없이 둔다
8. Read Further(p.45)를 본문 뒤로 옮긴다
9. 정답 대조 실패 2건(`whomever they want`, Q1 예시답안)은 Answers p.155 원문과 다시 비교해서 고치거나 사유를 적는다
10. `pipeline/verify.py` 화이트리스트에서 문항 본문 키(`statement`, `prompt`, `example`, `expression`, `instruction`, `sample`, `sampleAnswer`, `target`, `corrections`)를 빼고, 정답 대조 단계를 추가한다(지시서 05의 4-3)

## D. 완료 기준
- `npm run verify:all`: 클린 설치(`npm ci`) 후 build·test·qa 모두 통과, **qa ERROR 0건**(L1·L2), 원문 출처가 `pymupdf`로 표시될 것
- E2E 원문 확인 문장에 `Fun Shadows`, Wrap Up 문항 1개, Lesson Summary 문장 1개 추가. 화면에 `<img>` 0개
- 커밋: 작업 단위별 + `qa/reports/*.md`
