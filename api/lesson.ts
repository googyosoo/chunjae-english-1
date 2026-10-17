import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { verifyAuthToken } from './middleware/auth';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // CORS configuration
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    // 1. Verify Authentication Token (@simin.hs.kr & email_verified)
    await verifyAuthToken(req);

    const lessonId = (req.query.id as string) || 'lesson-01';
    // Validate path to prevent directory traversal
    const safeLessonId = path.basename(lessonId);
    const filePath = path.join(process.cwd(), 'content', `${safeLessonId}.json`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: `단원 데이터를 찾을 수 없습니다: ${safeLessonId}` });
    }

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const lessonData = JSON.parse(fileContent);

    return res.status(200).json(lessonData);
  } catch (error: any) {
    console.error('Lesson Fetch API Error:', error);
    return res.status(401).json({
      error: error.message || '교과서 데이터를 불러오기 위한 인증에 실패했습니다.',
    });
  }
}
