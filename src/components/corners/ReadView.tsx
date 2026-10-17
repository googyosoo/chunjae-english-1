import React, { useState } from 'react';
import { LessonData, SentenceItem } from '../../types/lesson';
import { TTSService } from '../../services/ttsService';
import { StorageService } from '../../services/storageService';
import { BookOpen, Sparkles, Volume2, CheckCircle2, ChevronRight, HelpCircle, MessageSquare } from 'lucide-react';

interface ReadViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
  onSelectSentence: (sentence: SentenceItem) => void;
}

export const ReadView: React.FC<ReadViewProps> = ({
  lesson,
  showTeacherAnswers,
  onSelectSentence,
}) => {
  const readCorner = lesson.corners.find(c => c.id === 'read');
  const activities = readCorner?.activities || [];

  const beforeAct = activities.find(a => a.type === 'before_you_read' || a.activityId.includes('before'));
  const beforeData = beforeAct?.data as any;
  const backgroundCheck = beforeData?.backgroundCheck;
  const vocabularyCheck = beforeData?.vocabularyCheck;

  const readingAct = activities.find(a => 
    a.type === 'interactive_reader' || 
    a.type === 'passage' || 
    a.type === 'reading_viewer' || 
    a.activityId.includes('passage') || 
    a.activityId.includes('main') || 
    a.activityId === 'read_interactive_viewer'
  );
  const readingData = (readingAct?.data?.readingViewer || readingAct?.data?.reading || readingAct?.data) as any;

  const readFurtherAct = activities.find(a => a.type === 'read_further' || a.activityId.includes('further'));
  const readFurtherData = (readFurtherAct?.data?.readFurther || readFurtherAct?.data) as any;

  // Background Check 진단 답변 상태
  const [bgAnswers, setBgAnswers] = useState<{ [id: string]: string }>({});

  // Before you read 어휘 퀴즈 상태
  const [vocabAnswers, setVocabAnswers] = useState<{ [idx: string]: string }>({});

  // 여백 질문 학생 답변 상태
  const [marginalAnswers, setMarginalAnswers] = useState<{ [qNumber: string]: string }>({});

  // 현재 읽고 있는 단락 필터
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleSpeakParagraph = (sentences: SentenceItem[]) => {
    const fullText = sentences.map(s => s.en).join(' ');
    TTSService.speak(fullText);
  };

  // L1: paragraphs, L2/L3: sections
  const rawSections: any[] = readingData?.sections || [];
  const rawParagraphs: any[] = readingData?.paragraphs || [];

  const unifiedSections = rawSections.length > 0
    ? rawSections.map((sec, idx) => {
        const sentences = sec.sentences && sec.sentences.length > 0
          ? sec.sentences
          : sec.paragraphs
          ? sec.paragraphs.flatMap((p: any) => p.sentences || [])
          : [];

        const questions = (sec.marginalQuestions || sec.questions || []).map((q: any, qIdx: number) => ({
          qNumber: q.id || q.num || `q_${idx}_${qIdx}`,
          question: q.question,
          sampleAnswer: q.answer,
        }));

        const title = sec.title || sec.titleEn || `Section ${idx + 1}`;

        return {
          id: sec.sectionId || `sec_${idx}`,
          heading: title,
          day: title,
          part: `Section ${idx + 1}`,
          pageRef: sec.pageRef,
          figureNote: sec.figureNote,
          asset: sec.asset,
          sentences,
          marginalQuestions: questions,
        };
      })
    : rawParagraphs;

  const filteredSections = activeTab === 'all'
    ? unifiedSections
    : unifiedSections.filter(p => p.day === activeTab || p.heading === activeTab || p.part === activeTab);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Before You Read: 어휘 및 사전 점검 */}
      {beforeData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-6">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
            <h2 className="text-base font-bold text-slate-900">Before You Read</h2>
          </div>

          {/* 1. Background Check */}
          {Array.isArray(backgroundCheck) && backgroundCheck.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                1. Background Check: 나의 습관 점검하기
              </h3>
              <div className="space-y-2">
                {backgroundCheck.map((item: any, bIdx: number) => (
                  <div
                    key={item.id || item.statement || `bg_${bIdx}`}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs"
                  >
                    <span className="font-medium text-slate-800">{item.statement}</span>
                    <div className="flex gap-1 shrink-0">
                      {['rarely', 'often', 'always'].map(level => (
                        <button
                          key={level}
                          onClick={() => setBgAnswers(prev => ({ ...prev, [item.id || `bg_${bIdx}`]: level }))}
                          className={`px-3 py-1 rounded-lg font-semibold text-[11px] transition-all ${
                            bgAnswers[item.id || `bg_${bIdx}`] === level
                              ? 'bg-indigo-600 text-white shadow-2xs'
                              : 'bg-white text-slate-600 border border-slate-200 hover:border-indigo-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* L5 Background Check (Painting & Characters) */}
          {backgroundCheck?.characters && (
            <div className="space-y-3">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                1. Background Check: {backgroundCheck.paintingTitle || 'Painting and Characters'}
              </h3>
              {(backgroundCheck.pageRef || backgroundCheck.figureNote) && (
                <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                  <span>📖</span>
                  <span>{backgroundCheck.figureNote || `교과서 p.${backgroundCheck.pageRef}의 그림을 보세요`}</span>
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {backgroundCheck.characters.map((char: any, cIdx: number) => (
                  <div key={char.name || cIdx} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 text-xs">
                    <span className="font-bold text-indigo-900 block">{char.name}</span>
                    <p className="text-slate-600 mt-0.5">{char.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* L2 Background Check Prompt */}
          {backgroundCheck?.prompt && (
            <div className="p-4 bg-indigo-50/60 rounded-xl border border-indigo-200 text-xs space-y-2">
              <span className="font-bold text-indigo-950 block">💡 Background Check:</span>
              <p className="text-slate-800">{backgroundCheck.prompt}</p>
              {showTeacherAnswers && backgroundCheck.sampleAnswer && (
                <p className="text-emerald-800 bg-white p-2.5 rounded-lg border border-indigo-100 font-medium">
                  🔑 [교과서 예시답안]: {backgroundCheck.sampleAnswer}
                </p>
              )}
            </div>
          )}

          {/* 2. Vocabulary Check */}
          {vocabularyCheck && (
            <div className="space-y-3 pt-2">
              <h3 className="text-xs sm:text-sm font-bold text-slate-800">
                2. Vocabulary Check: 문맥에 맞는 어휘 고르기
              </h3>
              {(vocabularyCheck.wordBox || vocabularyCheck.wordsBox) && (
                <div className="flex flex-wrap gap-2 p-2.5 bg-slate-100 rounded-lg text-xs font-bold text-slate-700">
                  <span>단어함:</span>
                  {(vocabularyCheck.wordBox || vocabularyCheck.wordsBox).map((w: string, wIdx: number) => (
                    <span key={`${w}_${wIdx}`} className="px-2 py-0.5 bg-white rounded border border-slate-300">{w}</span>
                  ))}
                </div>
              )}
              <div className="space-y-2">
                {(Array.isArray(vocabularyCheck) ? vocabularyCheck : vocabularyCheck.questions || vocabularyCheck.items || []).map((item: any, idx: number) => {
                  const key = item.id || `vc_${idx}`;
                  const isSelected = vocabAnswers[key] || '';
                  const isCorrect = isSelected === item.answer;

                  const options = item.options || vocabularyCheck?.wordBox || vocabularyCheck?.wordsBox;

                  return (
                    <div
                      key={key}
                      className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2 text-xs"
                    >
                      <p className="font-medium text-slate-800 leading-relaxed">
                        {idx + 1}. {item.sentence || item.text}
                      </p>
                      {options && options.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {options.map((opt: string) => (
                            <button
                              key={opt}
                              onClick={() => setVocabAnswers(prev => ({ ...prev, [key]: opt }))}
                              className={`px-2.5 py-1 rounded-md font-semibold transition-all ${
                                isSelected === opt
                                  ? isCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-rose-600 text-white'
                                  : 'bg-white text-slate-700 border border-slate-300 hover:border-indigo-400'
                              }`}
                            >
                              {opt}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      {/* Reading Tip Banner */}
      {readingData?.readingTip && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="font-bold text-amber-900 text-xs sm:text-sm">{readingData.readingTip.title}</h4>
            <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{readingData.readingTip.desc}</p>
          </div>
        </div>
      )}

      {/* Main Interactive Reader */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Reader Header */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">
                Lesson {lesson.lessonNumber} Main Text
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 mt-1">
                {readingData?.titleEn || readingData?.title || lesson.title}
              </h2>
              {readingData?.subtitle && (
                <p className="text-xs text-slate-500 mt-0.5">{readingData.subtitle}</p>
              )}
            </div>
            <div className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-full border border-indigo-200">
              💡 문장을 탭하면 해석·어휘·AI 질문 창이 열립니다
            </div>
          </div>
        </div>

        {/* Read Further Special Section */}
        {readFurtherData && (
          <div className="p-6 border-b border-slate-200 bg-indigo-50/40 space-y-4">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">Read Further</span>
              <h3 className="font-bold text-slate-900 text-base">
                {readFurtherData.titleEn || readFurtherData.title || readFurtherData.articleTitle}
              </h3>
              {readFurtherData.author && <span className="text-xs text-slate-600">- {readFurtherData.author}</span>}
            </div>

            {(readFurtherData.pageRef || readFurtherData.figureNote) && (
              <div className="p-3 my-2 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                <span>📖</span>
                <span>{readFurtherData.figureNote || `교과서 p.${readFurtherData.pageRef}의 그림을 보세요`}</span>
              </div>
            )}

            <div className="space-y-2 pt-2 text-xs sm:text-sm text-slate-800 leading-relaxed">
              {(readFurtherData.paragraphs || readFurtherData.sentences || []).map((p: any, idx: number) => {
                const text = p.text || p.en || (p.sentences ? p.sentences.map((s: any) => s.en).join(' ') : '');
                return (
                  <p key={idx} className="p-3 bg-white rounded-xl border border-indigo-100">
                    {text}
                  </p>
                );
              })}
            </div>

            {(readFurtherData.question || readFurtherData.marginalQuestion?.question) && (
              <div className="pt-2 border-t border-indigo-200 text-xs">
                <p className="font-bold text-slate-900 mb-1">
                  Q. {readFurtherData.question || readFurtherData.marginalQuestion?.question}
                </p>
                {showTeacherAnswers && (readFurtherData.sampleAnswer || readFurtherData.marginalQuestion?.answer) && (
                  <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg">
                    🔑 [교과서 예시답안]: {readFurtherData.sampleAnswer || readFurtherData.marginalQuestion?.answer}
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Paragraphs and Sentences Stream */}
        <div className="p-6 space-y-8">
          {filteredSections.map((para) => (
            <div key={para.id} className="space-y-4">
              {/* Heading & TTS */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {para.heading || para.part}
                </span>
                <button
                  onClick={() => handleSpeakParagraph(para.sentences)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>단락 전체 듣기</span>
                </button>
              </div>

              {/* Artwork Page Reference Note (if any) */}
              {(para.pageRef || para.figureNote) && (
                <div className="p-3 my-2 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 font-medium flex items-center gap-2">
                  <span>📖</span>
                  <span>{para.figureNote || `교과서 p.${para.pageRef}의 그림을 보세요`}</span>
                </div>
              )}

              {/* Sentences Stream */}
              <div className="space-y-2">
                {para.sentences.map((sentence: any, sIdx: number) => (
                  <div
                    key={sentence.id || `s_${para.id}_${sentence.sentenceNumber || sIdx}`}
                    onClick={() => onSelectSentence(sentence)}
                    className="group p-3 rounded-xl cursor-pointer transition-all border bg-white hover:bg-indigo-50/50 border-transparent hover:border-indigo-200"
                  >
                    <div className="flex items-start gap-2">
                      <div className="flex-1">
                        <p className="text-sm sm:text-base leading-relaxed text-slate-800">
                          {sentence.en}
                        </p>
                        {sentence.ko && (
                          <p className="text-xs text-slate-500 mt-1">{sentence.ko}</p>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Marginal Questions */}
              {para.marginalQuestions?.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>여백 질문 (In-text Questions):</span>
                  </div>
                  {para.marginalQuestions.map((q: any) => (
                    <div key={q.qNumber} className="bg-white p-3 rounded-lg border border-slate-200 space-y-2 text-xs">
                      <p className="font-bold text-slate-900">
                        {q.qNumber}. {q.question}
                      </p>
                      <input
                        type="text"
                        value={marginalAnswers[q.qNumber] || ''}
                        onChange={e => setMarginalAnswers(prev => ({ ...prev, [q.qNumber]: e.target.value }))}
                        placeholder="영어로 답변을 적어보세요..."
                        className="w-full px-3 py-1.5 border border-slate-300 rounded-md focus:ring-2 focus:ring-indigo-500"
                      />
                      {showTeacherAnswers && q.sampleAnswer && (
                        <div className="p-2 bg-emerald-50 rounded text-emerald-800 text-[11px] font-medium">
                          🔑 [교과서 정답키]: {q.sampleAnswer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
