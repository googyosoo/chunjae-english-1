import { RubricItem } from '../types/lesson';

export class GeminiService {
  /**
   * [AI 사용 원칙 1 준수] 교과서 본문 한정 AI 튜터 질의
   * Vercel Serverless Function (/api/tutor) 호출 - 클라이언트에 API 키 노출 0%
   */
  static async askTextbookTutor(question: string, contextLessonText: string): Promise<string> {
    try {
      const res = await fetch('/api/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, contextLessonText }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `서버 오류 (${res.status})`);
      }

      const data = await res.json();
      return data.answer || '답변을 불러오지 못했습니다.';
    } catch (e: any) {
      console.warn('Vercel API fallback:', e.message);
      // 로컬 개발 환경 등 백엔드 미기동 시 친절한 안내
      return `[AI 튜터 안내] 질문하신 문장과 관련하여 교과서 본문 맥락을 검토 중입니다.\n(${e.message})`;
    }
  }

  /**
   * [AI 사용 원칙 4 준수] 루브릭 기반 학생 영어 작문 피드백 (대필 금지)
   * Vercel Serverless Function (/api/rubric) 호출
   */
  static async evaluateWriting(
    studentDraft: string,
    topic: string,
    rubric: RubricItem[]
  ): Promise<{ feedbackKo: string; rubricScores: { criterion: string; comment: string }[] }> {
    try {
      const res = await fetch('/api/rubric', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studentDraft, topic, rubric }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `서버 오류 (${res.status})`);
      }

      return await res.json();
    } catch (e: any) {
      console.warn('Vercel Rubric API fallback:', e.message);
      return {
        feedbackKo: `초안 작성을 잘 시작하셨습니다! (${e.message})`,
        rubricScores: rubric.map(r => ({
          criterion: r.criterion,
          comment: `${r.criterion} 기준을 점검하고 스스로 퇴고해보세요.`,
        })),
      };
    }
  }
}
