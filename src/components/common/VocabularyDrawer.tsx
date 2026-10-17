import React, { useState } from 'react';
import { StorageService, SavedWord } from '../../services/storageService';
import { TTSService } from '../../services/ttsService';
import { X, Volume2, CheckCircle2, Circle, Trash2, Bookmark } from 'lucide-react';

interface VocabularyDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VocabularyDrawer: React.FC<VocabularyDrawerProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const [words, setWords] = useState<SavedWord[]>(StorageService.getSavedWords());

  const handleToggleMemorized = (wordStr: string) => {
    const updated = words.map(w => w.word === wordStr ? { ...w, memorized: !w.memorized } : w);
    setWords(updated);
    localStorage.setItem('aidt_my_vocabulary', JSON.stringify(updated));
  };

  const handleDelete = (wordStr: string) => {
    const updated = words.filter(w => w.word !== wordStr);
    setWords(updated);
    localStorage.setItem('aidt_my_vocabulary', JSON.stringify(updated));
  };

  const handleSpeak = (text: string) => {
    TTSService.speak(text);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Bookmark className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">나만의 스마트 단어장</h3>
              <p className="text-[11px] text-slate-500">본문 탭 및 오답 시 자동 수집된 단어 ({words.length}개)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Word List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
          {words.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-400">
              <Bookmark className="w-12 h-12 mb-2 stroke-1 text-slate-300" />
              <p className="text-sm font-medium">아직 수집된 단어가 없습니다.</p>
              <p className="text-xs mt-1">본문 문장을 탭하고 단어를 클릭하면 자동으로 저장됩니다.</p>
            </div>
          ) : (
            words.map((item, idx) => (
              <div
                key={idx}
                className={`p-3.5 rounded-xl border transition-all ${
                  item.memorized
                    ? 'bg-slate-50/60 border-slate-200 opacity-70'
                    : 'bg-white border-slate-200 shadow-xs hover:border-indigo-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleMemorized(item.word)}
                      className="text-slate-400 hover:text-emerald-600"
                    >
                      {item.memorized ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      ) : (
                        <Circle className="w-5 h-5" />
                      )}
                    </button>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className={`text-base font-bold ${item.memorized ? 'line-through text-slate-400' : 'text-slate-900'}`}>
                          {item.word}
                        </span>
                        <button
                          onClick={() => handleSpeak(item.word)}
                          className="p-1 text-slate-400 hover:text-indigo-600 rounded-md"
                          title="발음 듣기"
                        >
                          <Volume2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-600 mt-0.5">{item.meaning}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(item.word)}
                    className="p-1 text-slate-300 hover:text-rose-500 rounded-md transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {item.contextSentence && (
                  <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500 line-clamp-2 italic">
                    "{item.contextSentence}"
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
