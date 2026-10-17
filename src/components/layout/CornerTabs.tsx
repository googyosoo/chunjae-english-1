import React from 'react';
import { CornerId } from '../../types/lesson';
import { Sparkles, MessageSquare, BookOpen, CheckSquare, Users, BookMarked, PenTool, Award, Check } from 'lucide-react';

interface CornerTabsProps {
  activeCornerId: CornerId;
  onSelectCorner: (id: CornerId) => void;
  completedCorners: string[];
  corners?: { id: CornerId; titleKo?: string; titleEn?: string; pageRange?: string }[];
}

const CORNER_ICONS: Record<string, React.ElementType> = {
  introduction: Sparkles,
  communicate: MessageSquare,
  read: BookOpen,
  after_read: CheckSquare,
  share_thoughts: Users,
  language_focus: BookMarked,
  write_present: PenTool,
  go_global: Award,
  work_together: Users,
};

const DEFAULT_CORNERS: { id: CornerId; title: string; subtitle: string }[] = [
  { id: 'introduction', title: '1. 도입', subtitle: 'Topic Question' },
  { id: 'communicate', title: '2. 듣기·말하기', subtitle: 'Communicate' },
  { id: 'read', title: '3. 본문 리더', subtitle: 'Read' },
  { id: 'after_read', title: '4. 읽기 후', subtitle: 'After You Read' },
  { id: 'share_thoughts', title: '5. 생각 나누기', subtitle: 'Share Thoughts' },
  { id: 'language_focus', title: '6. 언어 탐구', subtitle: 'Language Focus' },
  { id: 'write_present', title: '7. 쓰기 스튜디오', subtitle: 'Write & Present' },
  { id: 'go_global', title: '8. 총괄 평가', subtitle: 'Wrap Up' },
];

export const CornerTabs: React.FC<CornerTabsProps> = ({
  activeCornerId,
  onSelectCorner,
  completedCorners,
  corners,
}) => {
  const tabs = corners && corners.length > 0
    ? corners.map((c, idx) => ({
        id: c.id,
        title: `${idx + 1}. ${c.titleKo || c.id}`,
        subtitle: c.titleEn || c.pageRange || '',
      }))
    : DEFAULT_CORNERS;

  return (
    <div className="bg-white border-b border-slate-200 overflow-x-auto scrollbar-none px-4 py-2">
      <div className="max-w-7xl mx-auto flex items-center gap-1.5 min-w-max">
        {tabs.map((corner) => {
          const Icon = CORNER_ICONS[corner.id] || Sparkles;
          const isActive = activeCornerId === corner.id;
          const isDone = completedCorners.includes(corner.id);

          return (
            <button
              key={corner.id}
              data-testid={`corner-tab-${corner.id}`}
              aria-label={`${corner.title} ${corner.subtitle}`}
              onClick={() => onSelectCorner(corner.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all select-none ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-100 ring-2 ring-indigo-600/20'
                  : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
              <div className="text-left">
                <div className="leading-tight">{corner.title}</div>
                <div className={`text-[10px] ${isActive ? 'text-indigo-100' : 'text-slate-400'}`}>
                  {corner.subtitle}
                </div>
              </div>
              {isDone && (
                <div className={`w-4 h-4 rounded-full flex items-center justify-center ml-1 ${
                  isActive ? 'bg-white text-indigo-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};
