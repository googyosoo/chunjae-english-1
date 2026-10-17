import { getAiProvider } from '../services/aiProvider';
import { verifyAuthToken } from '../middleware/auth';
import fs from 'fs';
import path from 'path';

function loadLessonParagraph(lessonId: string = 'lesson-01', cornerId: string = 'read'): string {
  try {
    const safeLessonId = path.basename(lessonId);
    const filePath = path.join(process.cwd(), 'content', `${safeLessonId}.json`);
    if (!fs.existsSync(filePath)) return '';

    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    const corner = data.corners?.find((c: any) => c.id === cornerId) || data.corners?.find((c: any) => c.id === 'read');
    const reading = corner?.activities?.[0]?.data?.reading;
    if (!reading) return '';

    return reading.paragraphs
      ?.map((p: any) => p.sentences?.map((s: any) => s.en).join(' '))
      .join('\n\n') || '';
  } catch {
    return '';
  }
}

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

    const { lessonId = 'lesson-01', cornerId = 'read', questionType = 'grammar_error' } = req.body || {};

    const passage = loadLessonParagraph(lessonId, cornerId);
    const provider = getAiProvider();

    const typeNames: Record<string, string> = {
      grammar_error: '어법상 어색한 것 고르기',
      blank_inference: '빈칸 추론',
      sentence_order: '글의 순서 배열',
      subjective_writing: '조건부 영작 서술형',
    };

    const typeKo = typeNames[questionType] || '내신형 문항';

    const systemInstruction = `당신은 대한민국 고등학교 1학년 영어 내신 지필평가 출제위원입니다.
[출제 지침]
1. 제공된 교과서 본문 지문을 바탕으로 실제 고등학교 정기고사(중간/기말) 수준의 ${typeKo} 문항을 1문항 출제하십시오.
2. 객관식(5지선다) 또는 서술형(조건 제시형) 규격을 엄격히 지키십시오.
3. 명확한 정답, 채점 기준표(서술형의 경우), 그리고 논리적인 출제 해설을 작성하십시오.`;

    const prompt = `[단원]: ${lessonId}
[교과서 본문 지문]:
${passage.slice(0, 1500) || 'Textbook passage content'}

[요청 문항 유형]: ${typeKo} (${questionType})

다음 JSON 포맷으로만 응답하세요:
{
  "item": {
    "id": "exam-gen-1",
    "type": "${questionType}",
    "typeKo": "${typeKo}",
    "questionText": "다음 글을 읽고 물음에 답하시오.",
    "passageText": "출제용 지문 (필요 시 밑줄 ①~⑤ 포함)",
    "options": ["① 보기 1", "② 보기 2", "③ 보기 3", "④ 보기 4", "⑤ 보기 5"],
    "correctAnswer": "정답 기호 또는 모범 답안",
    "explanation": "정답에 대한 상세한 해설과 오답 분석"
  }
}`;

    const parsed = await provider.generateJson(prompt, systemInstruction);
    return res.status(200).json(parsed);
  } catch (error: any) {
    console.error('Exam Generator API Error:', error);
    return res.status(500).json({
      error: error.message || '내신 문항 생성 중 오류가 발생했습니다.',
    });
  }
}
