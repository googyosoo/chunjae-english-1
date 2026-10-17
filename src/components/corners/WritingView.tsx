import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { GeminiService } from '../../services/geminiService';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/auth';
import { PenTool, Sparkles, CheckCircle2, Loader2, AlertCircle } from 'lucide-react';

interface WritingViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
  user?: UserProfile | null;
}

export const WritingView: React.FC<WritingViewProps> = ({ lesson, showTeacherAnswers, user = null }) => {
  const writingCorner = lesson.corners.find(c => c.id === 'write_present');
  const activities = writingCorner?.activities || [];

  const modelAct = activities.find(a => a.type === 'model_writing' || a.activityId.includes('model'));
  const modelData = modelAct?.data as any;

  const processAct = activities.find(a => a.type === 'writing_process' || a.activityId.includes('steps') || a.activityId.includes('workspace') || a.type.includes('workspace') || a.data?.writingWorkspace);
  const workspace = (processAct?.data?.writingWorkspace || processAct?.data) as any;

  const editingAct = activities.find(a => a.type === 'editing_practice' || a.activityId.includes('editing'));
  const editingData = editingAct?.data as any;

  // Step 1 Analyze 라벨 선택 상태
  const [step1Labels, setStep1Labels] = useState<{ [key: string]: string }>({});

  // Step 2 Outline Form State
  const [outline, setOutline] = useState({
    clubInformation: '',
    mainActivities: '',
    requirements: '',
    invitingRemarks: '',
    contactInformation: '',
  });

  // Step 3 Draft State
  const [draftText, setDraftText] = useState<string>('');
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiFeedback, setAiFeedback] = useState<{
    feedbackKo: string;
    rubricScores: { criterion: string; comment: string }[];
  } | null>(null);

  // Step 4 Editing Practice 상태
  const [showEditingAnswer, setShowEditingAnswer] = useState<boolean>(false);

  const handleRequestAiFeedback = async () => {
    if (!draftText.trim()) return;
    setIsAiEvaluating(true);
    setAiFeedback(null);
    setAiError(null);
    try {
      const result = await GeminiService.evaluateWriting(
        draftText,
        lesson.lessonNumber === 1
          ? 'School Club Promotion Post (동아리 홍보 온라인 게시글)'
          : 'My Favorite Work of Art (좋아하는 예술 작품 소개문)',
        workspace?.step3Draft?.rubric || [
          { criterion: '주제 적합성', description: '소개하고자 하는 대상과 그 특징이 명확하게 서술되었는가?' },
          { criterion: '구성 완성도', description: '도입, 세부 내용, 결론이 논리적으로 구성되었는가?' },
          { criterion: '어휘 및 문법', description: '단원의 핵심 표현과 문법이 올바르게 활용되었는가?' }
        ],
        `lesson-0${lesson.lessonNumber}`
      );
      setAiFeedback(result);
      await StorageService.logObservation(
        user,
        lesson.lessonNumber,
        'AI 쓰기 루브릭 첨삭',
        `초안 길이: ${draftText.length}자, 루브릭 피드백 수신`
      );
    } catch (e: any) {
      setAiError(e.message || 'AI 첨삭 호출 중 오류가 발생했습니다.');
    } finally {
      setIsAiEvaluating(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Model Writing */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">M</span>
          <h2 className="text-base font-bold text-slate-900">
            Model Writing: {workspace?.modelWriting?.title || modelData?.item || 'Writing Model'}
          </h2>
        </div>

        {/* L1 Model Writing */}
        {workspace?.modelWriting && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <h3 className="font-bold text-indigo-900 text-sm">{workspace.modelWriting.title}</h3>
            <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-white p-3.5 rounded-lg border border-slate-200">
              "{workspace.modelWriting.text}"
            </p>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              {workspace.modelWriting.sections?.map((sec: any, idx: number) => (
                <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                  <span className="font-bold text-indigo-600 block mb-0.5">{sec.label || sec.name}</span>
                  <span className="text-slate-600 leading-snug">{sec.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* L2 Model Writing */}
        {modelData && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-indigo-900 text-sm">{modelData.item} ({modelData.topic})</h3>
            </div>
            {modelData.asset && (
              <div className="max-w-md mx-auto rounded-xl overflow-hidden shadow-sm border border-slate-200 my-2">
                <img src={modelData.asset} alt={modelData.item} className="w-full h-auto object-cover" />
              </div>
            )}
            <div className="space-y-2 pt-2">
              {modelData.structure?.map((sec: any, idx: number) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-slate-200 space-y-1 text-xs">
                  <span className="font-bold text-indigo-700 block text-[11px] uppercase">{sec.section}</span>
                  <p className="text-slate-800 leading-relaxed italic">{sec.content}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* STEP 1 & 2 Outlining */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">2</span>
          <h2 className="text-base font-bold text-slate-900">Outlining & Drafting (나만의 영작 개요 및 초안 작성)</h2>
        </div>

        {/* L2 Outlining guide */}
        {workspace?.step2_outlining && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2 mb-4">
            <span className="font-bold text-indigo-950 block">💡 Outlining Guide & Sample:</span>
            <p className="text-slate-800 font-semibold">• 소개: {workspace.step2_outlining.introduction}</p>
            <div className="space-y-1 pl-2">
              {workspace.step2_outlining.detailedInfo?.map((info: string, idx: number) => (
                <p key={idx} className="text-slate-600">• {info}</p>
              ))}
            </div>
            <p className="text-slate-800 font-semibold">• 결론: {workspace.step2_outlining.closing}</p>
          </div>
        )}

        {/* Writing input */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold text-slate-700">✍️ 나의 영어 초안 작성 (Draft):</label>
          <textarea
            rows={5}
            value={draftText}
            onChange={e => setDraftText(e.target.value)}
            placeholder="교과서 예시와 개요를 참고하여 나만의 영작 초안을 작성해보세요..."
            className="w-full p-3.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500 leading-relaxed"
          />

          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 font-mono">{draftText.length} 자 작성됨</span>
            <button
              onClick={handleRequestAiFeedback}
              disabled={isAiEvaluating || !draftText.trim()}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all disabled:opacity-50"
            >
              {isAiEvaluating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>AI 실시간 루브릭 첨삭 받기</span>
            </button>
          </div>

          {/* AI Feedback View */}
          {aiFeedback && (
            <div className="p-4 bg-purple-50/70 border border-purple-200 rounded-xl space-y-3 text-xs">
              <span className="font-bold text-purple-950 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-purple-600" />
                AI 루브릭 정밀 분석 결과:
              </span>
              <p className="text-purple-900 leading-relaxed bg-white p-3 rounded-lg border border-purple-100">
                {aiFeedback.feedbackKo}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* STEP 4. Revising - Editing Practice */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">4</span>
          <h2 className="text-base font-bold text-slate-900">STEP 4. Revising: Editing Practice (오류 수정 연습)</h2>
        </div>

        {/* L1 Editing Practice */}
        {workspace?.step4Revise?.editingPractice && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <p className="text-slate-800 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
              {workspace.step4Revise.editingPractice.textWithErrors}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowEditingAnswer(!showEditingAnswer)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs"
              >
                {showEditingAnswer ? '정답 숨기기' : '교과서 정답 확인'}
              </button>
              {showEditingAnswer && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-emerald-900 space-y-1">
                  {workspace.step4Revise.editingPractice.corrections?.map((c: any, idx: number) => (
                    <p key={idx}>• <span className="line-through text-rose-600">{c.original}</span> → <span className="font-bold text-emerald-700">{c.corrected}</span> ({c.reason})</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* L2 Editing Practice */}
        {editingData && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            {editingData.tip && (
              <div className="p-2.5 bg-amber-50 rounded-lg border border-amber-200 text-amber-900 font-medium">
                💡 <span className="font-bold">Editing Tip:</span> {editingData.tip}
              </div>
            )}
            <p className="text-slate-800 leading-relaxed bg-white p-3.5 rounded-lg border border-slate-200">
              {editingData.passage}
            </p>
            <div className="pt-2">
              <button
                onClick={() => setShowEditingAnswer(!showEditingAnswer)}
                className="px-3 py-1.5 bg-indigo-50 text-indigo-700 font-bold rounded-lg border border-indigo-200 text-xs"
              >
                {showEditingAnswer ? '정답 숨기기' : '교과서 정답 확인'}
              </button>
              {showEditingAnswer && editingData.corrections && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-emerald-900 space-y-1">
                  {editingData.corrections.map((c: any, idx: number) => (
                    <p key={idx}>• <span className="line-through text-rose-600">{c.original}</span> → <span className="font-bold text-emerald-700">{c.corrected}</span> ({c.reason})</p>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
