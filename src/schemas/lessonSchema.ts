import { z } from 'zod';

// ============================================================================
// Simin High School English I AI Digital Textbook - Zod Validation Schema
// Standard: Up-to-Date 2026 Typed Schema for content/lesson-XX.json
// ============================================================================

export const SentenceItemSchema = z.object({
  id: z.string(),
  speaker: z.string().optional(),
  en: z.string(),
  ko: z.string(),
  words: z.array(z.string()).optional(),
  grammarPoint: z.string().optional(),
  grammarTip: z.string().optional(),
  isLanguageFocus: z.boolean().optional(),
}).passthrough();

export const CornerIdSchema = z.enum([
  'introduction',
  'communicate',
  'read',
  'after_read',
  'share_thoughts',
  'language_focus',
  'write_present',
  'go_global',
]);

// 1. Introduction Activity Schema
export const IntroDataSchema = z.object({
  topicQuestion: z.string().optional(),
  topicSampleAnswer: z.string().optional(),
  hashtags: z.array(z.string()).optional(),
  lessonFlow: z.array(z.object({
    step: z.string(),
    cornerTitle: z.string(),
    page: z.string(),
  })).optional(),
}).passthrough();

// 2. Communicate Activities Schemas
export const WatchAndThinkSchema = z.object({
  videoTitle: z.string(),
  youtubeUrl: z.string(),
  sourceCitation: z.string().optional(),
  script: z.array(SentenceItemSchema),
  checkQuestion: z.string(),
  options: z.array(z.string()),
  answer: z.string(),
  yourThoughtsQuestion: z.string().optional(),
  yourThoughtsSample: z.string().optional(),
}).passthrough();

export const ListenAndAnswerSchema = z.object({
  dialogues: z.array(z.object({
    id: z.string(),
    title: z.string(),
    script: z.array(SentenceItemSchema),
    quiz: z.object({
      question: z.string(),
      options: z.array(z.string()),
      answer: z.string(),
    }),
  })),
}).passthrough();

export const ListenAndWriteSchema = z.object({
  title: z.string(),
  chartTitle: z.string(),
  chartData: z.array(z.object({
    percentage: z.number(),
    item: z.string(),
    hasBlank: z.boolean(),
    correctWord: z.string().optional(),
  })),
  summarySentence: z.string().optional(),
}).passthrough();

export const WriteAndTalkSchema = z.object({
  prompt: z.string(),
  options: z.array(z.string()),
  dialogueTemplate: z.string().optional(),
}).passthrough();

// 3. Read Activities Schemas
export const ReadBeforeSchema = z.object({
  backgroundCheck: z.array(z.object({
    id: z.string(),
    statement: z.string(),
    options: z.array(z.string()),
  })),
  vocabularyCheck: z.array(z.object({
    id: z.string().optional(),
    sentence: z.string(),
    options: z.array(z.string()),
    answer: z.string(),
  })),
}).passthrough();

export const MarginalQuestionSchema = z.object({
  qNumber: z.string(),
  question: z.string(),
  sampleAnswer: z.string(),
});

export const ReadingParagraphSchema = z.object({
  id: z.string(),
  part: z.string(),
  day: z.string().optional(),
  heading: z.string().optional(),
  sentences: z.array(SentenceItemSchema),
  marginalQuestions: z.array(MarginalQuestionSchema),
});

export const ReadingViewerSchema = z.object({
  reading: z.object({
    title: z.string(),
    subtitle: z.string().optional(),
    readingTip: z.object({
      title: z.string(),
      desc: z.string(),
    }),
    paragraphs: z.array(ReadingParagraphSchema),
  }),
}).passthrough();

export const ReadFurtherSchema = z.object({
  readFurther: z.object({
    title: z.string(),
    source: z.string().optional(),
    paragraphs: z.array(z.object({
      paragraphNumber: z.number(),
      text: z.string(),
    })),
    question: z.string(),
    sampleAnswer: z.string(),
  }),
}).passthrough();

// 4. After You Read Schema
export const AfterReadSchema = z.object({
  summaryFillBlanks: z.object({
    wordBox: z.array(z.string()).optional(),
    options: z.array(z.string()).optional(),
    items: z.array(z.object({
      stage: z.string(),
      text: z.string(),
      answer: z.string(),
    })).optional(),
    answers: z.record(z.string()).optional(),
  }).optional(),
  detailsTF: z.array(z.object({
    id: z.string(),
    statement: z.string(),
    answer: z.enum(['T', 'F']),
    evidenceSentenceId: z.string().optional(),
    explanation: z.string().optional(),
  })).optional(),
  readingSkill: z.object({
    skillName: z.string(),
    skillDesc: z.string().optional(),
    example: z.object({
      expression: z.string(),
      context: z.string(),
      options: z.array(z.object({
        label: z.string(),
        text: z.string(),
      })),
      answer: z.string(),
    }).optional(),
    questions: z.array(z.object({
      id: z.string(),
      passage: z.string(),
      target: z.string(),
      options: z.array(z.object({
        label: z.string(),
        text: z.string(),
      })),
      answer: z.string(),
    })).optional(),
  }).optional(),
}).passthrough();

// 5. Share Thoughts Schema
export const ShareThoughtsSchema = z.object({
  videoTitle: z.string(),
  youtubeUrl: z.string(),
  sourceCitation: z.string().optional(),
  step1: z.object({
    title: z.string(),
    quiz: z.object({
      question: z.string(),
      options: z.array(z.string()),
      answer: z.string(),
    }),
    fillInBlank: z.object({
      instruction: z.string(),
      sentences: z.array(z.object({
        id: z.string(),
        template: z.string(),
        answer: z.string(),
      })),
    }).optional(),
    talkAboutVideo: z.object({
      question: z.string(),
      sampleAnswer: z.string(),
    }).optional(),
  }),
  step2: z.any().optional(),
  step3: z.any().optional(),
}).passthrough();

// 6. Language Focus Schema
export const LanguageFocusSchema = z.object({
  wordUses: z.object({
    word: z.string(),
    meanings: z.array(z.object({
      label: z.string(),
      definition: z.string(),
      example: z.string().optional(),
    })),
    sentences: z.array(z.object({
      id: z.string(),
      text: z.string(),
      answer: z.string(),
    })),
  }),
  commonPhrases: z.object({
    boxPhrases: z.array(z.string()),
    bookExamples: z.array(z.string()).optional(),
    exercises: z.array(z.object({
      id: z.string(),
      sentence: z.string(),
      answer: z.string(),
    })),
  }),
  grammarInContext: z.object({
    part1: z.object({
      ruleName: z.string(),
      explanation: z.string(),
      mainTextExamples: z.array(z.string()).optional(),
      passage: z.string().optional(),
      exercises: z.array(z.object({
        id: z.string(),
        instruction: z.string().optional(),
        template: z.string().optional(),
        prompt: z.string().optional(),
        answerWords: z.string().optional(),
        fullAnswer: z.string().optional(),
      })),
    }),
    part2: z.object({
      ruleName: z.string(),
      explanation: z.string(),
      mainTextExamples: z.array(z.string()).optional(),
      passage: z.string().optional(),
      exercises: z.array(z.object({
        id: z.string(),
        original: z.string().optional(),
        template: z.string().optional(),
        answer: z.string(),
      })),
    }),
  }),
}).passthrough();

// 7. Writing Schema
export const WritingSchema = z.object({
  writingWorkspace: z.object({
    modelWriting: z.object({
      title: z.string(),
      text: z.string(),
      sections: z.array(z.object({
        label: z.string().optional(),
        name: z.string().optional(),
        text: z.string(),
      })).optional(),
      headingsBox: z.array(z.string()).optional(),
    }),
    step1Analyze: z.object({
      instruction: z.string(),
      answers: z.record(z.string()).optional(),
    }),
    step2Outline: z.any().optional(),
    step3Draft: z.object({
      rubric: z.array(z.object({
        criterion: z.string(),
        maxScore: z.number().optional(),
        descriptors: z.record(z.string()).optional(),
      })),
    }),
    step4Revise: z.object({
      editingPractice: z.object({
        textWithErrors: z.string(),
        corrections: z.array(z.object({
          original: z.string(),
          corrected: z.string(),
          explanation: z.string(),
        })),
      }),
    }).optional(),
  }),
}).passthrough();

// 8. Go Global & Wrap Up Schemas
export const GlobalTextingSchema = z.object({
  goGlobal: z.object({
    dialogue1: z.string().optional(),
    dialogue2: z.string().optional(),
    exercises: z.array(z.object({
      id: z.string(),
      text: z.string(),
      answer: z.string(),
    })).optional(),
    abbreviationsList: z.array(z.object({
      abbr: z.string(),
      meaning: z.string(),
    })).optional(),
  }),
}).passthrough();

export const WrapUpActivitiesSchema = z.object({
  partA: z.object({
    question: z.string(),
    options: z.array(z.object({
      label: z.string(),
      text: z.string(),
    })),
    answer: z.string(),
    script: z.string(),
  }),
  partB: z.object({
    dialogue: z.array(z.object({
      speaker: z.string(),
      text: z.string(),
    })),
  }),
  partC: z.object({
    passage: z.string(),
    quiz1: z.object({
      question: z.string(),
      options: z.array(z.object({
        label: z.string(),
        text: z.string(),
      })),
      answer: z.string(),
    }),
    quiz2: z.object({
      prompt: z.string(),
      sampleAnswer: z.string(),
    }),
  }),
}).passthrough();

export const LessonSummarySchema = z.object({
  selfCheck: z.array(z.object({
    corner: z.string(),
    statement: z.string(),
    targetExpressions: z.array(z.string()).optional(),
  })),
  thinkBack: z.object({
    q1: z.string(),
    q2: z.string(),
    topicSampleAnswer: z.string().optional(),
  }),
}).passthrough();

// Activity Generic Wrapper
export const ActivityItemSchema = z.object({
  activityId: z.string(),
  type: z.string(),
  title: z.string().optional(),
  data: z.record(z.any()),
});

// Corner Schema
export const CornerItemSchema = z.object({
  id: CornerIdSchema,
  cornerNumber: z.number().optional(),
  titleKo: z.string().optional(),
  titleEn: z.string().optional(),
  page: z.string().optional(),
  description: z.string().optional(),
  activities: z.array(ActivityItemSchema),
});

// Vocabulary Item Schema
export const VocabItemSchema = z.object({
  id: z.string().optional(),
  word: z.string(),
  meaning: z.string(),
  page: z.number().optional(),
  partOfSpeech: z.string().optional(),
  example: z.string().optional(),
}).passthrough();

// Master LessonData Schema
export const LessonDataSchema = z.object({
  lessonNumber: z.number(),
  title: z.string(),
  topic: z.string(),
  topicQuestion: z.string(),
  hashtags: z.array(z.string()),
  pageRange: z.string(),
  school: z.string(),
  corners: z.array(CornerItemSchema),
  vocabulary: z.array(VocabItemSchema),
});

export type LessonDataParsed = z.infer<typeof LessonDataSchema>;
