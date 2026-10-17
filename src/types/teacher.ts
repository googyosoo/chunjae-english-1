/**
 * 심인고등학교 AI 교과서 교사 전용 데이터 타입 및 스키마 인터페이스
 * (Phase 3: 반 명단 관리, 학급 진도 대시보드, 수업 통제 잠금, 서술형 채점, 세특 내보내기)
 */

export interface StudentRosterItem {
  email: string; // e.g. "s10115@simin.hs.kr"
  name: string;
  grade: number; // 1 ~ 3
  classNumber: number; // 1 ~ 20
  studentNumber: number; // 1 ~ 60
  role: 'student';
  status: 'active' | 'inactive' | 'transferred';
  addedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface ClassroomInfo {
  classId: string; // e.g. "g1_c1"
  grade: number;
  classNumber: number;
  name: string; // e.g. "1학년 1반"
  academicYear: number;
  teacherId?: string;
  studentCount?: number;
}

export interface CornerLockState {
  lessonNumber: number;
  cornerId: string;
  isLocked: boolean;
  lockedAt?: string;
  reason?: string;
}

export interface TeacherReviewItem {
  id: string; // studentId + lessonNumber + cornerId
  studentId: string;
  studentName: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  lessonNumber: number;
  cornerId: string;
  activityTitle: string;
  studentAnswer: string;
  submittedAt: string;
  teacherComment?: string;
  teacherApproved: boolean;
  approvedAt?: string;
}

export interface StudentProgressRow {
  studentId: string;
  name: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  email: string;
  lessonNumber: number;
  completedCornersCount: number;
  totalCornersCount: number;
  progressPercent: number;
  completedCornerIds: string[];
  lastActiveAt?: string;
  isCompletedAll: boolean;
}

export interface CornerStat {
  cornerId: string;
  cornerName: string;
  completedCount: number;
  completionRatePercent: number;
}

export interface ClassProgressSummary {
  classId: string;
  lessonNumber: number;
  totalStudents: number;
  completedAllCount: number;
  averageProgressPercent: number;
  cornerStats: CornerStat[];
  unsubmittedStudents: {
    studentNumber: number;
    name: number | string;
    email: string;
    missingCorners: string[];
  }[];
  students: StudentProgressRow[];
}

export interface RosterCsvRow {
  grade?: string | number;
  classNumber?: string | number;
  studentNumber?: string | number;
  name?: string;
  email?: string;
}

export interface RosterCsvParseResult {
  validStudents: StudentRosterItem[];
  invalidRows: { rowNumber: number; rawText: string; reason: string }[];
  totalParsed: number;
  successCount: number;
  errorCount: number;
}

export interface ObservationExportItem {
  timestamp: string;
  grade: number;
  classNumber: number;
  studentNumber: number;
  studentName: string;
  lessonNumber: number;
  action: string;
  detail: string;
  teacherApproved: boolean;
  teacherNotes?: string;
}
