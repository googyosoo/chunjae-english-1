import { getAiProvider } from '../services/aiProvider';
import { verifyAuthToken } from '../middleware/auth';

export default async function handler(req: any, res: any) {
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
    await verifyAuthToken(req);

    const { dialogueContext, userMessage, history = [] } = req.body || {};

    if (!userMessage || typeof userMessage !== 'string') {
      return res.status(400).json({ error: '학생의 발화(userMessage) 내용이 필요합니다.' });
    }

    const provider = getAiProvider();
    const systemInstruction = `당신은 심인고등학교 영어 교과서(Communicate 코너) 대화 롤플레이 전문 AI 영어 회화 튜터입니다.
[대화 규칙]
1. 학생과 교과서 대화문 상황을 바탕으로 자연스럽게 1턴씩 번갈아가며 영어 대화를 진행합니다.
2. 학생의 발화 수준에 맞추어 격려하고, 다음 발화를 유도하는 질문을 던지십시오.
3. 한국어 번역(replyKo)과 실용적인 발음/연음 팁(pronunciationTip)을 1줄로 함께 제공하십시오.
4. 학생이 다음 턴에 선택하거나 참고할 수 있는 추천 모범 답변 2개(suggestedResponses)를 함께 제시하십시오.`;

    const prompt = `[대화 상황 컨텍스트]:
${dialogueContext || 'Daily conversation about school life'}

[이전 대화 이력]:
${history.map((h: any) => `${h.role}: ${h.content}`).join('\n')}

[학생의 최신 발화]:
"${userMessage}"

다음 JSON 포맷으로만 응답하세요:
{
  "replyEn": "AI 튜터의 영어 답변 (1~2문장)",
  "replyKo": "한국어 번역",
  "pronunciationTip": "발음 또는 억양 팁 (1문장)",
  "suggestedResponses": [
    "학생이 할 수 있는 추천 답변 1",
    "학생이 할 수 있는 추천 답변 2"
  ]
}`;

    const parsed = await provider.generateJson(prompt, systemInstruction);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Roleplay API Error:', error);
    return res.status(500).json({
      error: error.message || '롤플레이 AI 서비스 호출 중 오류가 발생했습니다.',
    });
  }
}
