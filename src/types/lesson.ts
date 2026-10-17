/**
 * 고등 영어I AI 디지털 교과서(AIDT) 마스터 데이터 스키마
 * 2022 개정 고등 영어I (강상구) 전 단원 표준 스키마 규격
 */

export type CornerId =
  | 'introduction'
  | 'communicate'
  | 'read'
  | 'after_read'
  | 'share_thoughts'
  | 'language_focus'
  | 'write_present'
  | 'go_global'
  | 'wrap_up';

export interface SentenceItem {
  id: string;
  en: string;
  ko: string;
  grammarTip?: string;
  keyWords?: string[];
  isLanguageFocus?: boolean; // 문법 타깃 문장 여부
}

export interface MarginalQuestion {
  qNumber: string; // e.g. "Q1", "Q2"
  question: string;
  sampleAnswer: string;
  isThinkAndTalk?: boolean;
}

export interface ReadingParagraph {
  id: string;
  part: 'Part 1' | 'Part 2';
  day?: string; // e.g. "Day 1", "Day 4", "Day 7", "Day 11", "Day 14"
  heading?: string;
  sentences: SentenceItem[];
  marginalQuestions: MarginalQuestion[];
  wordTips?: string[];
}

export interface DialogueUtterance {
  speaker: string; // "B", "G", "M", "W", "Selena", etc.
  text: string;
  translation: string;
}

export interface DialogueItem {
  id: string;
  title: string;
  utterances: DialogueUtterance[];
}

export interface VocabularyItem {
  word: string;
  meaning: string;
  page: number;
  partOfSpeech?: string;
  exampleEn?: string;
  exampleKo?: string;
}

export interface RubricItem {
  criterion: string; // 평가 항목 (예: 내용 충실성, 문법 정확성, 어휘 다양성)
  weight: number; // 배점 비율 (0~100)
  guideline: string; // AI 및 교사 평가 가이드
}

export interface ActivityPayload {
  // Introduction
  topicQuestion?: string;
  topicSampleAnswer?: string;
  hashtags?: string[];
  lessonFlow?: { step: number; title: string; pageRange: string }[];

  // Communicate on Topic
  watchAndThink?: {
    videoTitle: string;
    youtubeUrl: string;
    sourceCitation?: string;
    script: SentenceItem[];
    checkQuestion: string;
    options: string[];
    answer: string;
    yourThoughtsPrompt: string;
    yourThoughtsSample: string;
  };
  listenAndAnswer?: {
    dialogues: DialogueItem[];
    comprehensionQuizzes: {
      dialogueId: string;
      question: string;
      options: { label: string; text: string }[];
      answer: string;
    }[];
  };
  listenAndWrite?: {
    title: string;
    script: SentenceItem[];
    chartData: { label: string; percentage: number; isBlank?: boolean; correctWord?: string }[];
    answerKey: string[];
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
  };

  // Read
  beforeYouRead?: {
    backgroundCheck: { id: string; prompt: string; frequencyOptions: string[] }[];
    vocabularyCheck: { sentence: string; blankIndex: number; options: string[]; answer: string }[];
  };
  reading?: {
    title: string;
    subtitle: string;
    readingTip: { title: string; desc: string };
    paragraphs: ReadingParagraph[];
  };
  readFurther?: {
    title: string;
    subtitle: string;
    readingTip?: { title: string; desc: string };
    paragraphs: ReadingParagraph[];
    comprehensionCheck?: { question: string; options: string[]; answer: string }[];
  };
  shareThoughts?: {
    videoTitle: string;
    youtubeUrl: string;
    sourceCitation?: string;
    script: SentenceItem[];
    reflectionQuestions: string[];
    sampleDraft: string;
  };

  // After You Read
  summaryFillBlanks?: {
    textTemplate: string; // "[blank_1] is short for fear..."
    options: string[];
    answers: { [key: string]: string };
  };
  detailsTF?: {
    id: string;
    statement: string;
    answer: 'T' | 'F';
    evidenceSentenceId: string;
    explanation: string;
  }[];
  readingSkill?: {
    skillName: string;
    questions: { id: string; question: string; options: { label: string; text: string }[]; answer: string }[];
  };

  // Language Focus
  wordUses?: {
    word: string;
    meanings: { label: string; meaningKo: string }[];
    sentences: { id: string; en: string; ko: string; answerLabel: string }[];
  };
  grammarInContext?: {
    patternName: string; // e.g. "전치사 + 관계대명사", "분사구문"
    explanation: string;
    examples: { en: string; ko: string }[];
    practiceQuestions: { id: string; instruction: string; originalSentence: string; answer: string }[];
  };

  // Write & Present
  writingWorkspace?: {
    modelWriting: {
      type: string;
      title: string;
      text: string;
      sections: { name: string; text: string }[];
    };
    step1Analyze: { instruction: string; questions: string[] };
    step2Outline: {
      formFields: { fieldName: string; labelKo: string; placeholder: string; sample: string }[];
    };
    step3Draft: {
      guidelines: string[];
      rubric: RubricItem[];
      sampleDraft: string;
    };
    step4Revise: {
      checklist: string[];
      editingPractice: {
        textWithErrors: string;
        corrections: { original: string; corrected: string; explanation: string }[];
      };
    };
  };

  // Go Global / Wrap Up
  goGlobal?: {
    title: string;
    content: { abbreviation: string; fullText: string; meaningKo: string }[];
  };
  wrapUp?: {
    quizzes: {
      id: string;
      question: string;
      options: { label: string; text: string }[];
      answer: string;
      explanation: string;
    }[];
  };
}

export interface CornerItem {
  id: CornerId;
  cornerNumber: number;
  titleKo: string;
  titleEn: string;
  pageRange: string;
  priority: 'P1' | 'P2' | 'P3';
  activities: {
    activityId: string;
    type: string;
    title: string;
    data: ActivityPayload;
  }[];
}

export interface LessonData {
  lessonNumber: number;
  title: string;
  topic: string;
  topicQuestion: string;
  hashtags: string[];
  pageRange: string;
  corners: CornerItem[];
  vocabulary: VocabularyItem[];
}
