/**
 * 심인고등학교 AI 디지털 교과서 AI 공급자(Provider) 추상화 계층
 * - 미성년자 안전 및 학교 정책에 따라 Gemini, OpenAI, Mock 공급자 원클릭 교체 지원
 */

import { GoogleGenAI } from '@google/genai';

export interface AiGenerateOptions {
  temperature?: number;
  maxTokens?: number;
}

export interface IAiProvider {
  name: string;
  generateText(prompt: string, systemInstruction?: string, options?: AiGenerateOptions): Promise<string>;
  generateJson<T = any>(prompt: string, systemInstruction?: string, options?: AiGenerateOptions): Promise<T>;
}

// 1. Google Gemini Provider
export class GeminiProvider implements IAiProvider {
  name = 'gemini';
  private ai: GoogleGenAI;

  constructor(apiKey?: string) {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error('GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
    this.ai = new GoogleGenAI({ apiKey: key });
  }

  async generateText(prompt: string, systemInstruction?: string, options?: AiGenerateOptions): Promise<string> {
    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: options?.temperature ?? 0.3,
      },
    });
    return response.text || '';
  }

  async generateJson<T = any>(prompt: string, systemInstruction?: string, options?: AiGenerateOptions): Promise<T> {
    const text = await this.generateText(prompt, systemInstruction, options);
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as T;
  }
}

// 2. OpenAI / Azure OpenAI Provider (미성년자 계약 또는 기업용 전용 계정 지원)
export class OpenAiProvider implements IAiProvider {
  name = 'openai';
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || process.env.OPENAI_API_KEY || '';
    this.baseUrl = process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1';
    if (!this.apiKey) {
      throw new Error('OPENAI_API_KEY 환경 변수가 설정되지 않았습니다.');
    }
  }

  async generateText(prompt: string, systemInstruction?: string, options?: AiGenerateOptions): Promise<string> {
    const messages = [];
    if (systemInstruction) {
      messages.push({ role: 'system', content: systemInstruction });
    }
    messages.push({ role: 'user', content: prompt });

    const res = await fetch(`${this.baseUrl}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        temperature: options?.temperature ?? 0.3,
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error?.message || `OpenAI API 오류 (${res.status})`);
    }

    const data = await res.json();
    return data.choices?.[0]?.message?.content || '';
  }

  async generateJson<T = any>(prompt: string, systemInstruction?: string, options?: AiGenerateOptions): Promise<T> {
    const text = await this.generateText(prompt, systemInstruction, options);
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson) as T;
  }
}

// 3. Mock Provider (테스트, 오프라인 및 비용 0원 데모 모드)
export class MockProvider implements IAiProvider {
  name = 'mock';

  async generateText(prompt: string, systemInstruction?: string): Promise<string> {
    if (prompt.includes('조동사') || prompt.includes('could have')) {
      return '조동사 + have p.p.는 과거의 사실에 대한 추측 또는 유감을 나타내는 표현입니다. 본문에서는 "It could have been worse" 형태로 사용되었습니다.';
    }
    return `[교육용 AI 튜터]: 질문하신 "${prompt.slice(0, 30)}..."에 대한 교과서 본문 설명입니다. 문맥 속 단어의 쓰임과 기본 문법 구조에 유의하여 학습하세요.`;
  }

  async generateJson<T = any>(prompt: string): Promise<T> {
    if (prompt.includes('rubric') || prompt.includes('루브릭') || prompt.includes('studentDraft')) {
      return {
        feedbackKo: '디지털 디톡스 실천 경험을 영어 문맥에 맞추어 명확하게 표현했습니다. 문장 연결사와 시제 표현이 자연스럽습니다.',
        rubricScores: [
          { criterion: '주제 적합성', comment: '주제에 부합하며 자신의 생각과 실천 사례를 구체적으로 제시함.', scoreLevel: '우수' },
          { criterion: '언어 사용 및 문법', comment: '기본 어법이 안정적이며 전달력이 우수함.', scoreLevel: '우수' },
        ],
      } as unknown as T;
    }

    if (prompt.includes('roleplay') || prompt.includes('대화문')) {
      return {
        replyEn: "I totally understand how hard it is to put down your phone. What activity could you do instead of scrolling?",
        replyKo: "스마트폰을 내려놓는 게 얼마나 어려운지 정말 이해돼. 스크롤하는 대신 어떤 활동을 해볼 수 있을까?",
        pronunciationTip: "instead of의 'of'는 가볍게 [əv]로 연음하여 발음해 보세요.",
        suggestedResponses: [
          "I could go for a light jog in the park.",
          "I could read a few pages of a novel before bed.",
        ],
      } as unknown as T;
    }

    if (prompt.includes('grammar-variants') || prompt.includes('문법')) {
      return {
        questions: [
          {
            id: 'gv-mock-1',
            type: 'choice',
            difficulty: 'basic',
            question: '다음 문장의 빈칸에 들어갈 가장 알맞은 표현을 고르시오.',
            passageSnippet: 'She was not at home. She ______ to the library.',
            options: ['must go', 'must have gone', 'should go', 'can go'],
            correctAnswer: 1,
            explanation: '과거 사실에 대한 확실한 추측을 나타내므로 "must have gone"이 적절합니다.',
            targetGrammar: '조동사 + have p.p.',
          },
          {
            id: 'gv-mock-2',
            type: 'choice',
            difficulty: 'intermediate',
            question: '다음 중 밑줄 친 부분의 쓰임이 어법상 옳은 것을 고르시오.',
            passageSnippet: 'You should have finished your homework before watching TV.',
            options: ['옳은 문장', '틀린 문장 (should finish로 수정)'],
            correctAnswer: 0,
            explanation: '~했어야 했는데 하지 않았다는 과거의 후회/유감을 나타내므로 어법상 옳습니다.',
            targetGrammar: '조동사 + have p.p.',
          },
        ],
      } as unknown as T;
    }

    return {
      item: {
        id: 'exam-mock-1',
        type: 'grammar_error',
        typeKo: '어법상 어색한 것 고르기',
        questionText: '다음 글의 밑줄 친 ①~⑤ 중 어법상 틀린 것은?',
        passageText: 'Many students find it difficult to balance study and screen time. However, setting clear limits ① helps reduce anxiety. If you ② practiced digital detox regularly, you will feel more focused. Those who ③ have tried this approach report ④ higher satisfaction in daily life. Remember ⑤ to take small steps.',
        options: ['①', '②', '③', '④', '⑤'],
        correctAnswer: '②',
        explanation: '주절의 시제가 미래(will feel)를 가리키므로, 조건절의 동사는 현재시제(practice)를 써야 합니다.',
      },
    } as unknown as T;
  }
}

/**
 * 환경 변수 AI_PROVIDER에 따라 알맞은 공급자 인스턴스를 반환
 * 기본값: GEMINI_API_KEY가 있으면 gemini, 없으면 mock
 */
export function getAiProvider(): IAiProvider {
  const provider = (process.env.AI_PROVIDER || '').toLowerCase();

  if (provider === 'openai' && process.env.OPENAI_API_KEY) {
    return new OpenAiProvider();
  }

  if (provider === 'mock' || (!process.env.GEMINI_API_KEY && !process.env.OPENAI_API_KEY)) {
    return new MockProvider();
  }

  return new GeminiProvider();
}
