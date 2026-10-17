import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AiService } from './aiService';

describe('AiService (Phase 4 AI Core Service Test Suite)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    AiService.setAiEnabled(true);
  });

  describe('1. Global AI Feature Switch (AI 스위치 통제)', () => {
    it('AI 스위치가 꺼져있으면 AI 호출 시 명확한 안내 에러를 던진다', async () => {
      AiService.setAiEnabled(false);

      await expect(AiService.askTutor('이 문장의 어법을 설명해주세요.', 'lesson-01')).rejects.toThrow(
        '학교 정책 또는 관리자에 의해 AI 기능이 비활성화되어 있습니다.'
      );
    });
  });

  describe('2. Textbook AI Tutor (/api/tutor)', () => {
    it('성공 시 서버 응답 텍스트를 정확히 반환한다', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ answer: '조동사 + have p.p.는 과거의 추측을 나타냅니다.' }),
      } as any);

      const answer = await AiService.askTutor('could have been 뜻이 뭐야?', 'lesson-01');
      expect(answer).toBe('조동사 + have p.p.는 과거의 추측을 나타냅니다.');
    });

    it('서버 에러 시 에러를 은폐(가짜 응답 날조)하지 않고 정직하게 예외를 발생시킨다', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'AI 모델 할당량 초과' }),
      } as any);

      await expect(AiService.askTutor('질문', 'lesson-01')).rejects.toThrow('AI 모델 할당량 초과');
    });
  });

  describe('3. Writing Rubric Evaluation (/api/rubric)', () => {
    it('루브릭 기반 작문 피드백을 수신하여 반환한다', async () => {
      const mockFeedback = {
        feedbackKo: '디지털 디톡스의 장점을 자신의 경험과 연결하여 훌륭히 서술했습니다.',
        rubricScores: [
          { criterion: '주제 적합성', comment: 'JOMO의 실천 사례가 구체적임.', scoreLevel: '우수' },
        ],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockFeedback,
      } as any);

      const result = await AiService.evaluateWriting(
        'I tried digital detox yesterday.',
        'Digital Detox',
        [{ criterion: '주제 적합성', guideline: '주제와 관련된 내용인가' }],
        'lesson-01'
      );

      expect(result.feedbackKo).toContain('디지털 디톡스');
      expect(result.rubricScores).toHaveLength(1);
    });
  });

  describe('4. Dialogue Roleplay (/api/ai/roleplay)', () => {
    it('대화문 컨텍스트 기반 턴제 응답을 반환한다', async () => {
      const mockRoleplayRes = {
        replyEn: "I totally agree with you. What else can we do to reduce screen time?",
        replyKo: "전적으로 동의해. 화면 시간을 줄이기 위해 우리가 또 무엇을 할 수 있을까?",
        pronunciationTip: "reduce의 악센트는 뒤 음절에 있습니다.",
        suggestedResponses: ["We can read paper books.", "We can go for a walk."],
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => mockRoleplayRes,
      } as any);

      const result = await AiService.chatRoleplay(
        'Dialogue 1: Talking about smartphone usage',
        'I think we spend too much time on our phones.',
        []
      );

      expect(result.replyEn).toBe(mockRoleplayRes.replyEn);
      expect(result.suggestedResponses).toHaveLength(2);
    });
  });

  describe('5. Grammar Variant Question Generator (/api/ai/grammar-variants)', () => {
    it('목표 문법에 대한 고1 수준 3단계 변형 문항을 생성한다', async () => {
      const mockQuestions = [
        {
          id: 'gv-1',
          type: 'choice',
          difficulty: 'basic',
          question: '다음 괄호 안에서 어법상 알맞은 것을 고르시오.',
          passageSnippet: 'He (must have / should have) arrived yesterday, but he was delayed.',
          options: ['must have', 'should have'],
          correctAnswer: 'should have',
          explanation: '~했어야 했는데 하지 못했다는 유감이나 후회를 나타냅니다.',
          targetGrammar: '조동사 + have p.p.',
        },
      ];

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ questions: mockQuestions }),
      } as any);

      const questions = await AiService.generateGrammarVariants('조동사 + have p.p.', 'lesson-01', 1);
      expect(questions).toHaveLength(1);
      expect(questions[0].targetGrammar).toBe('조동사 + have p.p.');
    });
  });

  describe('6. Teacher Exam Item Studio (/api/ai/exam-generator)', () => {
    it('본문 지문 기반 교사용 내신형 문항과 모범답안을 생성한다', async () => {
      const mockExamItem = {
        id: 'exam-1',
        type: 'grammar_error',
        typeKo: '어법상 어색한 것 고르기',
        questionText: '다음 글의 밑줄 친 ①~⑤ 중 어법상 틀린 것은?',
        passageText: 'It is important to remember that...',
        options: ['①', '②', '③', '④', '⑤'],
        correctAnswer: '③',
        explanation: '주어와 동사의 수일치가 어긋나 있습니다.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ item: mockExamItem }),
      } as any);

      const item = await AiService.generateTeacherExamQuestion(
        'lesson-01',
        'read',
        'grammar_error'
      );

      expect(item.type).toBe('grammar_error');
      expect(item.correctAnswer).toBe('③');
    });

    it('전체 4대 유형 일괄 생성 요청 시 복수 문항 배열을 반환한다', async () => {
      const mockExamItem = {
        id: 'exam-1',
        type: 'grammar_error',
        typeKo: '어법상 어색한 것 고르기',
        questionText: '다음 글의 밑줄 친 ①~⑤ 중 어법상 틀린 것은?',
        passageText: 'It is important to remember that...',
        options: ['①', '②', '③', '④', '⑤'],
        correctAnswer: '③',
        explanation: '주어와 동사의 수일치가 어긋나 있습니다.',
      };

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ item: mockExamItem }),
      } as any);

      const items = await AiService.generateTeacherExamQuestions(
        'lesson-01',
        'read',
        'all'
      );

      expect(items).toHaveLength(4);
      expect(global.fetch).toHaveBeenCalledTimes(4);
    });
  });
});
