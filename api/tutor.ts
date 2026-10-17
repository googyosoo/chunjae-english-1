import { GoogleGenAI } from '@google/genai';

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const { question, contextLessonText } = req.body || {};

  if (!question) {
    return res.status(400).json({ error: 'Question is required' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server environment variable GEMINI_API_KEY is not configured.' });
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `당신은 심인고등학교 영어I 교과서 전담 친절한 AI 영어 튜터입니다.
[가드레일 원칙]
1. 반드시 아래 제공된 [교과서 본문 컨텍스트] 내용에 기반해서만 답변하십시오. 교과서 밖의 불필요한 과도한 배경지식은 배제합니다.
2. 학생이 문장의 문법, 단어의 문맥적 의미, 해석 이유를 물어보면 고1 눈높이에 맞추어 친절하게 한국어로 설명하십시오.
3. 정답을 곧바로 알려주기보다는 생각하는 실마리와 문맥적 힌트를 우선 제공하십시오.
4. 학생의 개인정보는 절대 언급하거나 요구하지 마십시오.`;

    const prompt = `[교과서 본문 컨텍스트]:
${contextLessonText || ''}

[학생의 질문]:
${question}

[답변]:`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.3,
      },
    });

    const text = response.text || '';
    return res.status(200).json({ answer: text });
  } catch (error: any) {
    console.error('Gemini API Error:', error);
    return res.status(500).json({ error: error.message || 'Failed to generate content' });
  }
}
