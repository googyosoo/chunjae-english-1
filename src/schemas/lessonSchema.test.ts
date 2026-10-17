import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import {
  LessonDataSchema,
  CornerItemSchema,
  IntroDataSchema,
  ReadBeforeSchema,
  ReadingViewerSchema,
  LanguageFocusSchema,
  WritingSchema,
  WrapUpActivitiesSchema,
  LessonSummarySchema,
} from './lessonSchema';

describe('Lesson Data Zod Schema Validation', () => {
  const jsonPath = path.resolve(__dirname, '../../content/lesson-01.json');
  const rawData = fs.readFileSync(jsonPath, 'utf-8');
  const parsedData = JSON.parse(rawData);

  it('validates content/lesson-01.json against LessonDataSchema with 100% success', () => {
    const parseResult = LessonDataSchema.safeParse(parsedData);
    if (!parseResult.success) {
      console.error('Validation errors:', JSON.stringify(parseResult.error.issues, null, 2));
    }
    expect(parseResult.success).toBe(true);
  });

  it('validates 8 corners and their activities structure', () => {
    expect(parsedData.corners).toHaveLength(8);
    for (const corner of parsedData.corners) {
      const cornerResult = CornerItemSchema.safeParse(corner);
      expect(cornerResult.success).toBe(true);
      expect(corner.activities.length).toBeGreaterThan(0);
    }
  });

  it('validates Read Before You Read activity payload', () => {
    const readCorner = parsedData.corners.find((c: any) => c.id === 'read');
    expect(readCorner).toBeDefined();
    const beforeAct = readCorner.activities.find((a: any) => a.type === 'before_you_read');
    expect(beforeAct).toBeDefined();

    const beforeResult = ReadBeforeSchema.safeParse(beforeAct.data);
    expect(beforeResult.success).toBe(true);
    expect(beforeAct.data.backgroundCheck).toHaveLength(6);
    expect(beforeAct.data.vocabularyCheck).toHaveLength(4);
  });

  it('validates Language Focus activity payload', () => {
    const langCorner = parsedData.corners.find((c: any) => c.id === 'language_focus');
    expect(langCorner).toBeDefined();
    const langAct = langCorner.activities.find((a: any) => a.type === 'word_polysemy_match');
    expect(langAct).toBeDefined();

    const langResult = LanguageFocusSchema.safeParse(langAct.data);
    expect(langResult.success).toBe(true);
    expect(langAct.data.wordUses.meanings).toHaveLength(3);
    expect(langAct.data.wordUses.sentences).toHaveLength(3);
    expect(langAct.data.commonPhrases.boxPhrases).toBeDefined();
  });

  it('validates Wrap Up activity payload', () => {
    const wrapCorner = parsedData.corners.find((c: any) => c.id === 'go_global');
    expect(wrapCorner).toBeDefined();
    const wrapAct = wrapCorner.activities.find((a: any) => a.type === 'wrap_up_activities');
    expect(wrapAct).toBeDefined();

    const wrapResult = WrapUpActivitiesSchema.safeParse(wrapAct.data);
    expect(wrapResult.success).toBe(true);
    expect(wrapAct.data.partA).toBeDefined();
    expect(wrapAct.data.partB).toBeDefined();
    expect(wrapAct.data.partC).toBeDefined();
  });

  it('fails safely when required fields are missing', () => {
    const invalidData = {
      lessonNumber: 1,
      // title missing
      topic: 'Test Topic',
    };
    const result = LessonDataSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  describe('Lesson 2 Zod Schema Validation', () => {
    const l2Path = path.resolve(__dirname, '../../content/lesson-02.json');
    const l2Raw = fs.readFileSync(l2Path, 'utf-8');
    const l2Data = JSON.parse(l2Raw);

    it('validates content/lesson-02.json against LessonDataSchema with 100% success', () => {
      const parseResult = LessonDataSchema.safeParse(l2Data);
      if (!parseResult.success) {
        console.error('L2 Validation errors:', JSON.stringify(parseResult.error.issues, null, 2));
      }
      expect(parseResult.success).toBe(true);
    });

    it('validates Lesson 2 has 8 corners and vocabulary list', () => {
      expect(l2Data.corners).toHaveLength(8);
      expect(l2Data.vocabulary.length).toBeGreaterThanOrEqual(10);
      for (const corner of l2Data.corners) {
        const cornerResult = CornerItemSchema.safeParse(corner);
        expect(cornerResult.success).toBe(true);
        expect(corner.activities.length).toBeGreaterThan(0);
      }
    });

    it('validates Lesson 2 corner 8 is work_together', () => {
      const workCorner = l2Data.corners.find((c: any) => c.id === 'work_together');
      expect(workCorner).toBeDefined();
      expect(workCorner.cornerNumber).toBe(8);
    });
  });
});
