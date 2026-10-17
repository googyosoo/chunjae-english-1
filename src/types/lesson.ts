/**
 * 고등 영어I AI 디지털 교과서(AIDT) 마스터 데이터 스키마
 * 2022 개정 고등 영어I (강상구) 전 단원 표준 스키마 규격
 * src/schemas/lessonSchema.ts Zod 스키마와 100% 동기화된 타입 정의
 */

import { z } from 'zod';
import {
  CornerIdSchema,
  SentenceItemSchema,
  MarginalQuestionSchema,
  ReadingParagraphSchema,
  VocabItemSchema,
  LessonDataSchema,
  IntroDataSchema,
  WatchAndThinkSchema,
  ListenAndAnswerSchema,
  ListenAndWriteSchema,
  WriteAndTalkSchema,
  ReadBeforeSchema,
  ReadingViewerSchema,
  ReadFurtherSchema,
  AfterReadSchema,
  ShareThoughtsSchema,
  LanguageFocusSchema,
  WritingSchema,
  GlobalTextingSchema,
  WrapUpActivitiesSchema,
  LessonSummarySchema,
} from '../schemas/lessonSchema';

export type CornerId = z.infer<typeof CornerIdSchema>;
export type SentenceItem = z.infer<typeof SentenceItemSchema>;
export type MarginalQuestion = z.infer<typeof MarginalQuestionSchema>;
export type ReadingParagraph = z.infer<typeof ReadingParagraphSchema>;
export type VocabularyItem = z.infer<typeof VocabItemSchema>;

export interface RubricItem {
  criterion: string;
  weight?: number;
  maxScore?: number;
  guideline?: string;
  descriptors?: Record<string, string>;
}

export interface ActivityPayload {
  [key: string]: any;

  // 1. Introduction
  topicQuestion?: string;
  topicSampleAnswer?: string;
  hashtags?: string[];
  lessonFlow?: { step: number | string; title?: string; cornerTitle?: string; pageRange?: string; page?: string }[];

  // 2. Communicate
  watchAndThink?: {
    videoTitle: string;
    youtubeUrl: string;
    sourceCitation?: string;
    script: SentenceItem[];
    checkQuestion: string;
    options: string[];
    answer: string;
    yourThoughtsPrompt?: string;
    yourThoughtsQuestion?: string;
    yourThoughtsSample?: string;
  };
  listenAndAnswer?: {
    dialogues: {
      id: string;
      title: string;
      script: SentenceItem[];
      quiz: { question: string; options: string[]; answer: string };
    }[];
  };
  listenAndWrite?: {
    title: string;
    chartTitle?: string;
    chartData: { label?: string; item?: string; percentage: number; isBlank?: boolean; hasBlank?: boolean; correctWord?: string }[];
    answerKey?: string[];
    summarySentence?: string;
  };
  writeAndTalk?: {
    dialogueModel?: {
      question: string;
      positiveAnswer: string;
      negativeAnswer: string;
    };
    usefulExpressions?: string[];
    prompts?: {
      opinion: string;
      reason: string;
    }[];
    options?: string[];
    dialogueTemplate?: string;
  };
  videoTitle?: string;
  youtubeUrl?: string;
  sourceCitation?: string;
  script?: SentenceItem[];
  checkQuestion?: string;
  options?: string[];
  answer?: string;
  yourThoughtsQuestion?: string;
  yourThoughtsSample?: string;
  dialogues?: {
    id: string;
    title: string;
    script: SentenceItem[];
    quiz: { question: string; options: string[]; answer: string };
  }[];
  title?: string;
  chartTitle?: string;
  chartData?: { percentage: number; item: string; hasBlank: boolean; correctWord?: string }[];
  summarySentence?: string;
  prompt?: string;
  dialogueTemplate?: string;

  // 3. Read
  backgroundCheck?: { id: string; statement: string; options: string[] }[];
  vocabularyCheck?: { id?: string; sentence: string; options: string[]; answer: string }[];
  beforeYouRead?: {
    backgroundCheck: { id: string; statement: string; options: string[] }[];
    vocabularyCheck: { id?: string; sentence: string; options: string[]; answer: string }[];
  };
  reading?: {
    title: string;
    subtitle: string;
    readingTip: { title: string; desc: string };
    paragraphs: ReadingParagraph[];
  };
  readFurther?: {
    title: string;
    source?: string;
    paragraphs: { paragraphNumber: number; text: string }[];
    question: string;
    sampleAnswer: string;
  };

  // 4. After Read
  summaryFillBlanks?: {
    wordBox?: string[];
    options?: string[];
    items?: { stage: string; text: string; answer: string }[];
    answers?: Record<string, string>;
  };
  detailsTF?: {
    id: string;
    statement: string;
    answer: 'T' | 'F';
    evidenceSentenceId?: string;
    explanation?: string;
  }[];
  readingSkill?: {
    skillName: string;
    skillDesc?: string;
    example?: {
      expression: string;
      context: string;
      options: { label: string; text: string }[];
      answer: string;
    };
    questions?: {
      id: string;
      passage?: string;
      target?: string;
      options: { label: string; text: string }[];
      answer: string;
    }[];
  };

  // 5. Share Thoughts
  step1?: {
    quiz1?: { question: string; options: { label: string; text: string }[]; answer: string };
    quiz2?: {
      instruction: string;
      sentence1?: string;
      sentence2?: string;
      sentence3?: string;
      answers: Record<string, string>;
    };
    talkAboutVideo?: { prompt: string; example?: string; sampleAnswer: string };
  };
  step2?: {
    prompt: string;
    categories: { weShould: string[]; weShouldNot: string[] };
  };
  step3?: {
    dialogueModel: { speaker: string; text: string }[];
    checkPoint: string[];
  };

  // 6. Language Focus
  wordUses?: {
    word: string;
    meanings: { label: string; definition: string; example?: string }[];
    sentences: { id: string; text: string; answer: string }[];
  };
  commonPhrases?: {
    boxPhrases: string[];
    bookExamples?: string[];
    exercises: { id: string; sentence: string; answer: string }[];
  };
  grammarInContext?: {
    part1?: {
      patternName?: string;
      ruleName?: string;
      explanation: string;
      mainTextExamples?: string[];
      passage?: string;
      exercises: { id: string; instruction?: string; template?: string; prompt?: string; answerWords?: string; fullAnswer?: string }[];
    };
    part2?: {
      patternName?: string;
      ruleName?: string;
      explanation: string;
      mainTextExamples?: string[];
      passage?: string;
      exercises: { id: string; original?: string; template?: string; sentence?: string; answer: string; ko?: string }[];
    };
  };

  // 7. Write & Present
  writingWorkspace?: {
    modelWriting: {
      clubName?: string;
      title: string;
      text: string;
      sections?: { label?: string; name?: string; text: string }[];
      headingsBox?: string[];
    };
    step1Analyze: {
      instruction: string;
      answers?: Record<string, string>;
    };
    step2Outline?: {
      example?: Record<string, string>;
      writingTip?: string;
    };
    step3Draft: {
      template?: string;
      rubric: RubricItem[];
    };
    step4Revise?: {
      editingPractice: {
        textWithErrors: string;
        corrections: { original: string; corrected: string; explanation: string }[];
      };
    };
  };

  // 8. Go Global & Wrap Up
  goGlobal?: {
    intro?: string;
    recipes?: { name: string; steps: string[] }[];
    sourceCitation?: string;
    dialogue1?: string;
    dialogue2?: string;
    exercises?: { id: string; text: string; answer: string }[];
    abbreviationsList?: { abbr: string; meaning: string }[];
  };
  partA?: {
    question: string;
    options: ({ label: string; text: string } | string)[];
    answer: string;
    script: string | { speaker: string; en?: string; text?: string }[];
  };
  partB?: {
    instruction?: string;
    dialogue: { speaker: string; text?: string; en?: string }[];
  };
  partC?: {
    passage?: string;
    quiz1?: { question: string; options: ({ label: string; text: string } | string)[]; answer: string };
    quiz2?: { prompt?: string; question?: string; sampleAnswer?: string; answer?: string };
  };
  selfCheck?: {
    corner: string;
    statement: string;
    targetExpressions?: string[];
  }[];
  thinkBack?: {
    q1: string;
    q2: string;
    sampleAnswer?: string;
    topicSampleAnswer?: string;
  };
}

export interface ActivityItem {
  activityId: string;
  type: string;
  title?: string;
  page?: number | string;
  pageRange?: string;
  sourceRef?: string;
  data: ActivityPayload;
}

export interface CornerItem {
  id: CornerId;
  cornerNumber?: number;
  titleKo?: string;
  titleEn?: string;
  page?: string;
  pageRange?: string;
  priority?: string;
  description?: string;
  activities: ActivityItem[];
}

export interface LessonData {
  lessonNumber: number;
  title: string;
  topic: string;
  topicQuestion: string;
  hashtags: string[];
  pageRange: string;
  school?: string;
  corners: CornerItem[];
  vocabulary: VocabularyItem[];
}

export type IntroData = z.infer<typeof IntroDataSchema>;
export type WatchAndThinkData = z.infer<typeof WatchAndThinkSchema>;
export type ListenAndAnswerData = z.infer<typeof ListenAndAnswerSchema>;
export type ListenAndWriteData = z.infer<typeof ListenAndWriteSchema>;
export type WriteAndTalkData = z.infer<typeof WriteAndTalkSchema>;
export type ReadBeforeData = z.infer<typeof ReadBeforeSchema>;
export type ReadingViewerData = z.infer<typeof ReadingViewerSchema>;
export type ReadFurtherData = z.infer<typeof ReadFurtherSchema>;
export type AfterReadData = z.infer<typeof AfterReadSchema>;
export type ShareThoughtsData = z.infer<typeof ShareThoughtsSchema>;
export type LanguageFocusData = z.infer<typeof LanguageFocusSchema>;
export type WritingData = z.infer<typeof WritingSchema>;
export type GlobalTextingData = z.infer<typeof GlobalTextingSchema>;
export type WrapUpActivitiesData = z.infer<typeof WrapUpActivitiesSchema>;
export type LessonSummaryData = z.infer<typeof LessonSummarySchema>;
