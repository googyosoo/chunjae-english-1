import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { GeminiService } from '../../services/geminiService';
import { StorageService } from '../../services/storageService';
import { PenTool, Sparkles, CheckCircle2, Loader2, AlertCircle, RefreshCw } from 'lucide-react';

interface WritingViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
}

export const WritingView: React.FC<WritingViewProps> = ({ lesson, showTeacherAnswers }) => {
  const writingCorner = lesson.corners.find(c => c.id === 'write_present');
  const activityData = writingCorner?.activities[0].data;
  const workspace = activityData?.writingWorkspace;

  // Step 2 Outline Form State
  const [outline, setOutline] = useState<{ [field: string]: string }>({});

  // Step 3 Draft State
  const [draftText, setDraftText] = useState<string>('');
  const [isAiEvaluating, setIsAiEvaluating] = useState<boolean>(false);
  const [aiFeedback, setAiFeedback] = useState<{
    feedbackKo: string;
    rubricScores: { criterion: string; comment: string }[];
  } | null>(null);

  // Step 4 Editing Practice
  const [showEditingAnswer, setShowEditingAnswer] = useState<boolean>(false);

  const handleRequestAiFeedback = async () => {
    if (!draftText.trim()) return;
    setIsAiEvaluating(true);
    setAiFeedback(null);
    try {
      const result = await GeminiService.evaluateWriting(
        draftText,
        'School Club Promotion Post (동아리 홍보 온라인 게시글)',
        workspace?.step3Draft.rubric || []
      );
      setAiFeedback(result);
      StorageService.logObservation(
        lesson.lessonNumber,
        'AI 쓰기 루브릭 첨삭',
        `초안 길이: ${draftText.length}자, 피드백 완료`
      );
    } catch (e: any) {
      alert(`AI 첨삭 오류: ${e.message || 'Gemini API 키를 확인해주세요.'}`);
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
          <h2 className="text-base font-bold text-slate-900">Model Writing: 모범 글 분석하기</h2>
        </div>
        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
          <h3 className="font-bold text-indigo-900 text-sm">{workspace?.modelWriting.title}</h3>
          <p className="text-xs sm:text-sm text-slate-800 leading-relaxed italic">
            "{workspace?.modelWriting.text}"
          </p>
          <div className="pt-2 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            {workspace?.modelWriting.sections.map((sec, idx) => (
              <div key={idx} className="bg-white p-2.5 rounded-lg border border-slate-200/80">
                <span className="font-bold text-indigo-600 block mb-0.5">{sec.name}</span>
                <span className="text-slate-600">{sec.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Step 2 Outlining */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">2</span>
          <h2 className="text-base font-bold text-slate-900">STEP 2. Outlining (개요 작성 폼)</h2>
        </div>
        <p className="text-xs text-slate-500 mb-4">홍보할 동아리의 핵심 정보를 입력하세요. 이 개요는 다음 단계 초안 작성 시 참조됩니다.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {workspace?.step2Outline.formFields.map((field) => (
            <div key={field.fieldName} className="space-y-1">
              <label className="block text-xs font-bold text-slate-700">
                {field.labelKo}
              </label>
              <input
                type="text"
                value={outline[field.fieldName] || ''}
                onChange={e => setOutline(prev => ({ ...prev, [field.fieldName]: e.target.value }))}
                placeholder={`예: ${field.sample}`}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Step 3 Drafting with Gemini AI Rubric Feedback */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">3</span>
          <h2 className="text-base font-bold text-slate-900">STEP 3. Drafting (초안 작성 & AI 루브릭 첨삭)</h2>
        </div>

        <div className="mb-4 p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1">
            <Sparkles className="w-4 h-4 text-amber-600" />
            <span>작문 가이드라인:</span>
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-amber-800">
            {workspace?.step3Draft.guidelines.map((g, idx) => <li key={idx}>{g}</li>)}
          </ul>
        </div>

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
            className="px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white text-xs font-bold rounded-xl shadow-md shadow-indigo-100 disabled:opacity-50 transition-all flex items-center gap-2"
          >
            {isAiEvaluating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Gemini AI 루브릭 첨삭 받기</span>
          </button>
        </div>

        {/* AI Rubric Feedback Result */}
        {aiFeedback && (
          <div className="mt-5 p-5 bg-indigo-50/80 rounded-2xl border border-indigo-200 space-y-4 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-indigo-950 font-bold text-sm">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>AI 교사의 정밀 루브릭 피드백</span>
            </div>
            <p className="text-xs text-slate-800 bg-white p-3.5 rounded-xl border border-indigo-100 leading-relaxed">
              {aiFeedback.feedbackKo}
            </p>
            <div className="space-y-2">
              {aiFeedback.rubricScores.map((score, idx) => (
                <div key={idx} className="bg-white p-3 rounded-lg border border-indigo-100 text-xs">
                  <span className="font-bold text-indigo-700 block mb-1">[{score.criterion}]</span>
                  <p className="text-slate-700">{score.comment}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* Step 4 Revising & Editing Practice */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-3">
          <span className="w-6 h-6 rounded-lg bg-indigo-600 text-white font-bold flex items-center justify-center text-xs">4</span>
          <h2 className="text-base font-bold text-slate-900">STEP 4. Editing Practice (오류 찾기 실전)</h2>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-800 leading-relaxed mb-4">
          <p className="font-bold text-slate-900 mb-2">다음 글에서 대소문자 및 오탈자 오류를 찾아보세요 (Kobe Bryant 지문):</p>
          <div className="p-3 bg-white rounded-lg border border-slate-200 font-mono text-[11px] leading-loose">
            {workspace?.step4Revise.editingPractice.textWithErrors}
          </div>
        </div>

        <div className="flex justify-between items-center">
          <button
            onClick={() => setShowEditingAnswer(!showEditingAnswer)}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
          >
            {showEditingAnswer ? '정답 접기' : '교과서 정답 확인 (p.153)'}
          </button>
        </div>

        {showEditingAnswer && (
          <div className="mt-4 p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-2">
            <div className="font-bold mb-1">🔑 교과서 오류 수정 사항 (6개):</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {workspace?.step4Revise.editingPractice.corrections.map((c, idx) => (
                <div key={idx} className="bg-white p-2.5 rounded-lg border border-emerald-200">
                  <div className="font-bold text-rose-600 line-through mr-1">{c.original}</div>
                  <div className="font-bold text-emerald-700">→ {c.corrected}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{c.explanation}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
