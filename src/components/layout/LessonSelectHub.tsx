import React from 'react';
import { BookOpen, Sparkles, CheckCircle2, ChevronRight, School } from 'lucide-react';
import { SCHOOL_NAME } from '../../types/auth';

export interface LessonSummaryInfo {
  id: string; // 'lesson-01', 'lesson-02'
  lessonNumber: number;
  title: string;
  topic: string;
  pageRange: string;
  description: string;
  completedCornersCount: number;
  totalCornersCount: number;
}

interface LessonSelectHubProps {
  lessons: LessonSummaryInfo[];
  onSelectLesson: (lessonId: string, lessonNumber: number) => void;
}

export const LessonSelectHub: React.FC<LessonSelectHubProps> = ({
  lessons,
  onSelectLesson,
}) => {
  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-bold">
            <School className="w-3.5 h-3.5" />
            <span>{SCHOOL_NAME} AI 디지털 교과서</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            2022 개정 고등 영어I (강상구)
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 max-w-lg mx-auto">
            학습할 단원을 선택하세요. 교과서 원문과 생성형 AI 첨삭 피드백으로 자기주도적 역량을 기릅니다.
          </p>
        </div>

        {/* Lesson Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {lessons.map((lesson) => {
            const progressPercent = Math.round(
              (lesson.completedCornersCount / (lesson.totalCornersCount || 8)) * 100
            );

            return (
              <div
                key={lesson.id}
                data-testid={`lesson-card-${lesson.id}`}
                onClick={() => onSelectLesson(lesson.id, lesson.lessonNumber)}
                className="group bg-white rounded-3xl p-6 shadow-xs hover:shadow-lg border border-slate-200 hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between space-y-4"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-600 text-white font-black text-xs">
                      LESSON {lesson.lessonNumber}
                    </span>
                    <span className="text-xs font-semibold text-slate-400">
                      {lesson.pageRange}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                      {lesson.title}
                    </h2>
                    <p className="text-xs text-slate-500 font-medium mt-1">
                      {lesson.topic}
                    </p>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {lesson.description}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-100 space-y-2">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      진도율 ({lesson.completedCornersCount}/{lesson.totalCornersCount || 8} 코너)
                    </span>
                    <span className="text-indigo-600 font-bold">{progressPercent}%</span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    />
                  </div>

                  <div className="flex justify-end pt-2">
                    <span className="text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                      학습 시작하기 <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
