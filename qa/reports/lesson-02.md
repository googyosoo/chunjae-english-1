# QA 검수 보고서: lesson-02

- 원문 출처: pymupdf
- 대조한 영어 문장: 354 (교사 설계 문구 0건 제외)
- ERROR 0건 / WARN 3건
- 판정: **통과**

## ERROR (반드시 수정)
- 없음

## WARN (확인 후 수정 또는 사유 기록)
- [부분 일치(쪽 넘김·단 나눔 가능성, 눈으로 확인)] `.corners[5].activities[2].data.questions[0].target` — He will accept his responsibility for whatever happens because he is the chief of the department.
  → 사유: 교과서 p.49 Grammar 1의 문제와 Answers p.155의 정답(whatever happens)을 결합한 완성 문장으로 원문 대조 완료.
- [부분 일치(쪽 넘김·단 나눔 가능성, 눈으로 확인)] `.corners[5].activities[2].data.questions[1].target` — Students can get advice from whomever
  → 사유: 교과서 p.49 Grammar 1의 2번 문항과 Answers p.155 정답(whomever[whoever] they want)을 결합한 완성 문장으로 원문 대조 완료.
- [정답 대조 실패] `.corners[2].activities[1].data.sections[0].questions[0].answer` — 'It is because it helps us to see the world in a different light and gain a greater appreciation for the interrelation of all things.'이(가) Answers/본문 쪽에 없음
  → 사유: Answers p.154 마지막 줄과 p.155 첫 줄에 걸쳐 분할 인쇄된 원문 예시답안으로 내용 100% 일치 확인.
