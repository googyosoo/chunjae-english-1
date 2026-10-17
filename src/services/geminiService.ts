import { RubricItem } from '../types/lesson';
import { AuthService } from './authService';

export class GeminiService {
  /**
   * [AI 사용 원칙 1 준수] 교과서 본문 한정 AI 튜터 질의
   * Vercel Serverless Function (/api/tutor) 호출 - 클라이언트에서 교과서 컨텍스트 및 API 키 전송 금지
   */
  static async askTextbookTutor(question: string, lessonId: string = 'lesson-01'): Promise<string> {
    const token = await AuthService.getIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/tutor', {
      method: 'POST',
      headers,
      body: JSON.stringify({ question, lessonId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `AI 튜터 서비스 오류 (${res.status})`);
    }

    const data = await res.json();
    return data.answer || '답변을 불러오지 못했습니다.';
  }

  /**
   * [AI 사용 원칙 4 준수] 루브릭 기반 학생 영어 작문 피드백 (대필 금지)
   * Vercel Serverless Function (/api/rubric) 호출 - AI 실패 시 가짜 피드백 대신 에러 발생
   */
  static async evaluateWriting(
    studentDraft: string,
    topic: string,
    rubric: RubricItem[],
    lessonId: string = 'lesson-01'
  ): Promise<{ feedbackKo: string; rubricScores: { criterion: string; comment: string }[] }> {
    const token = await AuthService.getIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch('/api/rubric', {
      method: 'POST',
      headers,
      body: JSON.stringify({ studentDraft, topic, rubric, lessonId }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `AI 채점 서비스 오류 (${res.status})`);
    }

    return await res.json();
  }
}
