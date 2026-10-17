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
  speaker?: string;
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
  speaker: string; // "B", "G", "M", "W", etc.
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
  criterion: string; // 평가 항목
  weight: number; // 배점 비율 (0~100)
  guideline: string; // AI 및 교사 평가 가이드
}

export interface ActivityPayload {
  // 1. Introduction
  topicQuestion?: string;
  topicSampleAnswer?: string;
  hashtags?: string[];
  lessonFlow?: { step: number; title: string; pageRange: string }[];

  // 2. Communicate on Topic
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

  // 3. Read
  beforeYouRead?: {
    backgroundCheck: { id: string; statement?: string; prompt?: string; options?: string[]; frequencyOptions?: string[] }[];
    vocabularyCheck: { id?: string; sentence: string; blankIndex?: number; options: string[]; answer: string }[];
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
    intro?: string;
    paragraphs?: { paragraphNumber: number; text: string }[];
    conclusion?: string;
    question: string;
    sampleAnswer: string;
  };

  // 4. After You Read
  summaryFillBlanks?: {
    textTemplate?: string;
    options?: string[];
    wordBox?: string[];
    items?: { stage: string; text: string; answer: string }[];
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
    skillDesc?: string;
    example?: {
      expression: string;
      context: string;
      options: { label: string; text: string }[];
      answer: string;
    };
    questions: {
      id: string;
      passage?: string;
      target?: string;
      question?: string;
      options: { label: string; text: string }[];
      answer: string;
    }[];
  };

  // 5. Share Thoughts
  shareThoughts?: {
    videoTitle: string;
    youtubeUrl: string;
    sourceCitation?: string;
    script: SentenceItem[];
    reflectionQuestions: string[];
    sampleDraft: string;
  };

  // 6. Language Focus
  wordUses?: {
    word: string;
    meanings: { label: string; meaningKo: string }[];
    sentences: { id: string; en: string; ko: string; answerLabel: string }[];
  };
  commonPhrases?: {
    boxPhrases: string[];
    exercises: { id: string; sentence: string; answer: string; ko: string }[];
  };
  grammarInContext?: {
    patternName?: string;
    explanation?: string;
    examples?: { en: string; ko: string }[];
    practiceQuestions?: { id: string; instruction: string; originalSentence: string; answer: string }[];
    part1?: {
      patternName: string;
      explanation: string;
      examples: { en: string; ko: string }[];
      exercises: { id: string; instruction?: string; template?: string; prompt?: string; options?: string[]; answerWords?: string; fullAnswer?: string }[];
    };
    part2?: {
      patternName: string;
      explanation: string;
      examples: { en: string; ko: string }[];
      exercises: { id: string; original?: string; template?: string; sentence?: string; baseVerb?: string; answer: string; ko?: string }[];
    };
  };

  // 7. Write & Present
  writingWorkspace?: {
    modelWriting: {
      clubName?: string;
      type?: string;
      title: string;
      text: string;
      sections: { label?: string; name?: string; text: string }[];
      headingsBox?: string[];
    };
    step1Analyze: {
      instruction: string;
      answers?: { [key: string]: string };
      questions?: string[];
    };
    step2Outline: {
      example?: {
        clubInformation: string;
        mainActivities: string;
        requirements: string;
        invitingRemarks: string;
        contactInformation: string;
      };
      writingTip?: string;
      formFields?: { fieldName: string; labelKo: string; placeholder: string; sample: string }[];
    };
    step3Draft: {
      template?: string;
      guidelines?: string[];
      rubric: RubricItem[];
      sampleDraft?: string;
    };
    step4Revise: {
      checklist?: string[];
      editingPractice: {
        textWithErrors: string;
        corrections: { original: string; corrected: string; explanation: string }[];
      };
    };
  };

  // 8. Go Global / Wrap Up
  goGlobal?: {
    title: string;
    description?: string;
    exercises?: { id: string; textMessage: string; abbreviation: string; answer: string }[];
    commonAbbreviations?: { abbr: string; full: string; meaningKo: string }[];
    content?: { abbreviation: string; fullText: string; meaningKo: string }[];
  };
  wrapUp?: {
    partA_crosswordOrVocab?: {
      instructions: string;
      items: { id: string; clue: string; answer: string }[];
    };
    partB_summary?: {
      title: string;
      textTemplate: string;
      blanks: { id: string; hint: string; answer: string }[];
    };
    quizzes?: {
      id: string;
      question: string;
      options: { label: string; text: string }[];
      answer: string;
      explanation: string;
    }[];
  };
  lessonSummary?: {
    selfCheck?: {
      corner: string;
      statement: string;
      targetExpressions?: string[];
    }[];
    thinkBack?: {
      q1: string;
      q2: string;
      topicSampleAnswer?: string;
    };
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
  school?: string;
  title: string;
  topic: string;
  topicQuestion: string;
  hashtags: string[];
  pageRange: string;
  corners: CornerItem[];
  vocabulary: VocabularyItem[];
}
