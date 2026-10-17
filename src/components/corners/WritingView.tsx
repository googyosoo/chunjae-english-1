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
  const activityData = writingCorner?.activities[0]?.data;
  const workspace = activityData?.writingWorkspace;

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
        'School Club Promotion Post (동아리 홍보 온라인 게시글)',
        workspace?.step3Draft.rubric || [],
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
      {/* Model Writing: Six Strings (p. 26) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">M</span>
          <h2 className="text-base font-bold text-slate-900">Model Writing: {workspace?.modelWriting.title} (p. 26)</h2>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-indigo-900 text-sm">{workspace?.modelWriting.title}</h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic bg-white p-3.5 rounded-lg border border-slate-200">
            "{workspace?.modelWriting.text}"
          </p>

          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {workspace?.modelWriting.sections?.map((sec, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="font-bold text-indigo-600 block mb-0.5">{sec.label || sec.name}</span>
                <span className="text-slate-600 leading-snug">{sec.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* STEP 1. Analyze (p. 26) */}
      {workspace?.step1Analyze && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">1</span>
            <h2 className="text-base font-bold text-slate-900">STEP 1. Analyze (글의 구성 요소 라벨링, p. 26)</h2>
          </div>
          <p className="text-xs text-slate-600 mb-4">{workspace.step1Analyze.instruction}</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
            {['A', 'B', 'C'].map(part => (
              <div key={part} className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                <span className="font-bold text-slate-800">단락 ({part})의 역할:</span>
                <select
                  value={step1Labels[part] || ''}
                  onChange={e => setStep1Labels(prev => ({ ...prev, [part]: e.target.value }))}
                  aria-label={`Step 1 Part ${part} Label`}
                  className="w-full px-2.5 py-1.5 border border-slate-300 bg-white rounded-lg font-medium text-indigo-700"
                >
                  <option value="">선택</option>
                  {workspace.modelWriting.headingsBox?.map(h => (
                    <option key={h} value={h}>{h}</option>
                  ))}
                </select>
                {showTeacherAnswers && (
                  <p className="text-[11px] text-emerald-700 font-bold">
                    🔑 정답: {workspace.step1Analyze.answers?.[part]}
                  </p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* STEP 2. Outlining (p. 27) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">2</span>
          <h2 className="text-base font-bold text-slate-900">STEP 2. Outlining (나만의 동아리 홍보 개요 작성, p. 27)</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">
          홍보할 동아리의 핵심 정보를 입력하세요. 교과서 모범 예시를 참고하여 작성할 수 있습니다.
        </p>

        {workspace?.step2Outline?.writingTip && (
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 mb-4">
            💡 <span className="font-bold">Writing Tip:</span> {workspace.step2Outline.writingTip}
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="space-y-1">
            <label className="block font-bold text-slate-700">1. 동아리 소개 (Club Information)</label>
            <input
              type="text"
              value={outline.clubInformation}
              onChange={e => setOutline(prev => ({ ...prev, clubInformation: e.target.value }))}
              placeholder={`예: ${workspace?.step2Outline?.example?.['clubInformation'] || 'a place where students learn...'}`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">2. 주요 활동 (Main Activities)</label>
            <input
              type="text"
              value={outline.mainActivities}
              onChange={e => setOutline(prev => ({ ...prev, mainActivities: e.target.value }))}
              placeholder="예: • performs at school events • community events"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">3. 가입 요건 (Requirements)</label>
            <input
              type="text"
              value={outline.requirements}
              onChange={e => setOutline(prev => ({ ...prev, requirements: e.target.value }))}
              placeholder={`예: ${workspace?.step2Outline?.example?.['requirements'] || 'willingness to interact with others'}`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block font-bold text-slate-700">4. 초대의 말 (Inviting Remarks)</label>
            <input
              type="text"
              value={outline.invitingRemarks}
              onChange={e => setOutline(prev => ({ ...prev, invitingRemarks: e.target.value }))}
              placeholder={`예: ${workspace?.step2Outline?.example?.['invitingRemarks'] || 'Come on and sign up now!'}`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="space-y-1 sm:col-span-2">
            <label className="block font-bold text-slate-700">5. 연락처 (Contact Information)</label>
            <input
              type="text"
              value={outline.contactInformation}
              onChange={e => setOutline(prev => ({ ...prev, contactInformation: e.target.value }))}
              placeholder={`예: ${workspace?.step2Outline?.example?.['contactInformation'] || '6strings@◯◯◯.hs.kr'}`}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </section>

      {/* STEP 3. Drafting with AI Rubric (p. 27) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">3</span>
          <h2 className="text-base font-bold text-slate-900">STEP 3. Drafting (초안 작성 & AI 루브릭 첨삭, p. 27)</h2>
        </div>

        {workspace?.step3Draft.template && (
          <div className="mb-4 p-3.5 bg-indigo-50/50 rounded-xl border border-indigo-200 text-xs text-indigo-950 space-y-1">
            <span className="font-bold block">📝 문장 템플릿:</span>
            <p className="font-mono text-[11px] leading-relaxed text-indigo-900">{workspace.step3Draft.template}</p>
          </div>
        )}

        <textarea
          value={draftText}
          onChange={e => setDraftText(e.target.value)}
          placeholder="Step 2의 개요를 바탕으로 60~100단어의 완전한 영어 문단을 작성해보세요..."
          rows={6}
          className="w-full p-4 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 font-mono mb-4 leading-relaxed"
        />

        <div className="flex items-center justify-between">
          <span className="text-xs text-slate-500">
            단어 수: {draftText.trim().split(/\s+/).filter(Boolean).length} words
          </span>
          <button
            onClick={handleRequestAiFeedback}
            disabled={isAiEvaluating || !draftText.trim()}
            aria-label="Request AI Rubric Feedback"
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isAiEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Gemini AI 루브릭 첨삭 받기</span>
          </button>
        </div>

        {/* AI Error Display */}
        {aiError && (
          <div className="mt-4 p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 space-y-1">
            <div className="font-bold flex items-center gap-1.5">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>AI 첨삭 오류 발생</span>
            </div>
            <p>{aiError}</p>
          </div>
        )}

        {/* AI Feedback Display */}
        {aiFeedback && (
          <div className="mt-5 p-5 bg-indigo-50/60 rounded-2xl border border-indigo-200/80 space-y-4">
            <div className="flex items-center gap-2 text-indigo-900 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI 루브릭 정밀 분석 결과</span>
            </div>

            <div className="p-3 bg-white rounded-xl border border-indigo-100 text-xs text-slate-800 leading-relaxed">
              <span className="font-bold text-indigo-950 block mb-1">총평:</span>
              {aiFeedback.feedbackKo}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {aiFeedback.rubricScores.map((score, idx) => (
                <div key={idx} className="bg-white p-3 rounded-xl border border-indigo-100 text-xs space-y-1">
                  <span className="font-bold text-indigo-700 block">{score.criterion}</span>
                  <p className="text-slate-600 leading-snug">{score.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* STEP 4. Revising & Editing Practice (p. 28) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">4</span>
          <h2 className="text-base font-bold text-slate-900">STEP 4. Revising: Editing Practice (Kobe Bryant, p. 28)</h2>
        </div>

        <p className="text-xs text-slate-500 mb-3">
          문장의 첫 글자와 고유명사(인명, 지명, 구단명 등)의 대문자 표기 오류를 찾아 바르게 고쳐보세요.
        </p>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs leading-relaxed text-slate-800 font-mono">
          <p>{workspace?.step4Revise?.editingPractice?.textWithErrors}</p>
        </div>

        <div className="mt-4 flex justify-between items-center">
          <button
            onClick={() => setShowEditingAnswer(!showEditingAnswer)}
            aria-label="Toggle Editing Practice Answers"
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl border border-slate-300 transition-colors"
          >
            {showEditingAnswer ? '정답 접기' : '🔑 교과서 수정 정답 확인 (6개 오류)'}
          </button>
        </div>

        {showEditingAnswer && (
          <div className="mt-3 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <span className="font-bold block">교과서 오류 정정 내역 (p. 28):</span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {workspace?.step4Revise?.editingPractice?.corrections.map((c, idx) => (
                <div key={idx} className="bg-white p-2 rounded-lg border border-emerald-100 flex items-center justify-between">
                  <span className="text-rose-600 line-through font-mono">{c.original}</span>
                  <span className="text-slate-400">➔</span>
                  <span className="text-emerald-700 font-bold font-mono">{c.corrected}</span>
                  <span className="text-[11px] text-slate-500">({c.explanation})</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
