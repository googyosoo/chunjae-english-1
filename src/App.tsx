import React, { useState, useEffect } from 'react';
import { UserProfile } from './types/auth';
import { CornerId, LessonData, SentenceItem } from './types/lesson';
import { AuthService } from './services/authService';
import { StorageService } from './services/storageService';
import lesson1DataRaw from '../content/lesson-01.json';

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

const lesson1Data = lesson1DataRaw as unknown as LessonData;

export const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(AuthService.getCurrentUser());
  const [currentMode, setCurrentMode] = useState<'student' | 'teacher'>('student');
  const [activeCornerId, setActiveCornerId] = useState<CornerId>('introduction');
  const [selectedSentence, setSelectedSentence] = useState<SentenceItem | null>(null);
  const [isVocabOpen, setIsVocabOpen] = useState<boolean>(false);
  const [showTeacherAnswers, setShowTeacherAnswers] = useState<boolean>(false);
  const [completedCorners, setCompletedCorners] = useState<string[]>([]);

  useEffect(() => {
    const loadData = async () => {
      const progress = await StorageService.getProgressAsync(user, 1);
      setCompletedCorners(progress.completedCorners);
    };
    loadData();

    if (user && user.role === 'teacher') {
      setCurrentMode('teacher');
      setShowTeacherAnswers(true);
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
  };

  // 본문 전체 텍스트 (AI 튜터 컨텍스트 주입용)
  const fullLessonContextText = lesson1Data.corners
    .find(c => c.id === 'read')
    ?.activities.find(a => a.activityId === 'read_interactive_viewer')
    ?.data.reading?.paragraphs.map(p =>
      `[${p.heading || p.part}]\n` + p.sentences.map(s => `${s.en} (${s.ko})`).join('\n')
    ).join('\n\n') || '';

  return (
    <div className={`min-h-screen bg-slate-100 flex flex-col font-sans overflow-x-hidden ${currentMode === 'teacher' ? 'projector-mode' : ''}`}>
      {/* Login Guard Modal */}
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

      {/* Teacher Projector Controls Toolbar (교사만 접근 가능) */}
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
        {activeCornerId === 'introduction' && (
          <IntroView lesson={lesson1Data} showTeacherAnswers={showTeacherAnswers} />
        )}
        {activeCornerId === 'communicate' && (
          <CommunicateView lesson={lesson1Data} showTeacherAnswers={showTeacherAnswers} />
        )}
        {activeCornerId === 'read' && (
          <ReadView
            lesson={lesson1Data}
            showTeacherAnswers={showTeacherAnswers}
            onSelectSentence={setSelectedSentence}
          />
        )}
        {activeCornerId === 'after_read' && (
          <AfterReadView lesson={lesson1Data} showTeacherAnswers={showTeacherAnswers} />
        )}
        {activeCornerId === 'share_thoughts' && (
          <ShareThoughtsView
            lesson={lesson1Data}
            user={user}
            showTeacherAnswers={showTeacherAnswers}
          />
        )}
        {activeCornerId === 'language_focus' && (
          <LanguageFocusView lesson={lesson1Data} showTeacherAnswers={showTeacherAnswers} />
        )}
        {activeCornerId === 'write_present' && (
          <WritingView lesson={lesson1Data} showTeacherAnswers={showTeacherAnswers} />
        )}
        {activeCornerId === 'go_global' && (
          <WrapUpView lesson={lesson1Data} showTeacherAnswers={showTeacherAnswers} />
        )}

        {/* Bottom Corner Completion Button */}
        <div className="max-w-4xl mx-auto mt-10 pt-6 border-t border-slate-200 flex justify-end">
          <button
            onClick={() => handleCornerComplete(activeCornerId)}
            aria-label="현재 코너 학습 완료 체크"
            className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-indigo-100 transition-all flex items-center gap-2"
          >
            <span>이 코너 학습 완료 체크</span>
          </button>
        </div>
      </main>

      {/* Sentence Tap Analysis Modal */}
      <SentenceModal
        sentence={selectedSentence}
        onClose={() => setSelectedSentence(null)}
        lessonContextText={fullLessonContextText}
      />

      {/* My Vocabulary Drawer */}
      <VocabularyDrawer
        isOpen={isVocabOpen}
        onClose={() => setIsVocabOpen(false)}
      />
    </div>
  );
};

export default App;
