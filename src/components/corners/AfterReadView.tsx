import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { CheckCircle2, XCircle, AlertCircle, Sparkles } from 'lucide-react';

interface AfterReadViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
}

export const AfterReadView: React.FC<AfterReadViewProps> = ({ lesson, showTeacherAnswers }) => {
  const afterCorner = lesson.corners.find(c => c.id === 'after_read');
  const activityData = afterCorner?.activities[0].data;
  const summaryData = activityData?.summaryFillBlanks;
  const tfData = activityData?.detailsTF;
  const skillData = activityData?.readingSkill;

  // Summary 드래그/선택 빈칸 상태
  const [selectedWords, setSelectedWords] = useState<{ [blankKey: string]: string }>({});
  const [summaryChecked, setSummaryChecked] = useState<boolean>(false);

  // T/F 답변 상태
  const [tfAnswers, setTfAnswers] = useState<{ [id: string]: 'T' | 'F' }>({});
  const [tfChecked, setTfChecked] = useState<boolean>(false);

  const handleSelectWord = (blankKey: string, word: string) => {
    setSelectedWords(prev => ({ ...prev, [blankKey]: word }));
  };

  const handleCheckAll = () => {
    setSummaryChecked(true);
    setTfChecked(true);
    StorageService.logObservation(lesson.lessonNumber, 'After Read 퀴즈 채점', '요약 빈칸 및 T/F 퀴즈 제출');
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* A. Summary: 요약 빈칸 채우기 */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
          <h2 className="text-base font-bold text-slate-900">Summary: 본문 핵심 내용 요약 완성하기</h2>
        </div>

        {/* Word Bank */}
        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 mb-4">
          <span className="text-xs font-bold text-slate-600 block mb-2">단어 보관함 (Word Box):</span>
          <div className="flex flex-wrap gap-2">
            {summaryData?.options.map(word => (
              <span
                key={word}
                className="px-3 py-1 bg-white border border-slate-300 rounded-lg text-xs font-bold text-slate-800 shadow-2xs"
              >
                {word}
              </span>
            ))}
          </div>
        </div>

        {/* Template Fill */}
        <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-sm leading-loose text-slate-800">
          Selena realized that she suffered from{' '}
          <select
            value={selectedWords['blank_1'] || ''}
            onChange={e => handleSelectWord('blank_1', e.target.value)}
            className="px-2 py-0.5 border border-slate-300 bg-white rounded-md font-bold text-indigo-700"
          >
            <option value="">(1) 선택</option>
            {summaryData?.options.map(w => <option key={w} value={w}>{w}</option>)}
          </select>{' '}
          and decided to take a two-week break from social media. On Day 1, she logged{' '}
          <select
            value={selectedWords['blank_2'] || ''}
            onChange={e => handleSelectWord('blank_2', e.target.value)}
            className="px-2 py-0.5 border border-slate-300 bg-white rounded-md font-bold text-indigo-700"
          >
            <option value="">(2) 선택</option>
            {summaryData?.options.map(w => <option key={w} value={w}>{w}</option>)}
          </select>{' '}
          all the apps. On Day 4, she played her old{' '}
          <select
            value={selectedWords['blank_3'] || ''}
            onChange={e => handleSelectWord('blank_3', e.target.value)}
            className="px-2 py-0.5 border border-slate-300 bg-white rounded-md font-bold text-indigo-700"
          >
            <option value="">(3) 선택</option>
            {summaryData?.options.map(w => <option key={w} value={w}>{w}</option>)}
          </select>{' '}
          for hours. On Day 7, she briefly visited a{' '}
          <select
            value={selectedWords['blank_4'] || ''}
            onChange={e => handleSelectWord('blank_4', e.target.value)}
            className="px-2 py-0.5 border border-slate-300 bg-white rounded-md font-bold text-indigo-700"
          >
            <option value="">(4) 선택</option>
            {summaryData?.options.map(w => <option key={w} value={w}>{w}</option>)}
          </select>{' '}
          but felt guilty. By Day 11, she felt{' '}
          <select
            value={selectedWords['blank_5'] || ''}
            onChange={e => handleSelectWord('blank_5', e.target.value)}
            className="px-2 py-0.5 border border-slate-300 bg-white rounded-md font-bold text-indigo-700"
          >
            <option value="">(5) 선택</option>
            {summaryData?.options.map(w => <option key={w} value={w}>{w}</option>)}
          </select>{' '}
          from the pressure of getting likes. On Day 14, she resolved to be in{' '}
          <select
            value={selectedWords['blank_6'] || ''}
            onChange={e => handleSelectWord('blank_6', e.target.value)}
            className="px-2 py-0.5 border border-slate-300 bg-white rounded-md font-bold text-indigo-700"
          >
            <option value="">(6) 선택</option>
            {summaryData?.options.map(w => <option key={w} value={w}>{w}</option>)}
          </select>{' '}
          of her social media use.
        </div>

        {showTeacherAnswers && (
          <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
            🔑 [교과서 정답키 (p.152)]: (1) FOMO, (2) out of, (3) guitar, (4) social media site, (5) free, (6) control
          </div>
        )}
      </section>

      {/* B. Details T/F Check */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">B</span>
          <h2 className="text-base font-bold text-slate-900">Details Check (T/F 사실 일치 & 근거 문장 해설)</h2>
        </div>

        <div className="space-y-4">
          {tfData?.map((item, idx) => {
            const chosen = tfAnswers[item.id];
            const isCorrect = chosen === item.answer;
            return (
              <div key={item.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex items-start justify-between gap-3">
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">
                    {idx + 1}. {item.statement}
                  </p>
                  <div className="flex gap-1.5 shrink-0">
                    {(['T', 'F'] as const).map(opt => (
                      <button
                        key={opt}
                        onClick={() => setTfAnswers(prev => ({ ...prev, [item.id]: opt }))}
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

        <div className="mt-5 flex justify-end">
          <button
            onClick={handleCheckAll}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            전체 채점 및 근거 확인
          </button>
        </div>
      </section>
    </div>
  );
};
