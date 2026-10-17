/**
 * Firestore 및 LocalStorage 하이브리드 영속성 관리자
 * - 심인고등학교 Firestore 데이터베이스 실시간 동기화
 * - 학생 진도, 답안, NEIS 세특 관찰기록
 * - CSV Export 시 로그인된 학생의 실제 프로필 데이터 바인딩 (하드코딩 제거)
 */

import { doc, getDoc, setDoc, updateDoc, collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from './firebase';
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
    if (user && user.uid) {
      try {
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

    if (user && user.uid) {
      try {
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
   * 코너 완료 체크 (user는 옵셔널)
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
   * 관찰 기록(세특 근거) 누적 (user는 옵셔널)
   */
  static async logObservation(
    userOrLesson: UserProfile | null | number,
    lessonOrAction: number | string,
    actionOrDetail?: string,
    maybeDetail?: string
  ): Promise<void> {
    let user: UserProfile | null = null;
    let lessonNumber = 1;
    let action = '';
    let detail = '';

    if (typeof userOrLesson === 'number') {
      lessonNumber = userOrLesson;
      action = lessonOrAction as string;
      detail = actionOrDetail || '';
    } else {
      user = userOrLesson;
      lessonNumber = lessonOrAction as number;
      action = actionOrDetail || '';
      detail = maybeDetail || '';
    }

    const progress = this.getProgress(lessonNumber);
    const logItem = {
      timestamp: new Date().toISOString(),
      action,
      detail,
    };
    progress.observedLogs.push(logItem);
    await this.saveProgress(user, progress);
  }

  /**
   * 내 단어장 저장
   */
  static saveWord(word: string, meaning: string, contextSentence?: string): void {
    const list = this.getSavedWords();
    const existing = list.find(w => w.word.toLowerCase() === word.toLowerCase());
    if (!existing) {
      list.unshift({
        word,
        meaning,
        savedAt: new Date().toISOString(),
        contextSentence,
        memorized: false,
      });
      localStorage.setItem(STORAGE_KEYS.VOCAB, JSON.stringify(list));
    }
  }

  static getSavedWords(): SavedWord[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.VOCAB);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * NEIS 세특용 관찰 기록 CSV Export
   * [지시사항 5 반영]: '홍길동/10101' 하드코딩 완전 제거!
   * 로그인된 사용자의 실제 학번, 이름, 반, 학년을 동적 바인딩.
   */
  static exportNeisObservationsToCSV(user: UserProfile | null, lessonNumber: number): string {
    const progress = this.getProgress(lessonNumber);
    const studentName = user?.name || '심인고 학생';
    // 동적 학번 생성 (예: 1학년 3반 15번 -> 10315)
    const studentIdNumber = user 
      ? `${user.grade}${user.classNumber.toString().padStart(2, '0')}${user.studentNumber.toString().padStart(2, '0')}`
      : '10101';

    const headers = ['일시', '학번', '이름', '학교', '단원', '활동구분', '세부관찰내용(NEIS 세특 근거)'];
    const rows = progress.observedLogs.map(log => [
      log.timestamp.split('T')[0],
      studentIdNumber,
      `"${studentName}"`,
      '"심인고등학교"',
      `"Lesson ${lessonNumber}"`,
      `"${log.action.replace(/"/g, '""')}"`,
      `"${log.detail.replace(/"/g, '""')}"`,
    ]);

    return '\uFEFF' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  }
}
