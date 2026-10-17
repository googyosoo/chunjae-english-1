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
  const activityData = readCorner?.activities[0].data;
  const beforeData = activityData?.beforeYouRead;
  const readingData = activityData?.reading;

  // Before you read 어휘 퀴즈 상태
  const [vocabAnswers, setVocabAnswers] = useState<{ [idx: number]: string }>({});

  // 여백 질문 (Q1~Q11) 학생 답변 상태
  const [marginalAnswers, setMarginalAnswers] = useState<{ [qNumber: string]: string }>({});

  // 현재 읽고 있는 단락 필터 (전체 또는 Day별)
  const [activeTab, setActiveTab] = useState<string>('all');

  const handleSpeakParagraph = (sentences: SentenceItem[]) => {
    const fullText = sentences.map(s => s.en).join(' ');
    TTSService.speak(fullText);
  };

  const filteredParagraphs = activeTab === 'all'
    ? readingData?.paragraphs || []
    : readingData?.paragraphs.filter(p => p.day === activeTab || (activeTab === 'Part 1' && p.part === 'Part 1')) || [];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Before You Read: 어휘 및 사전 점검 */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center gap-2 mb-4">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
          <h2 className="text-base font-bold text-slate-900">Before You Read: Background & Vocabulary Check</h2>
        </div>

        {/* Vocabulary Check Interactive Cards */}
        <div className="space-y-3">
          <p className="text-xs text-slate-500 font-medium">💡 본문 등장 핵심 어휘를 빈칸에 맞춰보세요 (p.12):</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {beforeData?.vocabularyCheck.map((item, idx) => {
              const isSelected = vocabAnswers[idx];
              const isCorrect = isSelected === item.answer;
              return (
                <div key={idx} className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <p className="font-medium text-slate-800 leading-snug">
                    {item.sentence.replace('[blank]', '_______')}
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {item.options.map(opt => (
                      <button
                        key={opt}
                        onClick={() => setVocabAnswers(prev => ({ ...prev, [idx]: opt }))}
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
                  {isSelected && (
                    <div className="text-[11px] font-bold">
                      {isCorrect ? (
                        <span className="text-emerald-600">✓ 정답입니다!</span>
                      ) : (
                        <span className="text-rose-600">✗ 다시 풀어보세요.</span>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Reading Tip Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 flex items-start gap-3">
        <Sparkles className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
        <div>
          <h4 className="font-bold text-amber-900 text-xs sm:text-sm">{readingData?.readingTip.title}</h4>
          <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">{readingData?.readingTip.desc}</p>
        </div>
      </div>

      {/* Main Interactive Reader */}
      <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        {/* Reader Header & Day Tabs */}
        <div className="p-6 border-b border-slate-200 bg-slate-50/70">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 uppercase tracking-wide">Lesson 1 Main Text</span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">{readingData?.title}</h1>
              <p className="text-xs text-slate-500 mt-0.5">{readingData?.subtitle}</p>
            </div>
            <div className="text-xs bg-indigo-50 text-indigo-700 font-semibold px-3 py-1.5 rounded-full border border-indigo-200">
              💡 문장을 탭하면 해석·어휘·AI 질문 창이 열립니다
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap gap-1.5">
            {['all', 'Part 1', 'Day 1', 'Day 4', 'Day 7', 'Day 14', 'Read Further'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                aria-label={`${tab} 탭으로 이동`}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'bg-white text-slate-600 hover:bg-slate-200/60 border border-slate-200'
                }`}
              >
                {tab === 'all' ? '전체 보기' : tab}
              </button>
            ))}
          </div>
        </div>

        {/* Read Further Special Tab */}
        {activeTab === 'Read Further' && (
          <div className="p-6 space-y-6">
            <div className="bg-indigo-50/70 p-5 rounded-2xl border border-indigo-200 space-y-4">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-indigo-600 text-white text-xs font-bold">Read Further (p. 21)</span>
                <h3 className="font-bold text-slate-900 text-base">Volunteering Online</h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 leading-relaxed">
                Volunteering has a great deal of benefits. Not only do you make a positive impact on someone’s life, but you gain valuable skills for your career. It even reduces stress and anxiety. With busy schedules, it can be hard to find the time to commit to volunteer work. These days, however, you can make a huge difference in the lives of others from your own home by virtually volunteering. Here are a few ways to virtually volunteer.
              </p>

              <div className="space-y-3 pt-2">
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                  <h4 className="font-bold text-xs text-indigo-700 mb-1">1. Phone Friends for Senior Citizens</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    First, you could be a part of the effort to lend support to senior citizens who struggle with loneliness. Typically, volunteer “phone friends” make regular calls to chat and check in with these people.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                  <h4 className="font-bold text-xs text-indigo-700 mb-1">2. Visual Assistance via Live Video Call</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Second, you can help people with low or no vision with their everyday tasks. Through a live video call, you can offer visual assistance to those who need it with tasks such as reading “use by” dates and instructions on food packages.
                  </p>
                </div>
                <div className="bg-white p-3.5 rounded-xl border border-indigo-100">
                  <h4 className="font-bold text-xs text-indigo-700 mb-1">3. Wildlife Monitoring and Conservation</h4>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Finally, if you have an interest in wildlife and its conservation, you can help with animal monitoring work by watching live videos of animal habitats around the world. Monitoring these animals helps protect wildlife and develop methods of conserving them.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-indigo-200 text-xs">
                <p className="font-bold text-slate-900 mb-1">Q. Among the three ways of volunteering online, which would you like to try and why?</p>
                {showTeacherAnswers && (
                  <p className="text-emerald-800 bg-emerald-50 p-2.5 rounded-lg">
                    🔑 [교과서 예시답안 (p.152)]: I would like to become a phone friend for senior citizens because I like chatting with others and meeting new people.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Paragraphs and Sentences */}
        <div className="p-6 space-y-8">
          {filteredParagraphs.map((para) => (
            <div key={para.id} className="space-y-4">
              {/* Paragraph Heading & TTS */}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                <span className="font-bold text-sm text-slate-900 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-600" />
                  {para.heading}
                </span>
                <button
                  onClick={() => handleSpeakParagraph(para.sentences)}
                  className="flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-lg transition-colors"
                  title="단락 전체 TTS 듣기"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  <span>단락 전체 듣기</span>
                </button>
              </div>

              {/* Sentences Stream */}
              <div className="space-y-2">
                {para.sentences.map((sentence) => (
                  <div
                    key={sentence.id}
                    onClick={() => onSelectSentence(sentence)}
                    className={`group p-3 rounded-xl cursor-pointer transition-all border ${
                      sentence.isLanguageFocus
                        ? 'bg-amber-50/50 hover:bg-amber-100/70 border-amber-300 shadow-xs'
                        : 'bg-white hover:bg-indigo-50/50 border-transparent hover:border-indigo-200'
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] font-mono text-slate-400 group-hover:text-indigo-600 mt-1 select-none">
                        {sentence.id.split('_')[2]}
                      </span>
                      <div className="flex-1">
                        <p className={`text-sm sm:text-base leading-relaxed ${
                          sentence.isLanguageFocus ? 'font-semibold text-slate-900' : 'text-slate-800'
                        }`}>
                          {sentence.en}
                        </p>
                        {sentence.isLanguageFocus && (
                          <span className="inline-block mt-1 text-[11px] font-bold text-amber-700 bg-amber-100/80 px-2 py-0.5 rounded-md">
                            ★ Language Focus 문장
                          </span>
                        )}
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-1" />
                    </div>
                  </div>
                ))}
              </div>

              {/* Marginal Questions (여백 Q1~Q11) */}
              {para.marginalQuestions.length > 0 && (
                <div className="mt-4 p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>여백 질문 (Marginal Questions):</span>
                  </div>
                  {para.marginalQuestions.map((q) => (
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
                      {showTeacherAnswers && (
                        <div className="p-2 bg-emerald-50 rounded text-emerald-800 text-[11px] font-medium">
                          🔑 [교과서 정답키 (p.152)]: {q.sampleAnswer}
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
