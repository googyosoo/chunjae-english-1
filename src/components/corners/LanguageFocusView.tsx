import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { BookMarked, Sparkles, CheckCircle2, HelpCircle } from 'lucide-react';

interface LanguageFocusViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
}

export const LanguageFocusView: React.FC<LanguageFocusViewProps> = ({ lesson, showTeacherAnswers }) => {
  const langCorner = lesson.corners.find(c => c.id === 'language_focus');
  const activityData = langCorner?.activities[0].data;
  const wordUsesData = activityData?.wordUses;
  const grammarData = activityData?.grammarInContext;

  const [wordAnswers, setWordAnswers] = useState<{ [id: string]: string }>({});
  const [grammarInputs, setGrammarInputs] = useState<{ [id: string]: string }>({});
  const [isWordChecked, setIsWordChecked] = useState<boolean>(false);
  const [isGrammarChecked, setIsGrammarChecked] = useState<boolean>(false);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* A. Word Uses: 다의어 탐구 */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
          <h2 className="text-base font-bold text-slate-900">Word Uses: 다의어 마스터 ('{wordUsesData?.word}')</h2>
        </div>

        {/* Meaning Box */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 mb-5">
          <span className="text-xs font-bold text-slate-700 block mb-2">사전적 의미 분류:</span>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {wordUsesData?.meanings.map(m => (
              <div key={m.label} className="p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                <span className="font-bold text-indigo-600 mr-1.5 uppercase">({m.label})</span>
                <span className="text-slate-800 font-medium">{m.meaningKo}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sentence Matching */}
        <div className="space-y-3">
          {wordUsesData?.sentences.map((item, idx) => {
            const chosen = wordAnswers[item.id];
            const isCorrect = chosen === item.answerLabel;
            return (
              <div key={item.id} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold text-slate-900 text-xs sm:text-sm">{idx + 1}. {item.en}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5">{item.ko}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {wordUsesData.meanings.map(m => (
                      <button
                        key={m.label}
                        onClick={() => setWordAnswers(prev => ({ ...prev, [item.id]: m.label }))}
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

        <div className="mt-4 flex justify-between items-center">
          {showTeacherAnswers && (
            <div className="text-xs text-emerald-800 font-medium bg-emerald-50 px-3 py-1.5 rounded-lg">
              🔑 정답: 1. c (중요하다), 2. b (사안), 3. a (물질)
            </div>
          )}
          <button
            onClick={() => setIsWordChecked(true)}
            className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            정답 확인
          </button>
        </div>
      </section>

      {/* B. Grammar in Context */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">B</span>
          <h2 className="text-base font-bold text-slate-900">Grammar in Context: {grammarData?.patternName}</h2>
        </div>

        {/* Explanation Card */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200/80 mb-5 text-xs text-slate-800 space-y-2">
          <div className="font-bold text-indigo-900 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>핵심 문법 원리</span>
          </div>
          <p className="leading-relaxed">{grammarData?.explanation}</p>
        </div>

        {/* Practice Questions */}
        <div className="space-y-4">
          {grammarData?.practiceQuestions.map((q, idx) => (
            <div key={q.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <p className="font-bold text-slate-800 leading-snug">
                {idx + 1}. {q.instruction}
              </p>
              <div className="p-2.5 bg-white rounded-lg border border-slate-200 text-slate-700 italic">
                "{q.originalSentence}"
              </div>
              <input
                type="text"
                value={grammarInputs[q.id] || ''}
                onChange={e => setGrammarInputs(prev => ({ ...prev, [q.id]: e.target.value }))}
                placeholder="완성된 문장을 입력하세요..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 font-mono text-xs"
              />
              {showTeacherAnswers && (
                <div className="p-2.5 bg-emerald-50 rounded-lg text-emerald-900 font-mono text-[11px]">
                  🔑 모범 답안: {q.answer}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
