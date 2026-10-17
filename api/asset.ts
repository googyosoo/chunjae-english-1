import type { VercelRequest, VercelResponse } from '@vercel/node';
import fs from 'fs';
import path from 'path';
import { verifyAuthToken } from './middleware/auth';

const MIME_TYPES: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
};

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
    // 1. 심인고 인증 토큰 검증 (@simin.hs.kr 및 email_verified)
    await verifyAuthToken(req);

    const lessonParam = (req.query.lesson as string) || 'lesson-02';
    const nameParam = req.query.name as string;

    if (!nameParam) {
      return res.status(400).json({ error: 'name 매개변수가 필요합니다.' });
    }

    // Path Traversal 방어
    const safeLesson = path.basename(lessonParam.startsWith('lesson-') ? lessonParam : `lesson-${lessonParam}`);
    const safeName = path.basename(nameParam);

    const assetPath = path.join(process.cwd(), 'content', 'assets', safeLesson, safeName);

    if (!fs.existsSync(assetPath)) {
      return res.status(404).json({ error: `이미지 자산을 찾을 수 없습니다: ${safeName}` });
    }

    const ext = path.extname(safeName).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    const fileBuffer = fs.readFileSync(assetPath);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'private, max-age=86400');
    return res.status(200).send(fileBuffer);
  } catch (error: any) {
    console.error('Asset Fetch API Error:', error);
    return res.status(401).json({
      error: error.message || '교과서 이미지를 열람하기 위한 인증에 실패했습니다.',
    });
  }
}
