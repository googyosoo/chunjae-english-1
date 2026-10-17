/**
 * Firestore 및 LocalStorage 하이브리드 영속성 관리자 (동적 Firebase 코드 분할)
 * - 심인고등학교 Firestore 데이터베이스 실시간 동기화
 * - 학생 진도, 답안, NEIS 세특 관찰기록
 * - CSV Export 시 로그인된 학생의 실제 프로필 데이터 바인딩
 */

import { getFirebase, isFirebaseConfigured } from './firebase';
import { UserProfile } from '../types/auth';

export interface StudentProgress {
  lessonNumber: number;
  completedCorners: string[];
  quizScores: { [activityId: string]: { score: number; total: number } };
  topicAnswers: { preAnswer?: string; postAnswer?: string };
  writingDrafts: { outline?: any; draft?: string; teacherApproved?: boolean; teacherComment?: string };
  observedLogs: { timestamp: string; action: string; detail: string }[];
}

export interface SavedWord {
  word: string;
  meaning: string;
  savedAt: string;
  contextSentence?: string;
  memorized: boolean;
}

const STORAGE_KEYS = {
  PROGRESS: 'aidt_student_progress_l',
  VOCAB: 'aidt_my_vocabulary',
};

export class StorageService {
  /**
   * 학생 진도 조회 (Firestore 우선, 실패 시 LocalStorage fallback)
   */
  static async getProgressAsync(user: UserProfile | null, lessonNumber: number): Promise<StudentProgress> {
    if (user && user.uid && isFirebaseConfigured()) {
      try {
        const { db } = await getFirebase();
        const { doc, getDoc } = await import('firebase/firestore');
        const classId = `g${user.grade}_c${user.classNumber}`;
        const ref = doc(db, 'classes', classId, 'students', user.uid, 'progress', `lesson_${lessonNumber}`);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data() as StudentProgress;
          this.saveLocalProgress(data);
          return data;
        }
      } catch (e) {
        console.warn('Firestore getProgress fallback to local:', e);
      }
    }
    return this.getLocalProgress(lessonNumber);
  }

  /**
   * 동기식 로컬 진도 조회
   */
  static getProgress(lessonNumber: number): StudentProgress {
    return this.getLocalProgress(lessonNumber);
  }

  private static getLocalProgress(lessonNumber: number): StudentProgress {
    try {
      const data = localStorage.getItem(`${STORAGE_KEYS.PROGRESS}${lessonNumber}`);
      if (data) {
        return JSON.parse(data);
      }
    } catch {}
    return {
      lessonNumber,
      completedCorners: [],
      quizScores: {},
      topicAnswers: {},
      writingDrafts: {},
      observedLogs: [],
    };
  }

  /**
   * 진도 저장 (Firestore 및 LocalStorage 동시 반영)
   */
  static async saveProgress(
    userOrProgress: UserProfile | null | StudentProgress,
    maybeProgress?: StudentProgress
  ): Promise<void> {
    let user: UserProfile | null = null;
    let progress: StudentProgress;

    if (maybeProgress) {
      user = userOrProgress as UserProfile | null;
      progress = maybeProgress;
    } else {
      progress = userOrProgress as StudentProgress;
    }

    this.saveLocalProgress(progress);

    if (user && user.uid && isFirebaseConfigured()) {
      try {
        const { db } = await getFirebase();
        const { doc, setDoc } = await import('firebase/firestore');
        const classId = `g${user.grade}_c${user.classNumber}`;
        const ref = doc(db, 'classes', classId, 'students', user.uid, 'progress', `lesson_${progress.lessonNumber}`);
        await setDoc(ref, progress, { merge: true });
      } catch (e) {
        console.warn('Firestore saveProgress fallback:', e);
      }
    }
  }

  private static saveLocalProgress(progress: StudentProgress): void {
    localStorage.setItem(`${STORAGE_KEYS.PROGRESS}${progress.lessonNumber}`, JSON.stringify(progress));
  }

  /**
   * 코너 완료 체크
   */
  static async markCornerComplete(
    userOrLesson: UserProfile | null | number,
    lessonOrCorner: number | string,
    maybeCornerId?: string
  ): Promise<void> {
    let user: UserProfile | null = null;
    let lessonNumber = 1;
    let cornerId = '';

    if (typeof userOrLesson === 'number') {
      lessonNumber = userOrLesson;
      cornerId = lessonOrCorner as string;
    } else {
      user = userOrLesson;
      lessonNumber = lessonOrCorner as number;
      cornerId = maybeCornerId || '';
    }

    const progress = this.getProgress(lessonNumber);
    if (!progress.completedCorners.includes(cornerId)) {
      progress.completedCorners.push(cornerId);
      await this.logObservation(user, lessonNumber, '코너 완료', `${cornerId} 코너 학습 완료`);
      await this.saveProgress(user, progress);
    }
  }

  /**
   * NEIS 세특 관찰 기록 로깅
   */
  static async logObservation(
    user: UserProfile | null,
    lessonNumber: number,
    action: string,
    detail: string
  ): Promise<void> {
    const timestamp = new Date().toISOString();
    const progress = this.getProgress(lessonNumber);
    progress.observedLogs.push({ timestamp, action, detail });
    this.saveLocalProgress(progress);

    if (user && user.uid && isFirebaseConfigured()) {
      try {
        const { db } = await getFirebase();
        const { collection, addDoc } = await import('firebase/firestore');
        const classId = `g${user.grade}_c${user.classNumber}`;
        const ref = collection(db, 'classes', classId, 'students', user.uid, 'observations');
        await addDoc(ref, {
          lessonNumber,
          action,
          detail,
          timestamp,
          studentName: user.name,
          studentNumber: user.studentNumber,
          teacherApproved: false,
        });
      } catch (e) {
        console.warn('Firestore logObservation fallback:', e);
      }
    }
  }

  /**
   * 단어장 조회
   */
  static getVocabulary(): SavedWord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOCAB);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }

  /**
   * 단어 저장
   */
  static saveWord(word: string, meaning: string, contextSentence?: string): void {
    const words = this.getVocabulary();
    if (!words.some(w => w.word.toLowerCase() === word.toLowerCase())) {
      words.push({
        word,
        meaning,
        savedAt: new Date().toISOString(),
        contextSentence,
        memorized: false,
      });
      localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(words));
    }
  }

  /**
   * 단어 암기 여부 토글
   */
  static toggleMemorized(word: string): void {
    const words = this.getVocabulary();
    const target = words.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (target) {
      target.memorized = !target.memorized;
      localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(words));
    }
  }

  /**
   * 단어 삭제
   */
  static removeWord(word: string): void {
    const words = this.getVocabulary().filter(w => w.word.toLowerCase() !== word.toLowerCase());
    localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(words));
  }

  /**
   * NEIS 세특 관찰 기록 CSV Export
   */
  static exportObservationsCSV(user: UserProfile | null, lessonNumber: number): void {
    const progress = this.getProgress(lessonNumber);
    const logs = progress.observedLogs;

    const studentName = user?.name || '심인고학생';
    const studentNumber = user?.studentNumber || 1;
    const grade = user?.grade || 1;
    const classNumber = user?.classNumber || 1;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += '일시,학년,반,번호,이름,활동유형,관찰내용(NEIS 참고용)\n';

    logs.forEach(log => {
      const dateStr = new Date(log.timestamp).toLocaleString('ko-KR');
      const safeAction = `"${log.action.replace(/"/g, '""')}"`;
      const safeDetail = `"${log.detail.replace(/"/g, '""')}"`;
      csvContent += `${dateStr},${grade},${classNumber},${studentNumber},${studentName},${safeAction},${safeDetail}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `심인고_세특관찰기록_${grade}학년${classNumber}반_${studentNumber}번_${studentName}_Lesson${lessonNumber}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}
