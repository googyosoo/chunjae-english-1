import React, { useState } from 'react';
import { LessonData } from '../../types/lesson';
import { TTSService } from '../../services/ttsService';
import { StorageService } from '../../services/storageService';
import { Volume2, Play, CheckCircle2, XCircle, Sparkles, MessageSquare, Bot } from 'lucide-react';
import { RoleplayModal } from '../ai/RoleplayModal';

interface CommunicateViewProps {
  lesson: LessonData;
  showTeacherAnswers: boolean;
}

export const CommunicateView: React.FC<CommunicateViewProps> = ({ lesson, showTeacherAnswers }) => {
  const commActivities = lesson.corners.find(c => c.id === 'communicate')?.activities || [];
  const watchAct = commActivities.find(a => a.type === 'watch_and_think' || a.activityId.includes('watch_think'));
  const watchData = (watchAct?.data?.watchAndThink || watchAct?.data) as any;

  const listenAnswerAct = commActivities.find(a => a.type === 'listen_and_answer' || a.activityId.includes('listen_answer'));
  const listenAnswerData = (listenAnswerAct?.data?.listenAndAnswer || listenAnswerAct?.data) as any;

  const listenWriteAct = commActivities.find(a => a.type === 'listen_and_write' || a.activityId.includes('listen_write'));
  const listenWriteData = (listenWriteAct?.data?.listenAndWrite || listenWriteAct?.data) as any;

  const writeTalkAct = commActivities.find(a => a.type === 'write_and_talk' || a.type === 'match_and_talk' || a.activityId.includes('talk'));
  const writeTalkData = (writeTalkAct?.data?.writeAndTalk || writeTalkAct?.data?.matchAndTalk || writeTalkAct?.data) as any;

  // A. Watch and Think 상태
  const [watchAnswer, setWatchAnswer] = useState<string>('');
  const [watchThoughts, setWatchThoughts] = useState<string>('');
  const [activeUtteranceId, setActiveUtteranceId] = useState<string | null>(null);

  // B. Listen and Answer 퀴즈 상태
  const [dialogueAnswers, setDialogueAnswers] = useState<{ [qId: string]: string }>({});

  // C. Listen and Write 빈칸 상태
  const [chartInputs, setChartInputs] = useState<{ [idx: number]: string }>({});
  const [chartChecked, setChartChecked] = useState<boolean>(false);

  // D. Write and Talk 상태
  const [talkOpinion, setTalkOpinion] = useState<'useful' | 'harmful' | ''>('');
  const [talkReason, setTalkReason] = useState<string>('');
  const [isRoleplayOpen, setIsRoleplayOpen] = useState<boolean>(false);

  const handleSpeak = (text: string, id: string) => {
    setActiveUtteranceId(id);
    TTSService.speak(text, {
      onEnd: () => setActiveUtteranceId(null),
      onError: () => setActiveUtteranceId(null),
    });
  };

  const handleCheckChart = () => {
    setChartChecked(true);
    const correctAnswers = listenWriteData?.chartData ? (listenWriteData.chartData as any[]).filter((d: any) => d.hasBlank || d.isBlank).map((d: any) => d.correctWord).join(', ') : '';
    StorageService.logObservation(
      null,
      lesson.lessonNumber,
      '듣기 차트 빈칸 제출',
      `입력값: ${JSON.stringify(chartInputs)}, 정답: ${correctAnswers}`
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* A. Watch and Think with Real Video Embed */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">A</span>
          <h2 className="text-base font-bold text-slate-900">Watch and Think: {watchData?.videoTitle}</h2>
        </div>

        {/* Real YouTube Video Embed or External Official Video Link */}
        {watchData?.youtubeUrl && (
          watchData.youtubeUrl.includes('youtube.com') || watchData.youtubeUrl.includes('youtu.be') ? (
            <div className="rounded-2xl overflow-hidden shadow-md border border-slate-200 aspect-video bg-black">
              <iframe
                src={watchData.youtubeUrl}
                title={watchData.videoTitle || 'Video player'}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="rounded-2xl p-6 bg-gradient-to-r from-indigo-900 to-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-4 shadow-md">
              <div className="space-y-1 text-center sm:text-left">
                <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-[10px] font-bold uppercase tracking-wider">
                  Official Documentary Video
                </span>
                <h3 className="font-bold text-sm sm:text-base">{watchData.videoTitle}</h3>
                <p className="text-xs text-slate-300">교과서 Sources(p.169) 공식 제공 다큐멘터리 영상</p>
              </div>
              <a
                href={watchData.youtubeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-xl bg-indigo-500 hover:bg-indigo-600 font-bold text-xs text-white shadow-xs transition-colors shrink-0 flex items-center gap-2"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>공식 영상 시청하기</span>
              </a>
            </div>
          )
        )}
        {watchData?.sourceCitation && (
          <p className="text-[11px] text-slate-500 italic">
            출처: {watchData.sourceCitation}
          </p>
        )}

        {/* Script & TTS Player (Scripts p.142 원문 그대로) */}
        <div className="space-y-2">
          <p className="text-xs text-slate-500 font-medium">🎧 대화 음성을 들으며 스크립트를 확인하세요 (문장 클릭 시 TTS 재생):</p>
          <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-slate-200/80">
            {(watchData?.script || watchData?.videoScript || []).map((item: any, idx: number) => {
              const uId = `wt_${idx}`;
              return (
                <div
                  key={idx}
                  onClick={() => handleSpeak(item.en, uId)}
                  className={`p-3 rounded-lg cursor-pointer transition-all ${
                    activeUtteranceId === uId
                      ? 'bg-indigo-100 text-indigo-950 shadow-xs border border-indigo-300'
                      : 'bg-white hover:bg-slate-100/80 border border-slate-200/60'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-start gap-2">
                      <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-bold flex items-center justify-center shrink-0">
                        {item.speaker}
                      </span>
                      <div>
                        <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug">{item.en}</p>
                        <p className="text-xs text-slate-500 mt-1">{item.ko}</p>
                      </div>
                    </div>
                    <Volume2 className={`w-4 h-4 shrink-0 mt-1 ${activeUtteranceId === uId ? 'text-indigo-600' : 'text-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Check Question */}
        <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
          <p className="text-xs sm:text-sm font-bold text-indigo-950 mb-3">
            Q. {watchData?.question || watchData?.checkQuestion || watchData?.sentence || watchData?.quiz?.sentence || watchData?.quiz?.question || ''}
          </p>
          <div className="flex gap-2">
            {(watchData?.options || watchData?.quiz?.options || []).map((opt: any) => {
              const isSelected = watchAnswer === opt;
              const isCorrect = opt === (watchData?.answer || watchData?.quiz?.answer);
              return (
                <button
                  key={opt}
                  onClick={() => setWatchAnswer(opt)}
                  aria-label={`선택지 ${opt}`}
                  className={`px-4 py-2 rounded-xl text-xs font-bold border transition-all ${
                    isSelected
                      ? isCorrect
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-rose-600 text-white border-rose-600'
                      : 'bg-white text-slate-700 border-slate-300 hover:border-indigo-400'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {watchAnswer && (
            <div className="mt-2 text-xs font-semibold">
              {watchAnswer === (watchData?.answer || watchData?.quiz?.answer) ? (
                <span className="text-emerald-700 flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> 정답입니다! ({watchData?.answer || watchData?.quiz?.answer})
                </span>
              ) : (
                <span className="text-rose-600 flex items-center gap-1">
                  <XCircle className="w-4 h-4" /> 다시 생각해보세요.
                </span>
              )}
            </div>
          )}
        </div>

        {/* Your Thoughts Reflection */}
        <div className="space-y-2">
          <label className="block text-xs font-bold text-slate-700">
            💭 Your Thoughts: {watchData?.yourThoughtsPrompt || watchData?.yourThoughtsQuestion || watchData?.yourThoughts?.prompt || watchData?.yourThoughts?.question || ''}
          </label>
          <input
            type="text"
            value={watchThoughts}
            onChange={e => setWatchThoughts(e.target.value)}
            placeholder="자신의 경험이나 생각을 영어로 적어보세요..."
            aria-label="Your thoughts 입력"
            className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-indigo-500"
          />
          {showTeacherAnswers && (watchData?.yourThoughtsSample || watchData?.yourThoughts?.sampleAnswer) && (
            <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800">
              <b>🔑 [교사용] 교과서 예시답안 (p.152):</b> {watchData.yourThoughtsSample || watchData.yourThoughts?.sampleAnswer}
            </div>
          )}
        </div>
      </section>

      {/* B. Listen and Answer */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
        <div className="flex items-center justify-between gap-2 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">B</span>
            <h2 className="text-base font-bold text-slate-900">Listen and Answer: 핵심 회화 롤플레이</h2>
          </div>
          <button
            onClick={() => setIsRoleplayOpen(true)}
            aria-label="AI 롤플레이 회화 연습 열기"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer"
          >
            <Bot className="w-3.5 h-3.5" />
            <span>AI와 롤플레이 대화하기</span>
          </button>
        </div>

        <div className="space-y-6">
          {listenAnswerData?.dialogues?.map((dial: any, dialIdx: number) => (
            <div key={dial.id || dial.title || `dial_${dialIdx}`} className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <h3 className="font-bold text-slate-800 text-sm mb-3">{dial.title}</h3>

              <div className="space-y-2 mb-4">
                {(dial.utterances || dial.script || dial.turns || []).map((utt: any, uIdx: number) => {
                  const uId = `${dial.id || dial.title || dialIdx}_${uIdx}`;
                  const isBoy = utt.speaker === 'B' || utt.speaker?.includes('Boy');
                  const uText = utt.text || utt.en;
                  const uTrans = utt.translation || utt.ko;
                  return (
                    <div
                      key={uId}
                      onClick={() => handleSpeak(uText, uId)}
                      className={`p-2.5 rounded-lg cursor-pointer transition-all flex items-start gap-2.5 ${
                        activeUtteranceId === uId
                          ? 'bg-indigo-100 border border-indigo-300'
                          : 'bg-white hover:bg-slate-100 border border-slate-200/70'
                      }`}
                    >
                      <span className={`w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center shrink-0 ${
                        isBoy ? 'bg-blue-100 text-blue-700' : 'bg-pink-100 text-pink-700'
                      }`}>
                        {utt.speaker}
                      </span>
                      <div className="flex-1">
                        <p className="text-xs sm:text-sm font-medium text-slate-900">{uText}</p>
                        {uTrans && <p className="text-[11px] text-slate-500">{uTrans}</p>}
                      </div>
                      <Volume2 className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-1" />
                    </div>
                  );
                })}
              </div>

              {/* Single Quiz (L1 dial.quiz or L2 dial.question) */}
              {(dial.quiz || dial.question) && (
                <div className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                  <p className="font-bold text-slate-800 mb-2">Q. {dial.quiz?.question || dial.question}</p>
                  <div className="space-y-1.5">
                    {(dial.quiz?.options || dial.options || []).map((opt: any, optIdx: number) => {
                      const optLabel = typeof opt === 'string' ? opt.charAt(0) : opt.label;
                      const optText = typeof opt === 'string' ? opt : opt.text;
                      const answer = dial.quiz?.answer || dial.answer;
                      const isChosen = dialogueAnswers[dial.id] === optLabel;
                      const isCorrect = optLabel === answer || optText === answer;
                      return (
                        <button
                          key={optIdx}
                          onClick={() => setDialogueAnswers(prev => ({ ...prev, [dial.id]: optLabel }))}
                          aria-label={`선택지 ${optLabel}: ${optText}`}
                          className={`w-full text-left p-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                            isChosen
                              ? isCorrect
                                ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                : 'bg-rose-100 text-rose-900 border border-rose-300'
                              : 'hover:bg-slate-50 border border-slate-200/70 text-slate-700'
                          }`}
                        >
                          <span className="font-bold uppercase w-4">{optLabel})</span>
                          <span>{optText}</span>
                        </button>
                      );
                    })}
                  </div>
                  {showTeacherAnswers && (
                    <div className="mt-2 text-emerald-700 font-bold">
                      🔑 정답: {dial.quiz?.answer || dial.answer}
                    </div>
                  )}
                </div>
              )}

              {/* Multiple Quizzes (L2 dial.questions) */}
              {dial.questions && (
                <div className="space-y-3">
                  {dial.questions.map((q: any, qIdx: number) => (
                    <div key={q.id || qIdx} className="p-3 bg-white rounded-lg border border-slate-200 text-xs">
                      <p className="font-bold text-slate-800 mb-2">{qIdx + 1}. {q.question}</p>
                      <div className="space-y-1.5">
                        {q.options?.map((opt: any, optIdx: number) => {
                          const optLabel = typeof opt === 'string' ? opt.charAt(0) : opt.label;
                          const optText = typeof opt === 'string' ? opt : opt.text;
                          const qKey = q.id || `${dial.id}_${qIdx}`;
                          const isChosen = dialogueAnswers[qKey] === optLabel;
                          const isCorrect = optLabel === q.answer;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => setDialogueAnswers(prev => ({ ...prev, [qKey]: optLabel }))}
                              className={`w-full text-left p-2 rounded-md font-medium transition-colors flex items-center gap-2 ${
                                isChosen
                                  ? isCorrect
                                    ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                                    : 'bg-rose-100 text-rose-900 border border-rose-300'
                                  : 'hover:bg-slate-50 border border-slate-200/70 text-slate-700'
                              }`}
                            >
                              <span className="font-bold uppercase w-4">{optLabel})</span>
                              <span>{optText}</span>
                            </button>
                          );
                        })}
                      </div>
                      {showTeacherAnswers && (
                        <div className="mt-2 text-emerald-700 font-bold">
                          🔑 정답: {q.answer}
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

      {/* C. Listen and Write: L1 차트 또는 L2 빈칸 채우기 */}
      {listenWriteData && (
        <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200">
          <div className="flex items-center gap-2 mb-4">
            <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">C</span>
            <h2 className="text-base font-bold text-slate-900">
              Listen and Write: {listenWriteData.chartData ? '설문조사 차트 듣기 노트' : '대화 듣고 빈칸 채우기'}
            </h2>
          </div>

          {/* L1 Chart Mode */}
          {listenWriteData.chartData && (
            <div className="space-y-3 bg-slate-50 p-5 rounded-2xl border border-slate-200">
              <p className="text-xs text-slate-600 mb-2">
                🎧 미국 청소년 420명 대상 설문조사 대본을 듣고, 차트 빈칸에 알맞은 단어를 채워 넣으세요.
              </p>
              {(listenWriteData.chartData as any[]).map((item: any, idx: number) => (
                <div key={idx} className="bg-white p-3.5 rounded-xl border border-slate-200 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-black text-indigo-600 w-12">{item.percentage}%</span>
                    {item.isBlank ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-600 font-medium">빈칸 ({idx + 1}):</span>
                        <input
                          type="text"
                          value={chartInputs[idx] || ''}
                          onChange={e => setChartInputs(prev => ({ ...prev, [idx]: e.target.value.trim().toLowerCase() }))}
                          placeholder={item.correctWord ? `${item.correctWord[0]}...` : ''}
                          aria-label={`차트 빈칸 ${idx + 1}`}
                          className="px-2.5 py-1 text-xs border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-indigo-500 w-32"
                        />
                        {chartChecked && (
                          item.correctWord === chartInputs[idx] ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <span className="text-[11px] text-rose-600 font-bold shrink-0">오답 (정답: {item.correctWord})</span>
                          )
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold text-slate-800">{item.label}</span>
                    )}
                  </div>
                </div>
              ))}

              <div className="pt-2 flex justify-end">
                <button
                  onClick={handleCheckChart}
                  aria-label="차트 자동채점 확인"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition-colors"
                >
                  자동채점 확인
                </button>
              </div>

              {showTeacherAnswers && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
                  🔑 [교사용 정답키]: {(listenWriteData.chartData as any[]).filter((d: any) => d.hasBlank || d.isBlank).map((d: any) => d.correctWord).filter(Boolean).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* L2 Fill-in-Blanks Text Mode */}
          {listenWriteData.text && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              {listenWriteData.wordBox && (
                <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700">단어 보관함:</span>
                  {(listenWriteData.wordBox as string[]).map((w: string) => (
                    <span key={w} className="px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded-lg font-bold">
                      {w}
                    </span>
                  ))}
                </div>
              )}

              <p className="p-4 bg-white rounded-xl border border-slate-200 leading-relaxed text-slate-800 whitespace-pre-line text-xs sm:text-sm">
                {listenWriteData.text}
              </p>

              {showTeacherAnswers && listenWriteData.answers && (
                <div className="p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
                  🔑 [교사용 정답]: {(listenWriteData.answers as string[]).join(', ')}
                </div>
              )}
            </div>
          )}

          {/* L5 Myths vs. Legends Comparison Notes Mode */}
          {listenWriteData.comparisonNotes && (
            <div className="space-y-4 bg-slate-50 p-5 rounded-2xl border border-slate-200 text-xs">
              {listenWriteData.wordsBox && (
                <div className="flex flex-wrap gap-2 p-3 bg-white rounded-xl border border-slate-200">
                  <span className="font-bold text-indigo-700">단어 보관함 (Word Box):</span>
                  {(listenWriteData.wordsBox as string[]).map((w: string) => (
                    <span key={w} className="px-2.5 py-1 bg-indigo-50 text-indigo-900 rounded-lg font-bold">
                      {w}
                    </span>
                  ))}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-sm text-indigo-900 border-b pb-1">Myths (신화)</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {listenWriteData.comparisonNotes.myths.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
                <div className="p-4 bg-white rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-sm text-indigo-900 border-b pb-1">Legends (전설)</h4>
                  <ul className="list-disc pl-4 space-y-1 text-slate-700">
                    {listenWriteData.comparisonNotes.legends.map((item: string, i: number) => (
                      <li key={i}>{item}</li>
                    ))}
                  </ul>
                </div>
              </div>

              {showTeacherAnswers && listenWriteData.answers && (
                <div className="mt-3 p-3 bg-emerald-50 rounded-lg text-xs text-emerald-800 font-medium">
                  🔑 [교사용 정답]: {typeof listenWriteData.answers === 'object' && !Array.isArray(listenWriteData.answers)
                    ? Object.entries(listenWriteData.answers).map(([k, v]) => `${k}. ${v}`).join(', ')
                    : (listenWriteData.answers as string[]).join(', ')}
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {/* D. Write and Talk / Chance to Express */}
      <section className="bg-white rounded-2xl p-6 shadow-xs border border-slate-200 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <span className="w-6 h-6 rounded-lg bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">D</span>
          <h2 className="text-base font-bold text-slate-900">{writeTalkAct?.title || 'Write and Talk: Chance to Express'}</h2>
        </div>

        {/* Figures from Myths and Legends (L5) */}
        {writeTalkAct?.data?.figures && (
          <div className="space-y-3">
            <p className="text-xs text-slate-600 font-medium">자신이 좋아하는 신화나 전설 속 인물을 선택하고 친구와 이야기해보세요.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {writeTalkAct.data.figures.map((fig: any, fIdx: number) => (
                <div key={fIdx} className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                  <h4 className="font-bold text-sm text-indigo-900">{fig.name}</h4>
                  <p className="text-xs text-slate-700 mt-1">{fig.desc}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Model Dialogue */}
        {writeTalkData?.dialogueModel && (
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-2">
            <p className="font-bold text-slate-900 mb-1">대화 모델 (Dialogue Model):</p>
            <div className="p-2.5 bg-white rounded-lg border border-slate-200">
              <p className="text-indigo-900 font-semibold">A: {writeTalkData.dialogueModel.question}</p>
              <p className="text-slate-700 mt-1">B (긍정): {writeTalkData.dialogueModel.positiveAnswer}</p>
              <p className="text-slate-700 mt-0.5">B (부정): {writeTalkData.dialogueModel.negativeAnswer}</p>
            </div>
            {writeTalkData.usefulExpressions && (
              <p className="text-[11px] text-slate-500">
                * 유용한 표현: {writeTalkData.usefulExpressions.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Interactive Opinion Form */}
        <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-200 space-y-3 text-xs">
          <span className="font-bold text-indigo-950 block">당신의 의견과 이유를 작성해보세요:</span>
          <div className="flex gap-2">
            <button
              onClick={() => setTalkOpinion('useful')}
              aria-label="Opinion: useful"
              className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                talkOpinion === 'useful'
                  ? 'bg-indigo-600 text-white border-indigo-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              useful (유용함)
            </button>
            <button
              onClick={() => setTalkOpinion('harmful')}
              aria-label="Opinion: harmful"
              className={`px-3 py-1.5 rounded-lg font-bold border transition-all ${
                talkOpinion === 'harmful'
                  ? 'bg-rose-600 text-white border-rose-600'
                  : 'bg-white text-slate-700 border-slate-300'
              }`}
            >
              harmful (해로움)
            </button>
          </div>
          <input
            type="text"
            value={talkReason}
            onChange={e => setTalkReason(e.target.value)}
            placeholder="자신의 의견에 대한 구체적인 이유를 영어로 입력하세요..."
            aria-label="의견에 대한 이유 입력"
            className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white"
          />
        </div>
      </section>

      {/* AI 대화 롤플레이 모달 */}
      <RoleplayModal
        isOpen={isRoleplayOpen}
        onClose={() => setIsRoleplayOpen(false)}
        lessonNumber={lesson.lessonNumber}
        initialContext={`Lesson ${lesson.lessonNumber} Communicate Dialogue`}
      />
    </div>
  );
};
