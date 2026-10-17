/**
 * 심인고등학교 AI 디지털 교과서 교사 전용 서비스 로직 (Phase 3)
 * - 반 명단 등록 (CSV 검증 및 이메일 자동 부여)
 * - 학급 진도 대시보드 및 미제출자 추적 통계
 * - 수업 운영 및 코너 잠금(Lock) 제어
 * - 서술형 과제 검토 및 피드백/승인
 * - NEIS 세특 관찰기록 CSV/Excel 변환 및 내보내기
 */

import {
  StudentRosterItem,
  CornerLockState,
  ClassProgressSummary,
  StudentProgressRow,
  CornerStat,
  RosterCsvParseResult,
  ObservationExportItem,
} from '../types/teacher';
import { StudentProgress } from './storageService';
import { getFirebase, isFirebaseConfigured } from './firebase';

const LOCAL_STORAGE_KEYS = {
  ROSTER_PREFIX: 'aidt_roster_',
  LOCKS_PREFIX: 'aidt_corner_locks_',
};

export class TeacherService {
  /**
   * 학생 이메일 생성 규칙:
   * s + 학년(1자리) + 반(2자리 포맷) + 번호(2자리 포맷)@simin.hs.kr
   * e.g. 1학년 1반 5번 -> s10105@simin.hs.kr
   */
  static generateStudentEmail(grade: number, classNumber: number, studentNumber: number): string {
    const classStr = classNumber < 10 ? `0${classNumber}` : `${classNumber}`;
    const numStr = studentNumber < 10 ? `0${studentNumber}` : `${studentNumber}`;
    return `s${grade}${classStr}${numStr}@simin.hs.kr`;
  }

  /**
   * 심인고 도메인 이메일 형식 검증
   */
  static isValidSiminEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false;
    const trimmed = email.trim().toLowerCase();
    const regex = /^[a-zA-Z0-9._%+-]+@simin\.hs\.kr$/;
    return regex.test(trimmed);
  }

  /**
   * CSV 텍스트 파싱 및 학생 명단 유효성 검사
   * 지원 헤더:
   * - 한글: 학년, 반, 번호, 이름, 이메일
   * - 영문: grade, classNumber, studentNumber, name, email
   */
  static parseRosterCsv(csvText: string, defaultClassId: string = 'g1_c1'): RosterCsvParseResult {
    const lines = csvText
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const validStudents: StudentRosterItem[] = [];
    const invalidRows: { rowNumber: number; rawText: string; reason: string }[] = [];

    if (lines.length === 0) {
      return {
        validStudents: [],
        invalidRows: [],
        totalParsed: 0,
        successCount: 0,
        errorCount: 0,
      };
    }

    // 헤더 분석
    const headerLine = lines[0];
    const rawHeaders = headerLine.split(',').map(h => h.trim().toLowerCase().replace(/['"]/g, ''));

    const colIndex = {
      grade: rawHeaders.findIndex(h => h === '학년' || h === 'grade'),
      classNumber: rawHeaders.findIndex(h => h === '반' || h === 'classnumber' || h === 'class_number' || h === 'class'),
      studentNumber: rawHeaders.findIndex(h => h === '번호' || h === 'studentnumber' || h === 'student_number' || h === 'number' || h === 'no'),
      name: rawHeaders.findIndex(h => h === '이름' || h === '성명' || h === 'name'),
      email: rawHeaders.findIndex(h => h === '이메일' || h === 'email'),
    };

    const hasHeader = colIndex.name !== -1 || colIndex.studentNumber !== -1;
    const startIndex = hasHeader ? 1 : 0;

    // 기본 학급 파싱 (e.g. "g1_c3" -> grade: 1, class: 3)
    let defGrade = 1;
    let defClass = 1;
    const match = defaultClassId.match(/g(\d+)_c(\d+)/);
    if (match) {
      defGrade = parseInt(match[1], 10);
      defClass = parseInt(match[2], 10);
    }

    const seenNumbers = new Set<number>();
    const seenEmails = new Set<string>();

    for (let i = startIndex; i < lines.length; i++) {
      const rowNumber = i + 1;
      const rawText = lines[i];
      const cols = rawText.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));

      if (cols.length === 0 || cols.every(c => c === '')) continue;

      let grade = defGrade;
      let classNumber = defClass;
      let studentNumber = 0;
      let name = '';
      let email = '';

      if (hasHeader) {
        if (colIndex.grade !== -1 && cols[colIndex.grade]) grade = parseInt(cols[colIndex.grade], 10);
        if (colIndex.classNumber !== -1 && cols[colIndex.classNumber]) classNumber = parseInt(cols[colIndex.classNumber], 10);
        if (colIndex.studentNumber !== -1 && cols[colIndex.studentNumber]) studentNumber = parseInt(cols[colIndex.studentNumber], 10);
        if (colIndex.name !== -1 && cols[colIndex.name]) name = cols[colIndex.name];
        if (colIndex.email !== -1 && cols[colIndex.email]) email = cols[colIndex.email].toLowerCase();
      } else {
        // 헤더 없는 경우 순서: 학년, 반, 번호, 이름, 이메일
        grade = cols[0] ? parseInt(cols[0], 10) : defGrade;
        classNumber = cols[1] ? parseInt(cols[1], 10) : defClass;
        studentNumber = cols[2] ? parseInt(cols[2], 10) : 0;
        name = cols[3] || '';
        email = (cols[4] || '').toLowerCase();
      }

      // 유효성 검증
      if (!name) {
        invalidRows.push({ rowNumber, rawText, reason: '학생 이름이 누락되었습니다.' });
        continue;
      }

      if (isNaN(grade) || grade < 1 || grade > 3) {
        invalidRows.push({ rowNumber, rawText, reason: `유효하지 않은 학년(${grade})입니다. 1~3학년만 허용됩니다.` });
        continue;
      }

      if (isNaN(classNumber) || classNumber < 1 || classNumber > 20) {
        invalidRows.push({ rowNumber, rawText, reason: `유효하지 않은 반(${classNumber})입니다. 1~20반만 허용됩니다.` });
        continue;
      }

      if (isNaN(studentNumber) || studentNumber < 1 || studentNumber > 60) {
        invalidRows.push({ rowNumber, rawText, reason: `유효하지 않은 번호(${studentNumber})입니다. 1~60번만 허용됩니다.` });
        continue;
      }

      // 이메일 자동 생성 또는 검증
      if (!email) {
        email = this.generateStudentEmail(grade, classNumber, studentNumber);
      } else if (!this.isValidSiminEmail(email)) {
        invalidRows.push({
          rowNumber,
          rawText,
          reason: `이메일(${email})이 심인고 공식 도메인(@simin.hs.kr) 규격과 일치하지 않습니다.`,
        });
        continue;
      }

      // 중복 체크 (학급 내 번호 및 이메일)
      if (seenNumbers.has(studentNumber)) {
        invalidRows.push({ rowNumber, rawText, reason: `학급 내 중복된 학생 번호(${studentNumber}번)가 발견되었습니다.` });
        continue;
      }
      if (seenEmails.has(email)) {
        invalidRows.push({ rowNumber, rawText, reason: `중복된 학생 이메일(${email})이 발견되었습니다.` });
        continue;
      }

      seenNumbers.add(studentNumber);
      seenEmails.add(email);

      validStudents.push({
        email,
        name,
        grade,
        classNumber,
        studentNumber,
        role: 'student',
        status: 'active',
        createdAt: new Date().toISOString(),
      });
    }

    // 번호 순 정렬
    validStudents.sort((a, b) => a.studentNumber - b.studentNumber);

    return {
      validStudents,
      invalidRows,
      totalParsed: validStudents.length + invalidRows.length,
      successCount: validStudents.length,
      errorCount: invalidRows.length,
    };
  }

  /**
   * 학급 진도 및 미제출자 통계 분석
   */
  static calculateClassProgressSummary(
    classId: string,
    lessonNumber: number,
    roster: StudentRosterItem[],
    progressMap: Record<string, StudentProgress>,
    allCorners: string[]
  ): ClassProgressSummary {
    const totalStudents = roster.length;
    if (totalStudents === 0) {
      return {
        classId,
        lessonNumber,
        totalStudents: 0,
        completedAllCount: 0,
        averageProgressPercent: 0,
        cornerStats: allCorners.map(c => ({ cornerId: c, cornerName: c, completedCount: 0, completionRatePercent: 0 })),
        unsubmittedStudents: [],
        students: [],
      };
    }

    const students: StudentProgressRow[] = [];
    const cornerCompletedCounts: Record<string, number> = {};
    allCorners.forEach(c => {
      cornerCompletedCounts[c] = 0;
    });

    let completedAllCount = 0;
    let totalProgressSum = 0;

    roster.forEach(student => {
      const studentProgress = progressMap[student.email] || {
        lessonNumber,
        completedCorners: [],
        quizScores: {},
        topicAnswers: {},
        writingDrafts: {},
        observedLogs: [],
      };

      const completed = studentProgress.completedCorners || [];
      const completedCount = completed.length;
      const totalCount = allCorners.length;
      const progressPercent = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;
      const isCompletedAll = completedCount >= totalCount && totalCount > 0;

      if (isCompletedAll) {
        completedAllCount++;
      }
      totalProgressSum += progressPercent;

      completed.forEach(cid => {
        if (cornerCompletedCounts[cid] !== undefined) {
          cornerCompletedCounts[cid]++;
        }
      });

      students.push({
        studentId: student.email,
        name: student.name,
        grade: student.grade,
        classNumber: student.classNumber,
        studentNumber: student.studentNumber,
        email: student.email,
        lessonNumber,
        completedCornersCount: completedCount,
        totalCornersCount: totalCount,
        progressPercent,
        completedCornerIds: completed,
        isCompletedAll,
      });
    });

    const averageProgressPercent = totalStudents > 0 ? totalProgressSum / totalStudents : 0;

    const cornerStats: CornerStat[] = allCorners.map(cornerId => {
      const count = cornerCompletedCounts[cornerId] || 0;
      return {
        cornerId,
        cornerName: cornerId,
        completedCount: count,
        completionRatePercent: totalStudents > 0 ? (count / totalStudents) * 100 : 0,
      };
    });

    // 미제출자 목록 (100% 미완료자)
    const unsubmittedStudents = students
      .filter(s => !s.isCompletedAll)
      .map(s => ({
        studentNumber: s.studentNumber,
        name: s.name,
        email: s.email,
        missingCorners: allCorners.filter(c => !s.completedCornerIds.includes(c)),
      }))
      .sort((a, b) => a.studentNumber - b.studentNumber);

    return {
      classId,
      lessonNumber,
      totalStudents,
      completedAllCount,
      averageProgressPercent,
      cornerStats,
      unsubmittedStudents,
      students,
    };
  }

  /**
   * 코너 잠금 여부 확인
   */
  static isCornerLocked(lessonNumber: number, cornerId: string, locks: CornerLockState[]): boolean {
    const lock = locks.find(l => l.lessonNumber === lessonNumber && l.cornerId === cornerId);
    return lock ? lock.isLocked : false;
  }

  /**
   * 코너 잠금 토글
   */
  static toggleCornerLock(
    lessonNumber: number,
    cornerId: string,
    isLocked: boolean,
    reason?: string,
    currentLocks: CornerLockState[] = []
  ): CornerLockState[] {
    const nextLocks = currentLocks.filter(l => !(l.lessonNumber === lessonNumber && l.cornerId === cornerId));
    nextLocks.push({
      lessonNumber,
      cornerId,
      isLocked,
      lockedAt: new Date().toISOString(),
      reason,
    });
    return nextLocks;
  }

  /**
   * 서술형 과제 피드백 및 승인
   */
  static applyTeacherFeedback(
    progress: StudentProgress,
    comment: string,
    approved: boolean
  ): StudentProgress {
    const writingDrafts = {
      ...(progress.writingDrafts || {}),
      teacherComment: comment,
      teacherApproved: approved,
    };

    return {
      ...progress,
      writingDrafts,
    };
  }

  /**
   * NEIS 세특 관찰 기록 CSV 문자열 생성
   */
  static generateObservationsCsv(
    observations: ObservationExportItem[],
    approvedOnly: boolean = false
  ): string {
    const filtered = approvedOnly ? observations.filter(o => o.teacherApproved) : observations;

    let csvContent = '\uFEFF'; // UTF-8 BOM
    csvContent += '일시,학년,반,번호,이름,단원,활동유형,관찰내용(NEIS 참고용),교사승인여부,교사메모\n';

    filtered.forEach(log => {
      const dateStr = new Date(log.timestamp).toLocaleString('ko-KR');
      const safeAction = `"${log.action.replace(/"/g, '""')}"`;
      const safeDetail = `"${log.detail.replace(/"/g, '""')}"`;
      const safeNotes = log.teacherNotes ? `"${log.teacherNotes.replace(/"/g, '""')}"` : '""';
      const approvedStr = log.teacherApproved ? '승인완료' : '미승인';

      csvContent += `${dateStr},${log.grade},${log.classNumber},${log.studentNumber},${log.studentName},Lesson ${log.lessonNumber},${safeAction},${safeDetail},${approvedStr},${safeNotes}\n`;
    });

    return csvContent;
  }

  /**
   * 로컬 스토리지 명단 조회
   */
  static getLocalRoster(classId: string): StudentRosterItem[] {
    try {
      const data = localStorage.getItem(`${LOCAL_STORAGE_KEYS.ROSTER_PREFIX}${classId}`);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }

  /**
   * 로컬 스토리지 명단 저장
   */
  static saveLocalRoster(classId: string, students: StudentRosterItem[]): void {
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.ROSTER_PREFIX}${classId}`, JSON.stringify(students));
  }

  /**
   * 비동기 학급 명단 조회 (Firestore 우선, fallback LocalStorage)
   */
  static async getRosterAsync(classId: string): Promise<StudentRosterItem[]> {
    if (isFirebaseConfigured()) {
      try {
        const { db } = await getFirebase();
        const { collection, getDocs } = await import('firebase/firestore');
        const rosterRef = collection(db, 'classes', classId, 'roster');
        const snap = await getDocs(rosterRef);
        if (!snap.empty) {
          const items: StudentRosterItem[] = [];
          snap.forEach(doc => {
            items.push(doc.data() as StudentRosterItem);
          });
          items.sort((a, b) => a.studentNumber - b.studentNumber);
          this.saveLocalRoster(classId, items);
          return items;
        }
      } catch (e) {
        console.warn('Firestore getRoster fallback to local:', e);
      }
    }
    return this.getLocalRoster(classId);
  }

  /**
   * 비동기 학급 명단 저장 (Firestore batch 및 LocalStorage 동시 반영)
   */
  static async saveRosterAsync(classId: string, students: StudentRosterItem[]): Promise<void> {
    this.saveLocalRoster(classId, students);

    if (isFirebaseConfigured()) {
      try {
        const { db } = await getFirebase();
        const { doc, writeBatch } = await import('firebase/firestore');
        const batch = writeBatch(db);

        students.forEach(student => {
          const docRef = doc(db, 'classes', classId, 'roster', student.email);
          batch.set(docRef, student, { merge: true });
        });

        await batch.commit();
      } catch (e) {
        console.warn('Firestore saveRoster fallback:', e);
      }
    }
  }

  /**
   * 로컬 스토리지 코너 잠금 상태 조회
   */
  static getLocalCornerLocks(classId: string): CornerLockState[] {
    try {
      const data = localStorage.getItem(`${LOCAL_STORAGE_KEYS.LOCKS_PREFIX}${classId}`);
      if (data) return JSON.parse(data);
    } catch {}
    return [];
  }

  /**
   * 로컬 스토리지 코너 잠금 상태 저장
   */
  static saveLocalCornerLocks(classId: string, locks: CornerLockState[]): void {
    localStorage.setItem(`${LOCAL_STORAGE_KEYS.LOCKS_PREFIX}${classId}`, JSON.stringify(locks));
  }

  /**
   * 비동기 코너 잠금 조회 (Firestore 우선, fallback LocalStorage)
   */
  static async getCornerLocksAsync(classId: string): Promise<CornerLockState[]> {
    if (isFirebaseConfigured()) {
      try {
        const { db } = await getFirebase();
        const { doc, getDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'classes', classId);
        const snap = await getDoc(docRef);
        if (snap.exists() && snap.data()?.cornerLocks) {
          const locks = snap.data().cornerLocks as CornerLockState[];
          this.saveLocalCornerLocks(classId, locks);
          return locks;
        }
      } catch (e) {
        console.warn('Firestore getCornerLocks fallback to local:', e);
      }
    }
    return this.getLocalCornerLocks(classId);
  }

  /**
   * 비동기 코너 잠금 저장 (Firestore 및 LocalStorage)
   */
  static async saveCornerLocksAsync(classId: string, locks: CornerLockState[]): Promise<void> {
    this.saveLocalCornerLocks(classId, locks);

    if (isFirebaseConfigured()) {
      try {
        const { db } = await getFirebase();
        const { doc, setDoc } = await import('firebase/firestore');
        const docRef = doc(db, 'classes', classId);
        await setDoc(docRef, { cornerLocks: locks }, { merge: true });
      } catch (e) {
        console.warn('Firestore saveCornerLocks fallback:', e);
      }
    }
  }
}
