import React, { useState, useEffect } from 'react';
import { UserProfile } from './types/auth';
import { CornerId, LessonData, SentenceItem } from './types/lesson';
import { AuthService } from './services/authService';
import { StorageService } from './services/storageService';
import { isFirebaseConfigured } from './services/firebase';

import { Navbar } from './components/layout/Navbar';
import { CornerTabs } from './components/layout/CornerTabs';
import { ProjectorToolbar } from './components/common/ProjectorToolbar';
import { SentenceModal } from './components/common/SentenceModal';
import { VocabularyDrawer } from './components/common/VocabularyDrawer';
import { LoginModal } from './components/common/LoginModal';

import { IntroView } from './components/corners/IntroView';
import { CommunicateView } from './components/corners/CommunicateView';
import { ReadView } from './components/corners/ReadView';
import { AfterReadView } from './components/corners/AfterReadView';
import { ShareThoughtsView } from './components/corners/ShareThoughtsView';
import { LanguageFocusView } from './components/corners/LanguageFocusView';
import { WritingView } from './components/corners/WritingView';
import { WrapUpView } from './components/corners/WrapUpView';
import { Loader2, AlertCircle, ShieldAlert } from 'lucide-react';

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isLessonLoading, setIsLessonLoading] = useState<boolean>(false);
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);

  const [currentMode, setCurrentMode] = useState<'student' | 'teacher'>('student');
  const [activeCornerId, setActiveCornerId] = useState<CornerId>('introduction');
  const [selectedSentence, setSelectedSentence] = useState<SentenceItem | null>(null);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [showTeacherAnswers, setShowTeacherAnswers] = useState<boolean>(false);
  const [completedCorners, setCompletedCorners] = useState<string[]>([]);

  // 1. Firebase 실시간 세션 구독 (onAuthStateChanged)
  useEffect(() => {
    // E2E 테스트 환경: window.__E2E_USER__ 가 주입된 경우 학생/교사 세션 즉시 설정
    if (typeof window !== 'undefined' && (window as any).__E2E_USER__) {
      setUser((window as any).__E2E_USER__);
      setAuthChecked(true);
      return;
    }

    if (!isFirebaseConfigured()) {
      setAuthChecked(true);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    AuthService.subscribeAuthState(
      (currentUser) => {
        setUser(currentUser);
        setAuthChecked(true);
        setAuthError(null);
      },
      (err) => {
        setAuthError(err.message);
        setAuthChecked(true);
      }
    ).then((unsub) => {
      unsubscribe = unsub;
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // 2. 로그인된 사용자에게만 교과서 데이터 비동기 Fetch (/api/lesson?id=lesson-01)
  // JS 번들에서 교과서 JSON을 완전히 분리하여 비로그인 상태의 저작권 유출 차단
  useEffect(() => {
    if (!user) {
      setLessonData(null);
      return;
    }

    const fetchLesson = async () => {
      setIsLessonLoading(true);
      setLessonLoadError(null);
      try {
        const token = await AuthService.getIdToken();
        const headers: Record<string, string> = {};
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const res = await fetch('/api/lesson?id=lesson-01', { headers });
        if (!res.ok) {
          // 로컬 dev 환경 등 서버리스 API 미기동 시 fallback fetch
          const localRes = await fetch('/content/lesson-01.json');
          if (localRes.ok) {
            const data: LessonData = await localRes.json();
            setLessonData(data);
            return;
          }
          throw new Error(`교과서 로드 실패 (${res.status})`);
        }
        const data: LessonData = await res.json();
        setLessonData(data);
      } catch (e: any) {
        setLessonLoadError(e.message || '교과서 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLessonLoading(false);
      }
    };

    fetchLesson();
  }, [user]);

  // 3. 진도 데이터 로드 및 역할 분기
  useEffect(() => {
    if (user) {
      StorageService.getProgressAsync(user, 1).then((progress) => {
        setCompletedCorners(progress.completedCorners);
      });

      if (user.role === 'teacher') {
        setCurrentMode('teacher');
        setShowTeacherAnswers(true);
      } else {
        setCurrentMode('student');
        setShowTeacherAnswers(false);
      }
    } else {
      setCurrentMode('student');
      setShowTeacherAnswers(false);
    }
  }, [user]);

  const handleCornerComplete = async (cornerId: CornerId) => {
    await StorageService.markCornerComplete(user, 1, cornerId);
    const progress = StorageService.getProgress(1);
    setCompletedCorners(progress.completedCorners);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    setLessonData(null);
  };

  // Firebase 설정 미비 시 오류 화면 (가짜 더미값 사용 금지, E2E 테스트 모드 제외)
  if (!isFirebaseConfigured() && authChecked && !(typeof window !== 'undefined' && (window as any).__E2E_USER__)) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 shadow-2xl text-center space-y-5">
          <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-xl font-black text-slate-900">심인고등학교 디지털 교과서</h1>
            <p className="text-xs text-slate-500 mt-1">Firebase 인프라 설정이 필요합니다.</p>
          </div>
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-2 text-slate-700">
            <p className="font-bold text-slate-900">시스템 관리자 안내:</p>
            <p>프로젝트 루트의 <code className="bg-slate-200 px-1 py-0.5 rounded font-mono">.env</code> 파일에 심인고등학교 Firebase 프로젝트 설정값을 등록해야 운영할 수 있습니다.</p>
            <ul className="list-disc list-inside space-y-0.5 text-slate-600 font-mono text-[11px]">
              <li>VITE_FIREBASE_API_KEY</li>
              <li>VITE_FIREBASE_PROJECT_ID</li>
              <li>VITE_FIREBASE_AUTH_DOMAIN</li>
            </ul>
          </div>
          <p className="text-[11px] text-slate-400">© 2026 심인고등학교 AI 디지털 교과서 플랫폼</p>
        </div>
      </div>
    );
  }

  // 인증 확인 대기 로딩
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
          <span className="text-xs font-semibold text-slate-600">심인고등학교 인증 세션 확인 중...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans overflow-x-hidden ${currentMode === 'teacher' ? 'projector-mode' : ''}`}>
      {/* Login Guard Modal: 비로그인 상태일 때 전면 차단 */}
      {!user && <LoginModal onLoginSuccess={setUser} />}

      {/* Top Navbar */}
      <Navbar
        user={user}
        currentMode={currentMode}
        onModeChange={(m) => {
          setCurrentMode(m);
          setShowTeacherAnswers(m === 'teacher');
        }}
        onOpenVocab={() => setIsVocabOpen(true)}
        onLogout={handleLogout}
      />

      {/* Teacher Projector Controls Toolbar (교사 전용) */}
      {currentMode === 'teacher' && user?.role === 'teacher' && (
        <ProjectorToolbar
          showAnswers={showTeacherAnswers}
          onToggleShowAnswers={() => setShowTeacherAnswers(!showTeacherAnswers)}
          lessonNumber={1}
          user={user}
        />
      )}

      {/* Corner Navigation Tabs */}
      <CornerTabs
        activeCornerId={activeCornerId}
        onSelectCorner={setActiveCornerId}
        completedCorners={completedCorners}
      />

      {/* Main Learning Canvas */}
      <main className="flex-1 p-3 sm:p-6 md:p-8 max-w-7xl mx-auto w-full overflow-x-hidden">
        {/* 교과서 데이터 로딩 인디케이터 */}
        {isLessonLoading && (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <span className="text-xs font-bold text-slate-600">인증된 교과서 데이터를 안전하게 불러오는 중입니다...</span>
          </div>
        )}

        {/* 교과서 데이터 로드 에러 */}
        {lessonLoadError && (
          <div className="p-6 bg-rose-50 rounded-2xl border border-rose-200 text-center space-y-2 max-w-lg mx-auto my-12">
            <AlertCircle className="w-8 h-8 text-rose-600 mx-auto" />
            <h3 className="text-sm font-bold text-rose-900">교과서 콘텐츠 불러오기 실패</h3>
            <p className="text-xs text-rose-700">{lessonLoadError}</p>
          </div>
        )}

        {/* 비로그인 안내 화면 (저작권 보호: 번들에 본문 없음) */}
        {!user && !isLessonLoading && (
          <div className="py-20 text-center max-w-md mx-auto space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-base font-bold text-slate-800">심인고등학교 계정 로그인이 필요합니다</h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              본 교과서는 저작권 보호 규정에 따라 학교 구글 계정(@simin.hs.kr)으로 로그인한 재학생 및 교직원만 열람할 수 있습니다.
            </p>
          </div>
        )}

        {/* 교과서 데이터 렌더링 (로그인 및 데이터 로드 완료 시) */}
        {user && lessonData && !isLessonLoading && (
          <>
            {activeCornerId === 'introduction' && (
              <IntroView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} user={user} />
            )}
            {activeCornerId === 'communicate' && (
              <CommunicateView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} />
            )}
            {activeCornerId === 'read' && (
              <ReadView
                lesson={lessonData}
                showTeacherAnswers={showTeacherAnswers}
                onSelectSentence={setSelectedSentence}
              />
            )}
            {activeCornerId === 'after_read' && (
              <AfterReadView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} user={user} />
            )}
            {activeCornerId === 'share_thoughts' && (
              <ShareThoughtsView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} user={user} />
            )}
            {activeCornerId === 'language_focus' && (
              <LanguageFocusView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} user={user} />
            )}
            {activeCornerId === 'write_present' && (
              <WritingView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} user={user} />
            )}
            {activeCornerId === 'go_global' && (
              <WrapUpView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} user={user} />
            )}
          </>
        )}
      </main>

      {/* Vocabulary Drawer */}
      <VocabularyDrawer
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
        vocabulary={lessonData?.vocabulary || []}
      />

      {/* Interactive Sentence Insight Modal */}
      {selectedSentence && (
        <SentenceModal
          sentence={selectedSentence}
          onClose={() => setSelectedSentence(null)}
          lessonContextText=""
        />
      )}
    </div>
  );
};

export default App;

