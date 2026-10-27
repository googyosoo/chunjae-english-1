/**
 * 초경량 인라인 영단어 미니 사전 유틸리티
 * 『笑える英文法 絵本』의 <script id="dict"> 벤치마킹
 * 고교 영어I 필수 어휘 및 문법/독해 핵심 단어 뜻·품사 제공
 */

export interface WordDictEntry {
  word: string;
  pos: string; // n(명사), v(동사), adj(형용사), adv(부사), prep(전치사), conj(접속사), pron(대명사)
  meaning: string;
}

export const QUICK_DICT: Record<string, WordDictEntry> = {
  // Lesson 1: Digital Well-being & Habits
  habit: { word: 'habit', pos: 'n.', meaning: '습관, 버릇' },
  digital: { word: 'digital', pos: 'adj.', meaning: '디지털의' },
  wellbeing: { word: 'well-being', pos: 'n.', meaning: '안녕, 행복, 웰빙' },
  screen: { word: 'screen', pos: 'n.', meaning: '화면, 스크린' },
  addiction: { word: 'addiction', pos: 'n.', meaning: '중독' },
  notification: { word: 'notification', pos: 'n.', meaning: '알림, 통지' },
  distract: { word: 'distract', pos: 'v.', meaning: '주의를 딴 데로 돌리다, 산만하게 하다' },
  distraction: { word: 'distraction', pos: 'n.', meaning: '주의 산만, 집중을 방해하는 것' },
  focus: { word: 'focus', pos: 'v./n.', meaning: '집중하다, 초점' },
  balance: { word: 'balance', pos: 'n./v.', meaning: '균형, 균형을 잡다' },
  reduce: { word: 'reduce', pos: 'v.', meaning: '줄이다, 감소시키다' },
  scroll: { word: 'scroll', pos: 'v.', meaning: '스크롤하다' },
  endless: { word: 'endless', pos: 'adj.', meaning: '끝없는, 무한한' },
  constant: { word: 'constant', pos: 'adj.', meaning: '끊임없는, 일정한' },
  check: { word: 'check', pos: 'v.', meaning: '확인하다, 점검하다' },
  anxious: { word: 'anxious', pos: 'adj.', meaning: '불안한, 염려하는' },
  overcome: { word: 'overcome', pos: 'v.', meaning: '극복하다, 이겨내다' },
  mindful: { word: 'mindful', pos: 'adj.', meaning: '유념하는, 주의를 기울이는' },
  routine: { word: 'routine', pos: 'n.', meaning: '일상, 루틴' },
  healthy: { word: 'healthy', pos: 'adj.', meaning: '건강한' },
  manage: { word: 'manage', pos: 'v.', meaning: '관리하다, 해내다' },
  limit: { word: 'limit', pos: 'n./v.', meaning: '한도, 제한하다' },
  benefit: { word: 'benefit', pos: 'n./v.', meaning: '이점, 혜택을 얻다' },
  relationship: { word: 'relationship', pos: 'n.', meaning: '관계' },
  interaction: { word: 'interaction', pos: 'n.', meaning: '상호작용' },

  // Lesson 2: Upcycling & Environment
  upcycle: { word: 'upcycle', pos: 'v.', meaning: '업사이클하다 (새활용하다)' },
  recycle: { word: 'recycle', pos: 'v.', meaning: '재활용하다' },
  environment: { word: 'environment', pos: 'n.', meaning: '환경' },
  sustainable: { word: 'sustainable', pos: 'adj.', meaning: '지속 가능한' },
  waste: { word: 'waste', pos: 'n./v.', meaning: '낭비, 쓰레기, 낭비하다' },
  trash: { word: 'trash', pos: 'n.', meaning: '쓰레기' },
  resource: { word: 'resource', pos: 'n.', meaning: '자원' },
  creative: { word: 'creative', pos: 'adj.', meaning: '창의적인' },
  material: { word: 'material', pos: 'n.', meaning: '재료, 물질' },
  transform: { word: 'transform', pos: 'v.', meaning: '변형시키다, 바꾸다' },
  valuable: { word: 'valuable', pos: 'adj.', meaning: '가치 있는, 귀중한' },
  protect: { word: 'protect', pos: 'v.', meaning: '보호하다, 지키다' },
  pollution: { word: 'pollution', pos: 'n.', meaning: '오염, 공해' },
  planet: { word: 'planet', pos: 'n.', meaning: '행성, 지구' },
  future: { word: 'future', pos: 'n./adj.', meaning: '미래' },

  // Lesson 3: Culture & Communication
  culture: { word: 'culture', pos: 'n.', meaning: '문화' },
  tradition: { word: 'tradition', pos: 'n.', meaning: '전통' },
  expression: { word: 'expression', pos: 'n.', meaning: '표현, 표정' },
  communicate: { word: 'communicate', pos: 'v.', meaning: '의사소통하다, 전달하다' },
  gesture: { word: 'gesture', pos: 'n.', meaning: '몸짓, 제스처' },
  respect: { word: 'respect', pos: 'v./n.', meaning: '존중하다, 존경' },
  difference: { word: 'difference', pos: 'n.', meaning: '차이점, 다름' },
  perspective: { word: 'perspective', pos: 'n.', meaning: '관점, 시각' },
  global: { word: 'global', pos: 'adj.', meaning: '세계적인, 지구의' },
  community: { word: 'community', pos: 'n.', meaning: '공동체, 지역사회' },
  diversity: { word: 'diversity', pos: 'n.', meaning: '다양성' },

  // Lesson 4: Science & Discovery
  science: { word: 'science', pos: 'n.', meaning: '과학' },
  discover: { word: 'discover', pos: 'v.', meaning: '발견하다' },
  experiment: { word: 'experiment', pos: 'n./v.', meaning: '실험, 실험하다' },
  curiosity: { word: 'curiosity', pos: 'n.', meaning: '호기심' },
  observe: { word: 'observe', pos: 'v.', meaning: '관찰하다, 준수하다' },
  nature: { word: 'nature', pos: 'n.', meaning: '자연, 본성' },
  phenomenon: { word: 'phenomenon', pos: 'n.', meaning: '현상' },
  evidence: { word: 'evidence', pos: 'n.', meaning: '증거' },
  theory: { word: 'theory', pos: 'n.', meaning: '이론, 학설' },
  technology: { word: 'technology', pos: 'n.', meaning: '기술' },
  innovate: { word: 'innovate', pos: 'v.', meaning: '혁신하다' },
  invent: { word: 'invent', pos: 'v.', meaning: '발명하다' },

  // Lesson 5 & Special: Art, Literature & Society
  art: { word: 'art', pos: 'n.', meaning: '예술, 미술' },
  artist: { word: 'artist', pos: 'n.', meaning: '예술가, 화가' },
  masterpiece: { word: 'masterpiece', pos: 'n.', meaning: '걸작, 명작' },
  paint: { word: 'paint', pos: 'v./n.', meaning: '그리다, 페인트' },
  painting: { word: 'painting', pos: 'n.', meaning: '그림, 회화' },
  inspire: { word: 'inspire', pos: 'v.', meaning: '영감을 주다' },
  imagination: { word: 'imagination', pos: 'n.', meaning: '상상력' },
  character: { word: 'character', pos: 'n.', meaning: '등장인물, 성격, 특징' },
  portrait: { word: 'portrait', pos: 'n.', meaning: '초상화, 인물화' },
  detail: { word: 'detail', pos: 'n.', meaning: '세부사항, 디테일' },
  hidden: { word: 'hidden', pos: 'adj.', meaning: '숨겨진' },
  symbol: { word: 'symbol', pos: 'n.', meaning: '상징' },
  symbolize: { word: 'symbolize', pos: 'v.', meaning: '상징하다' },
  represent: { word: 'represent', pos: 'v.', meaning: '나타내다, 대표하다' },
  society: { word: 'society', pos: 'n.', meaning: '사회' },
  courage: { word: 'courage', pos: 'n.', meaning: '용기' },
  justice: { word: 'justice', pos: 'n.', meaning: '정의, 공정함' },
  wisdom: { word: 'wisdom', pos: 'n.', meaning: '지혜' },

  // Grammar & High-frequency Core Terms (『笑える英文法 絵本』 15개 챕터 대응)
  tense: { word: 'tense', pos: 'n.', meaning: '시제' },
  present: { word: 'present', pos: 'n./adj.', meaning: '현재, 선물, 출석한' },
  past: { word: 'past', pos: 'n./adj.', meaning: '과거, 지난' },
  perfect: { word: 'perfect', pos: 'adj.', meaning: '완벽한, 완료의' },
  passive: { word: 'passive', pos: 'adj.', meaning: '수동태의, 수동적인' },
  active: { word: 'active', pos: 'adj.', meaning: '능동태의, 활동적인' },
  relative: { word: 'relative', pos: 'adj./n.', meaning: '관계의, 친척' },
  clause: { word: 'clause', pos: 'n.', meaning: '절 (주어+동사)' },
  participle: { word: 'participle', pos: 'n.', meaning: '분사 (ing/p.p.)' },
  subjunctive: { word: 'subjunctive', pos: 'n.', meaning: '가정법' },
  conditional: { word: 'conditional', pos: 'adj.', meaning: '조건의, 조건절' },
  comparison: { word: 'comparison', pos: 'n.', meaning: '비교' },
  modal: { word: 'modal', pos: 'adj.', meaning: '조동사의 (can/must/should)' },
  infinitive: { word: 'infinitive', pos: 'n.', meaning: '부정사 (to-V)' },
  gerund: { word: 'gerund', pos: 'n.', meaning: '동명사 (-ing)' },

  // Core Verbs & Adjectives
  important: { word: 'important', pos: 'adj.', meaning: '중요한' },
  crucial: { word: 'crucial', pos: 'adj.', meaning: '중대한, 결정적인' },
  essential: { word: 'essential', pos: 'adj.', meaning: '필수적인' },
  effective: { word: 'effective', pos: 'adj.', meaning: '효과적인' },
  experience: { word: 'experience', pos: 'n./v.', meaning: '경험, 경험하다' },
  challenge: { word: 'challenge', pos: 'n./v.', meaning: '도전, 도전하다' },
  opportunity: { word: 'opportunity', pos: 'n.', meaning: '기회' },
  achieve: { word: 'achieve', pos: 'v.', meaning: '달성하다, 성취하다' },
  success: { word: 'success', pos: 'n.', meaning: '성공' },
  improve: { word: 'improve', pos: 'v.', meaning: '향상시키다, 개선하다' },
  develop: { word: 'develop', pos: 'v.', meaning: '개발하다, 발전하다' },
  create: { word: 'create', pos: 'v.', meaning: '창조하다, 만들다' },
  produce: { word: 'produce', pos: 'v.', meaning: '생산하다, 만들어내다' },
  require: { word: 'require', pos: 'v.', meaning: '요구하다, 필요로 하다' },
  suggest: { word: 'suggest', pos: 'v.', meaning: '제안하다, 암시하다' },
  encourage: { word: 'encourage', pos: 'v.', meaning: '격려하다, 권장하다' },
  participate: { word: 'participate', pos: 'v.', meaning: '참여하다, 참가하다' },
  understand: { word: 'understand', pos: 'v.', meaning: '이해하다' },
  remember: { word: 'remember', pos: 'v.', meaning: '기억하다' },
  consider: { word: 'consider', pos: 'v.', meaning: '고려하다, 여기다' },
  realize: { word: 'realize', pos: 'v.', meaning: '깨닫다, 실현하다' },
};

/**
 * 단어 원형 추출 및 사전 검색
 */
export function lookupWord(rawWord: string): WordDictEntry | null {
  if (!rawWord) return null;

  // 구두점, 따옴표 제거 및 소문자화
  const clean = rawWord.toLowerCase().replace(/[^a-z-]/g, '').trim();
  if (!clean || clean.length < 2) return null;

  // 1. 직접 매칭
  if (QUICK_DICT[clean]) return QUICK_DICT[clean];

  // 2. 복수형 / 3인칭 단수 s / es 제거
  if (clean.endsWith('ies') && clean.length > 4) {
    const candidate = clean.slice(0, -3) + 'y';
    if (QUICK_DICT[candidate]) return QUICK_DICT[candidate];
  }
  if (clean.endsWith('es') && clean.length > 3) {
    const candidate = clean.slice(0, -2);
    if (QUICK_DICT[candidate]) return QUICK_DICT[candidate];
  }
  if (clean.endsWith('s') && !clean.endsWith('ss') && clean.length > 3) {
    const candidate = clean.slice(0, -1);
    if (QUICK_DICT[candidate]) return QUICK_DICT[candidate];
  }

  // 3. 과거형 / 분사 ed 제거
  if (clean.endsWith('ed') && clean.length > 4) {
    const candidate1 = clean.slice(0, -2);
    if (QUICK_DICT[candidate1]) return QUICK_DICT[candidate1];
    const candidate2 = clean.slice(0, -1); // e로 끝나는 동사
    if (QUICK_DICT[candidate2]) return QUICK_DICT[candidate2];
  }

  // 4. 진행형 / 동명사 ing 제거
  if (clean.endsWith('ing') && clean.length > 5) {
    const candidate1 = clean.slice(0, -3);
    if (QUICK_DICT[candidate1]) return QUICK_DICT[candidate1];
    const candidate2 = clean.slice(0, -3) + 'e';
    if (QUICK_DICT[candidate2]) return QUICK_DICT[candidate2];
  }

  // 5. 부사 ly 제거
  if (clean.endsWith('ly') && clean.length > 4) {
    const candidate = clean.slice(0, -2);
    if (QUICK_DICT[candidate]) return QUICK_DICT[candidate];
  }

  return null;
}
