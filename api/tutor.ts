import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { verifyAuthToken } from './middleware/auth';

function loadLessonContext(lessonId: string = 'lesson-01'): string {
  try {
    const safeLessonId = path.basename(lessonId);
    const filePath = path.join(process.cwd(), 'content', `${safeLessonId}.json`);
    if (!fs.existsSync(filePath)) return '';

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const readCorner = data.corners?.find((c: any) => c.id === 'read');
    const reading = readCorner?.activities?.find((a: any) => a.activityId === 'read_interactive_viewer')?.data?.reading;
    if (!reading) return '';

    return reading.paragraphs
      ?.map((p: any) => p.sentences?.map((s: any) => s.en).join(' '))
      .join('\n\n') || '';
  } catch {
    return '';
  }
}

export default async function handler(req: any, res: any) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Firebase ID Token Verification & Rate Limiting
    await verifyAuthToken(req);

    const { question, lessonId } = req.body || {};

    if (!question || typeof question !== 'string') {
      return res.status(400).json({ error: '질문(question) 내용이 필요합니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '서버 환경 변수 GEMINI_API_KEY가 설정되지 않았습니다.' });
    }

    // 2. Load Textbook Context securely on Server
    const textbookContext = loadLessonContext(lessonId || 'lesson-01');

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `당신은 심인고등학교 영어I 교과서 전담 친절한 AI 영어 튜터입니다.
[가드레일 원칙]
1. 반드시 아래 제공된 [교과서 본문 컨텍스트] 내용에 기반해서만 답변하십시오. 교과서 밖의 불필요한 과도한 배경지식은 배제합니다.
2. 학생이 문장의 문법, 단어의 문맥적 의미, 해석 이유를 물어보면 고1 눈높이에 맞추어 친절하게 한국어로 설명하십시오.
3. 정답을 곧바로 알려주기보다는 생각하는 실마리와 문맥적 힌트를 우선 제공하십시오.
4. 학생의 개인정보는 절대 언급하거나 요구하지 마십시오.`;

    const prompt = `[교과서 본문 컨텍스트]:
${textbookContext}

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
    console.error('Tutor API Error:', error);
    return res.status(500).json({
      error: error.message || 'AI 튜터 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
}
