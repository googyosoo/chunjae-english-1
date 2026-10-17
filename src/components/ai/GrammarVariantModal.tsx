import React, { useState } from 'react';
import { AiService } from '../../services/aiService';
import { StorageService } from '../../services/storageService';
import { GrammarVariantQuestion } from '../../types/ai';
import { X, CheckCircle2, XCircle, Sparkles, BookMarked, RefreshCw, Award } from 'lucide-react';

interface GrammarVariantModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonNumber: number;
  grammarPoint: string;
}

export const GrammarVariantModal: React.FC<GrammarVariantModalProps> = ({
  isOpen,
  onClose,
  lessonNumber,
  grammarPoint,
}) => {
  const [questions, setQuestions] = useState<GrammarVariantQuestion[]>([]);
  const [userAnswers, setUserAnswers] = useState<{ [qId: string]: number | string }>({});
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQuestions = async () => {
    setIsLoading(true);
    setError(null);
    setIsSubmitted(false);
    setUserAnswers({});
    try {
      const qList = await AiService.generateGrammarVariants(
        grammarPoint || '조동사 + have p.p.',
        `lesson-0${lessonNumber}`,
        3
      );
      setQuestions(qList);
    } catch (e: any) {
      setError(e.message || '문법 변형 문항을 불러오지 못했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen) {
      fetchQuestions();
    }
  }, [isOpen, grammarPoint]);

  if (!isOpen) return null;

  const handleSelectOption = (qId: string, optIdx: number) => {
    if (isSubmitted) return;
    setUserAnswers(prev => ({ ...prev, [qId]: optIdx }));
  };

  const handleSubmit = () => {
    setIsSubmitted(true);
    let correctCount = 0;
    questions.forEach(q => {
      if (userAnswers[q.id] === q.correctAnswer) {
        correctCount++;
      }
    });

    // 세특 관찰 기록 로깅
    StorageService.logObservation(
      null,
      lessonNumber,
      'AI 문법 변형 퀴즈',
      `목표문법: ${grammarPoint} · 결과: ${correctCount}/${questions.length} 정답 이수`
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* 헤더 */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">AI 문법 실전 변형 문제</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">고1 내신 대비</span>
              </div>
              <p className="text-xs text-blue-100 truncate max-w-sm">
                목표 문법: {grammarPoint || 'Language Focus'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchQuestions}
              disabled={isLoading}
              title="새 문제 생성"
              aria-label="새 문법 문제 생성"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              title="닫기"
              aria-label="문법 변형 모달 닫기"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 바디 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50/50">
          {isLoading && (
            <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500">
              <Sparkles className="w-8 h-8 animate-spin text-indigo-600" />
              <span className="text-xs font-bold">고1 내신형 문법 변형 문제를 생성 중입니다...</span>
            </div>
          )}

          {error && (
            <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs text-center">
              {error}
            </div>
          )}

          {!isLoading && questions.length > 0 && (
            <div className="space-y-6">
              {questions.map((q, idx) => {
                const isSelected = userAnswers[q.id] !== undefined;
                const isCorrect = userAnswers[q.id] === q.correctAnswer;
                return (
                  <div
                    key={q.id || idx}
                    className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded">
                        Question {idx + 1} ({q.difficulty === 'basic' ? '기초' : q.difficulty === 'intermediate' ? '발전' : '심화'})
                      </span>
                      {isSubmitted && (
                        <span
                          className={`text-xs font-bold flex items-center gap-1 ${
                            isCorrect ? 'text-emerald-700' : 'text-rose-600'
                          }`}
                        >
                          {isCorrect ? (
                            <>
                              <CheckCircle2 className="w-4 h-4" /> 정답
                            </>
                          ) : (
                            <>
                              <XCircle className="w-4 h-4" /> 오답
                            </>
                          )}
                        </span>
                      )}
                    </div>

                    <p className="font-bold text-sm text-slate-900 leading-snug">{q.question}</p>

                    {q.passageSnippet && (
                      <div className="p-3 bg-slate-50 rounded-xl font-serif text-xs text-slate-800 border border-slate-100">
                        {q.passageSnippet}
                      </div>
                    )}

                    {/* 객관식 보기 */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                      {q.options?.map((opt, optIdx) => {
                        const chosen = userAnswers[q.id] === optIdx;
                        const isThisCorrect = q.correctAnswer === optIdx;
                        let btnStyle = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';

                        if (isSubmitted) {
                          if (isThisCorrect) {
                            btnStyle = 'bg-emerald-50 text-emerald-800 border-emerald-300 font-bold';
                          } else if (chosen) {
                            btnStyle = 'bg-rose-50 text-rose-800 border-rose-300';
                          }
                        } else if (chosen) {
                          btnStyle = 'bg-indigo-600 text-white border-indigo-600 font-bold';
                        }

                        return (
                          <button
                            key={optIdx}
                            onClick={() => handleSelectOption(q.id, optIdx)}
                            aria-label={`문항 ${idx + 1} 보기: ${opt}`}
                            className={`p-2.5 rounded-xl border text-xs text-left transition-all ${btnStyle}`}
                          >
                            <span className="font-mono font-bold mr-1.5">{optIdx + 1}.</span>
                            {opt}
                          </button>
                        );
                      })}
                    </div>

                    {/* 해설 */}
                    {isSubmitted && (
                      <div className="p-3 rounded-xl bg-slate-100 text-[11px] text-slate-700 leading-relaxed space-y-1">
                        <div className="font-bold text-slate-900">📖 문법 해설:</div>
                        <div>{q.explanation}</div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* 하단 채점 버튼 */}
        <div className="p-4 bg-white border-t border-slate-200 shrink-0 flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {questions.length > 0 && (
              <span>
                응답: {Object.keys(userAnswers).length}/{questions.length} 문항
              </span>
            )}
          </div>
          <button
            onClick={handleSubmit}
            disabled={Object.keys(userAnswers).length === 0 || isSubmitted || isLoading}
            aria-label="정답 제출 및 채점하기"
            className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            정답 제출 및 채점하기
          </button>
        </div>
      </div>
    </div>
  );
};
