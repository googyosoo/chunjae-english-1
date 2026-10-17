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
  const activities = afterCorner?.activities || [];
  
  const summaryAct = activities.find(a => a.type === 'summary' || a.activityId.includes('summary'));
  const summaryData = (summaryAct?.data?.summaryDialogue || summaryAct?.data?.summaryFillIn || summaryAct?.data?.summaryFillBlanks || summaryAct?.data) as any;

  const tfAct = activities.find(a => a.type.includes('details') || a.activityId.includes('details'));
  const tfList = (tfAct?.data?.detailsTf || tfAct?.data?.detailsTF || (Array.isArray(tfAct?.data) ? tfAct?.data : null)) as any[] | null;
  const tfData = (tfList || tfAct?.data) as any;

  const skillAct = activities.find(a => a.type.includes('skill') || a.activityId.includes('skill'));
  const skillData = (skillAct?.data?.readingSkill || skillAct?.data) as any;

  // Summary 선택 빈칸 상태
  const [selectedWords, setSelectedWords] = useState<{ [blankKey: string]: string }>({});
  const [summaryChecked, setSummaryChecked] = useState<boolean>(false);

  // Details 답변 상태
  const [detailsAnswers, setDetailsAnswers] = useState<{ [id: string]: string }>({});
  const [detailsChecked, setDetailsChecked] = useState<boolean>(false);

  // Reading Skill C 답변 상태
  const [skillAnswers, setSkillAnswers] = useState<{ [qId: string]: string }>({});
  const [skillChecked, setSkillChecked] = useState<boolean>(false);

  const handleSelectWord = (blankKey: string, word: string) => {
    setSelectedWords(prev => ({ ...prev, [blankKey]: word }));
  };

  const handleCheckAll = async () => {
    setSummaryChecked(true);
    setDetailsChecked(true);
    setSkillChecked(true);
    await StorageService.logObservation(user, lesson.lessonNumber, 'After Read 퀴즈 채점', '요약 빈칸, 세부 사실 퀴즈 및 독해 스킬 제출');
  };

  const wordBox = summaryData?.wordsBox || summaryData?.wordBox || summaryData?.options || summaryData?.summaryDialogue?.wordsBox || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* A. Summary: 요약 빈칸 채우기 */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
          <h2 className="text-base font-bold text-slate-900">Summary: 본문 핵심 내용 요약 완성하기</h2>
        </div>

        {/* Word Bank */}
        {wordBox.length > 0 && (
          <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4">
            <span className="text-xs font-bold text-slate-600 block mb-2">단어 보관함 (Word Box):</span>
            <div className="flex flex-wrap gap-2">
              {wordBox.map((word: string) => (
                <span
                  key={word}
                  className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* L1: Structured Items */}
        {summaryData?.items && (
          <div className="space-y-3 mb-4">
            {summaryData.items.map((item: any, idx: number) => {
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
                      {wordBox.map((w: string) => (
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
        )}

        {/* L2: Artists Structured Summary */}
        {summaryData?.artists && (
          <div className="space-y-3 mb-4">
            {summaryData.artists.map((item: any, idx: number) => {
              const blankKey = `artist_${idx}`;
              const isSelected = selectedWords[blankKey] || '';
              const isCorrect = item.blanks?.includes(isSelected);

              return (
                <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <span className="font-bold text-indigo-700 block text-xs sm:text-sm">{item.artist}</span>
                  <div className="text-slate-800 leading-relaxed">
                    {item.text.split('[blank]').map((part: string, pIdx: number) => (
                      <React.Fragment key={pIdx}>
                        {part}
                        {pIdx < item.text.split('[blank]').length - 1 && (
                          <select
                            value={selectedWords[`${blankKey}_${pIdx}`] || ''}
                            onChange={e => handleSelectWord(`${blankKey}_${pIdx}`, e.target.value)}
                            aria-label={`${item.artist} 빈칸 ${pIdx + 1}`}
                            className="mx-1 px-2 py-0.5 border border-slate-300 rounded font-bold text-indigo-700 bg-white"
                          >
                            <option value="">선택</option>
                            {wordBox.map((w: string) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* L3: Food Categories Summary */}
        {summaryData?.categories && (
          <div className="space-y-4 mb-4">
            {summaryData.categories.map((cat: any, cIdx: number) => (
              <div key={cIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <span className="font-bold text-indigo-700 block text-xs sm:text-sm">{cat.category}</span>
                <ul className="space-y-2">
                  {cat.items?.map((item: any, iIdx: number) => {
                    const blankKey = `cat_${cIdx}_${iIdx}`;
                    const isSelected = selectedWords[blankKey] || '';
                    const isCorrect = item.answer ? isSelected.toLowerCase() === item.answer.toLowerCase() : true;
                    const hasBlank = item.text.includes('[');

                    if (!hasBlank) {
                      return (
                        <li key={iIdx} className="text-slate-800 list-disc list-inside leading-relaxed">
                          {item.text}
                        </li>
                      );
                    }

                    const parts = item.text.split(/\[.*?\]/);

                    return (
                      <li key={iIdx} className="text-slate-800 list-disc list-inside leading-relaxed flex flex-wrap items-center gap-1">
                        <span>{parts[0]}</span>
                        <select
                          value={isSelected}
                          onChange={e => handleSelectWord(blankKey, e.target.value)}
                          aria-label={`${cat.category} 빈칸 선택`}
                          className={`mx-1 px-2.5 py-1 border rounded-md font-bold text-xs ${
                            summaryChecked
                              ? isCorrect
                                ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                : 'bg-rose-50 border-rose-500 text-rose-800'
                              : 'bg-white border-slate-300 text-indigo-700'
                          }`}
                        >
                          <option value="">선택</option>
                          {wordBox.map((w: string) => (
                            <option key={w} value={w}>{w}</option>
                          ))}
                        </select>
                        <span>{parts[1]}</span>
                        {summaryChecked && item.answer && (
                          <span className="text-[11px] font-bold ml-2">
                            {isCorrect ? (
                              <span className="text-emerald-600">✓ 정답</span>
                            ) : (
                              <span className="text-rose-600">✗ 정답: {item.answer}</span>
                            )}
                          </span>
                        )}
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        {/* L4: Dialogue Summary (pairs) */}
        {summaryData?.pairs && (
          <div className="space-y-4 mb-4">
            {summaryData.pairs.map((pair: any, pIdx: number) => {
              const blankKey = `pair_${pIdx}`;
              const isSelected = selectedWords[blankKey] || '';
              const isCorrect = pair.answer ? isSelected.toLowerCase() === pair.answer.toLowerCase() : true;
              const hasBlank = pair.answerSentence?.includes('[');

              return (
                <div key={pIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start gap-2">
                    <span className="font-bold text-indigo-700 shrink-0">Q:</span>
                    <span className="font-semibold text-slate-800">{pair.question}</span>
                  </div>
                  <div className="flex items-start gap-2 text-slate-800 leading-relaxed">
                    <span className="font-bold text-emerald-700 shrink-0">A:</span>
                    <div>
                      {hasBlank ? (
                        <>
                          <span>{pair.answerSentence.split(/\[.*?\]/)[0]}</span>
                          <select
                            value={isSelected}
                            onChange={e => handleSelectWord(blankKey, e.target.value)}
                            aria-label={`Q${pIdx + 1} 빈칸 선택`}
                            className={`mx-1 px-2.5 py-1 border rounded-md font-bold text-xs ${
                              summaryChecked
                                ? isCorrect
                                  ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
                                  : 'bg-rose-50 border-rose-500 text-rose-800'
                                : 'bg-white border-slate-300 text-indigo-700'
                            }`}
                          >
                            <option value="">선택</option>
                            {wordBox.map((w: string) => (
                              <option key={w} value={w}>{w}</option>
                            ))}
                          </select>
                          <span>{pair.answerSentence.split(/\[.*?\]/)[1]}</span>
                        </>
                      ) : (
                        <span>{pair.answerSentence}</span>
                      )}
                      {summaryChecked && pair.answer && (
                        <span className="text-[11px] font-bold ml-2">
                          {isCorrect ? (
                            <span className="text-emerald-600">✓ 정답</span>
                          ) : (
                            <span className="text-rose-600">✗ 정답: {pair.answer}</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {showTeacherAnswers && summaryData?.items && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
            🔑 [교과서 정답키]: {summaryData.items.map((it: any, idx: number) => `(${idx + 1}) ${it.answer}`).join(', ')}
          </div>
        )}

        {showTeacherAnswers && summaryData?.pairs && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
            🔑 [교과서 정답키]: {summaryData.pairs.map((p: any, idx: number) => `(${idx + 1}) ${p.answer}`).join(', ')}
          </div>
        )}
      </section>

      {/* B. Details Check */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">B</span>
          <h2 className="text-base font-bold text-slate-900">Details Check: 세부 내용 이해 확인</h2>
        </div>

        {/* L1 & L3: Array of T/F */}
        {Array.isArray(tfList) && (
          <div className="space-y-3">
            {tfData.map((item: any, idx: number) => {
              const chosen = detailsAnswers[item.id];
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
                          onClick={() => setDetailsAnswers(prev => ({ ...prev, [item.id]: opt }))}
                          aria-label={`Statement ${idx + 1} ${opt}`}
                          className={`w-9 h-9 rounded-lg font-bold text-xs border transition-all ${
                            chosen === opt
                              ? detailsChecked
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

                  {detailsChecked && (
                    <div className={`p-2.5 rounded-lg text-xs font-medium ${
                      isCorrect ? 'bg-emerald-50 text-emerald-800' : 'bg-rose-50 text-rose-800'
                    }`}>
                      <div className="font-bold mb-0.5">
                        {isCorrect ? '✓ 정답입니다!' : `✗ 오답 (정답: ${item.answer})`}
                      </div>
                      {item.explanation && <div>근거 해설: {item.explanation}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* L2: Questions with Multiple Choice Options */}
        {tfData?.questions && (
          <div className="space-y-3">
            {tfData.questions.map((q: any, idx: number) => {
              const chosen = detailsAnswers[q.id];
              const isCorrect = chosen === q.answer;

              return (
                <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <p className="font-semibold text-slate-900 text-xs sm:text-sm">
                    {idx + 1}. {q.sentence}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {q.options?.map((opt: string) => (
                      <button
                        key={opt}
                        onClick={() => setDetailsAnswers(prev => ({ ...prev, [q.id]: opt }))}
                        className={`px-3.5 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                          chosen === opt
                            ? detailsChecked
                              ? isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300'
                        }`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                  {detailsChecked && (
                    <span className={`block text-xs font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                      {isCorrect ? '✓ 정답!' : `✗ 정답: ${q.answer}`}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* C. Reading Skill */}
      {skillData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">C</span>
            <div>
              <h2 className="text-base font-bold text-slate-900">Reading Skill: {skillData.skillTitle || skillData.skillName}</h2>
              {skillData.skillDesc && <p className="text-xs text-slate-500 mt-0.5">{skillData.skillDesc}</p>}
            </div>
          </div>

          {/* L2: Reading Skill Passages A & B */}
          {skillData.passageA && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <p className="italic text-slate-700 leading-relaxed bg-white p-3 rounded-lg border border-slate-200">
                "{skillData.passageA}"
              </p>
              <div className="space-y-1.5">
                <span className="font-bold text-slate-900 block">밑줄 친 '{skillData.wordA}'의 가장 가까운 의미는?</span>
                <div className="flex flex-wrap gap-2">
                  {skillData.optionsA?.map((opt: string) => (
                    <button
                      key={opt}
                      onClick={() => setSkillAnswers(prev => ({ ...prev, skillA: opt.charAt(0) }))}
                      className={`px-3 py-1.5 rounded-lg border font-bold text-xs ${
                        skillAnswers['skillA'] === opt.charAt(0)
                          ? 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-300'
                      }`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* L3: Transitional Expressions Types Table */}
          {skillData.types && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-3">
              <h3 className="font-bold text-slate-800">Transitional Expressions by Type (연결사 유형)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {skillData.types.map((t: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white rounded-lg border border-slate-200">
                    <span className="font-bold text-indigo-700 block mb-1">{t.type}</span>
                    <span className="text-slate-600 italic">{t.expressions}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* L3: Reading Skill Passage & Exercises */}
          {skillData.passage && skillData.exercises && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-4">
              <div className="p-3.5 bg-white rounded-lg border border-slate-200 text-slate-800 leading-relaxed">
                <p className="font-semibold text-slate-700 mb-2">지문을 읽고 문맥에 맞는 가장 적절한 연결사를 선택하세요:</p>
                <p className="italic">{skillData.passage}</p>
              </div>
              <div className="space-y-2">
                {skillData.exercises.map((ex: any, idx: number) => {
                  const chosen = skillAnswers[ex.id];
                  const isCorrect = chosen === ex.answer;

                  return (
                    <div key={ex.id} className="p-3 bg-white rounded-lg border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                      {ex.options && Array.isArray(ex.options) ? (
                        <div className="flex gap-2">
                          {ex.options.map((opt: string) => (
                            <button
                              key={opt}
                              onClick={() => setSkillAnswers(prev => ({ ...prev, [ex.id]: opt }))}
                              className={`px-3 py-1.5 rounded-lg border font-bold text-xs transition-all ${
                                chosen === opt
                                  ? skillChecked
                                    ? isCorrect
                                      ? 'bg-emerald-600 text-white border-emerald-600'
                                      : 'bg-rose-600 text-white border-rose-600'
                                    : 'bg-indigo-600 text-white border-indigo-600'
                                  : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-300'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      ) : ex.intendedMeaning ? (
                        <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-800 space-y-1">
                          <div>
                            <span className="font-bold text-indigo-700">Q ({ex.label || idx + 1}): </span>
                            <span className="italic font-semibold">"{ex.question}"</span>
                          </div>
                          <div>
                            <span className="font-bold text-emerald-700">➔ 의도된 의미: </span>
                            <span className="font-medium text-slate-700">"{ex.intendedMeaning}"</span>
                          </div>
                        </div>
                      ) : null}
                      {skillChecked && ex.answer && (
                        <span className={`text-[11px] font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-600'}`}>
                          {isCorrect ? '✓ 정답!' : `✗ 정답: ${ex.answer}`}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* L1 Questions */}
          {skillData.questions && (
            <div className="space-y-4">
              {skillData.questions.map((q: any, idx: number) => {
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
                      {idx + 1}. 밑줄 친 {q.target || '표현'}의 문맥적 의미는?
                    </p>
                    <div className="grid grid-cols-1 gap-2">
                      {q.options?.map((opt: any) => (
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
          )}
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
