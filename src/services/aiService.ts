/**
 * 심인고등학교 AI 디지털 교과서 종합 AI 서비스 (Phase 4)
 * - 미성년자 안전/약관 준수 AI 공급자 추상화 연동
 * - 교과서 한정 AI 튜터 질의
 * - 루브릭 기반 학생 작문 평가 (대필 원천 차단)
 * - 대화문 턴제 롤플레이 회화 코치
 * - 수준별 문법 변형 문항 생성
 * - 교사용 내신형 지필평가 문항 제작 스튜디오
 */

import { RubricItem } from '../types/lesson';
import { AuthService } from './authService';
import {
  AiChatMessage,
  RoleplayTurnResponse,
  GrammarVariantQuestion,
  TeacherExamQuestion,
  WritingRubricFeedback,
} from '../types/ai';

const AI_SWITCH_KEY = 'aidt_ai_feature_enabled';

export class AiService {
  private static _memoryAiEnabled: boolean | null = null;

  /**
   * AI 기능 활성화 여부 확인 (기본값: true)
   */
  static isAiEnabled(): boolean {
    if (this._memoryAiEnabled !== null) {
      return this._memoryAiEnabled;
    }
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        const stored = localStorage.getItem(AI_SWITCH_KEY);
        if (stored !== null) {
          return stored === 'true';
        }
      } catch {}
    }
    return true;
  }

  /**
   * AI 기능 전역 On/Off 제어 (교사/관리자용)
   */
  static setAiEnabled(enabled: boolean): void {
    this._memoryAiEnabled = enabled;
    if (typeof window !== 'undefined' && window.localStorage) {
      try {
        localStorage.setItem(AI_SWITCH_KEY, enabled ? 'true' : 'false');
      } catch {}
    }
  }

  private static assertAiEnabled(): void {
    if (!this.isAiEnabled()) {
      throw new Error('학교 정책 또는 관리자에 의해 AI 기능이 비활성화되어 있습니다.');
    }
  }

  private static async getAuthHeaders(): Promise<Record<string, string>> {
    const token = await AuthService.getIdToken();
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * 1. 교과서 본문 한정 AI 튜터 질의
   */
  static async askTutor(question: string, lessonId: string = 'lesson-01'): Promise<string> {
    this.assertAiEnabled();

    const headers = await this.getAuthHeaders();
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
   * 2. 루브릭 기반 학생 영어 작문 피드백 (대필 금지)
   */
  static async evaluateWriting(
    studentDraft: string,
    topic: string,
    rubric: RubricItem[],
    lessonId: string = 'lesson-01'
  ): Promise<WritingRubricFeedback> {
    this.assertAiEnabled();

    const headers = await this.getAuthHeaders();
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

  /**
   * 3. 대화문 턴제 롤플레이 회화 코치
   */
  static async chatRoleplay(
    dialogueContext: string,
    userMessage: string,
    history: AiChatMessage[] = []
  ): Promise<RoleplayTurnResponse> {
    this.assertAiEnabled();

    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/ai/roleplay', {
      method: 'POST',
      headers,
      body: JSON.stringify({ dialogueContext, userMessage, history }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `롤플레이 AI 서비스 오류 (${res.status})`);
    }

    return await res.json();
  }

  /**
   * 4. 수준별 문법 변형 문항 생성
   */
  static async generateGrammarVariants(
    targetGrammar: string,
    lessonId: string = 'lesson-01',
    count: number = 3
  ): Promise<GrammarVariantQuestion[]> {
    this.assertAiEnabled();

    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/ai/grammar-variants', {
      method: 'POST',
      headers,
      body: JSON.stringify({ targetGrammar, lessonId, count }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `문법 변형 생성 오류 (${res.status})`);
    }

    const data = await res.json();
    return data.questions || [];
  }

  /**
   * 5. 교사용 내신형 지필평가 문항 제작 (단일 문항)
   */
  static async generateTeacherExamQuestion(
    lessonId: string = 'lesson-01',
    cornerId: string = 'read',
    questionType: string = 'grammar_error'
  ): Promise<TeacherExamQuestion> {
    this.assertAiEnabled();

    const headers = await this.getAuthHeaders();
    const res = await fetch('/api/ai/exam-generator', {
      method: 'POST',
      headers,
      body: JSON.stringify({ lessonId, cornerId, questionType }),
    });

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.error || `내신 문항 생성 오류 (${res.status})`);
    }

    const data = await res.json();
    return data.item;
  }

  /**
   * 6. 교사용 내신형 지필평가 복수/일괄 문항 제작
   */
  static async generateTeacherExamQuestions(
    lessonId: string = 'lesson-01',
    cornerId: string = 'read',
    questionType: string = 'all'
  ): Promise<TeacherExamQuestion[]> {
    if (questionType === 'all') {
      const types = ['grammar_error', 'blank_inference', 'sentence_order', 'subjective_writing'];
      const results: TeacherExamQuestion[] = [];
      for (const t of types) {
        const item = await this.generateTeacherExamQuestion(lessonId, cornerId, t);
        results.push(item);
      }
      return results;
    } else {
      const item = await this.generateTeacherExamQuestion(lessonId, cornerId, questionType);
      return [item];
    }
  }
}
