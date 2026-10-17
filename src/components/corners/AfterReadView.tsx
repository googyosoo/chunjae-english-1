import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/auth';
import { CheckCircle2, XCircle, Sparkles, BookOpen } from 'lucide-react';

interface AfterReadViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
  user?: UserProfile | null;
}

export const AfterReadView: React.FC<AfterReadViewProps> = ({ lesson, showTeacherAnswers, user = null }) => {
  const afterCorner = lesson.corners.find(c => c.id === 'after_read');
  const activityData = afterCorner?.activities[0]?.data;
  const summaryData = activityData?.summaryFillBlanks;
  const tfData = activityData?.detailsTF;
  const skillData = activityData?.readingSkill;

  // Summary 선택 빈칸 상태
  const [selectedWords, setSelectedWords] = useState<{ [blankKey: string]: string }>({});
  const [summaryChecked, setSummaryChecked] = useState<boolean>(false);

  // T/F 답변 상태
  const [tfAnswers, setTfAnswers] = useState<{ [id: string]: 'T' | 'F' }>({});
  const [tfChecked, setTfChecked] = useState<boolean>(false);

  // Reading Skill C 답변 상태
  const [skillAnswers, setSkillAnswers] = useState<{ [qId: string]: string }>({});
  const [skillChecked, setSkillChecked] = useState<boolean>(false);

  const handleSelectWord = (blankKey: string, word: string) => {
    setSelectedWords(prev => ({ ...prev, [blankKey]: word }));
  };

  const handleCheckAll = async () => {
    setSummaryChecked(true);
    setTfChecked(true);
    setSkillChecked(true);
    await StorageService.logObservation(user, lesson.lessonNumber, 'After Read 퀴즈 채점', '요약 빈칸, T/F 퀴즈 및 독해 스킬 제출');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* A. Summary: 요약 빈칸 채우기 (p. 19) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
          <h2 className="text-base font-bold text-slate-900">Summary: 본문 핵심 내용 요약 완성하기 (p. 19)</h2>
        </div>

        {/* Word Bank */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4">
          <span className="text-xs font-bold text-slate-600 block mb-2">단어 보관함 (Word Box):</span>
          <div className="flex flex-wrap gap-2">
            {(summaryData?.wordBox || summaryData?.options || []).map(word => (
              <span
                key={word}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Structured Items or Inline Template */}
        {summaryData?.items ? (
          <div className="space-y-3 mb-4">
            {summaryData.items.map((item, idx) => {
              const blankKey = `blank_${idx + 1}`;
              const isSelected = selectedWords[blankKey] || '';
              const isCorrect = isSelected === item.answer;

              return (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className="font-semibold text-slate-700 w-36 shrink-0">{item.stage}:</div>
                  <div className="flex-1 text-slate-800 leading-relaxed">
                    {item.text.split('[blank]')[0]}
                    <select
                      value={isSelected}
                      onChange={e => handleSelectWord(blankKey, e.target.value)}
                      aria-label={`${item.stage} 빈칸 정답 선택`}
                      className={`mx-1 px-2.5 py-1 border rounded-md font-bold text-xs ${
                        summaryChecked
                          ? isCorrect
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                            : 'bg-rose-50 border-rose-500 text-rose-800'
                          : 'bg-white border-slate-300 text-indigo-700'
                      }`}
                    >
                      <option value="">선택</option>
                      {(summaryData?.wordBox || summaryData?.options || []).map(w => (
                        <option key={w} value={w}>{w}</option>
                      ))}
                    </select>
                    {item.text.split('[blank]')[1]}
                  </div>
                  {summaryChecked && (
                    <span className="text-[11px] font-bold">
                      {isCorrect ? <span className="text-emerald-600">✓ 정답</span> : <span className="text-rose-600">✗ 정답: {item.answer}</span>}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-sm leading-loose text-slate-800">
            Selena realized that she suffered from{' '}
            <select
              value={selectedWords['blank_1'] || ''}
              onChange={e => handleSelectWord('blank_1', e.target.value)}
              aria-label="Summary 빈칸 1"
              className="px-2 py-0.5 border border-slate-300 bg-white rounded-md font-bold text-indigo-700"
            >
              <option value="">(1) 선택</option>
              {(summaryData?.wordBox || summaryData?.options || []).map(w => <option key={w} value={w}>{w}</option>)}
            </select>{' '}
            and decided to take a two-week break from social media.
          </div>
        )}

        {showTeacherAnswers && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
            🔑 [교과서 정답키 (p.152)]: (1) FOMO, (2) out of, (3) guitar, (4) social media site, (5) free, (6) control
          </div>
        )}
      </section>

      {/* B. Details T/F Check (p. 19) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">B</span>
          <h2 className="text-base font-bold text-slate-900">Details Check: 사실 일치 T/F 퀴즈 (p. 19)</h2>
        </div>

        <div className="space-y-3">
          {tfData?.map((item, idx) => {
            const chosen = tfAnswers[item.id];
            const isCorrect = chosen === item.answer;

            return (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {idx + 1}. {item.statement}
                  </p>
                  <div className="flex gap-1.5 shrink-0">
                    {(['T', 'F'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setTfAnswers(prev => ({ ...prev, [item.id]: opt }))}
                        aria-label={`Statement ${idx + 1} ${opt}`}
                        className={`w-9 h-9 rounded-lg font-bold text-xs border transition-all ${
                          chosen === opt
                            ? tfChecked
                              ? isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>

                {tfChecked && (
                  <div className={`p-2.5 rounded-lg text-xs font-medium ${
                    isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                  }`}>
                    <div className="font-bold mb-0.5">
                      {isCorrect ? '✓ 정답입니다!' : `✗ 오답 (정답: ${item.answer})`}
                    </div>
                    <div>근거 해설: {item.explanation}</div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* C. Reading Skill: Contextual Meaning of an Expression (p. 20) */}
      {skillData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">C</span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Reading Skill: {skillData.skillName} (p. 20)</h2>
              {skillData.skillDesc && <p className="text-xs text-slate-500 mt-0.5">{skillData.skillDesc}</p>}
            </div>
          </div>

          {/* Example Box */}
          {skillData.example && (
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 text-xs space-y-2">
              <span className="font-bold text-indigo-900 block">💡 교과서 예시 (Example):</span>
              <p className="font-semibold text-slate-800">표현: "{skillData.example.expression}"</p>
              <p className="text-slate-600 italic bg-white p-2.5 rounded-lg border border-indigo-100">
                "{skillData.example.context}"
              </p>
              <p className="text-emerald-800 font-medium">✓ 의미: {skillData.example.options.find(o => o.label === skillData.example?.answer)?.text} (정답: {skillData.example.answer})</p>
            </div>
          )}

          {/* Questions */}
          <div className="space-y-4">
            {skillData.questions.map((q, idx) => {
              const chosen = skillAnswers[q.id];
              const isCorrect = chosen === q.answer;

              return (
                <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-3">
                  {q.passage && (
                    <div className="p-3 bg-white rounded-lg border border-slate-200 text-slate-700 leading-relaxed italic">
                      "{q.passage}"
                    </div>
                  )}
                  <p className="font-bold text-slate-900">
                    {idx + 1}. 밑줄 친 {q.target || q.question}의 문맥적 의미는?
                  </p>
                  <div className="grid grid-cols-1 gap-2">
                    {q.options.map(opt => (
                      <button
                        key={opt.label}
                        onClick={() => setSkillAnswers(prev => ({ ...prev, [q.id]: opt.label }))}
                        aria-label={`Option ${opt.label}: ${opt.text}`}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between ${
                          chosen === opt.label
                            ? skillChecked
                              ? isCorrect
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                                : 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                              : 'bg-indigo-50 border-indigo-500 text-indigo-950 font-bold'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-indigo-300'
                        }`}
                      >
                        <span><span className="font-bold mr-1.5 uppercase">({opt.label})</span> {opt.text}</span>
                        {skillChecked && opt.label === q.answer && (
                          <span className="text-emerald-700 font-bold text-[11px]">✓ 정답</span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Global Check Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleCheckAll}
          aria-label="After Read 전체 채점 및 확인"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          전체 채점 및 결과 확인
        </button>
      </div>
    </div>
  );
};
