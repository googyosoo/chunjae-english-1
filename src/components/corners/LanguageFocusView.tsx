import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/auth';
import { BookMarked, Sparkles, CheckCircle2 } from 'lucide-react';

interface LanguageFocusViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
  user?: UserProfile | null;
}

export const LanguageFocusView: React.FC<LanguageFocusViewProps> = ({ lesson, showTeacherAnswers, user = null }) => {
  const langCorner = lesson.corners.find(c => c.id === 'language_focus');
  const activityData = langCorner?.activities[0]?.data;
  const wordUsesData = activityData?.wordUses;
  const commonPhrasesData = activityData?.commonPhrases;
  const grammarData = activityData?.grammarInContext;

  // A. Word Uses 상태
  const [wordAnswers, setWordAnswers] = useState<{ [id: string]: string }>({});
  const [isWordChecked, setIsWordChecked] = useState<boolean>(false);

  // B. Common Phrases 상태
  const [phraseAnswers, setPhraseAnswers] = useState<{ [id: string]: string }>({});
  const [isPhraseChecked, setIsPhraseChecked] = useState<boolean>(false);

  // C. Grammar Part 1 (전치사 + 관계대명사) & Part 2 (분사구문) 상태
  const [grammarPart1Answers, setGrammarPart1Answers] = useState<{ [id: string]: string }>({});
  const [grammarPart2Answers, setGrammarPart2Answers] = useState<{ [id: string]: string }>({});
  const [isGrammarChecked, setIsGrammarChecked] = useState<boolean>(false);

  const handleCheckAll = async () => {
    setIsWordChecked(true);
    setIsPhraseChecked(true);
    setIsGrammarChecked(true);
    await StorageService.logObservation(user, lesson.lessonNumber, 'Language Focus 학습', '다의어, 숙어 및 문법 연습문제 채점');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* A. Word Uses: 다의어 마스터 (reflect, p. 24) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
          <h2 className="text-base font-bold text-slate-900">Word Uses: 다의어 마스터 ('{wordUsesData?.word || 'reflect'}', p. 24)</h2>
        </div>

        {/* Meaning Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
          <span className="text-xs font-bold text-slate-700 block mb-2">교과서 사전적 의미 분류 (p. 24):</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {wordUsesData?.meanings.map(m => (
              <div key={m.label} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">({m.label})</span>
                  <span className="text-slate-900 font-bold leading-tight">{m.definition}</span>
                </div>
                {m.example && (
                  <p className="text-slate-500 text-[11px] italic pl-1 border-l-2 border-indigo-200">
                    ex: {m.example}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Sentence Matching */}
        <div className="space-y-3">
          {wordUsesData?.sentences.map((item, idx) => {
            const chosen = wordAnswers[item.id];
            const isCorrect = chosen === item.answer;

            return (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm leading-relaxed">
                      {idx + 1}. {item.text}
                    </p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {wordUsesData.meanings.map(m => (
                      <button
                        key={m.label}
                        onClick={() => setWordAnswers(prev => ({ ...prev, [item.id]: m.label }))}
                        aria-label={`Sentence ${idx + 1} meaning ${m.label}`}
                        className={`w-7 h-7 rounded-lg font-bold border transition-all ${
                          chosen === m.label
                            ? isWordChecked
                              ? isCorrect
                                ? 'bg-emerald-600 text-white border-emerald-600'
                                : 'bg-rose-600 text-white border-rose-600'
                              : 'bg-indigo-600 text-white border-indigo-600'
                            : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                        }`}
                      >
                        {m.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {showTeacherAnswers && wordUsesData?.sentences && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
            🔑 [교과서 정답키 (p.153)]: {wordUsesData.sentences.map((s, idx) => `${idx + 1}. (${s.answer})`).join(', ')}
          </div>
        )}
      </section>

      {/* B. Common Phrases (p. 24) */}
      {commonPhrasesData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">B</span>
            <h2 className="text-base font-bold text-slate-900">Common Phrases (교과서 핵심 숙어 표현, p. 24)</h2>
          </div>

          {/* Box Phrases */}
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
            <span className="text-xs font-bold text-slate-600 block mb-1.5">표현 보관함:</span>
            <div className="flex flex-wrap gap-2">
              {commonPhrasesData.boxPhrases.map(phrase => (
                <span key={phrase} className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-800">
                  {phrase}
                </span>
              ))}
            </div>
          </div>

          {/* Book Examples */}
          {commonPhrasesData.bookExamples && commonPhrasesData.bookExamples.length > 0 && (
            <div className="p-3 bg-indigo-50/50 rounded-xl border border-indigo-100 mb-4 space-y-1.5">
              <span className="text-[11px] font-bold text-indigo-900 block">📖 교과서 본문 속 표현 용례:</span>
              <ul className="list-disc list-inside space-y-1 text-xs text-indigo-950">
                {commonPhrasesData.bookExamples.map((ex, idx) => (
                  <li key={idx} className="leading-relaxed">{ex}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercises */}
          <div className="space-y-3">
            {commonPhrasesData.exercises.map((ex, idx) => {
              const val = phraseAnswers[ex.id] || '';
              const isCorrect = val.trim().toLowerCase() === ex.answer.toLowerCase();

              return (
                <div key={ex.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                  <div className="text-slate-800 leading-relaxed font-medium">
                    {idx + 1}. {ex.sentence.split('[blank]')[0]}
                    <input
                      type="text"
                      value={val}
                      onChange={e => setPhraseAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                      placeholder="표현 입력"
                      aria-label={`Phrase question ${idx + 1}`}
                      className="mx-1 px-2.5 py-1 border border-slate-300 bg-white rounded-md font-bold text-xs text-indigo-700 inline-block w-36"
                    />
                    {ex.sentence.split('[blank]')[1] || ''}
                  </div>
                  {isPhraseChecked && (
                    <div className="text-[11px] font-bold">
                      {isCorrect ? <span className="text-emerald-600">✓ 정답입니다!</span> : <span className="text-rose-600">✗ 정답: {ex.answer}</span>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* C. Grammar in Context (p. 25) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">C</span>
          <h2 className="text-base font-bold text-slate-900">Grammar in Context (교과서 핵심 문법 원리 및 적용, p. 25)</h2>
        </div>

        {/* Part 1: 전치사 + 관계대명사 */}
        {grammarData?.part1 && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
              1. {grammarData.part1.patternName}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{grammarData.part1.explanation}</p>
            
            <div className="space-y-3 pt-2">
              {grammarData.part1.exercises.map((ex, idx) => {
                const val = grammarPart1Answers[ex.id] || '';
                const isCorrect = ex.answerWords ? val.trim().toLowerCase() === ex.answerWords.toLowerCase() : false;

                return (
                  <div key={ex.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                    {ex.instruction && (
                      <p className="text-[11px] font-semibold text-slate-500">{ex.instruction}</p>
                    )}
                    <p className="font-semibold text-slate-800 leading-relaxed">
                      {idx + 1}. {(ex.template || ex.prompt || '').replace('[blank_1]', '_______').replace('[blank_2]', '_______')}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <input
                        type="text"
                        value={val}
                        onChange={e => setGrammarPart1Answers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                        placeholder="정답 어구 입력..."
                        aria-label={`Grammar 1 input ${idx + 1}`}
                        className="px-3 py-1.5 border border-slate-300 bg-white rounded-md font-bold text-xs text-indigo-700 w-full sm:w-72"
                      />
                      {isGrammarChecked && (
                        <div className="text-[11px] font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-600">✓ 정답입니다!</span>
                          ) : (
                            <span className="text-rose-600">✗ 정답: {ex.answerWords}</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Part 2: 분사구문 */}
        {grammarData?.part2 && (
          <div className="space-y-3 pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-indigo-900 bg-indigo-50 px-3 py-1.5 rounded-lg inline-block">
              2. {grammarData.part2.patternName}
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{grammarData.part2.explanation}</p>

            <div className="space-y-3 pt-2">
              {grammarData.part2.exercises.map((ex, idx) => {
                const val = grammarPart2Answers[ex.id] || '';
                const isCorrect = val.trim().toLowerCase() === ex.answer.toLowerCase();

                return (
                  <div key={ex.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                    {ex.original && (
                      <p className="text-[11px] text-slate-500">원문: {ex.original}</p>
                    )}
                    <div className="text-slate-800 leading-relaxed">
                      {idx + 1}. {(ex.template || ex.sentence || '').split('[blank]')[0]}
                      <input
                        type="text"
                        value={val}
                        onChange={e => setGrammarPart2Answers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                        placeholder="분사형 입력..."
                        aria-label={`Participle question ${idx + 1}`}
                        className="mx-1 px-2.5 py-1 border border-slate-300 bg-white rounded-md font-bold text-xs text-indigo-700 inline-block w-28"
                      />
                      {(ex.template || ex.sentence || '').split('[blank]')[1] || ''}
                    </div>
                    {ex.ko && <p className="text-[11px] text-slate-500 italic">해석: {ex.ko}</p>}
                    {isGrammarChecked && (
                      <div className="text-[11px] font-bold mt-1">
                        {isCorrect ? <span className="text-emerald-600">✓ 정답입니다!</span> : <span className="text-rose-600">✗ 정답: {ex.answer}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>

      {/* Global Check Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleCheckAll}
          aria-label="Language Focus 전체 채점 및 확인"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          언어 탐구 전체 채점 및 정답 확인
        </button>
      </div>
    </div>
  );
};
