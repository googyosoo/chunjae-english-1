import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { LessonDataSchema } from '../src/schemas/lessonSchema.ts';

const jsonPath = process.argv[2];
if (!jsonPath) {
  console.error(JSON.stringify({ success: false, errors: ['No JSON path specified'] }));
  process.exit(1);
}

try {
  const raw = fs.readFileSync(path.resolve(jsonPath), 'utf-8');
  const data = JSON.parse(raw);
  const result = LessonDataSchema.safeParse(data);

  if (result.success) {
    console.log(JSON.stringify({ success: true }));
    process.exit(0);
  } else {
    const formatted = result.error.errors.map(e => `${e.path.join('.')}: ${e.message}`);
    console.log(JSON.stringify({ success: false, errors: formatted }));
    process.exit(1);
  }
} catch (err: any) {
  console.log(JSON.stringify({ success: false, errors: [err.message] }));
  process.exit(1);
}
