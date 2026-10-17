import React, { useState, useEffect } from 'react';
import { UserProfile } from '../../types/auth';
import {
  StudentRosterItem,
  ClassProgressSummary,
  CornerLockState,
  ObservationExportItem,
  RosterCsvParseResult,
} from '../../types/teacher';
import { TeacherService } from '../../services/teacherService';
import { StorageService, StudentProgress } from '../../services/storageService';
import { AiService } from '../../services/aiService';
import { TeacherExamQuestion } from '../../types/ai';
import {
  X,
  Upload,
  Users,
  BarChart3,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  FileSpreadsheet,
  Download,
  RefreshCw,
  MessageSquare,
  Sparkles,
  HelpCircle,
  FileText,
  UserCheck,
  Power,
  Copy,
  Check,
} from 'lucide-react';

interface TeacherDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  currentLessonNumber: number;
}

type TabKey = 'roster' | 'dashboard' | 'locks' | 'review' | 'export' | 'ai_exam';

const ALL_CORNERS = [
  { id: 'introduction', name: 'Intro: Before You Read' },
  { id: 'communicate', name: 'Communicate: Listen & Speak' },
  { id: 'read', name: 'Read: 본문 탐독' },
  { id: 'after_read', name: 'After Read: 내용 점검' },
  { id: 'share_thoughts', name: 'Share Thoughts: 심화 탐구' },
  { id: 'language_focus', name: 'Language Focus: 어법 & 어휘' },
  { id: 'write_present', name: 'Writing: 글쓰기 & 표현' },
  { id: 'go_global', name: 'Wrap Up & Go Global: 문화 확장' },
];

export const TeacherDashboardModal: React.FC<TeacherDashboardModalProps> = ({
  isOpen,
  onClose,
  user,
  currentLessonNumber,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [selectedGrade, setSelectedGrade] = useState<number>(user.grade || 1);
  const [selectedClass, setSelectedClass] = useState<number>(user.classNumber || 1);
  const [selectedLesson, setSelectedLesson] = useState<number>(currentLessonNumber || 1);

  const classId = `g${selectedGrade}_c${selectedClass}`;

  // 상태 데이터
  const [roster, setRoster] = useState<StudentRosterItem[]>([]);
  const [csvText, setCsvText] = useState<string>('');
  const [parseResult, setParseResult] = useState<RosterCsvParseResult | null>(null);
  const [locks, setLocks] = useState<CornerLockState[]>([]);
  const [progressSummary, setProgressSummary] = useState<ClassProgressSummary | null>(null);
  const [unsubmittedOnly, setUnsubmittedOnly] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);

  // 서술형 검토 모의/실제 데이터
  const [reviewList, setReviewList] = useState<{
    studentEmail: string;
    studentName: string;
    studentNumber: number;
    draft: string;
    comment: string;
    approved: boolean;
  }[]>([]);

  // AI 전역 On/Off 상태
  const [aiEnabled, setAiEnabledState] = useState<boolean>(AiService.isAiEnabled());
  const handleToggleAi = () => {
    const next = !aiEnabled;
    AiService.setAiEnabled(next);
    setAiEnabledState(next);
    setStatusMessage(
      next
        ? 'AI 기능이 전역 활성화되었습니다.'
        : 'AI 기능이 전역 비활성화되었습니다 (미성년자 안전/독자 학습 모드).'
    );
  };

  // AI 내신 문항 제작소 상태
  const [examPassage, setExamPassage] = useState<string>('');
  const [examQuestionType, setExamQuestionType] = useState<string>('all');
  const [isGeneratingExam, setIsGeneratingExam] = useState<boolean>(false);
  const [generatedExamQuestions, setGeneratedExamQuestions] = useState<TeacherExamQuestion[]>([]);
  const [copiedQuestionId, setCopiedQuestionId] = useState<string | null>(null);
  const [showAnswerMap, setShowAnswerMap] = useState<Record<string, boolean>>({});

  // 교과서 본문 지문 자동 로드
  const handleFetchPassageFromLesson = async () => {
    setIsGeneratingExam(true);
    try {
      const lessonParam = selectedLesson === 6 ? 'special-lesson' : `lesson-0${selectedLesson}`;
      const res = await fetch(`/api/lesson?id=${lessonParam}`);
      if (!res.ok) throw new Error(`단원 지문 불러오기 실패 (${res.status})`);
      const data = await res.json();
      const readCorner = data.corners?.find((c: any) => c.id === 'read');
      const readAct = readCorner?.activities?.find((a: any) => a.paragraphs);
      const paragraphs = readAct?.paragraphs || [];
      const passageText = paragraphs
        .map((p: any) => (typeof p === 'string' ? p : p.en || p.text || ''))
        .filter(Boolean)
        .join('\n\n');

      if (passageText) {
        setExamPassage(passageText);
        setStatusMessage(`${selectedLesson === 6 ? 'Special Lesson' : `Lesson ${selectedLesson}`} 본문 지문이 로드되었습니다.`);
      } else {
        setStatusMessage('본문 지문을 추출할 수 없습니다. 직접 입력해주세요.');
      }
    } catch (e: any) {
      setStatusMessage(`지문 로드 오류: ${e.message}`);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // 문항 생성 실행
  const handleGenerateExamQuestions = async () => {
    setIsGeneratingExam(true);
    setStatusMessage(null);
    try {
      const lessonParam = selectedLesson === 6 ? 'special-lesson' : `lesson-0${selectedLesson}`;
      const qList = await AiService.generateTeacherExamQuestions(
        lessonParam,
        'read',
        examQuestionType
      );
      setGeneratedExamQuestions(qList);
      setStatusMessage(`성공: ${qList.length}개의 내신 지필평가 문항이 생성되었습니다.`);
    } catch (e: any) {
      setStatusMessage(`문항 생성 실패: ${e.message}`);
    } finally {
      setIsGeneratingExam(false);
    }
  };

  // 개별 문항 지필평가 시험지 서식 복사
  const handleCopyQuestionText = async (q: TeacherExamQuestion) => {
    let text = `[${q.typeKo}]\n${q.questionText}\n\n[지문]\n${q.passageText}\n\n`;
    if (q.options && q.options.length > 0) {
      text += q.options.map((c: string, i: number) => `  ${['①', '②', '③', '④', '⑤'][i] || i + 1} ${c}`).join('\n');
      text += `\n\n[정답] ${q.correctAnswer}\n[해설] ${q.explanation}`;
    } else if (q.modelAnswer || q.scoringCriteria) {
      text += `[모범 답안] ${q.modelAnswer || q.correctAnswer}\n`;
      if (q.scoringCriteria && q.scoringCriteria.length > 0) {
        text += `[채점 기준]\n${q.scoringCriteria.map((c: { criterion: string; points: number }, i: number) => `  ${i + 1}. ${c.criterion} (${c.points}점)`).join('\n')}\n`;
      }
      text += `[해설] ${q.explanation}`;
    }
    await navigator.clipboard.writeText(text);
    setCopiedQuestionId(q.id);
    setTimeout(() => setCopiedQuestionId(null), 2000);
  };

  // 전체 문항 일괄 복사
  const handleCopyAllExamText = async () => {
    if (generatedExamQuestions.length === 0) return;
    const allText = generatedExamQuestions
      .map((q, idx) => {
        let text = `${idx + 1}. [${q.typeKo}]\n${q.questionText}\n\n[지문]\n${q.passageText}\n\n`;
        if (q.options && q.options.length > 0) {
          text += q.options.map((c: string, i: number) => `  ${['①', '②', '③', '④', '⑤'][i] || i + 1} ${c}`).join('\n');
          text += `\n\n[정답] ${q.correctAnswer}\n[해설] ${q.explanation}\n`;
        } else if (q.modelAnswer || q.scoringCriteria) {
          text += `[모범 답안] ${q.modelAnswer || q.correctAnswer}\n`;
          if (q.scoringCriteria && q.scoringCriteria.length > 0) {
            text += `[채점 기준]\n${q.scoringCriteria.map((c: { criterion: string; points: number }, i: number) => `  ${i + 1}. ${c.criterion} (${c.points}점)`).join('\n')}\n`;
          }
          text += `[해설] ${q.explanation}\n`;
        }
        return text;
      })
      .join('\n----------------------------------------\n\n');

    await navigator.clipboard.writeText(allText);
    setStatusMessage('전체 문항 및 해설이 클립보드에 복사되었습니다. 한글(HWP)이나 Word 시험지에 붙여넣으세요.');
  };

  // 1. 학급 명단 및 잠금 상태 로드
  const loadClassData = async () => {
    setIsLoading(true);
    setStatusMessage(null);
    try {
      const loadedRoster = await TeacherService.getRosterAsync(classId);
      setRoster(loadedRoster);

      const loadedLocks = await TeacherService.getCornerLocksAsync(classId);
      setLocks(loadedLocks);

      // 학생별 진도 맵 취합 (LocalStorage 및 Firestore)
      const progressMap: Record<string, StudentProgress> = {};
      const reviews: typeof reviewList = [];

      for (const student of loadedRoster) {
        // 모의/로컬 학생 프로필 기반 조회
        const dummyStudentProfile: UserProfile = {
          uid: student.email,
          email: student.email,
          name: student.name,
          role: 'student',
          grade: student.grade,
          classNumber: student.classNumber,
          studentNumber: student.studentNumber,
          domain: 'simin.hs.kr',
        };
        const prog = await StorageService.getProgressAsync(dummyStudentProfile, selectedLesson);
        progressMap[student.email] = prog;

        if (prog.writingDrafts?.draft) {
          reviews.push({
            studentEmail: student.email,
            studentName: student.name,
            studentNumber: student.studentNumber,
            draft: prog.writingDrafts.draft,
            comment: prog.writingDrafts.teacherComment || '',
            approved: prog.writingDrafts.teacherApproved || false,
          });
        }
      }

      setReviewList(reviews);

      const summary = TeacherService.calculateClassProgressSummary(
        classId,
        selectedLesson,
        loadedRoster,
        progressMap,
        ALL_CORNERS.map(c => c.id)
      );
      setProgressSummary(summary);
    } catch (e: any) {
      setStatusMessage(`데이터 로드 중 오류: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadClassData();
    }
  }, [isOpen, classId, selectedLesson]);

  if (!isOpen) return null;

  // CSV 파일 업로드 핸들러
  const handleCsvFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setCsvText(content);
      const result = TeacherService.parseRosterCsv(content, classId);
      setParseResult(result);
    };
    reader.readAsText(file, 'UTF-8');
  };

  // CSV 텍스트 직접 변경 핸들러
  const handleCsvTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setCsvText(text);
    if (text.trim()) {
      const result = TeacherService.parseRosterCsv(text, classId);
      setParseResult(result);
    } else {
      setParseResult(null);
    }
  };

  // 파싱된 명단 확정 저장
  const handleSaveParsedRoster = async () => {
    if (!parseResult || parseResult.validStudents.length === 0) return;
    const count = parseResult.validStudents.length;
    setIsLoading(true);
    try {
      await TeacherService.saveRosterAsync(classId, parseResult.validStudents);
      setRoster(parseResult.validStudents);
      setParseResult(null);
      setCsvText('');
      await loadClassData();
      setStatusMessage(`성공: ${count}명의 학생 명단이 등록되었습니다.`);
    } catch (e: any) {
      setStatusMessage(`명단 저장 실패: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 예시 CSV 템플릿 다운로드
  const handleDownloadCsvTemplate = () => {
    const template = '\uFEFF학년,반,번호,이름,이메일\n1,1,1,김심인,s10101@simin.hs.kr\n1,1,2,이대구,s10102@simin.hs.kr\n1,1,3,박영어,';
    const blob = new Blob([template], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `심인고_학생명단_등록양식_${selectedGrade}학년${selectedClass}반.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // 코너 잠금 토글
  const handleToggleLock = async (cornerId: string) => {
    const currentIsLocked = TeacherService.isCornerLocked(selectedLesson, cornerId, locks);
    const updated = TeacherService.toggleCornerLock(selectedLesson, cornerId, !currentIsLocked, undefined, locks);
    setLocks(updated);
    await TeacherService.saveCornerLocksAsync(classId, updated);
  };

  // 서술형 피드백 저장
  const handleSaveReview = async (studentEmail: string, comment: string, approved: boolean) => {
    const target = roster.find(r => r.email === studentEmail);
    if (!target) return;

    const dummyStudent: UserProfile = {
      uid: target.email,
      email: target.email,
      name: target.name,
      role: 'student',
      grade: target.grade,
      classNumber: target.classNumber,
      studentNumber: target.studentNumber,
      domain: 'simin.hs.kr',
    };

    const currentProg = await StorageService.getProgressAsync(dummyStudent, selectedLesson);
    const updated = TeacherService.applyTeacherFeedback(currentProg, comment, approved);
    await StorageService.saveProgress(dummyStudent, updated);

    // 관찰 기록에 교사 승인 여부 추가 기록
    if (approved) {
      await StorageService.logObservation(
        dummyStudent,
        selectedLesson,
        '서술형 교사 승인',
        `서술형 에세이 교사 검토 및 승인 완료 (코멘트: ${comment})`
      );
    }

    setReviewList(prev =>
      prev.map(item => (item.studentEmail === studentEmail ? { ...item, comment, approved } : item))
    );
    setStatusMessage(`${target.name} 학생의 서술형 피드백이 저장되었습니다.`);
  };

  // 학급 전체 세특 관찰기록 CSV 내보내기
  const handleExportAllObservations = async (approvedOnly: boolean) => {
    setIsLoading(true);
    try {
      const allObs: ObservationExportItem[] = [];

      for (const student of roster) {
        const dummyStudent: UserProfile = {
          uid: student.email,
          email: student.email,
          name: student.name,
          role: 'student',
          grade: student.grade,
          classNumber: student.classNumber,
          studentNumber: student.studentNumber,
          domain: 'simin.hs.kr',
        };

        const prog = await StorageService.getProgressAsync(dummyStudent, selectedLesson);
        prog.observedLogs.forEach(log => {
          allObs.push({
            timestamp: log.timestamp,
            grade: student.grade,
            classNumber: student.classNumber,
            studentNumber: student.studentNumber,
            studentName: student.name,
            lessonNumber: selectedLesson,
            action: log.action,
            detail: log.detail,
            teacherApproved: prog.writingDrafts?.teacherApproved || false,
            teacherNotes: prog.writingDrafts?.teacherComment || '',
          });
        });
      }

      if (allObs.length === 0) {
        alert('내보낼 세특 관찰 기록이 아직 없습니다.');
        return;
      }

      const csvContent = TeacherService.generateObservationsCsv(allObs, approvedOnly);
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `심인고_세특관찰기록_${selectedGrade}학년${selectedClass}반_Lesson${selectedLesson}_${approvedOnly ? '승인본' : '전체'}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e: any) {
      alert(`내보내기 실패: ${e.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col overflow-hidden border border-slate-200">
        {/* 상단 모달 헤더 */}
        <div className="p-4 sm:p-6 bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black tracking-tight">교사용 학급 운영 스튜디오</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                  교사 인증됨
                </span>
              </div>
              <p className="text-xs text-indigo-200">
                심인고등학교 2022 개정 영어I · {selectedGrade}학년 {selectedClass}반 실시간 통제
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* 학년/반/단원 필터 */}
            <div className="hidden md:flex items-center gap-1.5 bg-white/10 rounded-xl p-1 text-xs border border-white/10">
              <select
                aria-label="학년 선택"
                value={selectedGrade}
                onChange={e => setSelectedGrade(Number(e.target.value))}
                className="bg-transparent text-white font-semibold px-2 py-1 rounded focus:outline-hidden"
              >
                <option value={1} className="text-slate-900">1학년</option>
                <option value={2} className="text-slate-900">2학년</option>
                <option value={3} className="text-slate-900">3학년</option>
              </select>
              <select
                aria-label="반 선택"
                value={selectedClass}
                onChange={e => setSelectedClass(Number(e.target.value))}
                className="bg-transparent text-white font-semibold px-2 py-1 rounded focus:outline-hidden"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8].map(c => (
                  <option key={c} value={c} className="text-slate-900">{c}반</option>
                ))}
              </select>
              <select
                aria-label="단원 선택"
                value={selectedLesson}
                onChange={e => setSelectedLesson(Number(e.target.value))}
                className="bg-transparent text-white font-semibold px-2 py-1 rounded focus:outline-hidden border-l border-white/20 pl-2"
              >
                {[1, 2, 3, 4, 5, 6].map(l => (
                  <option key={l} value={l} className="text-slate-900">
                    {l === 6 ? 'Special Lesson' : `Lesson ${l}`}
                  </option>
                ))}
              </select>
            </div>

            {/* AI 전역 On/Off 토글 버튼 */}
            <button
              onClick={handleToggleAi}
              title={aiEnabled ? 'AI 기능 끄기 (미성년자 안전/독자 학습 모드)' : 'AI 기능 켜기'}
              aria-label="AI 기능 전역 토글"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                aiEnabled
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-400/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-400/40 hover:bg-rose-500/30'
              }`}
            >
              <Power className="w-3.5 h-3.5" />
              <span>AI {aiEnabled ? 'ON' : 'OFF'}</span>
            </button>

            <button
              onClick={loadClassData}
              title="새로고침"
              aria-label="학급 데이터 새로고침"
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={onClose}
              title="닫기"
              aria-label="대시보드 닫기"
              className="p-2 rounded-xl bg-white/10 hover:bg-rose-600 text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* 탭 네비게이션 */}
        <div className="flex border-b border-slate-200 bg-slate-50 px-4 sm:px-6 shrink-0 overflow-x-auto">
          {[
            { key: 'dashboard', label: '반 대시보드', icon: BarChart3 },
            { key: 'roster', label: '반 명단 등록', icon: UserCheck },
            { key: 'locks', label: '수업 운영 & 코너 잠금', icon: Lock },
            { key: 'review', label: '서술형 검토 & 승인', icon: MessageSquare },
            { key: 'export', label: 'NEIS 세특 내보내기', icon: FileSpreadsheet },
            { key: 'ai_exam', label: 'AI 내신 문항 제작소', icon: Sparkles },
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as TabKey)}
                aria-label={tab.label}
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 font-bold text-xs sm:text-sm border-b-2 transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'border-indigo-600 text-indigo-700 bg-white'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 안내 알림 배너 */}
        {statusMessage && (
          <div className="bg-indigo-50 border-b border-indigo-100 px-6 py-2 text-xs font-semibold text-indigo-800 flex items-center justify-between">
            <span>{statusMessage}</span>
            <button onClick={() => setStatusMessage(null)} className="text-indigo-400 hover:text-indigo-600">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        {/* 메인 탭 컨텐츠 영역 */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50/50">
          {/* TAB 1: 반 대시보드 */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* 요약 통계 카드 4개 */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500">등록 학생 수</div>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {progressSummary?.totalStudents || 0}
                    <span className="text-xs font-semibold text-slate-400 ml-1">명</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500">완주 학생 수</div>
                  <div className="text-2xl font-black text-emerald-600 mt-1">
                    {progressSummary?.completedAllCount || 0}
                    <span className="text-xs font-semibold text-slate-400 ml-1">명</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500">학급 평균 진도율</div>
                  <div className="text-2xl font-black text-indigo-600 mt-1">
                    {progressSummary ? Math.round(progressSummary.averageProgressPercent) : 0}
                    <span className="text-xs font-semibold text-slate-400 ml-1">%</span>
                  </div>
                </div>
                <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-2xs">
                  <div className="text-xs font-bold text-slate-500">미완료(미제출) 학생</div>
                  <div className="text-2xl font-black text-rose-600 mt-1">
                    {progressSummary?.unsubmittedStudents.length || 0}
                    <span className="text-xs font-semibold text-slate-400 ml-1">명</span>
                  </div>
                </div>
              </div>

              {/* 코너별 완료율 막대 그래프 */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-600" />
                  코너별 학생 완주 현황
                </h3>
                <div className="space-y-2.5">
                  {progressSummary?.cornerStats.map(c => {
                    const cornerInfo = ALL_CORNERS.find(ac => ac.id === c.cornerId);
                    return (
                      <div key={c.cornerId} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="font-semibold text-slate-700">{cornerInfo?.name || c.cornerName}</span>
                          <span className="font-mono text-slate-500">
                            {c.completedCount}/{progressSummary.totalStudents}명 ({Math.round(c.completionRatePercent)}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${c.completionRatePercent}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* 학생별 진도 테이블 */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-slate-800 flex items-center gap-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    학생별 학습 이수 현황
                  </h3>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={unsubmittedOnly}
                      onChange={e => setUnsubmittedOnly(e.target.checked)}
                      className="rounded text-indigo-600"
                    />
                    미제출자만 보기 ({progressSummary?.unsubmittedStudents.length || 0}명)
                  </label>
                </div>

                <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                        <th className="p-2.5 text-center w-12">번호</th>
                        <th className="p-2.5 w-24">이름</th>
                        <th className="p-2.5 w-40">이메일</th>
                        <th className="p-2.5 text-center w-28">진도율</th>
                        <th className="p-2.5">완료된 코너</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {progressSummary?.students
                        .filter(s => (unsubmittedOnly ? !s.isCompletedAll : true))
                        .map(s => (
                          <tr key={s.email} className="hover:bg-slate-50/80">
                            <td className="p-2.5 text-center font-mono font-bold text-slate-600">{s.studentNumber}</td>
                            <td className="p-2.5 font-bold text-slate-900">{s.name}</td>
                            <td className="p-2.5 font-mono text-slate-500">{s.email}</td>
                            <td className="p-2.5 text-center">
                              <span
                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  s.isCompletedAll
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : s.completedCornersCount > 0
                                    ? 'bg-indigo-100 text-indigo-800'
                                    : 'bg-rose-100 text-rose-800'
                                }`}
                              >
                                {Math.round(s.progressPercent)}% ({s.completedCornersCount}/{s.totalCornersCount})
                              </span>
                            </td>
                            <td className="p-2.5">
                              <div className="flex flex-wrap gap-1">
                                {ALL_CORNERS.map(ac => {
                                  const isDone = s.completedCornerIds.includes(ac.id);
                                  return (
                                    <span
                                      key={ac.id}
                                      title={ac.name}
                                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                                        isDone
                                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                          : 'bg-slate-100 text-slate-400'
                                      }`}
                                    >
                                      {ac.id.substring(0, 4)}
                                    </span>
                                  );
                                })}
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: 반 명단 등록 */}
          {activeTab === 'roster' && (
            <div className="space-y-6">
              {/* CSV 업로드 박스 */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">학급 학생 명단 CSV 등록</h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      심인고 나이스/엑셀 명단을 CSV 파일로 업로드하거나 아래 텍스트창에 붙여넣으세요.
                    </p>
                  </div>
                  <button
                    onClick={handleDownloadCsvTemplate}
                    aria-label="CSV 표준 서식 다운로드"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
                  >
                    <Download className="w-3.5 h-3.5" />
                    표준 서식 다운로드
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* 파일 드래그앤드롭 인풋 */}
                  <div className="border-2 border-dashed border-slate-200 hover:border-indigo-400 rounded-2xl p-6 text-center space-y-3 bg-slate-50/50">
                    <Upload className="w-8 h-8 text-indigo-600 mx-auto" />
                    <div>
                      <label className="text-xs font-bold text-indigo-700 hover:underline cursor-pointer">
                        CSV 파일 선택하기
                        <input
                          type="file"
                          accept=".csv,text/csv"
                          onChange={handleCsvFileUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-[11px] text-slate-400 mt-1">UTF-8 인코딩 지원 (.csv)</p>
                    </div>
                  </div>

                  {/* 직접 붙여넣기 텍스트 에어리어 */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">또는 CSV 내용 직접 붙여넣기:</label>
                    <textarea
                      value={csvText}
                      onChange={handleCsvTextChange}
                      placeholder={`학년,반,번호,이름,이메일\n1,1,1,김심인,s10101@simin.hs.kr\n1,1,2,이대구,`}
                      rows={4}
                      className="w-full text-xs font-mono p-3 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* 파싱 결과 검증 박스 */}
                {parseResult && (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-800">검증 결과:</span>
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                          정상 {parseResult.successCount}건
                        </span>
                        {parseResult.errorCount > 0 && (
                          <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                            오류 {parseResult.errorCount}건
                          </span>
                        )}
                      </div>
                      <button
                        onClick={handleSaveParsedRoster}
                        disabled={parseResult.successCount === 0 || isLoading}
                        aria-label="명단 시스템에 등록하기"
                        className="px-4 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs disabled:opacity-50 transition-all cursor-pointer"
                      >
                        명단 등록 확정하기 ({parseResult.successCount}명)
                      </button>
                    </div>

                    {parseResult.invalidRows.length > 0 && (
                      <div className="p-3 bg-rose-50 rounded-lg text-xs space-y-1 text-rose-800 border border-rose-100">
                        <div className="font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> 오류 항목 (자동 제외됨):
                        </div>
                        <ul className="list-disc list-inside space-y-0.5 text-[11px]">
                          {parseResult.invalidRows.map((err, idx) => (
                            <li key={idx}>
                              {err.rowNumber}행: {err.reason} ({err.rawText})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* 현재 등록된 명단 목록 */}
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-bold text-slate-900">
                    현재 {selectedGrade}학년 {selectedClass}반 등록 명단 ({roster.length}명)
                  </h3>
                </div>

                {roster.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    등록된 학생 명단이 없습니다. 위에서 CSV를 업로드해 주세요.
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-xl overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700">
                          <th className="p-2.5 text-center w-12">번호</th>
                          <th className="p-2.5 w-28">이름</th>
                          <th className="p-2.5 w-48">공식 계정 이메일</th>
                          <th className="p-2.5 text-center w-20">상태</th>
                          <th className="p-2.5 text-center w-24">등록일자</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {roster.map(st => (
                          <tr key={st.email} className="hover:bg-slate-50/80">
                            <td className="p-2.5 text-center font-mono font-bold text-slate-600">{st.studentNumber}</td>
                            <td className="p-2.5 font-bold text-slate-900">{st.name}</td>
                            <td className="p-2.5 font-mono text-slate-600">{st.email}</td>
                            <td className="p-2.5 text-center">
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {st.status}
                              </span>
                            </td>
                            <td className="p-2.5 text-center text-slate-400 text-[11px]">
                              {new Date(st.createdAt).toLocaleDateString('ko-KR')}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 3: 수업 운영 & 코너 잠금 */}
          {activeTab === 'locks' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lesson {selectedLesson} 코너별 실시간 잠금(Lock) 제어
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    잠금 상태로 설정된 코너는 학생 화면에서 열람이 차단되며 자물쇠 안내 카드가 표시됩니다.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {ALL_CORNERS.map(corner => {
                    const isLocked = TeacherService.isCornerLocked(selectedLesson, corner.id, locks);
                    return (
                      <div
                        key={corner.id}
                        className={`p-4 rounded-2xl border transition-all flex items-center justify-between ${
                          isLocked
                            ? 'bg-rose-50/60 border-rose-200'
                            : 'bg-white border-slate-200 hover:border-slate-300'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            {isLocked ? (
                              <Lock className="w-4 h-4 text-rose-600" />
                            ) : (
                              <Unlock className="w-4 h-4 text-emerald-600" />
                            )}
                            <span className="font-bold text-xs sm:text-sm text-slate-800">{corner.name}</span>
                          </div>
                          <p className="text-[11px] text-slate-500">
                            {isLocked ? '학생 열람 차단됨 (잠금)' : '모든 학생 자유 열람 가능'}
                          </p>
                        </div>

                        <button
                          onClick={() => handleToggleLock(corner.id)}
                          aria-label={`${corner.name} 잠금 전환`}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                            isLocked
                              ? 'bg-rose-600 text-white hover:bg-rose-700 shadow-2xs'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {isLocked ? '잠금 해제' : '코너 잠그기'}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: 서술형 검토 & 승인 */}
          {activeTab === 'review' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Lesson {selectedLesson} 학생 서술형 과제 검토 및 피드백
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    학생이 작성한 에세이를 채점하고 교사 피드백을 전달하여 NEIS 세특 기재의 공신력을 부여합니다.
                  </p>
                </div>

                {reviewList.length === 0 ? (
                  <div className="py-12 text-center text-xs text-slate-400">
                    제출된 서술형 과제가 아직 없습니다.
                  </div>
                ) : (
                  <div className="space-y-4">
                    {reviewList.map(item => (
                      <div
                        key={item.studentEmail}
                        className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                      >
                        <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                              {item.studentNumber}번
                            </span>
                            <span className="font-bold text-sm text-slate-900">{item.studentName}</span>
                            <span className="text-xs text-slate-400 font-mono">({item.studentEmail})</span>
                          </div>
                          <div>
                            {item.approved ? (
                              <span className="flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                                <CheckCircle2 className="w-3.5 h-3.5" /> 교사 승인 완료
                              </span>
                            ) : (
                              <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                                검토 대기
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 학생 작성 글 */}
                        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-800 leading-relaxed font-serif whitespace-pre-wrap border border-slate-100">
                          {item.draft}
                        </div>

                        {/* 교사 코멘트 입력창 */}
                        <div className="flex flex-col sm:flex-row gap-2">
                          <input
                            type="text"
                            defaultValue={item.comment}
                            id={`comment-${item.studentEmail}`}
                            aria-label={`${item.studentName} 학생 피드백 입력`}
                            placeholder="교사 피드백 코멘트 (예: 논리 전개 우수, 어휘 다양성 돋보임)"
                            className="flex-1 text-xs p-2.5 rounded-xl border border-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById(
                                `comment-${item.studentEmail}`
                              ) as HTMLInputElement;
                              handleSaveReview(item.studentEmail, input?.value || '', !item.approved);
                            }}
                            aria-label="피드백 저장 및 승인 토글"
                            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                              item.approved
                                ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                            }`}
                          >
                            {item.approved ? '승인 취소' : '승인 및 피드백 저장'}
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 5: NEIS 세특 내보내기 */}
          {activeTab === 'export' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      NEIS 학교생활기록부 세부능력및특기사항(세특) 근거 데이터 일괄 추출
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      학생들의 학습 이력, 서술형 에세이, 교사 코멘트가 담긴 공식 관찰기록을 CSV 규격으로 다운로드합니다.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  <div className="p-5 rounded-2xl border border-indigo-100 bg-indigo-50/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                      <FileSpreadsheet className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">학급 전체 관찰기록 내보내기</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        코너 완료, 퀴즈 정답, 서술형 작성 등 모든 학습 활동 로그를 전수 추출합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => handleExportAllObservations(false)}
                      disabled={isLoading}
                      aria-label="전체 활동기록 CSV 다운로드"
                      className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      전체 활동기록 CSV 다운로드
                    </button>
                  </div>

                  <div className="p-5 rounded-2xl border border-emerald-100 bg-emerald-50/50 space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">교사 승인 완료본만 내보내기</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        교사가 직접 검토하고 승인 도장을 찍은 공식 서술형 세특 기재 근거만 필터링합니다.
                      </p>
                    </div>
                    <button
                      onClick={() => handleExportAllObservations(true)}
                      disabled={isLoading}
                      aria-label="승인본만 CSV 다운로드"
                      className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-100 transition-all cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      <Download className="w-4 h-4" />
                      승인본만 CSV 다운로드
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-600 space-y-2">
                  <div className="font-bold text-slate-800 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-600" /> NEIS 세특 기재 팁
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>추출된 CSV 파일은 Excel에서 열었을 때 한글 깨짐이 없도록 UTF-8 BOM 서식이 적용되어 있습니다.</li>
                    <li>고등학교 과목별 세특은 한글 500자(영문 1,500바이트) 이내 기재 규정을 준수해야 합니다.</li>
                    <li>학생의 관찰기록 중 '서술형 작성' 및 'Share Thoughts' 활동 내용을 조합하여 세특 문장을 손쉽게 완성할 수 있습니다.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 6: AI 내신 문항 제작소 */}
          {activeTab === 'ai_exam' && (
            <div className="space-y-6">
              <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      AI 내신 지필평가 문항 제작소
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      교과서 본문 지문을 바탕으로 고1 내신 4대 유형(어법·빈칸·순서·조건부 영작) 문항을 출제합니다.
                    </p>
                  </div>
                  {generatedExamQuestions.length > 0 && (
                    <button
                      onClick={handleCopyAllExamText}
                      aria-label="전체 시험지 복사"
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      <Copy className="w-3.5 h-3.5" />
                      <span>전체 시험지 복사</span>
                    </button>
                  )}
                </div>

                {/* 지문 및 문항 유형 설정 컨트롤 */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">단원:</span>
                      <span className="px-2.5 py-1 rounded-lg bg-indigo-100 text-indigo-800 font-bold text-xs">
                        {selectedLesson === 6 ? 'Special Lesson' : `Lesson ${selectedLesson}`}
                      </span>
                      <button
                        onClick={handleFetchPassageFromLesson}
                        disabled={isGeneratingExam}
                        aria-label="교과서 본문 불러오기"
                        className="px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 font-bold text-xs transition-colors cursor-pointer disabled:opacity-50"
                      >
                        본문 지문 자동 로드
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-700">문항 유형:</span>
                      <select
                        aria-label="출제 문항 유형"
                        value={examQuestionType}
                        onChange={e => setExamQuestionType(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-semibold text-slate-800 focus:outline-hidden"
                      >
                        <option value="all">전체 4개 유형 일괄 세트</option>
                        <option value="grammar_error">어법상 어색한 것 (객관식)</option>
                        <option value="blank_inference">빈칸 추론 (객관식)</option>
                        <option value="sentence_order">문장/문단 순서 배열 (객관식)</option>
                        <option value="conditional_writing">조건부 서술형 영작 (주관식)</option>
                      </select>
                    </div>
                  </div>

                  {/* 지문 입력 텍스트에어리어 */}
                  <div>
                    <label htmlFor="exam-passage-input" className="block text-xs font-semibold text-slate-600 mb-1">
                      출제 대상 본문 지문 (직접 편집 가능):
                    </label>
                    <textarea
                      id="exam-passage-input"
                      rows={5}
                      value={examPassage}
                      onChange={e => setExamPassage(e.target.value)}
                      placeholder="단원 본문 지문을 불러오거나 출제할 영어 지문을 붙여넣으세요..."
                      className="w-full p-3 rounded-lg border border-slate-300 bg-white text-xs font-serif leading-relaxed focus:outline-hidden focus:border-indigo-500"
                    />
                  </div>

                  {/* 출제 버튼 */}
                  <div className="flex justify-end">
                    <button
                      onClick={handleGenerateExamQuestions}
                      disabled={isGeneratingExam || !examPassage.trim()}
                      aria-label="내신 문항 생성하기"
                      className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs shadow-md shadow-indigo-100 transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className={`w-4 h-4 ${isGeneratingExam ? 'animate-spin' : ''}`} />
                      <span>{isGeneratingExam ? 'AI 출제 중...' : '내신 문항 생성하기'}</span>
                    </button>
                  </div>
                </div>

                {/* 생성된 문항 카드 리스트 */}
                {generatedExamQuestions.length > 0 && (
                  <div className="space-y-4 pt-2">
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>총 {generatedExamQuestions.length}개 문항 생성됨</span>
                      <span className="text-[11px]">개별 문항의 복사 버튼을 눌러 시험지(HWP/Word)에 붙여넣을 수 있습니다.</span>
                    </div>

                    {generatedExamQuestions.map((q, idx) => {
                      const isAnswerOpen = showAnswerMap[q.id];
                      const isCopied = copiedQuestionId === q.id;

                      return (
                        <div
                          key={q.id || idx}
                          className="p-4 rounded-xl border border-slate-200 bg-white space-y-3 shadow-2xs"
                        >
                          {/* 문항 헤더 */}
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-full bg-indigo-600 text-white font-black text-xs flex items-center justify-center">
                                {idx + 1}
                              </span>
                              <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                                {q.typeKo}
                              </span>
                            </div>

                            <button
                              onClick={() => handleCopyQuestionText(q)}
                              aria-label={`문항 ${idx + 1} 클립보드 복사`}
                              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border ${
                                isCopied
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-300'
                                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                              }`}
                            >
                              {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                              <span>{isCopied ? '복사됨!' : '문항 복사'}</span>
                            </button>
                          </div>

                          {/* 발문 */}
                          <p className="font-bold text-xs sm:text-sm text-slate-900 leading-snug">
                            {idx + 1}. {q.questionText}
                          </p>

                          {/* 지문 박스 */}
                          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs font-serif leading-relaxed text-slate-800 whitespace-pre-wrap">
                            {q.passageText}
                          </div>

                          {/* 객관식 보기 (options) */}
                          {q.options && q.options.length > 0 && (
                            <div className="space-y-1.5 pl-1">
                              {q.options.map((choice: string, cIdx: number) => (
                                <div key={cIdx} className="flex items-start gap-2 text-xs text-slate-800">
                                  <span className="font-bold text-indigo-600 shrink-0">
                                    {['①', '②', '③', '④', '⑤'][cIdx] || `${cIdx + 1}.`}
                                  </span>
                                  <span>{choice}</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* 서술형 채점 기준 (scoringCriteria) */}
                          {q.scoringCriteria && q.scoringCriteria.length > 0 && (
                            <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200 space-y-1 text-xs">
                              <span className="font-bold text-amber-900 block">[채점 기준]</span>
                              <ul className="list-disc list-inside space-y-0.5 text-slate-700">
                                {q.scoringCriteria.map((crit: { criterion: string; points: number }, cdIdx: number) => (
                                  <li key={cdIdx}>
                                    {crit.criterion} ({crit.points}점)
                                  </li>
                                ))}
                              </ul>
                            </div>
                          )}

                          {/* 정답 및 해설 아코디언 */}
                          <div className="pt-2 border-t border-slate-100">
                            <button
                              onClick={() =>
                                setShowAnswerMap(prev => ({ ...prev, [q.id]: !prev[q.id] }))
                              }
                              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
                            >
                              <span>{isAnswerOpen ? '▼ 정답 및 해설 접기' : '▶ 정답 및 해설 열람'}</span>
                            </button>

                            {isAnswerOpen && (
                              <div className="mt-2 p-3 bg-slate-50 rounded-lg border border-slate-200 text-xs space-y-1.5 animate-in fade-in duration-150">
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-emerald-700">정답/모범답안:</span>
                                  <span className="font-semibold text-slate-900">{q.modelAnswer || q.correctAnswer}</span>
                                </div>
                                <div className="text-slate-600 leading-relaxed">
                                  <span className="font-bold text-slate-700">해설/오답분석: </span>
                                  {q.explanation}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
