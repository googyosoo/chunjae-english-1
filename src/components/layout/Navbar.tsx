import React, { useState } from 'react';
import { UserProfile, SCHOOL_NAME } from '../../types/auth';
import { TTSService } from '../../services/ttsService';
import { BookOpen, Monitor, Smartphone, Volume2, Bookmark, LogOut, LayoutDashboard } from 'lucide-react';

interface NavbarProps {
  user: UserProfile | null;
  currentMode: 'student' | 'teacher';
  lessonNumber?: number;
  lessonTitle?: string;
  onModeChange: (mode: 'student' | 'teacher') => void;
  onOpenVocab: () => void;
  onSelectLessonList?: () => void;
  onOpenTeacherDashboard?: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  user,
  currentMode,
  lessonNumber = 1,
  lessonTitle = 'Digital Well-being',
  onModeChange,
  onOpenVocab,
  onSelectLessonList,
  onOpenTeacherDashboard,
  onLogout,
}) => {
  const [playbackRate, setPlaybackRate] = useState<number>(1.0);

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    TTSService.setDefaultRate(rate);
  };

  const isTeacher = user?.role === 'teacher';

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-3 sm:px-4 py-2 shadow-xs">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
        {/* Logo & School Badge */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={onSelectLessonList}
            aria-label="단원 선택 화면으로 이동"
            className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0 hover:opacity-90 transition-opacity cursor-pointer"
          >
            <BookOpen className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-slate-900 text-sm sm:text-base tracking-tight truncate">영어I AI 교과서</span>
              <span className="px-1.5 py-0.5 text-[10px] font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0">
                {SCHOOL_NAME}
              </span>
              {onSelectLessonList && (
                <button
                  onClick={onSelectLessonList}
                  aria-label="다른 단원 선택하기"
                  className="px-1.5 py-0.5 text-[10px] font-semibold rounded bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-900 border border-slate-200 transition-colors"
                >
                  단원 변경
                </button>
              )}
            </div>
            <p className="text-[10px] sm:text-xs text-slate-500 hidden sm:block truncate">
              2022 개정 고등 영어I (강상구) · Lesson {lessonNumber} {lessonTitle}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Audio Speed Selector */}
          <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200 text-[11px]">
            <span className="px-1.5 py-0.5 text-slate-500 font-medium hidden md:inline-flex items-center gap-0.5">
              <Volume2 className="w-3 h-3" /> TTS:
            </span>
            {[0.75, 1.0, 1.25].map(rate => (
              <button
                key={rate}
                onClick={() => handleRateChange(rate)}
                aria-label={`TTS 배속 ${rate}배로 설정`}
                className={`px-1.5 py-0.5 rounded font-semibold transition-all ${
                  playbackRate === rate
                    ? 'bg-white text-indigo-700 shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>

          {/* Teacher Only: Projector Mode Switcher & Teacher Dashboard (교사에게만 노출) */}
          {isTeacher && (
            <div className="flex items-center gap-1.5">
              <div className="flex items-center bg-slate-100 rounded-lg p-0.5 border border-slate-200">
                <button
                  onClick={() => onModeChange('student')}
                  aria-label="학생 모드로 보기"
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    currentMode === 'student' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">학생 뷰</span>
                </button>
                <button
                  onClick={() => onModeChange('teacher')}
                  aria-label="교사용 수업 모드로 전환"
                  className={`px-2 py-1 rounded text-xs font-semibold transition-all ${
                    currentMode === 'teacher' ? 'bg-emerald-600 text-white shadow-2xs' : 'text-slate-600'
                  }`}
                >
                  <Monitor className="w-3.5 h-3.5 sm:hidden" />
                  <span className="hidden sm:inline">수업 모드</span>
                </button>
              </div>

              {onOpenTeacherDashboard && (
                <button
                  onClick={onOpenTeacherDashboard}
                  aria-label="교사용 대시보드 열기"
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-2xs transition-all cursor-pointer"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">교사 대시보드</span>
                </button>
              )}
            </div>
          )}

          {/* My Vocab Button */}
          <button
            onClick={onOpenVocab}
            aria-label="내 단어장 열기"
            className="p-1.5 sm:p-2 rounded-lg text-slate-600 hover:bg-slate-100 hover:text-indigo-600 transition-colors border border-slate-200"
          >
            <Bookmark className="w-4 h-4" />
          </button>

          {/* User Profile & Logout */}
          {user && (
            <div className="flex items-center gap-1.5 pl-1.5 border-l border-slate-200">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-bold text-slate-800 leading-tight">{user.name}</div>
                <div className="text-[10px] text-slate-500 font-mono">
                  {user.grade}학년 {user.classNumber}반 {user.studentNumber}번
                </div>
              </div>
              <button
                onClick={onLogout}
                aria-label="로그아웃"
                title="로그아웃"
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-md transition-colors"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
