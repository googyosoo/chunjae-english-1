import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { Award, Globe, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';

interface WrapUpViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
}

export const WrapUpView: React.FC<WrapUpViewProps> = ({ lesson, showTeacherAnswers }) => {
  const wrapCorner = lesson.corners.find(c => c.id === 'go_global');
  const activityData = wrapCorner?.activities[0].data;
  const goGlobalData = activityData?.goGlobal;
  const wrapUpData = activityData?.wrapUp;

  const progress = StorageService.getProgress(lesson.lessonNumber);
  const [postAnswer, setPostAnswer] = useState<string>(progress.topicAnswers.postAnswer || '');
  const [quizAnswers, setQuizAnswers] = useState<{ [qId: string]: string }>({});
  const [isSaved, setIsSaved] = useState<boolean>(!!progress.topicAnswers.postAnswer);

  const handleSavePostAnswer = () => {
    progress.topicAnswers.postAnswer = postAnswer;
    StorageService.saveProgress(progress);
    StorageService.logObservation(lesson.lessonNumber, '단원 사후 성찰 작성', `사후 답변: "${postAnswer}"`);
    setIsSaved(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Go Global: Texting Abbreviations */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Globe className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">{goGlobalData?.title}</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {goGlobalData?.content.map((item, idx) => (
            <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-center space-y-1">
              <span className="text-base font-black text-indigo-600 block">{item.abbreviation}</span>
              <span className="text-xs font-semibold text-slate-800 block">{item.fullText}</span>
              <span className="text-[11px] text-slate-500 block">{item.meaningKo}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Wrap Up Quizzes */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Award className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">단원 총괄 평가 (Wrap Up Quizzes)</h2>
        </div>

        <div className="space-y-4">
          {wrapUpData?.quizzes.map((quiz, idx) => (
            <div key={quiz.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <p className="font-bold text-xs sm:text-sm text-slate-900">{idx + 1}. {quiz.question}</p>
              <div className="space-y-1.5">
                {quiz.options.map(opt => {
                  const isChosen = quizAnswers[quiz.id] === opt.label;
                  const isCorrect = opt.label === quiz.answer;
                  return (
                    <button
                      key={opt.label}
                      onClick={() => setQuizAnswers(prev => ({ ...prev, [quiz.id]: opt.label }))}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-medium border transition-colors flex items-center gap-2 ${
                        isChosen
                          ? isCorrect
                            ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                            : 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="font-bold uppercase w-4">{opt.label})</span>
                      <span>{opt.text}</span>
                    </button>
                  );
                })}
              </div>
              {showTeacherAnswers && (
                <div className="mt-2 text-xs text-emerald-800 font-medium bg-emerald-50 p-2 rounded">
                  🔑 정답: {quiz.answer}) {quiz.explanation}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Lesson Summary: Pre vs Post Reflection Comparison */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-amber-500" />
          <h2 className="text-base font-bold text-slate-900">Lesson Summary: 토픽 질문 사전·사후 답변 비교 성장</h2>
        </div>

        <p className="text-xs text-slate-600 mb-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
          단원을 마무리하며, 단원 시작 때 적었던 사전 답변과 지금의 배움을 바탕으로 사후 답변을 비교해보세요.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Pre Answer Box */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-xs font-bold text-slate-500 block">🌱 단원 시작 전 나의 답변 (Pre):</span>
            <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs text-slate-700 min-h-20 italic">
              {progress.topicAnswers.preAnswer || '(단원 시작 시 작성된 사전 답변이 없습니다)'}
            </div>
          </div>

          {/* Post Answer Box */}
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-200 space-y-2">
            <span className="text-xs font-bold text-indigo-700 block">🌳 단원 학습 후 나의 성장 답변 (Post):</span>
            <textarea
              value={postAnswer}
              onChange={e => {
                setPostAnswer(e.target.value);
                setIsSaved(false);
              }}
              placeholder="예: We can promote our digital well-being by controlling our screen time and being mindful..."
              rows={3}
              className="w-full p-3 bg-white rounded-lg border border-indigo-200 text-xs text-slate-800 focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-400">
            {isSaved && <span className="text-emerald-600 font-semibold">✓ 사후 답변이 저장되었습니다.</span>}
          </div>
          <button
            onClick={handleSavePostAnswer}
            disabled={!postAnswer.trim()}
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs shadow-xs disabled:opacity-40 transition-all flex items-center gap-1.5"
          >
            <span>사후 답변 저장 & 단원 완료</span>
            <CheckCircle2 className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
