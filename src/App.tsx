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

import { LessonDataSchema } from './schemas/lessonSchema';
import { LessonSelectHub, LessonSummaryInfo } from './components/layout/LessonSelectHub';
import { WorkTogetherView } from './components/corners/WorkTogetherView';
import { TeacherDashboardModal } from './components/teacher/TeacherDashboardModal';
import { TeacherService } from './services/teacherService';
import { CornerLockState } from './types/teacher';
import { Lock } from 'lucide-react';

const getInitialLessonId = (): string => {
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams(window.location.search);
    const l = params.get('lesson');
    if (l === 'special' || l === 'special-lesson' || l === '06' || l === '6') return 'special-lesson';
    if (l === '05' || l === 'lesson-05' || l === '5') return 'lesson-05';
    if (l === '04' || l === 'lesson-04' || l === '4') return 'lesson-04';
    if (l === '03' || l === 'lesson-03' || l === '3') return 'lesson-03';
    if (l === '02' || l === 'lesson-02' || l === '2') return 'lesson-02';
    if (l === '01' || l === 'lesson-01' || l === '1') return 'lesson-01';
  }
  return 'lesson-01';
};

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authChecked, setAuthChecked] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const [selectedLessonId, setSelectedLessonId] = useState<string>(getInitialLessonId());
  const [isHubOpen, setIsHubOpen] = useState<boolean>(false);

  const [lessonData, setLessonData] = useState<LessonData | null>(null);
  const [isLessonLoading, setIsLessonLoading] = useState<boolean>(false);
  const [lessonLoadError, setLessonLoadError] = useState<string | null>(null);

  const [currentMode, setCurrentMode] = useState<'student' | 'teacher'>('student');
  const [activeCornerId, setActiveCornerId] = useState<CornerId>('introduction');
  const [selectedSentence, setSelectedSentence] = useState<SentenceItem | null>(null);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [showTeacherAnswers, setShowTeacherAnswers] = useState<boolean>(false);
  const [completedCorners, setCompletedCorners] = useState<string[]>([]);
  const [isTeacherDashboardOpen, setIsTeacherDashboardOpen] = useState<boolean>(false);
  const [cornerLocks, setCornerLocks] = useState<CornerLockState[]>([]);

  // 브라우저 뒤로가기/앞으로가기 시 URL의 ?lesson= 파라미터 동기화
  useEffect(() => {
    const handlePopState = () => {
      setSelectedLessonId(getInitialLessonId());
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // 1. Firebase 실시간 세션 구독 (onAuthStateChanged)
  useEffect(() => {
    // E2E 테스트/개발 환경: __E2E_USER__ 주입 확인 (프로덕션 빌드 시 조건문 DCE 제거됨)
    if (import.meta.env.DEV || import.meta.env.MODE === 'test') {
      if (typeof window !== 'undefined' && (window as any).__E2E_USER__) {
        setUser((window as any).__E2E_USER__);
        setAuthChecked(true);
        return;
      }
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

  // 2. 로그인된 사용자에게 선택된 단원의 교과서 데이터 비동기 Fetch (/api/lesson?id=lesson-XX)
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

        const res = await fetch(`/api/lesson?id=${selectedLessonId}`, { headers });
        if (!res.ok) {
          throw new Error(`교과서 로드 실패 (${res.status})`);
        }
        const rawJson = await res.json();
        
        // Zod 스키마 런타임 데이터 검증
        const validated = LessonDataSchema.safeParse(rawJson);
        if (!validated.success) {
          console.error('교과서 데이터 Zod 검증 오류:', validated.error.issues);
          throw new Error('교과서 데이터 규격(Zod Schema) 검증에 실패했습니다.');
        }

        setLessonData(validated.data);
      } catch (e: any) {
        setLessonLoadError(e.message || '교과서 데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLessonLoading(false);
      }
    };

    fetchLesson();
  }, [user, selectedLessonId]);

  // 3. 진도 데이터 로드 및 역할/잠금 분기
  const currentLessonNum = lessonData?.lessonNumber || (selectedLessonId === 'special-lesson' ? 6 : selectedLessonId === 'lesson-05' ? 5 : selectedLessonId === 'lesson-04' ? 4 : selectedLessonId === 'lesson-03' ? 3 : selectedLessonId === 'lesson-02' ? 2 : 1);
  useEffect(() => {
    if (user) {
      StorageService.getProgressAsync(user, currentLessonNum).then((progress) => {
        setCompletedCorners(progress.completedCorners);
      });

      const classId = `g${user.grade || 1}_c${user.classNumber || 1}`;
      TeacherService.getCornerLocksAsync(classId).then((locks) => {
        setCornerLocks(locks);
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
  }, [user, currentLessonNum]);

  const handleCornerComplete = async (cornerId: CornerId) => {
    await StorageService.markCornerComplete(user, currentLessonNum, cornerId);
    const progress = StorageService.getProgress(currentLessonNum);
    setCompletedCorners(progress.completedCorners);
  };

  const handleSelectLesson = (lessonId: string, lessonNumber: number) => {
    setSelectedLessonId(lessonId);
    setIsHubOpen(false);
    setActiveCornerId('introduction');
    const numStr = lessonNumber < 10 ? `0${lessonNumber}` : `${lessonNumber}`;
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href);
      url.searchParams.set('lesson', numStr);
      window.history.pushState(null, '', url.toString());
    }
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setUser(null);
    setLessonData(null);
  };

  // Firebase 설정 미비 시 오류 화면 (가짜 더미값 사용 금지, E2E 테스트 모드 제외)
  const isE2EMode = (import.meta.env.DEV || import.meta.env.MODE === 'test') && typeof window !== 'undefined' && (window as any).__E2E_USER__;
  if (!isFirebaseConfigured() && authChecked && !isE2EMode) {
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

  const LESSONS_METADATA: LessonSummaryInfo[] = [
    {
      id: 'lesson-01',
      lessonNumber: 1,
      title: 'Digital Well-being',
      topic: 'Social Media and Digital Detox',
      pageRange: 'pp. 8-31',
      description: '디지털 기기와 SNS 과몰입을 점검하고, JOMO(Joy of Missing Out)를 실천하며 건강한 디지털 시민의식을 형성합니다.',
      completedCornersCount: selectedLessonId === 'lesson-01' ? completedCorners.length : 0,
      totalCornersCount: 8,
    },
    {
      id: 'lesson-02',
      lessonNumber: 2,
      title: 'Spark Your Creativity',
      topic: 'Ideas for the Common Good',
      pageRange: 'pp. 32-55',
      description: '공공의 이익을 위한 일상 속 기발한 예술과 디자인 아이디어를 탐구하고, Su Blackwell의 페이퍼 아트 및 3인 모둠 협동 작품을 완성합니다.',
      completedCornersCount: selectedLessonId === 'lesson-02' ? completedCorners.length : 0,
      totalCornersCount: 8,
    },
    {
      id: 'lesson-03',
      lessonNumber: 3,
      title: 'Healthy Plate, Healthy Planet',
      topic: 'Environment & Food',
      pageRange: 'pp. 56-79',
      description: '지속 가능한 식문화를 위한 미래 식량(배양육, 곤충, 3D 프린팅 푸드, 조류)과 푸드 업사이클링을 탐구하고 친환경 급식 제안서를 작성합니다.',
      completedCornersCount: selectedLessonId === 'lesson-03' ? completedCorners.length : 0,
      totalCornersCount: 8,
    },
    {
      id: 'lesson-04',
      lessonNumber: 4,
      title: 'Amazing Animals Around Us',
      topic: 'Nature & Ecology',
      pageRange: 'pp. 80-103',
      description: '생태계 속 동물들의 경이로운 이동과 생존 방식을 인터뷰 형식으로 탐구하고, 멸종 위기 동물 보존을 위한 인포그래픽 모둠 프로젝트를 진행합니다.',
      completedCornersCount: selectedLessonId === 'lesson-04' ? completedCorners.length : 0,
      totalCornersCount: 8,
    },
    {
      id: 'lesson-05',
      lessonNumber: 5,
      title: 'Ancient Worlds of Imagination',
      topic: 'Culture & Myths',
      pageRange: 'pp. 104-127',
      description: '고대 그리스 신화 속 바우키스와 필레몬(Baucis and Philemon)의 환대와 미덕을 살펴보고, 신화 유래 표현 탐구 및 이야기의 대안적 결말 쓰기를 수행합니다.',
      completedCornersCount: selectedLessonId === 'lesson-05' ? completedCorners.length : 0,
      totalCornersCount: 8,
    },
    {
      id: 'special-lesson',
      lessonNumber: 6,
      title: 'Music and Everything Else',
      topic: 'Music Math Ecology',
      pageRange: 'pp. 128-139',
      description: '음악과 수학(원주율과 Lullapi 작곡), 음악과 생태(죠스 영화음악과 상어 인식 실험)를 융합 탐구하고, 음악을 활용한 정보 전달 영상 제작 모둠 프로젝트를 수행합니다.',
      completedCornersCount: selectedLessonId === 'special-lesson' ? completedCorners.length : 0,
      totalCornersCount: 4,
    },
  ];

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans overflow-x-hidden ${currentMode === 'teacher' ? 'projector-mode' : ''}`}>
      {/* Login Guard Modal: 비로그인 상태일 때 전면 차단 */}
      {!user && <LoginModal onLoginSuccess={setUser} />}

      {/* Top Navbar */}
      <Navbar
        user={user}
        currentMode={currentMode}
        lessonNumber={currentLessonNum}
        lessonTitle={lessonData?.title}
        onModeChange={(m) => {
          setCurrentMode(m);
          setShowTeacherAnswers(m === 'teacher');
        }}
        onOpenVocab={() => setIsVocabOpen(true)}
        onSelectLessonList={() => setIsHubOpen(true)}
        onOpenTeacherDashboard={() => setIsTeacherDashboardOpen(true)}
        onLogout={handleLogout}
      />

      {/* Teacher Projector Controls Toolbar (교사 전용) */}
      {currentMode === 'teacher' && user?.role === 'teacher' && (
        <ProjectorToolbar
          showAnswers={showTeacherAnswers}
          onToggleShowAnswers={() => setShowTeacherAnswers(!showTeacherAnswers)}
          lessonNumber={currentLessonNum}
          user={user}
        />
      )}

      {/* 단원 선택 대시보드 허브 모달/화면 */}
      {isHubOpen ? (
        <main className="flex-1 max-w-7xl mx-auto w-full">
          <LessonSelectHub
            lessons={LESSONS_METADATA}
            onSelectLesson={handleSelectLesson}
          />
        </main>
      ) : (
        <>
          {/* Corner Navigation Tabs */}
          <CornerTabs
            activeCornerId={activeCornerId}
            onSelectCorner={setActiveCornerId}
            completedCorners={completedCorners}
            corners={lessonData?.corners}
            lockedCornerIds={cornerLocks.filter(l => l.lessonNumber === currentLessonNum && l.isLocked).map(l => l.cornerId)}
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

            {/* 코너 잠금 안내 화면 (학생 계정 및 현재 코너가 잠겨있을 때) */}
            {user && user.role === 'student' && TeacherService.isCornerLocked(currentLessonNum, activeCornerId, cornerLocks) ? (
              <div className="py-20 text-center max-w-md mx-auto space-y-4 bg-white rounded-3xl p-8 border border-rose-200 shadow-xl">
                <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
                  <Lock className="w-8 h-8" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-base font-bold text-slate-900">선생님이 현재 이 코너를 잠가두었습니다</h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    수업 진도 및 공정한 평가를 위해 교사가 일시적으로 접근을 통제하고 있습니다. 담당 선생님의 수업 지시에 따라주세요.
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl text-[11px] font-mono text-slate-500">
                  Lesson {currentLessonNum} · {activeCornerId} (Lock Enforced)
                </div>
              </div>
            ) : (
              /* 교과서 데이터 렌더링 (로그인 및 잠금 해제 상태일 때) */
              user && lessonData && !isLessonLoading && (
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
                    lessonData.lessonNumber === 6 ? (
                      <ReadView
                        lesson={{
                          ...lessonData,
                          corners: [
                            {
                              ...lessonData.corners.find(c => c.id === 'after_read')!,
                              id: 'read' as any,
                            }
                          ]
                        }}
                        showTeacherAnswers={showTeacherAnswers}
                        onSelectSentence={setSelectedSentence}
                      />
                    ) : (
                      <AfterReadView lesson={lessonData} showTeacherAnswers={showTeacherAnswers} user={user} />
                    )
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
                  {activeCornerId === 'work_together' && (
                    <WorkTogetherView
                      activityData={lessonData.corners.find(c => c.id === 'work_together')?.activities?.[0]}
                      showTeacherAnswers={showTeacherAnswers}
                      lesson={lessonData}
                      user={user}
                    />
                  )}
                </>
              )
            )}
          </main>
        </>
      )}

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

      {/* Teacher Dashboard Modal (교사용 학급 운영 스튜디오) */}
      {user && user.role === 'teacher' && (
        <TeacherDashboardModal
          isOpen={isTeacherDashboardOpen}
          onClose={() => {
            setIsTeacherDashboardOpen(false);
            // 모달 닫힐 때 최신 잠금 상태 동기화
            const classId = `g${user.grade || 1}_c${user.classNumber || 1}`;
            TeacherService.getCornerLocksAsync(classId).then(setCornerLocks);
          }}
          user={user}
          currentLessonNumber={currentLessonNum}
        />
      )}
    </div>
  );
};

export default App;

