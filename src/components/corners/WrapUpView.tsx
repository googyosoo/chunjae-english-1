import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/auth';
import { Award, Globe, Sparkles, CheckCircle2 } from 'lucide-react';

interface WrapUpViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
  user?: UserProfile | null;
}

export const WrapUpView: React.FC<WrapUpViewProps> = ({ lesson, showTeacherAnswers, user = null }) => {
  const globalCorner = lesson.corners.find(c => c.id === 'go_global');
  const goGlobalData = globalCorner?.activities.find(a => a.activityId === 'global_texting')?.data.goGlobal;
  const wrapUpData = globalCorner?.activities.find(a => a.activityId === 'wrap_up_activities')?.data.wrapUp;
  const lessonSummaryData = globalCorner?.activities.find(a => a.activityId === 'lesson_summary')?.data.lessonSummary;

  // Go Global 줄임말 연습 답변 상태
  const [globalAnswers, setGlobalAnswers] = useState<{ [id: string]: string }>({});
  const [isGlobalChecked, setIsGlobalChecked] = useState<boolean>(false);

  // Wrap Up Part A 어휘 답변 상태
  const [vocabAnswers, setVocabAnswers] = useState<{ [id: string]: string }>({});
  // Wrap Up Part B 요약 빈칸 답변 상태
  const [summaryAnswers, setSummaryAnswers] = useState<{ [id: string]: string }>({});
  const [isWrapUpChecked, setIsWrapUpChecked] = useState<boolean>(false);

  const handleCheckAll = async () => {
    setIsGlobalChecked(true);
    setIsWrapUpChecked(true);
    await StorageService.logObservation(
      user,
      lesson.lessonNumber,
      '단원 총괄 평가 제출',
      'Go Global 및 Wrap Up 총괄 문제 채점 완료'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Go Global: Texting Abbreviations (p. 29) */}
      {goGlobalData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">{goGlobalData.title} (p. 29)</h2>
          </div>
          {goGlobalData.description && (
            <p className="text-xs text-slate-600 mb-4">{goGlobalData.description}</p>
          )}

          {/* Common Abbreviations Cards */}
          {goGlobalData.commonAbbreviations && (
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 mb-6">
              {goGlobalData.commonAbbreviations.map((item, idx) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
                  <span className="text-sm font-black text-indigo-700 block">{item.abbr}</span>
                  <span className="text-[11px] font-semibold text-slate-800 block truncate" title={item.full}>
                    {item.full}
                  </span>
                  <span className="text-[10px] text-slate-500 block truncate" title={item.meaningKo}>
                    {item.meaningKo}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Exercises */}
          {goGlobalData.exercises && (
            <div className="space-y-3">
              <span className="text-xs font-bold text-slate-700 block">문맥에 맞는 문자 메시지 줄임말을 해석해보세요:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goGlobalData.exercises.map((ex, idx) => {
                  const val = globalAnswers[ex.id] || '';
                  const isCorrect = val.trim().toLowerCase() === ex.answer.toLowerCase();

                  return (
                    <div key={ex.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <p className="font-semibold text-slate-800">
                        {idx + 1}. 메시지: <span className="font-mono text-indigo-700 font-bold bg-indigo-50 px-2 py-0.5 rounded">{ex.textMessage}</span>
                      </p>
                      <input
                        type="text"
                        value={val}
                        onChange={e => setGlobalAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                        placeholder={`'${ex.abbreviation}'의 원래 영어 표현`}
                        aria-label={`Go Global question ${idx + 1}`}
                        className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg font-medium text-xs text-indigo-800"
                      />
                      {isGlobalChecked && (
                        <div className="text-[11px] font-bold">
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
      )}

      {/* 2. Wrap Up: Part A 어휘 확인 (p. 30) */}
      {wrapUpData?.partA_crosswordOrVocab && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Award className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Wrap Up: Part A 어휘 완성 (p. 30)</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4">{wrapUpData.partA_crosswordOrVocab.instructions}</p>

          <div className="space-y-3">
            {wrapUpData.partA_crosswordOrVocab.items.map((item, idx) => {
              const val = vocabAnswers[item.id] || '';
              const isCorrect = val.trim().toLowerCase() === item.answer.toLowerCase();

              return (
                <div key={item.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1.5">
                  <p className="font-semibold text-slate-800 leading-snug">
                    {idx + 1}. {item.clue}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={val}
                      onChange={e => setVocabAnswers(prev => ({ ...prev, [item.id]: e.target.value }))}
                      placeholder="단어 입력"
                      aria-label={`Wrap Up Part A item ${idx + 1}`}
                      className="px-3 py-1.5 border border-slate-300 bg-white rounded-lg font-mono text-xs text-indigo-700 w-44"
                    />
                    {isWrapUpChecked && (
                      <span className="text-[11px] font-bold">
                        {isCorrect ? <span className="text-emerald-600">✓ 정답</span> : <span className="text-rose-600">✗ 정답: {item.answer}</span>}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 3. Wrap Up: Part B 본문 총괄 요약 (Lesson Summary, p. 31) */}
      {wrapUpData?.partB_summary && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">{wrapUpData.partB_summary.title} (p. 31)</h2>
          </div>

          <div className="p-4 bg-indigo-50/40 rounded-xl border border-indigo-100 text-xs sm:text-sm leading-loose text-slate-800 space-y-3">
            <p className="leading-relaxed whitespace-pre-line">
              {wrapUpData.partB_summary.textTemplate}
            </p>
          </div>

          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {wrapUpData.partB_summary.blanks.map(blank => {
              const val = summaryAnswers[blank.id] || '';
              const isCorrect = val.trim().toLowerCase() === blank.answer.toLowerCase();

              return (
                <div key={blank.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                  <span className="font-bold text-slate-700 block">빈칸 [{blank.id}] ({blank.hint}):</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={val}
                      onChange={e => setSummaryAnswers(prev => ({ ...prev, [blank.id]: e.target.value }))}
                      placeholder={blank.hint}
                      aria-label={`Lesson Summary blank ${blank.id}`}
                      className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg font-bold text-indigo-700"
                    />
                    {isWrapUpChecked && (
                      <span className="text-[11px] font-bold shrink-0">
                        {isCorrect ? <span className="text-emerald-600">✓ 정답</span> : <span className="text-rose-600">✗ 정답: {blank.answer}</span>}
                      </span>
                    )}
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
          aria-label="Wrap Up 전체 채점 및 확인"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          총괄 평가 전체 채점 및 결과 확인
        </button>
      </div>
    </div>
  );
};
