import { describe, it, expect } from 'vitest';
import lesson1DataRaw from './lesson1.json';
import { LessonData } from '../types/lesson';

const lesson1 = lesson1DataRaw as unknown as LessonData;

describe('Lesson 1 Data Integrity Test (데이터 무결성 검증)', () => {
  it('단원 기본 메타데이터가 정확해야 한다', () => {
    expect(lesson1.lessonNumber).toBe(1);
    expect(lesson1.title).toBe('Digital Well-being');
    expect(lesson1.topicQuestion).toBe('How can we promote our digital well-being?');
    expect(lesson1.corners.length).toBe(8);
  });

  it('8대 코너 순서가 교과서 및 계획서와 1:1로 일치해야 한다', () => {
    const cornerIds = lesson1.corners.map(c => c.id);
    expect(cornerIds).toEqual([
      'introduction',
      'communicate',
      'read',
      'after_read',
      'share_thoughts',
      'language_focus',
      'write_present',
      'go_global',
    ]);
  });

  it('본문 리더에 Part 1 및 Part 2 단락들과 여백 질문 Q1~Q11이 모두 포함되어야 한다', () => {
    const readCorner = lesson1.corners.find(c => c.id === 'read');
    expect(readCorner).toBeDefined();
    const reading = readCorner?.activities[0].data.reading;
    expect(reading).toBeDefined();
    expect(reading?.paragraphs.length).toBeGreaterThanOrEqual(5);

    // Q1~Q11 수집 확인
    const allQuestions: string[] = [];
    reading?.paragraphs.forEach(p => {
      p.marginalQuestions.forEach(q => allQuestions.push(q.qNumber));
    });

    for (let i = 1; i <= 11; i++) {
      expect(allQuestions).toContain(`Q${i}`);
    }
  });

  it('공식 정답키와 대본 데이터가 누락 없이 탑재되어야 한다', () => {
    const commCorner = lesson1.corners.find(c => c.id === 'communicate');
    const listenWrite = commCorner?.activities.find(a => a.activityId === 'comm_listen_write')?.data.listenAndWrite;
    expect(listenWrite?.answerKey).toEqual(['connections', 'information', 'positive']);

    const afterCorner = lesson1.corners.find(c => c.id === 'after_read');
    const tfData = afterCorner?.activities[0].data.detailsTF;
    expect(tfData?.length).toBe(4);
    expect(tfData?.map(t => t.answer)).toEqual(['T', 'F', 'F', 'T']);
  });
});
