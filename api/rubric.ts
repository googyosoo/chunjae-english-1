import { GoogleGenAI } from '@google/genai';
import fs from 'fs';
import path from 'path';
import { verifyAuthToken } from './middleware/auth';

function loadServerRubric(lessonId: string = 'lesson-01'): any[] {
  try {
    const safeLessonId = path.basename(lessonId);
    const filePath = path.join(process.cwd(), 'content', `${safeLessonId}.json`);
    if (!fs.existsSync(filePath)) return [];

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const writeCorner = data.corners?.find((c: any) => c.id === 'write_present');
    const writingWorkspace = writeCorner?.activities?.[0]?.data?.writingWorkspace;
    return writingWorkspace?.step3Draft?.rubric || [];
  } catch {
    return [];
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

    const { studentDraft, topic, lessonId, rubric: clientRubric } = req.body || {};

    if (!studentDraft || typeof studentDraft !== 'string') {
      return res.status(400).json({ error: '학생 초안(studentDraft) 내용이 필요합니다.' });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: '서버 환경 변수 GEMINI_API_KEY가 설정되지 않았습니다.' });
    }

    // 2. Load Rubric from Server's Lesson Data or fallback to client
    const serverRubric = loadServerRubric(lessonId || 'lesson-01');
    const targetRubric = serverRubric.length > 0 ? serverRubric : (clientRubric || []);

    const ai = new GoogleGenAI({ apiKey });
    const systemInstruction = `당신은 심인고등학교 영어 쓰기(Write & Present) 전문 평가 AI 교사입니다.
[절대 원칙]
1. 학생의 글을 대신 다시 써주는 행위(대필)는 절대 금지됩니다.
2. 학생이 스스로 고쳐 쓸 수 있도록, 발견된 문법/어휘 오류의 '위치'와 '이유'를 짚어주고 개선 방향을 제안하십시오.
3. 주어진 루브릭 항목별로 구체적인 격려와 발전 피드백을 제공하십시오.
4. 한국어로 정중하고 건설적인 어조로 피드백을 작성하십시오.`;

    const rubricDesc = targetRubric.map((r: any) => `- ${r.criterion} (가이드: ${r.guideline})`).join('\n');

    const prompt = `[작문 주제]: ${topic || 'School Club Promotion Post'}

[평가 루브릭]:
${rubricDesc}

[학생의 초안]:
${studentDraft}

다음 JSON 포맷으로만 응답해주세요:
{
  "feedbackKo": "전체 총평 및 따뜻한 격려 (한국어, 3~4문장)",
  "rubricScores": [
    {
      "criterion": "루브릭 항목명",
      "comment": "구체적인 피드백 및 제안"
    }
  ]
}`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
      },
    });

    const text = response.text || '';
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanJson);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Gemini Rubric API Error:', error);
    // Return explicit error message instead of fake fallback feedback
    return res.status(500).json({
      error: error.message || 'AI 피드백 채점 서비스 호출 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    });
  }
}
