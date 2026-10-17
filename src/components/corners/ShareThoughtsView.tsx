import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/auth';
import { Users, Play, CheckCircle2, XCircle, Sparkles, HelpCircle } from 'lucide-react';

interface ShareThoughtsViewProps {
  lesson: LessonData;
  user?: UserProfile | null;
  showTeacherAnswers?: boolean;
}

export const ShareThoughtsView: React.FC<ShareThoughtsViewProps> = ({
  lesson,
  user = null,
  showTeacherAnswers = false,
}) => {
  const shareCorner = lesson.corners.find(c => c.id === 'share_thoughts');
  const activityData = shareCorner?.activities[0].data;
  const shareData = (activityData as any);

  // Step 1 상태
  const [topicQuizAnswer, setTopicQuizAnswer] = useState<string>('');
  const [fillAnswers, setFillAnswers] = useState<{ [key: string]: string }>({});
  const [userExperience, setUserExperience] = useState<string>('');
  const [isStep1Checked, setIsStep1Checked] = useState<boolean>(false);

  // Step 3 Check Point 상태
  const [checkedPoints, setCheckedPoints] = useState<{ [idx: number]: boolean }>({});

  const handleToggleCheck = (idx: number) => {
    setCheckedPoints(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSaveExperience = () => {
    StorageService.logObservation(
      user,
      lesson.lessonNumber,
      '디지털 시민성 경험 나눔',
      `학생 경험 서술: "${userExperience}"`
    );
    setIsStep1Checked(true);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            Corner 5
          </span>
          <span className="text-xs text-indigo-200">pp. 22-23</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">Share Your Thoughts: A Good Digital Citizen</h1>
        <p className="text-xs sm:text-sm text-indigo-200 mt-1">올바른 디지털 시민으로서의 태도와 온라인 예절 탐구</p>
      </div>

      {/* Step 1: Watch the Video & Check */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">1</span>
          <h2 className="text-base font-bold text-slate-900">STEP 1. Watch the video and answer the questions</h2>
        </div>

        {/* Real YouTube Video Embed */}
        {shareData?.youtubeUrl && (
          <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-video bg-black">
            <iframe
              src={shareData.youtubeUrl}
              title={shareData.videoTitle || 'Video player'}
              className="w-full h-full"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        )}
        {shareData?.sourceCitation && (
          <p className="text-[11px] text-slate-500 italic">
            출처: {shareData.sourceCitation}
          </p>
        )}

        {/* 1. Multiple Choice Quiz */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <p className="font-bold text-xs sm:text-sm text-slate-900">
            1. {shareData?.step1?.quiz1?.question}
          </p>
          <div className="space-y-1.5">
            {shareData?.step1?.quiz1?.options.map((opt: any) => {
              const isSelected = topicQuizAnswer === opt.label;
              const isCorrect = opt.label === shareData.step1.quiz1.answer;
              return (
                <button
                  key={opt.label}
                  onClick={() => setTopicQuizAnswer(opt.label)}
                  aria-label={`선택지 ${opt.label}: ${opt.text}`}
                  className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                        : 'bg-rose-100 text-rose-950 border-rose-300'
                      : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-700'
                  }`}
                >
                  <span className="font-bold uppercase w-4">{opt.label})</span>
                  <span>{opt.text}</span>
                </button>
              );
            })}
          </div>
          {topicQuizAnswer && (
            <div className="text-xs font-semibold">
              {topicQuizAnswer === shareData?.step1?.quiz1?.answer ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 정답입니다! (a. being a good digital citizen)
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> 오답입니다. 영상을 다시 확인해보세요.
                </span>
              )}
            </div>
          )}
        </div>

        {/* 2. Fill in the Blanks with Box Expressions */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3 text-xs">
          <p className="font-bold text-indigo-950">
            2. {shareData?.step1?.quiz2?.instruction}
          </p>
          <div className="p-3 bg-white rounded-lg border border-indigo-200 space-y-2 leading-loose text-slate-800">
            <p>
              Here are some things you can do to be a good{' '}
              <input
                type="text"
                value={fillAnswers['blank_1'] || ''}
                onChange={e => setFillAnswers(prev => ({ ...prev, blank_1: e.target.value.trim().toLowerCase() }))}
                placeholder="digital citizen"
                aria-label="빈칸 1"
                className="px-2 py-0.5 border border-slate-300 rounded font-semibold text-indigo-700 w-28"
              />
              .
            </p>
            <p>
              • Treat others as you’d like to be treated: You’re interacting with{' '}
              <input
                type="text"
                value={fillAnswers['blank_2'] || ''}
                onChange={e => setFillAnswers(prev => ({ ...prev, blank_2: e.target.value.trim().toLowerCase() }))}
                placeholder="real people"
                aria-label="빈칸 2"
                className="px-2 py-0.5 border border-slate-300 rounded font-semibold text-indigo-700 w-28"
              />
              .
            </p>
            <p>
              • Don’t feed the trolls, those who enjoy annoying or{' '}
              <input
                type="text"
                value={fillAnswers['blank_3'] || ''}
                onChange={e => setFillAnswers(prev => ({ ...prev, blank_3: e.target.value.trim().toLowerCase() }))}
                placeholder="arguing"
                aria-label="빈칸 3"
                className="px-2 py-0.5 border border-slate-300 rounded font-semibold text-indigo-700 w-24"
              />{' '}
              with others online.
            </p>
          </div>

          {showTeacherAnswers && shareData?.step1?.quiz2?.answers && (
            <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded text-xs font-semibold">
              🔑 정답: {Object.entries(shareData.step1.quiz2.answers).map(([k, v], idx) => `(${idx + 1}) ${v}`).join(', ')}
            </div>
          )}
        </div>

        {/* Talk About the Video Reflection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-800">
            💭 {shareData?.step1?.talkAboutVideo?.prompt}
          </label>
          <textarea
            value={userExperience}
            onChange={e => setUserExperience(e.target.value)}
            placeholder={`예: ${shareData?.step1?.talkAboutVideo?.example}`}
            rows={3}
            aria-label="온라인 부정적 경험 입력"
            className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-between items-center">
            {showTeacherAnswers && (
              <span className="text-[11px] text-emerald-700 font-semibold">
                🔑 교과서 예시답안 (p.153): {shareData?.step1?.talkAboutVideo?.sampleAnswer}
              </span>
            )}
            <button
              onClick={handleSaveExperience}
              disabled={!userExperience.trim()}
              aria-label="경험 답변 저장하기"
              className="ml-auto px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition-colors disabled:opacity-40"
            >
              답변 저장
            </button>
          </div>
        </div>
      </section>

      {/* Step 2: What actions can we take? */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">2</span>
          <h2 className="text-base font-bold text-slate-900">STEP 2. What are some other actions to become a better digital citizen?</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
            <span className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>We should (우리가 해야 할 행동):</span>
            </span>
            <ul className="space-y-1.5 text-xs text-emerald-800">
              {shareData?.step2?.categories?.weShould.map((item: string, idx: number) => (
                <li key={idx} className="bg-white p-2 rounded border border-emerald-200">
                  • {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="p-4 bg-rose-50/70 border border-rose-200 rounded-xl space-y-2">
            <span className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
              <XCircle className="w-4 h-4 text-rose-600" />
              <span>We should not (우리가 하지 말아야 할 행동):</span>
            </span>
            <ul className="space-y-1.5 text-xs text-rose-800">
              {shareData?.step2?.categories?.weShouldNot.map((item: string, idx: number) => (
                <li key={idx} className="bg-white p-2 rounded border border-rose-200">
                  • {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Step 3: Dialogue & Check Point */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">3</span>
          <h2 className="text-base font-bold text-slate-900">STEP 3. Talk with a classmate & Check Point</h2>
        </div>

        {/* Model Dialogue */}
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <span className="text-xs font-bold text-slate-600 block mb-1">대화 모델 (Dialogue Model):</span>
          {shareData?.step3?.dialogueModel.map((utt: any, idx: number) => (
            <div key={idx} className="flex items-start gap-2 text-xs">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${
                utt.speaker === 'A' ? 'bg-indigo-100 text-indigo-700' : 'bg-violet-100 text-violet-700'
              }`}>
                {utt.speaker}
              </span>
              <span className="text-slate-800 font-medium leading-relaxed">{utt.text}</span>
            </div>
          ))}
        </div>

        {/* Check Point */}
        <div className="p-4 bg-amber-50/60 rounded-xl border border-amber-200 space-y-2">
          <span className="text-xs font-bold text-amber-900 block mb-1">Check Point (자기 점검):</span>
          <div className="space-y-1.5">
            {shareData?.step3?.checkPoint.map((cp: string, idx: number) => (
              <label key={idx} className="flex items-center gap-2 text-xs text-amber-950 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!!checkedPoints[idx]}
                  onChange={() => handleToggleCheck(idx)}
                  className="rounded border-amber-400 text-indigo-600 focus:ring-indigo-500"
                />
                <span>{cp}</span>
              </label>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};
