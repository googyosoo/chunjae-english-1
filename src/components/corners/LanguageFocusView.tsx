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
  const activities = langCorner?.activities || [];

  const wordUsesAct = activities.find(a => a.type === 'word_uses' || a.activityId.includes('word_uses') || a.type.includes('word_polysemy') || a.data?.wordUses);
  const wordUsesData = (wordUsesAct?.data?.wordUses || wordUsesAct?.data) as any;

  const phrasesAct = activities.find(a => a.type === 'common_phrases' || a.activityId.includes('phrase') || a.data?.commonPhrases);
  const commonPhrasesData = (phrasesAct?.data?.commonPhrases || phrasesAct?.data) as any;

  const grammarActs = activities.filter(a => a.type.includes('grammar') || a.activityId.includes('grammar'));
  const grammarData = (grammarActs.length > 0 && grammarActs[0]?.data?.grammarInContext ? grammarActs[0].data.grammarInContext : null) as any;

  // A. Word Uses 상태
  const [wordAnswers, setWordAnswers] = useState<{ [id: string]: string }>({});
  const [isWordChecked, setIsWordChecked] = useState<boolean>(false);

  // B. Common Phrases 상태
  const [phraseAnswers, setPhraseAnswers] = useState<{ [id: string]: string }>({});
  const [isPhraseChecked, setIsPhraseChecked] = useState<boolean>(false);

  // C. Grammar 상태
  const [grammarAnswers, setGrammarAnswers] = useState<{ [id: string]: string }>({});
  const [isGrammarChecked, setIsGrammarChecked] = useState<boolean>(false);

  const handleCheckAll = async () => {
    setIsWordChecked(true);
    setIsPhraseChecked(true);
    setIsGrammarChecked(true);
    await StorageService.logObservation(user, lesson.lessonNumber, 'Language Focus 학습', '다의어, 숙어 및 문법 연습문제 채점');
  };

  const wordMeanings = wordUsesData?.meanings || [];
  const wordSentences = wordUsesData?.sentences || wordUsesData?.questions || wordUsesData?.exercises || [];
  const activeWord = wordUsesData?.word || wordUsesData?.targetWord || '';

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* A. Word Uses */}
      {wordUsesData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
            <h2 className="text-base font-bold text-slate-900">Word Uses: 다의어 마스터 ('{activeWord}')</h2>
          </div>

          {/* Meaning Box */}
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
            <span className="text-xs font-bold text-slate-700 block mb-2">교과서 사전적 의미 분류:</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {wordMeanings.map((m: any, mIdx: number) => (
                <div key={m.label || m.id || mIdx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-indigo-600 uppercase bg-indigo-50 px-1.5 py-0.5 rounded text-[11px]">({m.label})</span>
                    <span className="text-slate-900 font-bold leading-tight">{m.definition || m.enDef || m.def}</span>
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
            {wordSentences.map((item: any, idx: number) => {
              const itemId = item.id || `word-sent-${item.num || idx}`;
              const chosen = wordAnswers[itemId];
              const isCorrect = chosen === item.answer;

              return (
                <div key={itemId} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900 text-xs sm:text-sm leading-relaxed">
                        {idx + 1}. {item.text || item.sentence}
                      </p>
                    </div>
                    <div className="flex gap-1 shrink-0">
                      {wordMeanings.map((m: any) => (
                        <button
                          key={m.label}
                          onClick={() => setWordAnswers(prev => ({ ...prev, [itemId]: m.label }))}
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

          {showTeacherAnswers && (
            <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
              🔑 [교과서 정답키]: {wordSentences.map((s: any, idx: number) => `${idx + 1}. (${s.answer})`).join(', ')}
            </div>
          )}
        </section>
      )}

      {/* B. Common Phrases */}
      {commonPhrasesData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">B</span>
            <h2 className="text-base font-bold text-slate-900">Common Phrases: 교과서 핵심 숙어 표현</h2>
          </div>

          {/* L1 Box phrases */}
          {commonPhrasesData.boxPhrases && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 mb-4">
              <span className="text-xs font-bold text-slate-600 block mb-1.5">표현 보관함:</span>
              <div className="flex flex-wrap gap-2">
                {commonPhrasesData.boxPhrases.map((phrase: string) => (
                  <span key={phrase} className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-indigo-800">
                    {phrase}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* L2 Phrases with meanings */}
          {commonPhrasesData.phrases && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {commonPhrasesData.phrases.map((p: any, pIdx: number) => (
                <div key={p.phrase || pIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-indigo-700 block">{p.phrase}</span>
                  <p className="text-slate-600 text-[11px]">{p.meaning || p.meaningKo}</p>
                </div>
              ))}
            </div>
          )}

          {/* Practice exercises */}
          <div className="space-y-3">
            {(commonPhrasesData.exercises || commonPhrasesData.questions || []).map((ex: any, idx: number) => (
              <div key={ex.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <p className="font-medium text-slate-900">{idx + 1}. {ex.sentence}</p>
                {showTeacherAnswers && (
                  <span className="block mt-1 font-bold text-emerald-700 text-[11px]">
                    🔑 정답: {ex.answer || ex.blank}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* C. Grammar in Context */}
      {/* L1 Grammar In Context */}
      {grammarData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">C</span>
            <h2 className="text-base font-bold text-slate-900">Grammar in Context</h2>
          </div>

          <div className="space-y-4">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900">{grammarData.part1?.ruleName}</h3>
            {grammarData.part1?.exercises?.map((ex: any, idx: number) => (
              <div key={ex.id || idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                <p className="font-medium text-slate-800">{idx + 1}. {ex.original}</p>
                {showTeacherAnswers && <p className="text-emerald-700 font-bold">🔑 정답: {ex.answerWords}</p>}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* L2 & L4 Grammar Points */}
      {grammarActs.length > 0 && !grammarData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">C</span>
            <h2 className="text-base font-bold text-slate-900">Grammar in Context: 핵심 문법 구조</h2>
          </div>

          {grammarActs.map((act, gIdx) => {
            const gData = act.data;
            return (
              <div key={gIdx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
                {gData.ruleName && <h3 className="font-bold text-indigo-900 text-xs sm:text-sm">{gData.ruleName}</h3>}
                {gData.ruleExplanation && <p className="text-slate-600">{gData.ruleExplanation}</p>}

                {/* Quotes */}
                {gData.quotes && (
                  <div className="space-y-2 my-2">
                    {gData.quotes.map((q: any, qIdx: number) => (
                      <div key={qIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 italic text-slate-800">
                        "{q.quote}" <span className="font-semibold text-slate-500 not-italic">- {q.author}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* Dialogue */}
                {gData.dialogue && (
                  <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1.5 my-2">
                    {gData.dialogue.map((d: any, dIdx: number) => (
                      <p key={dIdx} className="text-slate-800">
                        <span className="font-bold text-indigo-600">{d.speaker}:</span> {d.en}
                      </p>
                    ))}
                  </div>
                )}

                {/* L4: Structures */}
                {gData.structures && (
                  <div className="space-y-4 my-2">
                    {gData.structures.map((st: any, sIdx: number) => (
                      <div key={st.pointNumber || sIdx} className="p-3 bg-white rounded-lg border border-slate-200 space-y-2">
                        <span className="font-bold text-indigo-700 block text-xs sm:text-sm">{st.pointNumber}. {st.title}</span>
                        {st.explanation && <p className="text-slate-600">{st.explanation}</p>}
                        {st.examples && (
                          <div className="space-y-1 pl-2 border-l-2 border-indigo-200">
                            {st.examples.map((ex: string, eIdx: number) => (
                              <p key={eIdx} className="italic text-slate-800">{ex}</p>
                            ))}
                          </div>
                        )}
                        {(st.practice || st.exercises) && (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            {(st.practice || st.exercises).map((ex: any, exIdx: number) => (
                              <div key={ex.id || ex.num || exIdx} className="p-2 bg-slate-50 rounded text-slate-800">
                                <p className="font-medium">{ex.sentence || ex.gappedText || ex.originalSentence}</p>
                                {ex.leadIn && <p className="text-slate-600 text-[11px] mt-0.5">→ {ex.leadIn}</p>}
                                {showTeacherAnswers && ex.answer && (
                                  <p className="text-emerald-700 font-bold mt-1">🔑 정답: {ex.answer}</p>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                {/* Questions */}
                {gData.questions && (
                  <div className="space-y-2 pt-2 border-t border-slate-200">
                    {gData.questions.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="p-2.5 bg-white rounded-lg border border-slate-200 space-y-1">
                        <p className="font-medium text-slate-900">{qIdx + 1}. {q.prompt || q.original}</p>
                        {showTeacherAnswers && (
                          <p className="font-bold text-emerald-700">🔑 정답: {q.answer}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </section>
      )}

      {/* Global Check Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleCheckAll}
          aria-label="Language Focus 채점"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          채점 및 결과 확인
        </button>
      </div>
    </div>
  );
};
