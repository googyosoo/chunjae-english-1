import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { Sparkles, MessageSquare, ArrowRight, CheckCircle2 } from 'lucide-react';

interface IntroViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
}

export const IntroView: React.FC<IntroViewProps> = ({ lesson, showTeacherAnswers }) => {
  const introData = lesson.corners.find(c => c.id === 'introduction')?.activities[0].data;
  const progress = StorageService.getProgress(lesson.lessonNumber);

  const [preAnswer, setPreAnswer] = useState<string>(progress.topicAnswers.preAnswer || '');
  const [isSaved, setIsSaved] = useState<boolean>(!!progress.topicAnswers.preAnswer);

  const handleSaveAnswer = () => {
    progress.topicAnswers.preAnswer = preAnswer;
    StorageService.saveProgress(progress);
    StorageService.logObservation(lesson.lessonNumber, '도입 질문 답변', `토픽 질문 사전 답변 작성: "${preAnswer}"`);
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Hero Unit Card */}
      <div className="bg-gradient-to-br from-indigo-900 via-indigo-800 to-slate-900 text-white rounded-3xl p-6 sm:p-10 shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-3 py-1 rounded-full bg-white/10 text-indigo-200 text-xs font-bold border border-white/10 tracking-wide">
              LESSON {lesson.lessonNumber}
            </span>
            <span className="text-xs text-indigo-300 font-medium">{lesson.pageRange}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight mb-3">
            {lesson.title}
          </h1>
          <p className="text-indigo-200 text-sm sm:text-base font-medium max-w-xl mb-6">
            {lesson.topic} · 디지털 중독과 불안에서 벗어나 나만의 주도권을 되찾는 여정
          </p>

          {/* Hashtags */}
          <div className="flex flex-wrap gap-2">
            {lesson.hashtags.map((tag, idx) => (
              <span
                key={idx}
                className="px-3 py-1 rounded-full bg-white/15 text-xs font-semibold text-indigo-100 backdrop-blur-xs border border-white/10"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Topic Question Interactive Hub */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2.5 mb-4">
          <div className="w-9 h-9 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs font-bold text-amber-700 tracking-wide uppercase">Topic Question</span>
            <h2 className="text-lg font-bold text-slate-900">{lesson.topicQuestion}</h2>
          </div>
        </div>

        <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          💡 단원을 시작하기 전, 자신의 현재 생각이나 경험을 자유롭게 한두 문장의 영어(또는 한국어)로 적어보세요. 이 답변은 단원이 끝날 때 사후 답변과 나란히 비교되어 여러분의 성장을 보여줍니다.
        </p>

        <div className="space-y-3">
          <textarea
            value={preAnswer}
            onChange={(e) => {
              setPreAnswer(e.target.value);
              setIsSaved(false);
            }}
            placeholder="예: I can spend less time on social media and do exercise instead."
            rows={3}
            className="w-full p-4 rounded-xl border border-slate-300 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-indigo-500 bg-white shadow-inner"
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {isSaved ? (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 사전 답변이 안전하게 기록되었습니다.
                </span>
              ) : (
                '작성 후 [저장하기]를 누르면 진도에 반영됩니다.'
              )}
            </div>
            <button
              onClick={handleSaveAnswer}
              disabled={!preAnswer.trim()}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs disabled:opacity-40 transition-all flex items-center gap-1.5"
            >
              <span>답변 저장하기</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Teacher Answer Key Display */}
          {showTeacherAnswers && (
            <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
              <div className="font-bold text-emerald-900 mb-1 flex items-center gap-1">
                <span>🔑 [교사용] 단원 모범 예시답안 (p.154):</span>
              </div>
              <p className="text-emerald-800 font-medium">
                {introData?.topicSampleAnswer}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Lesson Flow */}
      <div className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <h3 className="font-bold text-slate-900 text-base mb-4 flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-indigo-600" />
          <span>단원 학습 여정 (Lesson Flow)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {introData?.lessonFlow?.map((flow, idx) => (
            <div
              key={idx}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 hover:border-indigo-200 hover:bg-indigo-50/40 transition-colors"
            >
              <div className="text-[11px] font-bold text-indigo-600 mb-1">STEP 0{flow.step}</div>
              <div className="font-bold text-slate-800 text-sm">{flow.title}</div>
              <div className="text-xs text-slate-500 mt-1">{flow.pageRange}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
