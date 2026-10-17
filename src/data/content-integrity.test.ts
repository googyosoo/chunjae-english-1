import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
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
});
