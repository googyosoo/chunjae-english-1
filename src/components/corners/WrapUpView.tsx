import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/auth';
import { Award, Globe, Sparkles, CheckCircle2, Headphones, MessageSquare, BookOpen, CheckSquare } from 'lucide-react';

interface WrapUpViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
  user?: UserProfile | null;
}

export const WrapUpView: React.FC<WrapUpViewProps> = ({ lesson, showTeacherAnswers, user = null }) => {
  const globalCorner = lesson.corners.find(c => c.id === 'go_global');
  
  // 1. Go Global (Texting Abbreviations)
  const textingAct = globalCorner?.activities.find(a => a.type === 'texting_abbreviations' || a.activityId === 'texting_abbreviations');
  const goGlobalData = textingAct?.data?.goGlobal;

  // 2. Wrap Up Activities (Part A, B, C)
  const wrapUpAct = globalCorner?.activities.find(a => a.type === 'wrap_up_activities' || a.activityId === 'wrap_up_activities');
  const partA = wrapUpAct?.data?.partA;
  const partB = wrapUpAct?.data?.partB;
  const partC = wrapUpAct?.data?.partC;

  // 3. Lesson Summary (Self-Check & Think Back)
  const summaryAct = globalCorner?.activities.find(a => a.type === 'lesson_summary' || a.activityId === 'lesson_summary');
  const selfCheckList = summaryAct?.data?.selfCheck || [];
  const thinkBackData = summaryAct?.data?.thinkBack;

  // State: Go Global 줄임말 연습 답변 (ga_1 ~ ga_4)
  const [globalAnswers, setGlobalAnswers] = useState<{ [id: string]: string }>({});
  const [isGlobalChecked, setIsGlobalChecked] = useState<boolean>(false);

  // State: Wrap Up Part A 선택지
  const [partASelected, setPartASelected] = useState<string>('');
  const [showPartAScript, setShowPartAScript] = useState<boolean>(false);

  // State: Wrap Up Part C quiz1 객관식 및 quiz2 서술형
  const [partCQuiz1Selected, setPartCQuiz1Selected] = useState<string>('');
  const [partCQuiz2Text, setPartCQuiz2Text] = useState<string>('');
  const [isWrapUpChecked, setIsWrapUpChecked] = useState<boolean>(false);

  // State: Self-Check 체크박스
  const [checkedCorners, setCheckedCorners] = useState<{ [idx: number]: boolean }>({});
  // State: Think Back 응답
  const [thinkBackAnswers, setThinkBackAnswers] = useState<{ q1: string; q2: string }>({ q1: '', q2: '' });

  const handleCheckAll = async () => {
    setIsGlobalChecked(true);
    setIsWrapUpChecked(true);
    await StorageService.logObservation(
      user,
      lesson.lessonNumber,
      'Go Global 및 Wrap Up 총괄 평가',
      'Go Global 줄임말, Wrap Up Part A/B/C 및 Lesson Summary 자기점검 완료'
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* 1. Go Global: Texting Abbreviations (p. 29) */}
      {goGlobalData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-indigo-600" />
            <h2 className="text-base font-bold text-slate-900">Go Global: Texting Abbreviations (p. 29)</h2>
          </div>

          {/* Sample Dialogues */}
          {(goGlobalData.dialogue1 || goGlobalData.dialogue2) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {goGlobalData.dialogue1 && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-indigo-700 block mb-1">대화 예시 1:</span>
                  <p className="whitespace-pre-line text-slate-800 font-medium leading-relaxed">{goGlobalData.dialogue1}</p>
                </div>
              )}
              {goGlobalData.dialogue2 && (
                <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-indigo-700 block mb-1">대화 예시 2:</span>
                  <p className="whitespace-pre-line text-slate-800 font-medium leading-relaxed">{goGlobalData.dialogue2}</p>
                </div>
              )}
            </div>
          )}

          {/* Abbreviations Reference Grid */}
          {goGlobalData.abbreviationsList && goGlobalData.abbreviationsList.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-700 block">📱 주요 문자 줄임말 사전 (24종):</span>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {goGlobalData.abbreviationsList.map((item, idx) => (
                  <div key={idx} className="p-2 bg-indigo-50/50 rounded-lg border border-indigo-100 text-center">
                    <span className="font-mono font-bold text-indigo-800 text-xs block">{item.abbr}</span>
                    <span className="text-[10px] text-slate-600 block truncate" title={item.meaning}>{item.meaning}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Exercises (ga_1 ~ ga_4) */}
          {goGlobalData.exercises && goGlobalData.exercises.length > 0 && (
            <div className="space-y-3 pt-3 border-t border-slate-100">
              <span className="text-xs font-bold text-slate-700 block">줄임말 문장을 온전한 영어 문장으로 풀어보세요:</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {goGlobalData.exercises.map((ex, idx) => {
                  const val = globalAnswers[ex.id] || '';
                  const isCorrect = val.trim().toLowerCase() === ex.answer.toLowerCase();

                  return (
                    <div key={ex.id} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
                      <p className="font-semibold text-slate-900 font-mono">
                        {ex.text}
                      </p>
                      <input
                        type="text"
                        value={val}
                        onChange={e => setGlobalAnswers(prev => ({ ...prev, [ex.id]: e.target.value }))}
                        placeholder="정확한 영어 문장 입력..."
                        aria-label={`Go Global question ${idx + 1}`}
                        className="w-full px-3 py-1.5 border border-slate-300 bg-white rounded-lg font-medium text-xs text-indigo-800"
                      />
                      {isGlobalChecked && (
                        <div className="text-[11px] font-bold">
                          {isCorrect ? (
                            <span className="text-emerald-600">✓ 정답입니다!</span>
                          ) : (
                            <span className="text-rose-600">✗ 정답: {ex.answer}</span>
                          )}
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

      {/* 2. Wrap Up Activities (p. 30) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Wrap Up: Part A, B, C (p. 30)</h2>
        </div>

        {/* Part A: Listening Comprehension */}
        {partA && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-bold text-indigo-900 uppercase">Part A. Listening Comprehension</span>
              <button
                onClick={() => setShowPartAScript(!showPartAScript)}
                className="flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-800 bg-white px-2.5 py-1 rounded-md border border-slate-200"
              >
                <Headphones className="w-3.5 h-3.5" />
                <span>{showPartAScript ? '대본 닫기' : '대본 보기 (Scripts)'}</span>
              </button>
            </div>

            {showPartAScript && partA.script && (
              <div className="p-3 bg-white rounded-lg border border-indigo-100 whitespace-pre-line text-slate-700 leading-relaxed text-[11px]">
                {partA.script}
              </div>
            )}

            <p className="font-bold text-slate-900 text-xs sm:text-sm">{partA.question}</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {partA.options.map(opt => (
                <button
                  key={opt.label}
                  onClick={() => setPartASelected(opt.label)}
                  className={`p-2.5 rounded-lg border text-left font-medium transition-all ${
                    partASelected === opt.label
                      ? isWrapUpChecked
                        ? opt.label === partA.answer
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-rose-600 text-white border-rose-600'
                        : 'bg-indigo-600 text-white border-indigo-600'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                  }`}
                >
                  <span className="font-bold mr-1.5 uppercase">({opt.label})</span>
                  <span>{opt.text}</span>
                </button>
              ))}
            </div>
            {isWrapUpChecked && (
              <div className="text-[11px] font-bold">
                {partASelected === partA.answer ? (
                  <span className="text-emerald-600">✓ 정답입니다!</span>
                ) : (
                  <span className="text-rose-600">✗ 정답: ({partA.answer})</span>
                )}
              </div>
            )}
          </div>
        )}

        {/* Part B: Speaking Dialogue */}
        {partB && partB.dialogue && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3 text-xs">
            <span className="font-bold text-indigo-900 uppercase block">Part B. Speaking Dialogue</span>
            <div className="space-y-2">
              {partB.dialogue.map((line, idx) => (
                <div key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
                  <span className="font-bold text-indigo-600 shrink-0 w-6">{line.speaker}:</span>
                  <span className="text-slate-800 leading-relaxed font-medium">{line.text}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Part C: Reading Comprehension & Writing */}
        {partC && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-4 text-xs">
            <span className="font-bold text-indigo-900 uppercase block">Part C. Reading & Writing</span>
            
            {/* Passage */}
            <div className="p-3.5 bg-white rounded-lg border border-slate-200 leading-relaxed text-slate-800 text-xs sm:text-sm">
              {partC.passage}
            </div>

            {/* Quiz 1 (Multiple Choice) */}
            {partC.quiz1 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900">1. {partC.quiz1.question}</p>
                <div className="space-y-1.5">
                  {partC.quiz1.options.map(opt => (
                    <button
                      key={opt.label}
                      onClick={() => setPartCQuiz1Selected(opt.label)}
                      className={`w-full p-2.5 rounded-lg border text-left font-medium transition-all ${
                        partCQuiz1Selected === opt.label
                          ? isWrapUpChecked
                            ? opt.label === partC.quiz1.answer
                              ? 'bg-emerald-600 text-white border-emerald-600'
                              : 'bg-rose-600 text-white border-rose-600'
                            : 'bg-indigo-600 text-white border-indigo-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      <span className="font-bold mr-1.5 uppercase">({opt.label})</span>
                      <span>{opt.text}</span>
                    </button>
                  ))}
                </div>
                {isWrapUpChecked && (
                  <div className="text-[11px] font-bold">
                    {partCQuiz1Selected === partC.quiz1.answer ? (
                      <span className="text-emerald-600">✓ 정답입니다!</span>
                    ) : (
                      <span className="text-rose-600">✗ 정답: ({partC.quiz1.answer})</span>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Quiz 2 (Short Writing) */}
            {partC.quiz2 && (
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <p className="font-bold text-slate-900">2. {partC.quiz2.prompt}</p>
                <textarea
                  value={partCQuiz2Text}
                  onChange={e => setPartCQuiz2Text(e.target.value)}
                  placeholder="영어로 자신의 생각을 적어보세요..."
                  rows={3}
                  className="w-full p-3 border border-slate-300 bg-white rounded-lg text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                />
                {showTeacherAnswers && (
                  <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg text-[11px]">
                    🔑 [교과서 예시답안 (p.153)]: {partC.quiz2.sampleAnswer}
                  </p>
                )}
              </div>
            )}
          </div>
        )}
      </section>

      {/* 3. Lesson Summary (p. 31) */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Lesson Summary: Self-Check & Think Back (p. 31)</h2>
        </div>

        {/* Self-Check Checklist */}
        {selfCheckList.length > 0 && (
          <div className="space-y-3">
            <span className="text-xs font-bold text-slate-700 block">✅ Self-Check: 1단원에서 배운 학습 성취도를 스스로 점검해보세요:</span>
            <div className="space-y-2">
              {selfCheckList.map((item, idx) => (
                <div key={idx} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs flex items-start gap-3">
                  <input
                    type="checkbox"
                    checked={!!checkedCorners[idx]}
                    onChange={e => setCheckedCorners(prev => ({ ...prev, [idx]: e.target.checked }))}
                    className="w-4 h-4 text-indigo-600 rounded border-slate-300 mt-0.5 cursor-pointer"
                  />
                  <div className="space-y-1">
                    <p className="font-bold text-slate-900">
                      <span className="text-indigo-600 mr-1.5">[{item.corner}]</span>
                      {item.statement}
                    </p>
                    {item.targetExpressions && item.targetExpressions.length > 0 && (
                      <ul className="text-[11px] text-slate-600 space-y-0.5 pl-2 border-l-2 border-indigo-200 font-mono">
                        {item.targetExpressions.map((expr, eIdx) => (
                          <li key={eIdx}>{expr}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Think Back */}
        {thinkBackData && (
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-4 text-xs">
            <span className="font-bold text-indigo-950 uppercase block">💡 Think Back</span>
            <div className="space-y-2">
              <p className="font-bold text-slate-900">Q1. {thinkBackData.q1}</p>
              <textarea
                value={thinkBackAnswers.q1}
                onChange={e => setThinkBackAnswers(prev => ({ ...prev, q1: e.target.value }))}
                placeholder="1단원에서 가장 흥미로웠거나 어려웠던 점을 적어보세요..."
                rows={2}
                className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-xs"
              />
            </div>
            <div className="space-y-2 pt-2 border-t border-indigo-200">
              <p className="font-bold text-slate-900">Q2. {thinkBackData.q2}</p>
              <textarea
                value={thinkBackAnswers.q2}
                onChange={e => setThinkBackAnswers(prev => ({ ...prev, q2: e.target.value }))}
                placeholder="토픽 질문에 대한 최종 생각을 영어로 작성해보세요..."
                rows={2}
                className="w-full p-2.5 border border-slate-300 bg-white rounded-lg text-xs"
              />
              {showTeacherAnswers && thinkBackData.topicSampleAnswer && (
                <p className="text-emerald-800 bg-emerald-50 p-2 rounded-lg text-[11px]">
                  🔑 [교과서 예시답안]: {thinkBackData.topicSampleAnswer}
                </p>
              )}
            </div>
          </div>
        )}
      </section>

      {/* Global Check Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleCheckAll}
          aria-label="Wrap Up 전체 채점 및 확인"
          className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
        >
          총괄 평가 전체 채점 및 성찰 제출
        </button>
      </div>
    </div>
  );
};
