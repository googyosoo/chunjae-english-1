import React, { useState } from 'react';
import { AiService } from '../../services/aiService';
import { TTSService } from '../../services/ttsService';
import { StorageService } from '../../services/storageService';
import { AiChatMessage, RoleplayTurnResponse } from '../../types/ai';
import { X, Send, Volume2, Bot, User, Sparkles, MessageCircle, RefreshCw, Lightbulb } from 'lucide-react';

interface RoleplayModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessonNumber: number;
  initialContext?: string;
}

export const RoleplayModal: React.FC<RoleplayModalProps> = ({
  isOpen,
  onClose,
  lessonNumber,
  initialContext = 'Dialogue 1: Talking about smartphone usage and digital habits',
}) => {
  const [messages, setMessages] = useState<AiChatMessage[]>([
    {
      role: 'assistant',
      content: "Hello! I'm your AI speaking partner. Let's practice the dialogue together! What do you usually do on your smartphone before sleeping?",
    },
  ]);
  const [inputText, setInputText] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [latestTips, setLatestTips] = useState<{
    replyKo?: string;
    pronunciationTip?: string;
    suggestedResponses?: string[];
  }>({
    replyKo: '안녕! 나는 너의 AI 말하기 파트너야. 함께 대화를 연습해보자! 너는 자기 전에 보통 스마트폰으로 무엇을 하니?',
    pronunciationTip: "smartphone의 'ph'는 [f] 사운드로 부드럽게 발음합니다.",
    suggestedResponses: [
      'I usually watch video clips on YouTube.',
      'I try not to use my phone in bed.',
    ],
  });

  if (!isOpen) return null;

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim() || isLoading) return;

    const userMsg: AiChatMessage = { role: 'user', content: text.trim() };
    const nextMessages = [...messages, userMsg];
    setMessages(nextMessages);
    setInputText('');
    setIsLoading(true);

    try {
      const response: RoleplayTurnResponse = await AiService.chatRoleplay(
        initialContext,
        text.trim(),
        nextMessages
      );

      const aiMsg: AiChatMessage = { role: 'assistant', content: response.replyEn };
      setMessages([...nextMessages, aiMsg]);
      setLatestTips({
        replyKo: response.replyKo,
        pronunciationTip: response.pronunciationTip,
        suggestedResponses: response.suggestedResponses,
      });

      // 발화 TTS 자동 또는 버튼 재생 지원
      TTSService.speak(response.replyEn);

      // 세특 학습 이력 기록
      StorageService.logObservation(
        null,
        lessonNumber,
        'AI 롤플레이 회화',
        `학생 발화: "${text.trim()}" → AI 응답 턴 완료`
      );
    } catch (e: any) {
      setMessages([
        ...nextMessages,
        { role: 'assistant', content: `[오류] ${e.message || '응답을 불러올 수 없습니다.'}` },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Hello! Let's start a fresh practice! How are you feeling today?",
      },
    ]);
    setLatestTips({
      replyKo: '안녕! 새로운 대화를 시작해보자! 오늘 기분이 어떠니?',
      pronunciationTip: 'feeling의 장모음 [i:]를 살려 길게 소리 내어 보세요.',
      suggestedResponses: ['I feel great and ready to learn.', 'A bit tired, but excited.'],
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full h-[85vh] flex flex-col overflow-hidden border border-slate-200">
        {/* 모달 상단 헤더 */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center text-white">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">AI 대화 롤플레이 파트너</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/20">고1 영어I</span>
              </div>
              <p className="text-xs text-indigo-100 truncate max-w-sm">{initialContext}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleReset}
              title="대화 다시 시작"
              aria-label="대화 다시 시작"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              title="닫기"
              aria-label="롤플레이 모달 닫기"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-500 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 대화 메시지 목록 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, idx) => {
            const isAi = msg.role === 'assistant';
            return (
              <div key={idx} className={`flex items-start gap-2.5 ${isAi ? '' : 'flex-row-reverse'}`}>
                <div
                  className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-white text-xs font-bold ${
                    isAi ? 'bg-indigo-600' : 'bg-slate-700'
                  }`}
                >
                  {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                </div>

                <div className={`space-y-1 max-w-[80%] ${isAi ? '' : 'text-right'}`}>
                  <div
                    className={`p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAi
                        ? 'bg-white text-slate-800 border border-slate-200/80 rounded-tl-none shadow-2xs'
                        : 'bg-indigo-600 text-white rounded-tr-none shadow-2xs text-left'
                    }`}
                  >
                    {msg.content}
                  </div>

                  {isAi && (
                    <button
                      onClick={() => TTSService.speak(msg.content)}
                      aria-label="AI 발화 다시 듣기"
                      className="inline-flex items-center gap-1 text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 pt-0.5"
                    >
                      <Volume2 className="w-3 h-3" /> 다시 듣기
                    </button>
                  )}
                </div>
              </div>
            );
          })}

          {isLoading && (
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-400 pl-11">
              <Sparkles className="w-3.5 h-3.5 animate-spin text-indigo-600" />
              <span>AI가 답변을 생각하는 중입니다...</span>
            </div>
          )}
        </div>

        {/* 팁 및 추천 발화 영역 */}
        {latestTips && (
          <div className="p-3 bg-white border-t border-slate-200 shrink-0 space-y-2">
            {latestTips.replyKo && (
              <div className="text-[11px] text-slate-500 bg-slate-50 p-2 rounded-xl">
                <span className="font-bold text-slate-700">해석:</span> {latestTips.replyKo}
              </div>
            )}
            {latestTips.pronunciationTip && (
              <div className="text-[11px] text-indigo-700 bg-indigo-50/70 p-2 rounded-xl flex items-center gap-1.5">
                <Lightbulb className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                <span>{latestTips.pronunciationTip}</span>
              </div>
            )}
            {latestTips.suggestedResponses && latestTips.suggestedResponses.length > 0 && (
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                <span className="text-[10px] font-bold text-slate-400 self-center">추천 답변:</span>
                {latestTips.suggestedResponses.map((res, i) => (
                  <button
                    key={i}
                    onClick={() => handleSendMessage(res)}
                    aria-label={`추천 답변 사용: ${res}`}
                    className="text-[11px] px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 border border-slate-200 transition-colors"
                  >
                    "{res}"
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {/* 하단 입력 폼 */}
        <div className="p-3 bg-white border-t border-slate-200 shrink-0">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="영어로 답변을 입력하세요 (예: I try to read books instead.)"
              aria-label="롤플레이 영어 답변 입력"
              className="flex-1 p-2.5 sm:p-3 text-xs sm:text-sm rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
            />
            <button
              type="submit"
              disabled={!inputText.trim() || isLoading}
              aria-label="답변 전송"
              className="p-2.5 sm:p-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
