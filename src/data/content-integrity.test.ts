import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { LessonDataSchema } from '../schemas/lessonSchema';
import lesson1DataRaw from '../../content/lesson-01.json';

const lesson1 = lesson1DataRaw as any;

describe('교과서 PDF 원문 100% 대조 무결성 테스트 (Content Integrity Test)', () => {
  it('1. 학교명이 심인고등학교여야 한다', () => {
    expect(lesson1.school).toBe('심인고등학교');
  });

  it('2. Watch and Think 대본이 Scripts p.142 원문 그대로 축약 없이 4명(M, G1, B, G2) 발화를 포함해야 한다', () => {
    const commCorner = lesson1.corners.find((c: any) => c.id === 'communicate');
    const watchAndThink = commCorner.activities.find((a: any) => a.activityId === 'comm_watch_think').data.watchAndThink;
    
    expect(watchAndThink.script.length).toBe(4);
    expect(watchAndThink.script[0].speaker).toBe('M');
    expect(watchAndThink.script[0].en).toContain('Have you ever felt separation anxiety');
    expect(watchAndThink.script[1].speaker).toBe('G1');
    expect(watchAndThink.script[1].en).toContain('I miss my phone');
    expect(watchAndThink.script[2].speaker).toBe('B');
    expect(watchAndThink.script[2].en).toContain('Where is my phone?');
    expect(watchAndThink.script[3].speaker).toBe('G2');
    expect(watchAndThink.script[3].en).toContain('how impatient I’ve gotten');
    expect(watchAndThink.answer).toBe('impatient');
    expect(watchAndThink.youtubeUrl).toContain('-YXK2vy8Y90'); // 교과서 Sources p.169 실제 URL
  });

  it('3. Listen and Write 그래프가 46, 25, 14, 7, 13%의 5개 항목을 모두 포함해야 한다', () => {
    const commCorner = lesson1.corners.find((c: any) => c.id === 'communicate');
    const lw = commCorner.activities.find((a: any) => a.activityId === 'comm_listen_write').data.listenAndWrite;
    
    expect(lw.chartData.length).toBe(5);
    const percentages = lw.chartData.map((d: any) => d.percentage);
    expect(percentages).toEqual([46, 25, 14, 13, 7]);
    expect(lw.answerKey).toEqual(['connections', 'information', 'positive']);
  });

  it('4. Write and Talk (D 코너)가 교과서 p.11 원문으로 추가되어야 한다', () => {
    const commCorner = lesson1.corners.find((c: any) => c.id === 'communicate');
    const wt = commCorner.activities.find((a: any) => a.activityId === 'comm_write_talk');
    expect(wt).toBeDefined();
    expect(wt.data.writeAndTalk.dialogueModel.question).toBe('Do you think social media is harmful?');
  });

  it('5. Before You Read(p.12)의 Background Check 6문항과 Vocabulary Check 4문항이 원문과 일치해야 한다', () => {
    const readCorner = lesson1.corners.find((c: any) => c.id === 'read');
    const before = readCorner.activities.find((a: any) => a.activityId === 'read_before').data;
    
    expect(before.backgroundCheck.length).toBe(6);
    expect(before.backgroundCheck[0].statement).toBe('I check my phone while I eat.');
    expect(before.backgroundCheck[5].statement).toBe('I keep my eyes on my phone while walking on the street.');

    expect(before.vocabularyCheck.length).toBe(4);
    expect(before.vocabularyCheck.map((v: any) => v.answer)).toEqual(['addicted', 'remove', 'gaze', 'swayed']);
  });

  it('6. Read Further(p.21 Volunteering Online)가 추가되어야 한다', () => {
    const readCorner = lesson1.corners.find((c: any) => c.id === 'read');
    const rf = readCorner.activities.find((a: any) => a.activityId === 'read_further');
    expect(rf).toBeDefined();
    expect(rf.data.readFurther.title).toBe('Volunteering Online');
    expect(rf.data.readFurther.paragraphs.length).toBe(3);
    expect(rf.data.readFurther.paragraphs[0].text).toContain('Volunteering has a great deal of benefits');
  });

  it('7. Details T/F(p.19) 4문항과 정답이 T, F, F, T로 원문과 일치해야 한다', () => {
    const afterCorner = lesson1.corners.find((c: any) => c.id === 'after_read');
    const details = afterCorner.activities[0].data.detailsTF;
    expect(details.length).toBe(4);
    expect(details.map((d: any) => d.answer)).toEqual(['T', 'F', 'F', 'T']);
  });

  it('8. Word Uses가 reflect(a, b, c)로 원문 3문장과 일치해야 한다', () => {
    const langCorner = lesson1.corners.find((c: any) => c.id === 'language_focus');
    const wu = langCorner.activities[0].data.wordUses;
    expect(wu.word).toBe('reflect');
    expect(wu.meanings.length).toBe(3);
    expect(wu.sentences.map((s: any) => s.answer)).toEqual(['c', 'b', 'a']);
  });

  it('9. Common Phrases(p.24)가 think up, in line with, ended up 3문항이어야 한다', () => {
    const langCorner = lesson1.corners.find((c: any) => c.id === 'language_focus');
    const cp = langCorner.activities[0].data.commonPhrases;
    expect(cp.boxPhrases).toEqual(['think up', 'in line with', 'ended up']);
    expect(cp.exercises.map((e: any) => e.answer)).toEqual(['think up', 'in line with', 'ended up']);
  });

  it('10. Grammar in Context(p.25) 1·2가 전치사+관계사 및 분사구문 원문이어야 한다', () => {
    const langCorner = lesson1.corners.find((c: any) => c.id === 'language_focus');
    const g = langCorner.activities[0].data.grammarInContext;
    expect(g.part1.exercises[0].answerWords).toBe('tomatoes, with which');
    expect(g.part1.exercises[1].answerWords).toBe('cousin, with whom');
    expect(g.part2.exercises.map((e: any) => e.answer)).toEqual(['wiping', 'attracted', 'asked']);
  });

  it('11. Model Writing(p.26)이 Six Strings 기타 동아리 원문이어야 한다', () => {
    const writeCorner = lesson1.corners.find((c: any) => c.id === 'write_present');
    const mw = writeCorner.activities[0].data.writingWorkspace.modelWriting;
    expect(mw.clubName).toBe('Six Strings');
    expect(mw.headingsBox).toEqual(['Requirements', 'Inviting remarks', 'Main activities']);
  });

  it('12. Editing Practice(p.28)가 Kobe Bryant 지문이어야 한다', () => {
    const writeCorner = lesson1.corners.find((c: any) => c.id === 'write_present');
    const ep = writeCorner.activities[0].data.writingWorkspace.step4Revise.editingPractice;
    expect(ep.textWithErrors).toContain('Kobe bryant');
    expect(ep.corrections.length).toBe(6);
  });

  it('13. Go Global(p.29) 줄임말이 교과서 원문 4문항이어야 한다', () => {
    const wrapCorner = lesson1.corners.find((c: any) => c.id === 'go_global');
    const gg = wrapCorner.activities.find((a: any) => a.activityId === 'global_texting').data.goGlobal;
    expect(gg.exercises.length).toBe(4);
    expect(gg.exercises[0].answer).toBe('I’ll see you later');
    expect(gg.exercises[1].answer).toBe('Let me know');
    expect(gg.exercises[2].answer).toBe('before tonight');
    expect(gg.exercises[3].answer).toBe('I’m really hungry, too.');
  });

  describe('Lesson 2 교과서 PDF 원문 무결성 테스트', () => {
    const l2 = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../content/lesson-02.json'), 'utf-8'));

    it('1. Lesson 2 기본 정보 및 토픽 질문이 원문과 일치해야 한다', () => {
      expect(l2.lessonNumber).toBe(2);
      expect(l2.title).toBe('Spark Your Creativity');
      expect(l2.topicQuestion).toBe('How can you come up with creative ideas?');
      expect(l2.hashtags).toContain('#creativity_in_life');
    });

    it('2. Watch and Think(p.34) 대본이 Scripts pp.143-144 원문과 일치해야 한다', () => {
      const commCorner = l2.corners.find((c: any) => c.id === 'communicate');
      const wt = commCorner.activities.find((a: any) => a.activityId === 'l2_comm_watch_think').data;
      expect(wt.script[0].en).toContain('Imagine you are hungry and all you have at home is a coconut');
      expect(wt.sentence).toContain('Your brain can connect / distinguish the dots');
      expect(wt.answer).toBe('connect');
    });

    it('3. Listen and Answer(p.34) Dialogue 1과 2가 Scripts p.144 원문과 일치해야 한다', () => {
      const commCorner = l2.corners.find((c: any) => c.id === 'communicate');
      const la = commCorner.activities.find((a: any) => a.activityId === 'l2_comm_listen_answer').data;
      expect(la.dialogues[0].script[0].en).toContain('Mr. Oxman, thank you for joining our show.');
      expect(la.dialogues[0].answer).toBe('c');
      expect(la.dialogues[1].questions[0].answer).toBe('T');
      expect(la.dialogues[1].questions[1].answer).toBe('F');
    });

    it('4. 본문(pp.37-42)에 3명의 예술가(Robin Yayla, Rob Gonsalves, Vincent Bal)가 포함되어야 한다', () => {
      const readCorner = l2.corners.find((c: any) => c.id === 'read');
      const passage = readCorner.activities.find((a: any) => a.activityId === 'l2_read_passage').data;
      expect(passage.sections).toHaveLength(5);
      // 교과서 원문 표기 소제목 검증
      expect(passage.sections[1].title).toBe('Beyond the Scene');
      expect(passage.sections[3].title).toBe('Fun Shadows');
      // 본문 내 3명의 예술가 등장 검증
      expect(passage.sections[1].sentences.some((s: any) => s.en.includes('Robin Yayla'))).toBe(true);
      expect(passage.sections[2].sentences.some((s: any) => s.en.includes('Rob Gonsalves'))).toBe(true);
      expect(passage.sections[3].sentences.some((s: any) => s.en.includes('Vincent Bal'))).toBe(true);
    });

    it('5. Read Further(p.45)에 Su Blackwell 본문 및 질문이 포함되어야 한다', () => {
      const readCorner = l2.corners.find((c: any) => c.id === 'read');
      const rf = readCorner.activities.find((a: any) => a.activityId === 'l2_read_further').data;
      expect(rf.author).toBe('Su Blackwell');
      expect(rf.sentences[0].en).toBe('I became a book artist almost by accident.');
    });

    it('6. Work Together(p.53) 코너가 정상 구성되어야 한다', () => {
      const wtCorner = l2.corners.find((c: any) => c.id === 'work_together');
      expect(wtCorner).toBeDefined();
      const project = wtCorner.activities[0].data;
      expect(project.steps).toHaveLength(4);
      expect(project.steps[1].dialogue[2].en).toContain('patbingsu');
    });
  });

  describe('Lesson 3 교과서 PDF 원문 무결성 테스트', () => {
    const l3 = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../content/lesson-03.json'), 'utf-8'));

    it('1. Lesson 3 기본 정보 및 토픽 질문이 원문과 일치해야 한다', () => {
      expect(l3.lessonNumber).toBe(3);
      expect(l3.title).toBe('Healthy Plate, Healthy Planet');
      expect(l3.topicQuestion).toBe('How can we make our food culture sustainable?');
      expect(l3.hashtags).toContain('#food_culture');
      expect(l3.hashtags).toContain('#future_foods');
      expect(l3.hashtags).toContain('#vertical_farming');
      expect(l3.hashtags).toContain('#eco-friendly_recipes');
    });

    it('2. Watch and Think(p.58) 대본과 DW Documentary 출처가 일치해야 한다', () => {
      const commCorner = l3.corners.find((c: any) => c.id === 'communicate');
      const wt = commCorner.activities.find((a: any) => a.activityId === 'l3_comm_watch_think').data.watchAndThink;
      expect(wt.youtubeUrl).toBe('https://www.dw.com/en/food-for-everyone-farming-in-the-future/video-63543942');
      expect(wt.script[0].en).toBe('We need to feed more and more people globally.');
      expect(wt.script[3].en).toBe("It's time to switch to sustainable farming practices and new food sources.");
      expect(wt.answer).toBe('sustainable');
    });

    it('3. Listen and Answer(p.58) Dialogue 1과 2가 Scripts p.146 원문과 일치해야 한다', () => {
      const commCorner = l3.corners.find((c: any) => c.id === 'communicate');
      const la = commCorner.activities.find((a: any) => a.activityId === 'l3_comm_listen_answer').data.listenAndAnswer;
      expect(la.dialogues[0].script[0].en).toContain('I need something sweet.');
      expect(la.dialogues[0].quiz.answer).toBe('c');
      expect(la.dialogues[1].script[0].en).toContain("What's in My Dish?");
      expect(la.dialogues[1].quiz.answer).toBe('(ⓑ) very different from → similar to');
    });

    it('4. Before You Read(p.60)의 Background Check 4종과 Vocabulary Check 4문항이 일치해야 한다', () => {
      const readCorner = l3.corners.find((c: any) => c.id === 'read');
      const before = readCorner.activities.find((a: any) => a.activityId === 'l3_read_before').data.readBefore;
      expect(before.backgroundCheck[0].options).toHaveLength(4);
      expect(before.backgroundCheck[0].figureNote).toContain('교과서 60쪽 음식 사진 4종');
      expect(before.vocabularyCheck.map((v: any) => v.answer)).toEqual(['accelerate', 'conventional', 'convert', 'habitat']);
    });

    it('5. 본문(pp.61-66) 5개 섹션 및 미래 식량 4종(배양육, 곤충, 3D 프린팅, 조류)이 일치해야 한다', () => {
      const readCorner = l3.corners.find((c: any) => c.id === 'read');
      const viewer = readCorner.activities.find((a: any) => a.activityId === 'l3_read_main').data.readingViewer;
      expect(viewer.sections).toHaveLength(5);
      expect(viewer.sections[0].titleEn).toBe('Introduction & Environmental Impact');
      expect(viewer.sections[1].titleEn).toBe('Lab-grown Meat');
      expect(viewer.sections[2].titleEn).toBe('Insects');
      expect(viewer.sections[3].titleEn).toBe('3D Printed Food');
      expect(viewer.sections[4].titleEn).toBe('Algae');
      // 그림/도표 쪽수 안내 확인 (이미지 태그 미사용)
      expect(viewer.sections[0].figureNote).toContain('교과서 62쪽 식품 1kg당 온실가스 배출량 차트 참고');
      expect(viewer.sections[1].figureNote).toContain('교과서 63쪽 배양육 생산 과정 그림');
    });

    it('6. Read Further(p.69) Indoor Vertical Farming 본문이 원문과 일치해야 한다', () => {
      const readCorner = l3.corners.find((c: any) => c.id === 'read');
      const rf = readCorner.activities.find((a: any) => a.activityId === 'l3_read_further').data.readFurther;
      expect(rf.titleEn).toBe('No Sunlight, No Soil - Indoor Vertical Farming');
      expect(rf.paragraphs[0].sentences[0].en).toBe('Perfectly shaped tomatoes grow under purple lighting.');
      expect(rf.marginalQuestion.answer).toContain('Green peppers and strawberries');
    });

    it('7. Share Your Thoughts(pp.70-71) 푸드 업사이클링 및 유튜브 URL이 일치해야 한다', () => {
      const stCorner = l3.corners.find((c: any) => c.id === 'share_thoughts');
      const step1 = stCorner.activities.find((a: any) => a.activityId === 'l3_share_step1').data.step1;
      expect(step1.video.youtubeUrl).toBe('https://www.youtube.com/watch?v=fCl0-lMsCxc');
      expect(step1.quiz.answer).toBe('c');
      expect(step1.reviewFillIn.boxWords).toEqual(['reduce', 'waste', 'upcycled']);
    });

    it('8. Go Global(p.77) 및 Wrap Up(p.78) 친환경 레시피와 총괄 평가가 일치해야 한다', () => {
      const ggCorner = l3.corners.find((c: any) => c.id === 'go_global');
      const recipesAct = ggCorner.activities.find((a: any) => a.activityId === 'l3_go_global_recipes').data.goGlobal;
      expect(recipesAct.recipes).toHaveLength(3);
      expect(recipesAct.recipes[0].name).toBe('Bibimbap with Crispy Tofu');
      expect(recipesAct.recipes[1].name).toBe('Vegan Burritos');
      expect(recipesAct.recipes[2].name).toBe('Spring Rolls');

      const wrapUpAct = ggCorner.activities.find((a: any) => a.activityId === 'l3_wrap_up_activities').data;
      expect(wrapUpAct.partA.answer).toBe('c. watermelon juice');
      expect(wrapUpAct.partC.quiz1.answer).toBe('a');
      expect(wrapUpAct.partC.quiz2.answer).toContain('benefits of algae as a source of food');
    });
  });

  describe('Lesson 4 교과서 PDF 원문 무결성 테스트', () => {
    const l4 = JSON.parse(fs.readFileSync(path.resolve(__dirname, '../../content/lesson-04.json'), 'utf-8'));

    it('1. Lesson 4 기본 정보 및 토픽 질문이 원문과 일치해야 한다', () => {
      expect(l4.lessonNumber).toBe(4);
      expect(l4.title).toBe('Amazing Animals Around Us');
      expect(l4.topicQuestion).toBe('How do we coexist with animals around us?');
      expect(l4.hashtags).toContain('#biodiversity');
      expect(l4.hashtags).toContain('#migratory_birds');
      expect(l4.hashtags).toContain('#animal_habitats');
      expect(l4.hashtags).toContain('#coexistence');
    });

    it('2. Watch and Think(p.82) 대본과 비디오 출처가 일치해야 한다', () => {
      const commCorner = l4.corners.find((c: any) => c.id === 'communicate');
      const wt = commCorner.activities.find((a: any) => a.activityId === 'l4_comm_watch_think').data;
      expect(wt.videoScript[0].en).toContain('Earth is full of life');
      expect(wt.quiz.answer).toBe('depends on');
    });

    it('3. Listen and Answer(pp.82-83) Dialogue 1과 2가 Scripts pp.147-148 원문과 일치해야 한다', () => {
      const commCorner = l4.corners.find((c: any) => c.id === 'communicate');
      const la = commCorner.activities.find((a: any) => a.activityId === 'l4_comm_listen_answer').data.listenAndAnswer;
      expect(la.dialogues[0].script[0].en).toContain('did you watch the nature documentary');
      expect(la.dialogues[0].quiz.answer).toBe('c');
      expect(la.dialogues[1].script[0].en).toContain('I saw a huge bird on my way to school.');
      expect(la.dialogues[1].quiz.answer).toBe('b');
    });

    it('4. Before You Read(p.84)의 Background Check 기사와 Vocabulary Check 4문항이 일치해야 한다', () => {
      const readCorner = l4.corners.find((c: any) => c.id === 'read');
      const before = readCorner.activities.find((a: any) => a.activityId === 'l4_read_before').data;
      expect(before.backgroundCheck.headline).toContain('Young Bar-tailed Godwit');
      expect(before.vocabularyCheck.wordsBox).toEqual(['preserve', 'countless', 'predators', 'migrate']);
      expect(before.vocabularyCheck.items.map((i: any) => i.answer)).toEqual(['migrate', 'predators', 'countless', 'preserve']);
    });

    it('5. 본문(pp.85-90) 인터뷰 대담 6개 섹션(Scott Weidensaul) 및 여백 질문 10문항이 일치해야 한다', () => {
      const readCorner = l4.corners.find((c: any) => c.id === 'read');
      const viewer = readCorner.activities.find((a: any) => a.activityId === 'l4_read_main').data;
      expect(viewer.titleEn).toBe('A World on the Wing');
      expect(viewer.sections).toHaveLength(6);
      expect(viewer.sections[0].page).toBe(85);
      expect(viewer.sections[1].page).toBe(86);
      expect(viewer.sections[2].page).toBe(87);
      expect(viewer.sections[3].page).toBe(88);
      expect(viewer.sections[4].page).toBe(89);
      expect(viewer.sections[5].page).toBe(90);

      // 본문 내 핵심 과학 사실(반구 수면, 폭식, 황해 갯벌) 검증
      expect(viewer.sections[2].sentences.some((s: any) => s.en.includes('half-brain sleep'))).toBe(true);
      expect(viewer.sections[3].sentences.some((s: any) => s.en.includes('binge feeding'))).toBe(true);
      expect(viewer.sections[4].sentences.some((s: any) => s.en.includes('Yellow Sea mudflats'))).toBe(true);

      // 여백 질문 10문항(Q1~Q10) 전수 검증
      const allQuestions = viewer.sections.flatMap((s: any) => s.questions || []);
      expect(allQuestions.length).toBeGreaterThanOrEqual(10);
      expect(allQuestions[0].id).toBe('q1');
    });

    it('6. Read Further(p.93) Hamsters in Urban Areas 본문이 원문과 일치해야 한다', () => {
      const stCorner = l4.corners.find((c: any) => c.id === 'share_thoughts');
      const rf = stCorner.activities.find((a: any) => a.activityId === 'l4_share_read_further').data;
      expect(rf.articleTitle).toBe('Hamsters in Urban Areas');
      expect(rf.text).toContain('Vienna');
      expect(rf.sampleAnswer).toContain('Pigeons');
    });

    it('7. Share Your Thoughts(p.94) 유리창 충돌 방지 및 BBC 출처가 일치해야 한다', () => {
      const stCorner = l4.corners.find((c: any) => c.id === 'share_thoughts');
      const step1 = stCorner.activities.find((a: any) => a.activityId === 'l4_share_step1_video').data.step1;
      expect(step1.video.sourceCitation).toContain('BBC');
      expect(step1.quiz.answer).toBe('b');
      expect(step1.reviewFillIn.boxWords).toEqual(['glass', 'markings', 'reflections', 'sunshades']);
    });

    it('8. Work Together & Wrap Up(pp.101-103) 인포그래픽 프로젝트 및 총괄 평가가 일치해야 한다', () => {
      const wtCorner = l4.corners.find((c: any) => c.id === 'work_together');
      expect(wtCorner).toBeDefined();
      const infogAct = wtCorner.activities.find((a: any) => a.activityId === 'l4_work_together_project').data;
      expect(infogAct.projectTitle).toContain('Infographic');
      expect(infogAct.steps).toHaveLength(4);

      const wrapUpAct = wtCorner.activities.find((a: any) => a.activityId === 'l4_wrap_up_activities').data;
      expect(wrapUpAct.partA.answer).toBe('b');
      expect(wrapUpAct.partC.questions[0].answer).toBe('b');
      expect(wrapUpAct.partC.questions[1].answers).toContain('realize the value of the mudflats');
    });
  });

  describe('Lesson 5: Ancient Worlds of Imagination 교과서 무결성 전수 검증', () => {
    let l5: any;

    beforeAll(() => {
      const p = path.resolve(__dirname, '../../content/lesson-05.json');
      const raw = fs.readFileSync(p, 'utf-8');
      l5 = JSON.parse(raw);
    });

    it('1. LessonDataSchema Zod 런타임 스키마 검증을 100% 통과해야 한다', () => {
      const res = LessonDataSchema.safeParse(l5);
      expect(res.success).toBe(true);
      if (!res.success) {
        console.error('L5 Zod Errors:', res.error.issues);
      }
      expect(l5.lessonNumber).toBe(5);
      expect(l5.title).toBe('Ancient Worlds of Imagination');
      expect(l5.topic).toBe('Culture & Myths');
      expect(l5.topicQuestion).toBe('How do ancient myths relate to us?');
      expect(l5.pageRange).toBe('pp. 104-127');
      expect(l5.corners).toHaveLength(8);
    });

    it('2. Watch and Think(p.106) 이카로스 영상 및 선택지가 일치해야 한다', () => {
      const commCorner = l5.corners.find((c: any) => c.id === 'communicate');
      const wt = commCorner.activities.find((a: any) => a.activityId === 'l5_comm_watch_think').data;
      expect(wt.answer).toBe('the sun melted the wax on his wings');
      expect(wt.yourThoughts.sampleAnswer).toBe('We should be aware of our limitations.');
      expect(wt.videoScript[0].en).toContain('Daedalus and his son Icarus');
    });

    it('3. Listen and Answer(p.106) Dialogue 1과 2가 Scripts p.150 원문과 일치해야 한다', () => {
      const commCorner = l5.corners.find((c: any) => c.id === 'communicate');
      const la = commCorner.activities.find((a: any) => a.activityId === 'l5_comm_listen_answer').data;
      expect(la.dialogues[0].turns[2].en).toContain('Achilles’ heel');
      expect(la.dialogues[0].quiz.answer).toBe('c');
      expect(la.dialogues[1].turns[1].en).toContain('Thor’s day');
      expect(la.dialogues[1].quiz.answer).toContain('travel back to the past -> fly');
    });

    it('4. Before You Read(p.108) Background Check 및 Vocabulary Check 4문항이 일치해야 한다', () => {
      const readCorner = l5.corners.find((c: any) => c.id === 'read');
      const before = readCorner.activities.find((a: any) => a.activityId === 'l5_read_before').data;
      expect(before.backgroundCheck.paintingTitle).toBe('Peter Paul Rubens, Jupiter and Mercury with Philemon and Baucis');
      expect(before.backgroundCheck.characters).toHaveLength(4);
      expect(before.vocabularyCheck.items.map((v: any) => v.answer)).toEqual(['cottage', 'wandering', 'immortals', 'approval']);
    });

    it('5. 본문(pp.109-114) Baucis and Philemon 6개 섹션 및 Q1~Q13이 일치해야 한다', () => {
      const readCorner = l5.corners.find((c: any) => c.id === 'read');
      const viewer = readCorner.activities.find((a: any) => a.activityId === 'l5_read_main').data;
      expect(viewer.sections).toHaveLength(6);
      expect(viewer.sections[0].page).toBe(109);
      expect(viewer.sections[1].page).toBe(110);
      expect(viewer.sections[2].page).toBe(111);
      expect(viewer.sections[3].page).toBe(112);
      expect(viewer.sections[4].page).toBe(113);
      expect(viewer.sections[5].page).toBe(114);

      // 본문 핵심 문장 검증 (마법의 사발, 두 그루의 얽힌 나무)
      const sec2Sentences = viewer.sections[2].paragraphs.flatMap((p: any) => p.sentences);
      const sec5Sentences = viewer.sections[5].paragraphs.flatMap((p: any) => p.sentences);
      expect(sec2Sentences.some((s: any) => s.en.includes('as if it had never been touched before'))).toBe(true);
      expect(sec5Sentences.some((s: any) => s.en.includes('branches intertwined'))).toBe(true);

      // 여백 질문 13문항(Q1~Q13) 전수 검증
      const allQuestions = viewer.sections.flatMap((s: any) => s.questions || []);
      expect(allQuestions).toHaveLength(13);
      expect(allQuestions[0].num).toBe('Q1');
      expect(allQuestions[12].num).toBe('Q13');
    });

    it('6. After You Read(pp.115-116) 사건 순서 배열(4-5-2-3)과 대명사 지칭 추론이 일치해야 한다', () => {
      const afterCorner = l5.corners.find((c: any) => c.id === 'after_read');
      const summary = afterCorner.activities.find((a: any) => a.activityId === 'l5_after_summary').data;
      expect(summary.correctOrder).toBe('4-5-2-3');

      const details = afterCorner.activities.find((a: any) => a.activityId === 'l5_after_details').data;
      expect(details.items.map((it: any) => it.answer)).toEqual(['T', 'T', 'F', 'F']);

      const skill = afterCorner.activities.find((a: any) => a.activityId === 'l5_after_reading_skill').data;
      expect(skill.questions.map((q: any) => q.answer)).toEqual(['Echo', 'Narcissus', 'Narcissus', 'he and his love']);
    });

    it('7. Share Your Thoughts(pp.117-119) Sun Mythology 및 Midas Touch 표현이 일치해야 한다', () => {
      const stCorner = l5.corners.find((c: any) => c.id === 'share_thoughts');
      const rf = stCorner.activities.find((a: any) => a.activityId === 'l5_share_read_further').data;
      expect(rf.title).toBe('Sun Mythology');
      expect(rf.paragraphs[1]).toContain('Inti');
      expect(rf.sampleAnswer).toContain('Vietnamese mythology');

      const expr = stCorner.activities.find((a: any) => a.activityId === 'l5_share_expressions').data;
      expect(expr.step1Video.quiz.answer).toBe('a');
      expect(expr.step1Video.fillInBlanks.answers).toEqual(['solid gold', 'make money', 'success']);
      expect(expr.step2Articles[0].expression).toBe('Pandora’s box');
      expect(expr.step2Articles[1].expression).toBe('a narcissist');
    });

    it('8. Go Global & Wrap Up(pp.125-127) 현대 미디어 신화 3편 및 총괄 평가가 일치해야 한다', () => {
      const ggCorner = l5.corners.find((c: any) => c.id === 'go_global');
      expect(ggCorner).toBeDefined();

      const mediaAct = ggCorner.activities.find((a: any) => a.activityId === 'l5_go_global_media').data.goGlobal;
      expect(mediaAct.mediaList).toHaveLength(3);
      expect(mediaAct.mediaList[0].title).toBe('Guardian (2016)');
      expect(mediaAct.mediaList[1].title).toBe('Song of the Sea (2016)');
      expect(mediaAct.mediaList[2].title).toBe('Beowulf (2007)');

      const wrapUpAct = ggCorner.activities.find((a: any) => a.activityId === 'l5_wrap_up_activities').data;
      expect(wrapUpAct.partA.answer).toBe('a');
      expect(wrapUpAct.partC.quiz1.answer).toBe('b');
      expect(wrapUpAct.partC.quiz2.answer).toBe('it had never been touched before');
    });
  });
});
