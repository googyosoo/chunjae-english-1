import React from 'react';
import { X, ExternalLink, BookOpen, Sparkles } from 'lucide-react';

interface GrammarPictureBookModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GrammarPictureBookModal: React.FC<GrammarPictureBookModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  const handleOpenNewTab = () => {
    window.open('/waraeru_grammar_book.html', '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-6xl h-[92vh] rounded-3xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="px-5 py-3.5 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  Illustrated English Grammar
                </h3>
                <span className="text-[11px] font-medium text-amber-300 bg-amber-400/20 px-2 py-0.5 rounded-full border border-amber-400/30">
                  笑える英文法 絵本 Vol. 1
                </span>
                <span className="hidden sm:inline-block text-[11px] text-slate-300">
                  · 15 Chapters · 122 Pages with Built-in Dict & TTS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 hidden md:block">
                리소그래프 아트북 스타일 인터랙티브 영문법 그림책 (호버 사전 · 실시간 음성 지원)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleOpenNewTab}
              title="새 창으로 크게 열기"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-200 hover:text-white text-xs font-semibold transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">전체화면 새 창</span>
            </button>
            <button
              onClick={onClose}
              title="닫기"
              className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Embedded Interactive Grammar Book Iframe */}
        <div className="flex-1 w-full bg-slate-100 relative overflow-hidden">
          <iframe
            src="/waraeru_grammar_book.html"
            title="笑える英文法 絵本 - Illustrated English Grammar"
            className="w-full h-full border-0"
            allow="autoplay"
          />
        </div>
      </div>
    </div>
  );
};
