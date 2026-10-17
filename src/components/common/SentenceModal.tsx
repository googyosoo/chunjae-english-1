import React, { useState } from 'react';
import { SentenceItem } from '../../types/lesson';
import { TTSService } from '../../services/ttsService';
import { GeminiService } from '../../services/geminiService';
import { StorageService } from '../../services/storageService';
import { Volume2, Sparkles, Bookmark, Check, X, MessageCircleQuestion, HelpCircle, Loader2 } from 'lucide-react';

interface SentenceModalProps {
  sentence: SentenceItem | null;
  onClose: () => void;
  lessonContextText: string;
}

export const SentenceModal: React.FC<SentenceModalProps> = ({
  sentence,
  onClose,
  lessonContextText,
}) => {
  if (!sentence) return null;

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [aiQuestion, setAiQuestion] = useState<string>('');
  const [aiAnswer, setAiAnswer] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [savedWords, setSavedWords] = useState<string[]>([]);

  const handlePlayTTS = () => {
    setIsPlaying(true);
    TTSService.speak(sentence.en, {
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const handleSaveWord = (word: string) => {
    StorageService.saveWord(word, '본문 핵심 어휘', sentence.en);
    setSavedWords(prev => [...prev, word]);
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim()) return;
    setIsAiLoading(true);
    setAiAnswer('');
    try {
      const fullQuery = `[대상 문장]: "${sentence.en}"\n[해석]: "${sentence.ko}"\n\n[질문]: ${aiQuestion}`;
      const answer = await GeminiService.askTextbookTutor(fullQuery, lessonContextText);
      setAiAnswer(answer);
    } catch (e: any) {
      setAiAnswer(`AI 질의 오류: ${e.message || 'Gemini API 키를 먼저 확인해주세요.'}`);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 단어 토큰 분리
  const words = sentence.en.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"']/g, '').split(/\s+/).filter(w => w.length > 2);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-slate-900/60 backdrop-blur-xs p-2 sm:p-4">
      <div className="bg-white rounded-t-3xl sm:rounded-2xl max-w-xl w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in slide-in-from-bottom-6 sm:zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 text-xs font-bold border border-indigo-200">
              문장 정밀 분석
            </span>
            {sentence.isLanguageFocus && (
              <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold border border-amber-200 flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> 문법 핵심 타깃
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* English Sentence & TTS */}
        <div className="my-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
          <div className="flex items-start justify-between gap-3 mb-2">
            <p className="text-base sm:text-lg font-bold text-slate-900 leading-snug">
              {sentence.en}
            </p>
            <button
              onClick={handlePlayTTS}
              className={`p-2.5 rounded-xl transition-all shadow-xs shrink-0 ${
                isPlaying
                  ? 'bg-indigo-600 text-white ring-4 ring-indigo-200'
                  : 'bg-white text-indigo-600 hover:bg-indigo-50 border border-slate-200'
              }`}
              title="원어민 발음 듣기"
            >
              <Volume2 className="w-5 h-5" />
            </button>
          </div>

          {/* Translation */}
          <div className="pt-2 border-t border-slate-200/80">
            <p className="text-sm font-medium text-slate-700 leading-relaxed">
              {sentence.ko}
            </p>
          </div>
        </div>

        {/* Grammar Tip */}
        {sentence.grammarTip && (
          <div className="mb-4 p-3.5 rounded-xl bg-amber-50/80 border border-amber-200 text-xs">
            <div className="font-bold text-amber-900 mb-1 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-600" />
              <span>핵심 문법 분석 가이드</span>
            </div>
            <p className="text-amber-800 leading-relaxed">
              {sentence.grammarTip}
            </p>
          </div>
        )}

        {/* Clickable Words for Vocabulary */}
        <div className="mb-4">
          <div className="text-xs font-bold text-slate-600 mb-2 flex items-center gap-1.5">
            <Bookmark className="w-3.5 h-3.5 text-indigo-600" />
            <span>단어를 클릭하여 내 단어장에 저장:</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {words.slice(0, 8).map((word, idx) => {
              const isSaved = savedWords.includes(word);
              return (
                <button
                  key={idx}
                  onClick={() => handleSaveWord(word)}
                  disabled={isSaved}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all flex items-center gap-1 ${
                    isSaved
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-700 border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50'
                  }`}
                >
                  <span>{word}</span>
                  {isSaved ? <Check className="w-3 h-3 text-emerald-600" /> : <Bookmark className="w-3 h-3 text-slate-400" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* AI Tutor Assistant for This Sentence */}
        <div className="p-3.5 rounded-xl bg-indigo-50/70 border border-indigo-200">
          <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-900 mb-2">
            <MessageCircleQuestion className="w-4 h-4 text-indigo-600" />
            <span>교과서 본문 한정 AI 튜터에게 질문하기</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={aiQuestion}
              onChange={e => setAiQuestion(e.target.value)}
              placeholder="예: 이 문장에서 for which가 수식하는 게 뭐야?"
              className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-300 bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              onKeyDown={e => e.key === 'Enter' && handleAskAi()}
            />
            <button
              onClick={handleAskAi}
              disabled={isAiLoading || !aiQuestion.trim()}
              className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold disabled:opacity-50 transition-colors shrink-0 flex items-center gap-1"
            >
              {isAiLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : '질문'}
            </button>
          </div>

          {aiAnswer && (
            <div className="p-3 bg-white rounded-lg border border-indigo-100 text-xs text-slate-800 leading-relaxed max-h-40 overflow-y-auto">
              <div className="font-bold text-indigo-700 mb-1">🤖 AI 튜터의 답변:</div>
              {aiAnswer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
