import React, { useState } from 'react';
import { Users, Camera, Palette, CheckCircle2, FileText, Send } from 'lucide-react';
import { LessonData } from '../../types/lesson';
import { UserProfile } from '../../types/auth';
import { WrapUpView } from './WrapUpView';

interface WorkTogetherViewProps {
  activityData?: any;
  showTeacherAnswers?: boolean;
  lesson?: LessonData;
  user?: UserProfile | null;
}

export const WorkTogetherView: React.FC<WorkTogetherViewProps> = ({
  activityData,
  showTeacherAnswers = false,
  lesson,
  user = null,
}) => {
  const [personalMemo, setPersonalMemo] = useState<string>('');
  const [savedMemo, setSavedMemo] = useState<boolean>(false);
  const [role, setRole] = useState<'photographer' | 'artist' | 'presenter'>('photographer');

  const data = activityData?.data || activityData || {};
  const steps = data.steps || [
    {
      step: 1,
      title: 'Find a Scenic Photo',
      titleKo: '풍경 사진 찾기',
      desc: '학교 주변이나 우리 동네의 인상적인 풍경 사진을 준비합니다.',
    },
    {
      step: 2,
      title: 'Add Creative Drawings',
      titleKo: '창의적 드로잉 더하기',
      desc: '사진 속 사물이나 배경을 새로운 시각으로 재해석하여 드로잉을 추가합니다.',
    },
    {
      step: 3,
      title: 'Group Presentation',
      titleKo: '모둠 발표 및 감상',
      desc: '완성된 작품의 의도와 제작 과정을 모둠원들과 함께 발표합니다.',
    },
  ];

  const handleSaveMemo = () => {
    if (!personalMemo.trim()) return;
    setSavedMemo(true);
    setTimeout(() => setSavedMemo(false), 3000);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-12">
      {/* Corner Header */}
      <div className="bg-gradient-to-r from-teal-600 to-emerald-600 rounded-3xl p-6 sm:p-8 text-white shadow-lg space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold">
          <Users className="w-3.5 h-3.5" />
          <span>Work Together · 3인 협동 모둠 프로젝트</span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          {data.title || '모둠 협동 프로젝트'}
        </h1>
        <p className="text-xs sm:text-sm text-teal-100 leading-relaxed max-w-2xl">
          {data.instruction || '모둠원과 협력하여 일상 속 풍경 사진에 창의적 드로잉을 더해 새로운 예술 작품을 만들어보세요.'}
        </p>
      </div>

      {/* Page Reference Note */}
      {(data.pageRef || data.figureNote) && (
        <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
          <span>📖</span>
          <span>{data.figureNote || `교과서 p.${data.pageRef}의 그림을 보세요`}</span>
        </div>
      )}

      {/* Step Guide */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Palette className="w-4 h-4 text-emerald-600" />
          <span>프로젝트 단계별 안내 (Project Steps)</span>
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {steps.map((st: any, idx: number) => (
            <div key={idx} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
              <span className="w-6 h-6 rounded-lg bg-emerald-600 text-white font-bold flex items-center justify-center text-xs">
                {st.step || idx + 1}
              </span>
              <h3 className="font-bold text-xs text-slate-900">{st.title}</h3>
              {st.titleKo && <p className="text-[11px] text-slate-500 font-medium">{st.titleKo}</p>}
              <p className="text-xs text-slate-600 leading-relaxed pt-1">{st.desc}</p>
              {st.example && (
                <p className="text-[11px] italic bg-white p-2 rounded-lg border border-slate-200 text-slate-700">
                  {st.example}
                </p>
              )}
              {st.dialogue && (
                <div className="space-y-1 bg-white p-2 rounded-lg border border-slate-200 text-[11px]">
                  {st.dialogue.map((d: any, dIdx: number) => (
                    <p key={dIdx} className="text-slate-800">
                      <span className="font-bold text-emerald-700">{d.speaker}:</span> {d.en}
                    </p>
                  ))}
                </div>
              )}
              {st.presentationSample && (
                <div className="bg-emerald-50/70 p-2.5 rounded-lg border border-emerald-200/60 text-[11px] text-emerald-950 leading-relaxed">
                  <span className="font-bold block text-emerald-800 mb-0.5">발표 예시:</span>
                  "{st.presentationSample}"
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Role Selection & Personal Brainstorming Memo */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600" />
          <span>개인 기획 및 모둠 역할 메모 (Brainstorming Note)</span>
        </h2>

        {/* Role Choice */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-slate-700">모둠 내 나의 역할 선택:</label>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {[
              { key: 'photographer', label: '사진 촬영/선정' },
              { key: 'artist', label: '아이디어/드로잉' },
              { key: 'presenter', label: '작품 해설/발표' },
            ].map(r => (
              <button
                key={r.key}
                type="button"
                onClick={() => setRole(r.key as any)}
                className={`py-2 px-3 rounded-xl border font-bold text-center transition-all ${
                  role === r.key
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Memo Input */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            작품 아이디어 및 모둠 회의 메모:
          </label>
          <textarea
            value={personalMemo}
            onChange={e => setPersonalMemo(e.target.value)}
            placeholder="어떤 사진을 사용하고 어떤 드로잉을 추가할지 자유롭게 아이디어를 적어보세요. (예: 운동장 벤치 사진에 거인의 의자 드로잉)"
            rows={4}
            className="w-full p-3 border border-slate-300 rounded-xl text-xs focus:ring-2 focus:ring-indigo-500"
          />
          <div className="flex justify-between items-center">
            {savedMemo && (
              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> 메모가 저장되었습니다!
              </span>
            )}
            <button
              type="button"
              onClick={handleSaveMemo}
              disabled={!personalMemo.trim()}
              className="ml-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-40 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>메모 저장</span>
            </button>
          </div>
        </div>
      </section>

      {/* Wrap Up & Lesson Summary (pp. 54-55) */}
      {lesson && (
        <div className="pt-4 border-t border-slate-200">
          <WrapUpView
            lesson={lesson}
            showTeacherAnswers={showTeacherAnswers}
            user={user}
          />
        </div>
      )}
    </div>
  );
};
