/**
 * 심인고등학교 영어I AI 디지털 교과서 AI 기능 규격 및 타입 정의 (Phase 4)
 * - AI 튜터, 작문 평가, 대화 롤플레이, 문법 변형 문항, 교사용 내신형 문항
 */

export type AiProviderType = 'gemini' | 'openai' | 'mock';

export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
}

export interface RoleplayTurnResponse {
  replyEn: string;
  replyKo: string;
  pronunciationTip?: string;
  grammarTip?: string;
  suggestedResponses?: string[];
  isCompleted?: boolean;
}

export interface GrammarVariantQuestion {
  id: string;
  type: 'choice' | 'short_answer';
  difficulty: 'basic' | 'intermediate' | 'advanced';
  question: string;
  passageSnippet: string;
  options?: string[];
  correctAnswer: string | number;
  explanation: string;
  targetGrammar: string;
}

export interface TeacherExamQuestion {
  id: string;
  type: 'grammar_error' | 'blank_inference' | 'sentence_order' | 'subjective_writing';
  typeKo: string;
  questionText: string;
  passageText: string;
  options?: string[];
  correctAnswer: string;
  modelAnswer?: string;
  scoringCriteria?: { criterion: string; points: number }[];
  explanation: string;
}

export interface WritingRubricFeedback {
  feedbackKo: string;
  rubricScores: {
    criterion: string;
    comment: string;
    scoreLevel?: '우수' | '보통' | '노력요함';
  }[];
  grammarCorrections?: {
    original: string;
    suggested: string;
    reason: string;
  }[];
}
