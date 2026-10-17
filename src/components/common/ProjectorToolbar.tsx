import React, { useState, useEffect } from 'react';
import { StorageService } from '../../services/storageService';
import { UserProfile } from '../../types/auth';
import { Eye, EyeOff, Timer, Shuffle, FileSpreadsheet, Play, Pause, RotateCcw } from 'lucide-react';

interface ProjectorToolbarProps {
  showAnswers: boolean;
  onToggleShowAnswers: () => void;
  lessonNumber: number;
  user: UserProfile | null;
}

export const ProjectorToolbar: React.FC<ProjectorToolbarProps> = ({
  showAnswers,
  onToggleShowAnswers,
  lessonNumber,
  user,
}) => {
  const [timerSeconds, setTimerSeconds] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);

  const [randomStudent, setRandomStudent] = useState<string | null>(null);
  const [isRouletteSpinning, setIsRouletteSpinning] = useState<boolean>(false);

  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning && timerSeconds > 0) {
      interval = setInterval(() => {
        setTimerSeconds(prev => prev - 1);
      }, 1000);
    } else if (timerSeconds === 0) {
      setIsTimerRunning(false);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, timerSeconds]);

  const handleStartTimer = (mins: number) => {
    setTimerSeconds(mins * 60);
    setIsTimerRunning(true);
  };

  const handleResetTimer = () => {
    setIsTimerRunning(false);
    setTimerSeconds(0);
  };

  const handlePickRandomStudent = () => {
    setIsRouletteSpinning(true);
    setRandomStudent(null);
    // 심인고등학교 학급 학생 명단 시뮬레이션
    const mockStudents = [
      '1반 03번 김민준', '1반 07번 이서윤', '1반 12번 박도현', '1반 18번 최예은',
      '2반 04번 정우진', '2반 11번 한소희', '3반 05번 강태양', '3반 15번 윤지후'
    ];
    setTimeout(() => {
      const selected = mockStudents[Math.floor(Math.random() * mockStudents.length)];
      setRandomStudent(selected);
      setIsRouletteSpinning(false);
    }, 1000);
  };

  const handleExportNeisCSV = () => {
    StorageService.exportObservationsCSV(user, lessonNumber);
  };

  const formatTimer = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-emerald-900 text-white px-3 sm:px-4 py-2 shadow-lg border-b border-emerald-800">
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2.5 text-xs">
        {/* Mode Title */}
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />
          <span className="font-bold text-xs sm:text-sm tracking-tight truncate">🖥️ 교사용 수업 모드</span>
          <span className="bg-emerald-800 px-1.5 py-0.5 rounded text-[10px] text-emerald-200 hidden sm:inline">프로젝터 전자칠판</span>
        </div>

        {/* Classroom Controls */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Answer Toggle */}
          <button
            onClick={onToggleShowAnswers}
            aria-label={showAnswers ? '정답 가리기' : '정답 전체 공개'}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg font-bold transition-all shadow-xs ${
              showAnswers
                ? 'bg-amber-400 text-slate-950 hover:bg-amber-300'
                : 'bg-emerald-800 text-emerald-100 hover:bg-emerald-700'
            }`}
          >
            {showAnswers ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span>{showAnswers ? '정답 가리기' : '정답 공개'}</span>
          </button>

          {/* Activity Timer */}
          <div className="flex items-center gap-1 bg-emerald-950/80 px-2 py-1 rounded-lg border border-emerald-700">
            <Timer className="w-3 h-3 text-emerald-300" />
            <span className="font-mono font-bold text-xs text-emerald-100 w-10 text-center">
              {formatTimer(timerSeconds)}
            </span>
            {timerSeconds === 0 ? (
              <div className="flex items-center gap-0.5">
                {[1, 3, 5].map(m => (
                  <button
                    key={m}
                    onClick={() => handleStartTimer(m)}
                    aria-label={`타이머 ${m}분 시작`}
                    className="px-1 py-0.5 bg-emerald-800 hover:bg-emerald-700 rounded text-[10px]"
                  >
                    {m}m
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsTimerRunning(!isTimerRunning)}
                  aria-label={isTimerRunning ? '타이머 일시정지' : '타이머 재생'}
                  className="p-0.5 hover:text-emerald-300"
                >
                  {isTimerRunning ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3" />}
                </button>
                <button
                  onClick={handleResetTimer}
                  aria-label="타이머 리셋"
                  className="p-0.5 hover:text-emerald-300"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Random Roulette */}
          <button
            onClick={handlePickRandomStudent}
            aria-label="랜덤 발표자 지목"
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-100 font-semibold"
          >
            <Shuffle className="w-3 h-3" />
            <span>발표자 지목</span>
          </button>
          {randomStudent && (
            <span className="bg-amber-400 text-slate-900 font-black px-1.5 py-0.5 rounded text-[11px] animate-bounce">
              🎯 {randomStudent}
            </span>
          )}
        </div>

        {/* NEIS Observation CSV Export */}
        <button
          onClick={handleExportNeisCSV}
          aria-label="NEIS 세특 관찰기록 CSV 내보내기"
          className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-colors shadow-xs shrink-0"
          title="학생별 활동 기록을 NEIS 세특 기재용 엑셀로 내보냅니다"
        >
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>세특 Export</span>
        </button>
      </div>
    </div>
  );
};
