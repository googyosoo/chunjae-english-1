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

    const { targetGrammar, lessonId = 'lesson-01', count = 3 } = req.body || {};

    if (!targetGrammar || typeof targetGrammar !== 'string') {
      return res.status(400).json({ error: '목표 문법(targetGrammar) 내용이 필요합니다.' });
    }

    const provider = getAiProvider();
    const systemInstruction = `당신은 대한민국 고등학교 1학년 영어 교과서(Language Focus 코너) 문법 변형 문항 출제 전문 AI 교사입니다.
[출제 원칙]
1. 입력된 목표 문법 구조를 중심으로 고1 수준의 정밀한 4지선다 객관식 문항을 ${count}개 출제하십시오.
2. 난이도는 기본(basic), 발전(intermediate), 심화(advanced)로 배분하십시오.
3. 명확한 한국어 해설과 정답 인덱스(0~3)를 반드시 포함하십시오.`;

    const prompt = `[단원]: ${lessonId}
[목표 문법 포인트]: ${targetGrammar}
[요청 문항 수]: ${count}개

다음 JSON 포맷으로만 응답하세요:
{
  "questions": [
    {
      "id": "gv-1",
      "type": "choice",
      "difficulty": "basic",
      "question": "다음 문장의 빈칸에 들어갈 알맞은 것을 고르시오.",
      "passageSnippet": "예문 문장...",
      "options": ["보기 1", "보기 2", "보기 3", "보기 4"],
      "correctAnswer": 1,
      "explanation": "상세한 문법적 해설",
      "targetGrammar": "${targetGrammar}"
    }
  ]
}`;

    const parsed = await provider.generateJson(prompt, systemInstruction);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Grammar Variants API Error:', error);
    return res.status(500).json({
      error: error.message || '문법 변형 문항 생성 중 오류가 발생했습니다.',
    });
  }
}
