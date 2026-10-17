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
  const activities = shareCorner?.activities || [];

  const step1Act = activities.find(a => a.activityId.includes('step1') || a.type.includes('video') || a.activityId === 'share_digital_citizen');
  const step1Data = (step1Act?.data?.step1 ? step1Act.data : step1Act?.data) as any;

  const step23Act = activities.find(a => a.activityId.includes('step2') || a.type.includes('people') || a.type.includes('group') || a.activityId === 'share_digital_citizen');
  const step23Data = (step23Act?.data?.step2 || step23Act?.data) as any;

  const [topicQuizAnswer, setTopicQuizAnswer] = useState<string>('');
  const [fillAnswers, setFillAnswers] = useState<{ [key: string]: string }>({});
  const [userExperience, setUserExperience] = useState<string>('');
  const [isStep1Checked, setIsStep1Checked] = useState<boolean>(false);

  const [checkedPoints, setCheckedPoints] = useState<{ [idx: number]: boolean }>({});

  const handleToggleCheck = (idx: number) => {
    setCheckedPoints(prev => ({ ...prev, [idx]: !prev[idx] }));
  };

  const handleSaveExperience = () => {
    StorageService.logObservation(
      user,
      lesson.lessonNumber,
      '생각 나누기 활동 기록',
      `학생 서술: "${userExperience}"`
    );
    setIsStep1Checked(true);
  };

  const quiz1 = step1Data?.step1?.quiz1 || step1Data?.q1;
  const quiz2 = step1Data?.step1?.quiz2 || step1Data?.q2;
  const talkAboutVideo = step1Data?.step1?.talkAboutVideo || step1Data?.talkAboutVideo;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Title Header */}
      <div className="bg-gradient-to-r from-violet-900 to-indigo-900 text-white rounded-3xl p-6 sm:p-8 shadow-lg">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-white text-xs font-bold uppercase tracking-wider">
            Corner 5
          </span>
          <span className="text-xs text-indigo-200">{shareCorner?.pageRange || 'pp. 22-23'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
          {shareCorner?.titleEn || 'Share Your Thoughts'}: {lesson.title}
        </h1>
        <p className="text-xs sm:text-sm text-indigo-200 mt-1">
          {lesson.topic} 관련 탐구 및 생각 나누기
        </p>
      </div>

      {/* Step 1: Video & Discussion */}
      {step1Data && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">1</span>
            <h2 className="text-base font-bold text-slate-900">
              STEP 1. {step1Data.videoTitle ? `${step1Data.videoTitle} (영상 탐구)` : 'Watch the video and answer the questions'}
            </h2>
          </div>

          {/* YouTube Video Embed */}
          {(step1Data.youtubeUrl || step1Data.videoUrl) && (
            <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-video bg-black">
              <iframe
                src={step1Data.youtubeUrl || step1Data.videoUrl}
                title={step1Data.videoTitle || 'Video player'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          )}

          {step1Data.sourceCitation && (
            <p className="text-[11px] text-slate-500 italic">
              출처: {step1Data.sourceCitation}
            </p>
          )}

          {/* Quiz 1 */}
          {quiz1 && (
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <p className="font-bold text-xs sm:text-sm text-slate-900">
                1. {quiz1.question}
              </p>
              <div className="space-y-1.5">
                {quiz1.options?.map((opt: any, idx: number) => {
                  const optLabel = typeof opt === 'string' ? opt.charAt(0) : opt.label;
                  const optText = typeof opt === 'string' ? opt : opt.text;
                  const isSelected = topicQuizAnswer === optLabel;
                  const isCorrect = optLabel === quiz1.answer;

                  return (
                    <button
                      key={idx}
                      onClick={() => setTopicQuizAnswer(optLabel)}
                      className={`w-full text-left p-2.5 rounded-lg text-xs font-semibold border transition-all flex items-center gap-2 ${
                        isSelected
                          ? isCorrect
                            ? 'bg-emerald-100 text-emerald-950 border-emerald-300'
                            : 'bg-rose-100 text-rose-950 border-rose-300'
                          : 'bg-white hover:bg-slate-100/70 border-slate-200 text-slate-700'
                      }`}
                    >
                      <span>{optText}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quiz 2 (Fill in the blanks) */}
          {quiz2 && (
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-3 text-xs">
              <p className="font-bold text-indigo-950">
                2. {quiz2.instruction || '빈칸에 알맞은 단어를 보기에서 골라 입력하세요.'}
              </p>
              {quiz2.wordBox && (
                <div className="flex flex-wrap gap-2 p-2 bg-white rounded-lg border border-indigo-200">
                  <span className="font-bold text-indigo-800">단어 보관함:</span>
                  {quiz2.wordBox.map((w: string) => (
                    <span key={w} className="px-2 py-0.5 bg-indigo-50 rounded text-indigo-900 font-semibold">{w}</span>
                  ))}
                </div>
              )}
              {quiz2.text && (
                <p className="p-3 bg-white rounded-lg border border-indigo-200 leading-relaxed text-slate-800">
                  {quiz2.text}
                </p>
              )}
            </div>
          )}

          {/* Talk About Video */}
          {talkAboutVideo && (
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-800">
                💭 {talkAboutVideo.prompt}
              </label>
              <textarea
                value={userExperience}
                onChange={e => setUserExperience(e.target.value)}
                placeholder={`예: ${talkAboutVideo.example}`}
                rows={3}
                className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
              />
              {showTeacherAnswers && talkAboutVideo.sampleAnswer && (
                <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg text-xs">
                  🔑 [교과서 예시답안]: {talkAboutVideo.sampleAnswer}
                </p>
              )}
            </div>
          )}
        </section>
      )}

      {/* Step 2 & 3: Discussion & People */}
      {step23Data && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">2</span>
            <h2 className="text-base font-bold text-slate-900">STEP 2 & 3. Exploration & Peer Discussion</h2>
          </div>

          {/* L2 Creative People List */}
          {step23Data.people && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {step23Data.people.map((p: any, idx: number) => (
                <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-indigo-700 block">{p.who}</span>
                  <p className="text-slate-900 font-semibold">작품: {p.work}</p>
                  <p className="text-slate-600 italic">{p.creativePoint}</p>
                </div>
              ))}
            </div>
          )}

          {/* Model Dialogue */}
          {step23Data.modelDialogue && (
            <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2 text-xs">
              <span className="font-bold text-indigo-950 block">💬 대화 모델 (Model Dialogue):</span>
              <div className="space-y-1 bg-white p-3 rounded-lg border border-indigo-200">
                {step23Data.modelDialogue.map((d: any, idx: number) => (
                  <p key={idx} className="text-slate-800">
                    <span className="font-bold text-indigo-600">{d.speaker}:</span> {d.en}
                  </p>
                ))}
              </div>
            </div>
          )}

          {/* Check Points */}
          {step23Data.checkPoint && (
            <div className="space-y-2 pt-2 border-t border-slate-200 text-xs">
              <span className="font-bold text-slate-800 block">Check Point (자가 진단):</span>
              <div className="space-y-1.5">
                {step23Data.checkPoint.map((cp: string, idx: number) => (
                  <label key={idx} className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded-lg border border-slate-200">
                    <input
                      type="checkbox"
                      checked={!!checkedPoints[idx]}
                      onChange={() => handleToggleCheck(idx)}
                      className="rounded text-indigo-600"
                    />
                    <span className="text-slate-800">{cp}</span>
                  </label>
                ))}
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
};
