#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Special Lesson (Music and Everything Else) JSON Builder
교과서 원문 pp. 128-139, Answers p.163, Words p.167, Sources p.171 대조 기반 무결성 구축
"""

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUTPUT_FILE = ROOT / "content" / "special-lesson.json"

data = {
  "lessonNumber": 6,
  "title": "Music and Everything Else",
  "topic": "Music Math Ecology",
  "topicQuestion": "Think of where music can be used. What role do you think music plays in each area?",
  "hashtags": [
    "#music_and_something_else",
    "#pi_song",
    "#sharks_and_BGM"
  ],
  "pageRange": "pp. 128-139",
  "school": "심인고등학교",
  "vocabulary": [
    {"word": "arrangement", "meaning": "편곡, 배열", "pos": "n.", "page": 133},
    {"word": "assistant", "meaning": "조수의, 보조의", "pos": "adj.", "page": 137},
    {"word": "atmospheric", "meaning": "분위기의, 대기의", "pos": "adj.", "page": 137},
    {"word": "block", "meaning": "덩어리, 구획", "pos": "n.", "page": 133},
    {"word": "boost", "meaning": "북돋우다, 증진하다", "pos": "v.", "page": 138},
    {"word": "calculate", "meaning": "계산하다", "pos": "v.", "page": 132},
    {"word": "celebrate", "meaning": "기념하다, 축하하다", "pos": "v.", "page": 132},
    {"word": "cheery", "meaning": "명랑한, 쾌활한", "pos": "adj.", "page": 136},
    {"word": "circular", "meaning": "원형의, 순환하는", "pos": "adj.", "page": 132},
    {"word": "cite", "meaning": "인용하다, 출처를 대다", "pos": "v.", "page": 138},
    {"word": "coast", "meaning": "해안", "pos": "n.", "page": 134},
    {"word": "consideration", "meaning": "고려, 숙고", "pos": "n.", "page": 133},
    {"word": "coordinated", "meaning": "조율된, 조화된", "pos": "adj.", "page": 139},
    {"word": "deck", "meaning": "(카드의) 한 벌", "pos": "n.", "page": 133},
    {"word": "demonize", "meaning": "악마화하다", "pos": "v.", "page": 134},
    {"word": "demonstration", "meaning": "시연, 증명", "pos": "n.", "page": 131},
    {"word": "depression", "meaning": "우울증", "pos": "n.", "page": 138},
    {"word": "digit", "meaning": "숫자, 자릿수", "pos": "n.", "page": 132},
    {"word": "discount", "meaning": "할인", "pos": "n.", "page": 132},
    {"word": "distract", "meaning": "마음을 딴 데로 돌리다", "pos": "v.", "page": 130},
    {"word": "donate", "meaning": "기부하다", "pos": "v.", "page": 134},
    {"word": "ecologically", "meaning": "생태학적으로", "pos": "adv.", "page": 137},
    {"word": "exceed", "meaning": "초과하다", "pos": "v.", "page": 134},
    {"word": "exceptional", "meaning": "이례적인, 뛰어난", "pos": "adj.", "page": 132},
    {"word": "factor", "meaning": "요인, 인자", "pos": "n.", "page": 137},
    {"word": "famed", "meaning": "유명한", "pos": "adj.", "page": 132},
    {"word": "fin", "meaning": "지느러미", "pos": "n.", "page": 135},
    {"word": "general", "meaning": "일반적인", "pos": "adj.", "page": 137},
    {"word": "harmlessly", "meaning": "무해하게", "pos": "adv.", "page": 136},
    {"word": "haunting", "meaning": "뇌리에서 떠나지 않는", "pos": "adj.", "page": 135},
    {"word": "indeed", "meaning": "정말로, 참으로", "pos": "adv.", "page": 136},
    {"word": "individualize", "meaning": "개별화하다", "pos": "v.", "page": 138},
    {"word": "instrument", "meaning": "악기, 도구", "pos": "n.", "page": 138},
    {"word": "invariably", "meaning": "변함없이, 언제나", "pos": "adv.", "page": 135},
    {"word": "irrational", "meaning": "비이성적인", "pos": "adj.", "page": 134},
    {"word": "jaw", "meaning": "턱", "pos": "n.", "page": 134},
    {"word": "likelihood", "meaning": "가능성", "pos": "n.", "page": 135},
    {"word": "lyric", "meaning": "가사, 노랫말", "pos": "n.", "page": 138},
    {"word": "marketing", "meaning": "마케팅", "pos": "n.", "page": 137},
    {"word": "memorize", "meaning": "암기하다", "pos": "v.", "page": 133},
    {"word": "minor", "meaning": "단조의, 작은", "pos": "adj.", "page": 133},
    {"word": "mood", "meaning": "기분, 분위기", "pos": "n.", "page": 139},
    {"word": "ominous", "meaning": "불길한", "pos": "adj.", "page": 134},
    {"word": "outcome", "meaning": "결과", "pos": "n.", "page": 137},
    {"word": "participant", "meaning": "참가자", "pos": "n.", "page": 136},
    {"word": "physicist", "meaning": "물리학자", "pos": "n.", "page": 132},
    {"word": "precision", "meaning": "정밀성, 정확도", "pos": "n.", "page": 131},
    {"word": "professional", "meaning": "전문적인", "pos": "adj.", "page": 138},
    {"word": "pull off", "meaning": "해내다, 성사시키다", "pos": "phr.", "page": 131},
    {"word": "quote", "meaning": "인용구, 인용하다", "pos": "n.", "page": 130},
    {"word": "randomly", "meaning": "무작위로", "pos": "adv.", "page": 133},
    {"word": "rebound", "meaning": "회복, 반등", "pos": "n.", "page": 134},
    {"word": "recognizable", "meaning": "알아볼 수 있는", "pos": "adj.", "page": 135},
    {"word": "recruit", "meaning": "모집하다", "pos": "v.", "page": 136},
    {"word": "release", "meaning": "발매, 공개, 출시", "pos": "n.", "page": 131},
    {"word": "researcher", "meaning": "연구원", "pos": "n.", "page": 135},
    {"word": "shark", "meaning": "상어", "pos": "n.", "page": 134},
    {"word": "sharply", "meaning": "급격하게", "pos": "adv.", "page": 134},
    {"word": "silence", "meaning": "침묵, 고요", "pos": "n.", "page": 136},
    {"word": "soundtrack", "meaning": "사운드트랙, 영화음악", "pos": "n.", "page": 135},
    {"word": "specific", "meaning": "구체적인, 특정한", "pos": "adj.", "page": 131},
    {"word": "subject", "meaning": "피험자, 실험 대상자", "pos": "n.", "page": 136},
    {"word": "succeed", "meaning": "성공하다", "pos": "v.", "page": 131},
    {"word": "summit", "meaning": "정상, 꼭대기", "pos": "n.", "page": 131},
    {"word": "symbol", "meaning": "기호, 상징", "pos": "n.", "page": 133},
    {"word": "take a front seat", "meaning": "중요한 역할을 하다", "pos": "phr.", "page": 131},
    {"word": "talent", "meaning": "재능", "pos": "n.", "page": 133},
    {"word": "tempt", "meaning": "유혹하다", "pos": "v.", "page": 137},
    {"word": "terrorize", "meaning": "공포에 빠뜨리다", "pos": "v.", "page": 134},
    {"word": "theme", "meaning": "주제곡, 테마", "pos": "n.", "page": 135},
    {"word": "therapy", "meaning": "치료, 요법", "pos": "n.", "page": 130},
    {"word": "tone", "meaning": "음조, 음색", "pos": "n.", "page": 133},
    {"word": "trillion", "meaning": "1조", "pos": "n.", "page": 132},
    {"word": "unforgettable", "meaning": "잊을 수 없는", "pos": "adj.", "page": 135},
    {"word": "when it comes to", "meaning": "~에 관한 한", "pos": "phr.", "page": 131}
  ],
  "corners": [
    {
      "id": "introduction",
      "cornerNumber": 1,
      "titleKo": "도입 및 배경 지식",
      "titleEn": "Before You Read",
      "pageRange": "pp. 130-131",
      "priority": "P1",
      "activities": [
        {
          "activityId": "spec_intro_quotes",
          "type": "before_you_read",
          "title": "A. Background Check: Quotes & Roles of Music",
          "page": 130,
          "sourceRef": "Textbook p. 130",
          "data": {
            "figureNote": "교과서 p.130의 음악 인용문과 활용 영역을 보세요",
            "pageRef": 130,
            "instruction": "Read the quotes about music and think about what they might mean.",
            "quotes": [
              {
                "author": "Bono",
                "quote": "Music can change the world because it can change people.",
                "ko": "음악은 사람들을 변화시킬 수 있기 때문에 세상을 변화시킬 수 있다."
              },
              {
                "author": "Paulo Coelho",
                "quote": "Music isn't just something that comforts or distracts us, it goes beyond that - it's an ideology.",
                "ko": "음악은 우리를 위로하거나 주의를 돌려주는 것에 그치지 않고, 그 이상으로 나아간다. 그것은 하나의 이데올로기이다."
              },
              {
                "author": "Confucius",
                "quote": "Music produces a kind of pleasure which human nature cannot do without.",
                "ko": "음악은 인간 본성이 없이는 살 수 없는 일종의 즐거움을 만들어 낸다."
              }
            ],
            "discussionPrompt": "Think of where music can be used. What role do you think music plays in each area? Talk about it with classmates.",
            "areas": [
              "entertainment",
              "exercise",
              "education",
              "social events",
              "therapy",
              "films",
              "advertising"
            ],
            "topicQuestion": "Think of where music can be used. What role do you think music plays in each area?",
            "topicSampleAnswer": "음악은 치료(therapy)에서 스트레스를 해소하고, 영화(films)와 광고(advertising)에서 감정을 형성하며 대중의 태도에 깊은 영향을 미칩니다.",
            "lessonFlow": [
              {
                "step": "1",
                "cornerTitle": "Before You Read: Quotes & Vocab",
                "page": "pp. 130-131"
              },
              {
                "step": "2",
                "cornerTitle": "Read 1: Music & Math (Pi Song)",
                "page": "pp. 132-133"
              },
              {
                "step": "3",
                "cornerTitle": "Read 2: Music & Nature (Sharks & BGM)",
                "page": "pp. 134-137"
              },
              {
                "step": "4",
                "cornerTitle": "Work Together: Making a Video",
                "page": "pp. 138-139"
              }
            ]
          }
        },
        {
          "activityId": "spec_intro_vocab",
          "type": "vocabulary_check",
          "title": "B. Vocabulary Check",
          "page": 131,
          "sourceRef": "Textbook p. 131, Answers p. 163",
          "data": {
            "figureNote": "교과서 p.131의 어휘 및 숙어 빈칸 채우기를 보세요",
            "pageRef": 131,
            "instruction": "Fill in the blanks with the words from the box.",
            "boxWords": [
              "demonstration",
              "precision",
              "release",
              "ominous"
            ],
            "items": [
              {
                "num": 1,
                "sentence": "Making a watch requires great [blank].",
                "answer": "precision",
                "ko": "시계를 제작하는 것은 고도의 정밀성을 요구한다."
              },
              {
                "num": 2,
                "sentence": "He gave me a(n) [blank] of how to use the camera.",
                "answer": "demonstration",
                "ko": "그는 나에게 카메라 사용법에 대한 시연을 보여주었다."
              },
              {
                "num": 3,
                "sentence": "The weather remained [blank] with dark clouds rolling in, pushed by an increasing wind.",
                "answer": "ominous",
                "ko": "거세지는 바람에 밀려 먹구름이 몰려오면서 날씨는 불길한 상태를 유지했다."
              },
              {
                "num": 4,
                "sentence": "The [blank] of his new book is scheduled for next month.",
                "answer": "release",
                "ko": "그의 신간 발매는 다음 달로 예정되어 있다."
              }
            ],
            "phrasesInstruction": "Fill in the blanks with the phrases below. Change the forms if necessary.",
            "boxPhrases": [
              "pull off",
              "when it comes to",
              "take a front seat"
            ],
            "phraseItems": [
              {
                "num": 1,
                "sentence": "Last year, the explorers [blank] the dream of making the final climb to the summit.",
                "answer": "pulled off",
                "ko": "작년에 탐험가들은 정상으로 향하는 마지막 등반의 꿈을 성사시켰다."
              },
              {
                "num": 2,
                "sentence": "We are approaching an age where making food production more sustainable will [blank].",
                "answer": "take a front seat",
                "ko": "우리는 식량 생산을 더욱 지속 가능하게 만드는 것이 중요한 역할을 맡게 될 시대에 다가가고 있다."
              },
              {
                "num": 3,
                "sentence": "[blank] keeping a conversation going and staying in touch, use email or social media.",
                "answer": "When it comes to",
                "ko": "대화를 이어가고 연락을 유지하는 것에 관한 한 이메일이나 소셜 미디어를 사용하라."
              }
            ]
          }
        }
      ]
    },
    {
      "id": "read",
      "cornerNumber": 2,
      "titleKo": "본문 1: 음악과 수학",
      "titleEn": "Read 1: Music & Math",
      "pageRange": "pp. 132-133",
      "priority": "P1",
      "activities": [
        {
          "activityId": "spec_read1_main",
          "type": "reading_viewer",
          "title": "If the Mathematical Constant Pi Was a Song, What Would It Sound Like?",
          "page": 132,
          "pageRange": "pp. 132-133",
          "sourceRef": "Textbook pp. 132-133, Sources p. 171",
          "data": {
            "figureNote": "교과서 pp.132-133의 원주율(π)과 Lullapi 작곡 과정을 보세요",
            "pageRef": "132-133",
            "sections": [
              {
                "sectionId": "spec_read1_sec1",
                "page": 132,
                "heading": "If the Mathematical Constant Pi Was a Song, What Would It Sound Like?",
                "figureNote": "교과서 p.132의 원주율(π) 행성과 피자 일러스트를 보세요",
                "paragraphs": [
                  {
                    "paraId": "p132_1",
                    "sentences": [
                      {
                        "id": "s_132_1",
                        "en": "Everyone should remember the number represented by the Greek symbol π from middle school.",
                        "ko": "모든 사람은 중학교 때 배운 그리스 문자 π로 표현되는 숫자를 기억할 것이다."
                      },
                      {
                        "id": "s_132_2",
                        "en": "Pi(π) shows up everywhere in mathematics.",
                        "ko": "원주율(π)은 수학의 도처에서 나타난다."
                      },
                      {
                        "id": "s_132_3",
                        "en": "Pi also shows up in our lives and in nature where there is a circular shape, such as in planets and DNA.",
                        "ko": "원주율은 또한 행성과 DNA에서처럼 원형 모양이 존재하는 우리 삶과 자연 속에서도 나타난다."
                      },
                      {
                        "id": "s_132_4",
                        "en": "In fact, humans have known about the existence of pi for at least the past 4,000 years.",
                        "ko": "사실 인류는 적어도 지난 4,000년 동안 원주율의 존재에 대해 알고 있었다."
                      },
                      {
                        "id": "s_132_5",
                        "en": "However, in the past few hundred years, there have been efforts to increase the precision of the calculations of the digits of pi.",
                        "ko": "그러나 지난 수백 년 동안 원주율 자릿수 계산의 정밀성을 높이려는 노력들이 있어 왔다."
                      },
                      {
                        "id": "s_132_6",
                        "en": "In 2022, it was calculated to 100 trillion digits.",
                        "ko": "2022년에는 100조 자리까지 계산되었다."
                      }
                    ]
                  },
                  {
                    "paraId": "p132_2",
                    "sentences": [
                      {
                        "id": "s_132_7",
                        "en": "This endless number is typically rounded down to 3.14.",
                        "ko": "이 끝없는 숫자는 일반적으로 3.14로 반올림(절사)된다."
                      },
                      {
                        "id": "s_132_8",
                        "en": "This is why March 14 became the annual holiday honoring this exceptional number.",
                        "ko": "이것이 바로 3월 14일이 이 특별한 숫자를 기념하는 연례 기념일이 된 이유이다."
                      },
                      {
                        "id": "s_132_9",
                        "en": "The date also happens to be famed physicist Albert Einstein's birthday and marks the anniversary of Stephen Hawking's death.",
                        "ko": "그 날짜는 공교롭게도 유명한 물리학자 알베르트 아인슈타인의 생일이자 스티븐 호킹의 기일을 나타내기도 한다."
                      },
                      {
                        "id": "s_132_10",
                        "en": "While the day is really about math, many restaurants offer deals and discounts on circular food items, including pizza and traditional pies, to celebrate the holiday.",
                        "ko": "그날은 본래 수학에 관한 날이지만 많은 식당들이 그 기념일을 축하하기 위해 피자와 전통 파이를 포함한 원형 음식에 대한 특가와 할인을 제공한다."
                      }
                    ]
                  }
                ]
              },
              {
                "sectionId": "spec_read1_sec2",
                "page": 133,
                "heading": "Lullapi (룰라파이)",
                "figureNote": "교과서 p.133의 악보와 피아노 연주 일러스트를 보세요",
                "paragraphs": [
                  {
                    "paraId": "p133_1",
                    "sentences": [
                      {
                        "id": "s_133_1",
                        "en": "As if celebrating the number with a holiday were not enough, there have been contests to try to memorize its endless sequence of digits that never repeat.",
                        "ko": "기념일로 그 숫자를 축하하는 것만으로는 충분하지 않다는 듯이, 결코 반복되지 않는 끝없는 자릿수 순서를 암기하려는 대회들이 열려 왔다."
                      },
                      {
                        "id": "s_133_2",
                        "en": "Devin Powell was once challenged to a pi digit memorizing contest.",
                        "ko": "데빈 파월은 언젠가 원주율 자릿수 암기 대회에 도전장을 내밀었다."
                      },
                      {
                        "id": "s_133_3",
                        "en": "A few years before that, he had covered the World Memory Championship as a reporter and watched someone memorize a randomly ordered deck of cards in less than 19 seconds.",
                        "ko": "그 몇 년 전, 그는 기자로서 세계 기억력 대회를 취재하며 누군가가 무작위로 섞인 카드 한 벌을 19초도 안 되어 외우는 것을 목격했다."
                      },
                      {
                        "id": "s_133_4",
                        "en": "Powell spent a lot of time talking to people about how they pulled off these seemingly impossible demonstrations of memory.",
                        "ko": "파월은 겉보기에는 불가능해 보이는 이러한 기억력의 시연을 그들이 어떻게 성공시켰는지에 대해 사람들과 이야기하는 데 많은 시간을 보냈다."
                      },
                      {
                        "id": "s_133_5",
                        "en": "He learned that it was not really due to some kind of natural talent for memorizing things, but some skills of using associations.",
                        "ko": "그는 그것이 기억에 대한 타고난 재능 덕분이라기보다는 연상을 활용하는 몇 가지 기술 덕분이라는 것을 알게 되었다."
                      }
                    ]
                  },
                  {
                    "paraId": "p133_2",
                    "sentences": [
                      {
                        "id": "s_133_6",
                        "en": "He tried to get to 50 digits.",
                        "ko": "그는 50자리까지 외우려고 시도했다."
                      },
                      {
                        "id": "s_133_7",
                        "en": "After careful consideration, he decided to associate the digits with music.",
                        "ko": "심사숙고 끝에 그는 그 숫자들을 음악과 연관 짓기로 결정했다."
                      },
                      {
                        "id": "s_133_8",
                        "en": "He mapped the numbers to the notes on the musical scale; the bigger the number, the higher up on the scale it went.",
                        "ko": "그는 숫자들을 음계의 음표들에 대응시켰는데, 숫자가 클수록 음계의 더 높은 곳으로 올라갔다."
                      },
                      {
                        "id": "s_133_9",
                        "en": "At first, he was only going to have these tones in his head so that he could memorize the digits, but as he mapped the very first five digits, he found that it sounded really nice, like a lullaby.",
                        "ko": "처음에는 숫자를 외우기 위해 머릿속으로만 이 음조들을 떠올리려고 했지만, 맨 처음 다섯 자리를 음표로 바꾸었을 때 자장가처럼 소리가 정말 훌륭하게 들린다는 것을 발견했다."
                      }
                    ]
                  },
                  {
                    "paraId": "p133_3",
                    "sentences": [
                      {
                        "id": "s_133_10",
                        "en": "He sat down at the piano and started to play with that, which allowed him to identify the phrases that sounded really neat.",
                        "ko": "그는 피아노 앞에 앉아 그것을 연주하기 시작했고, 이를 통해 소리가 정말 깔끔하게 들리는 악구들을 찾아낼 수 있었다."
                      },
                      {
                        "id": "s_133_11",
                        "en": "He tried some parts in a major key and some in a minor key, playing with different arrangements of blocks from pi.",
                        "ko": "그는 원주율에서 가져온 덩어리들의 다양한 배열을 가지고 연주하며 어떤 부분은 장조로, 어떤 부분은 단조로 시도해 보았다."
                      },
                      {
                        "id": "s_133_12",
                        "en": "He ended up calling it Lullapi.",
                        "ko": "그는 결국 그것을 Lullapi(룰라파이)라고 부르게 되었다."
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "id": "after_read",
      "cornerNumber": 3,
      "titleKo": "본문 2: 음악과 생태",
      "titleEn": "Read 2: Music & Nature",
      "pageRange": "pp. 134-137",
      "priority": "P1",
      "activities": [
        {
          "activityId": "spec_read2_main",
          "type": "reading_viewer",
          "title": "Ominous Background Music Is Bad for Sharks",
          "page": 134,
          "pageRange": "pp. 134-137",
          "sourceRef": "Textbook pp. 134-137, Sources p. 171",
          "data": {
            "figureNote": "교과서 pp.134-137의 상어 다큐멘터리와 영화 배경음악 실험 연구를 보세요",
            "pageRef": "134-137",
            "sections": [
              {
                "sectionId": "spec_read2_sec1",
                "page": 134,
                "heading": "Ominous Background Music Is Bad for Sharks",
                "figureNote": "교과서 p.134의 바닷속 상어와 수영하는 사람들의 그림을 보세요",
                "paragraphs": [
                  {
                    "paraId": "p134_1",
                    "sentences": [
                      {
                        "id": "s_134_1",
                        "en": "According to environmental conservationists, some 100 million sharks are killed every year, far exceeding the average rebound rate for many shark populations.",
                        "ko": "환경 보호론자들에 따르면 많은 상어 개체군의 평균 회복률을 훨씬 초과하여 매년 약 1억 마리의 상어가 죽임을 당하고 있다."
                      },
                      {
                        "id": "s_134_2",
                        "en": "This number has risen sharply ever since the release of the 1975 movie Jaws, in which an enormous great white shark terrorizes a resort island off the coast of Massachusetts.",
                        "ko": "이 수치는 거대한 백상아리가 매사추세츠 해안의 휴양지 섬을 공포에 빠뜨리는 1975년 영화 죠스가 개봉된 이래로 급격히 증가했다."
                      },
                      {
                        "id": "s_134_3",
                        "en": "Sharks have been demonized on screen for decades, as in Finding Nemo, Sharknado, 47 Meters Down, and many others.",
                        "ko": "상어는 '니모를 찾아서', '샤크네이도', '47미터' 그리고 수많은 다른 영화에서처럼 수십 년 동안 스크린에서 악마화되어 왔다."
                      }
                    ]
                  },
                  {
                    "paraId": "p134_2",
                    "sentences": [
                      {
                        "id": "s_134_4",
                        "en": "In addition to the development of an irrational fear of sharks, it has been suggested that people are less likely to support and donate money toward conserving sharks than other marine animals or even other predators, despite a strong need to maintain a healthy shark population for a balanced ecosystem.",
                        "ko": "상어에 대한 비이성적인 공포감의 형성 외에도, 균형 잡힌 생태계를 위해 건강한 상어 개체군을 유지해야 할 절실한 필요성에도 불구하고 사람들이 다른 해양 동물이나 심지어 다른 포식자보다 상어 보존을 지지하고 돈을 기부할 가능성이 더 낮다는 점이 지적되어 왔다."
                      },
                      {
                        "id": "s_134_5",
                        "en": "Why do we have such a hard time helping sharks but don't have similar problems when it comes to helping tigers?",
                        "ko": "왜 우리는 상어를 돕는 데는 그렇게 큰 어려움을 겪으면서 호랑이를 돕는 일에 있어서는 비슷한 문제를 겪지 않는 것일까?"
                      },
                      {
                        "id": "s_134_6",
                        "en": "What really influences our fear of sharks?",
                        "ko": "상어에 대한 우리의 두려움에 진정으로 영향을 미치는 것은 무엇일까?"
                      }
                    ]
                  }
                ]
              },
              {
                "sectionId": "spec_read2_sec2",
                "page": 135,
                "heading": "John Williams and Jaws (존 윌리엄스와 죠스 테마)",
                "figureNote": "교과서 p.135의 상어 지느러미와 존 윌리엄스의 악보를 보세요",
                "paragraphs": [
                  {
                    "paraId": "p135_1",
                    "sentences": [
                      {
                        "id": "s_135_1",
                        "en": "Some researchers propose that the background music in movies about sharks can negatively influence viewers' perceptions of sharks and the likelihood of them supporting related conservation efforts.",
                        "ko": "일부 연구원들은 상어에 관한 영화의 배경음악이 시청자들의 상어에 대한 인식과 관련 보존 활동을 지원할 가능성에 부정적인 영향을 미칠 수 있다고 제안한다."
                      },
                      {
                        "id": "s_135_2",
                        "en": "Why are sharks associated with scary music so often?",
                        "ko": "상어는 왜 그렇게 자주 무서운 음악과 연관되는 것일까?"
                      },
                      {
                        "id": "s_135_3",
                        "en": "Thank the brilliant composer John Williams, who wrote the score for Jaws, which won him an Academy Award.",
                        "ko": "영화 죠스의 음악을 작곡하여 아카데미상을 수상한 뛰어난 작곡가 존 윌리엄스 덕분이다."
                      },
                      {
                        "id": "s_135_4",
                        "en": "It is one of the most recognizable and influential scores of all time.",
                        "ko": "그것은 역사상 가장 쉽게 알아볼 수 있고 영향력 있는 영화 음악 중 하나이다."
                      },
                      {
                        "id": "s_135_5",
                        "en": "In modern pop culture, great white sharks are invariably tied to the movie's main theme, a simple alternating pattern of two notes: Dahh-na.",
                        "ko": "현대 대중문화에서 백상아리는 영화의 메인 테마인 두 음의 단순한 교차 패턴과 변함없이 결부되어 있다: 다-나."
                      },
                      {
                        "id": "s_135_6",
                        "en": "Dahh-na.",
                        "ko": "다-나."
                      },
                      {
                        "id": "s_135_7",
                        "en": "Dah-na dah-na dah-na!",
                        "ko": "다-나 다-나 다-나!"
                      },
                      {
                        "id": "s_135_8",
                        "en": "The unforgettable two notes of the Jaws soundtrack immediately bring to our minds haunting images of a shark's fin and swimmers' legs underwater.",
                        "ko": "죠스 사운드트랙의 잊을 수 없는 두 음은 상어의 지느러미와 물속 수영객들의 다리라는 뇌리에서 떠나지 않는 이미지를 우리 마음에 즉각 떠올리게 한다."
                      },
                      {
                        "id": "s_135_9",
                        "en": "Unlike Hollywood films, documentaries tend to show sharks in their natural habitats.",
                        "ko": "할리우드 영화와 달리 다큐멘터리는 자연 서식지에 있는 상어를 보여주는 경향이 있다."
                      },
                      {
                        "id": "s_135_10",
                        "en": "These documentaries may also fuel fear, due to the dark background music that is often associated with sharks.",
                        "ko": "이러한 다큐멘터리들 역시 상어와 종종 연관되는 어두운 배경음악으로 인해 공포를 부채질할 수 있다."
                      }
                    ]
                  }
                ]
              },
              {
                "sectionId": "spec_read2_sec3",
                "page": 136,
                "heading": "2,181 Participants (다큐멘터리 실험)",
                "figureNote": "교과서 p.136의 다큐멘터리 시청 실험 그룹 도표를 보세요",
                "paragraphs": [
                  {
                    "paraId": "p136_1",
                    "sentences": [
                      {
                        "id": "s_136_1",
                        "en": "In a series of experiments, the researchers found that music indeed has the power to influence public opinions about sharks.",
                        "ko": "일련의 실험에서 연구진은 음악이 실제로 상어에 대한 대중의 여론에 영향을 미치는 힘을 가지고 있다는 것을 발견했다."
                      },
                      {
                        "id": "s_136_2",
                        "en": "To measure the effect of scary music in shark documentaries, the researchers recruited 2,181 participants to watch a clip from a documentary, which featured sharks swimming around harmlessly, not eating anything.",
                        "ko": "상어 다큐멘터리에서 무서운 음악의 효과를 측정하기 위해 연구진은 2,181명의 참가자를 모집하여 아무것도 먹지 않고 무해하게 헤엄치는 상어가 등장하는 다큐멘터리 클립을 시청하게 했다."
                      },
                      {
                        "id": "s_136_3",
                        "en": "Some participants watched the clip with the music that originally accompanied the shark scenes in the documentary, a track called Sharks, which was considered ominous by an independent music expert.",
                        "ko": "일부 참가자들은 다큐멘터리 속 상어 장면에 원래 수록되었던 음악인, 독립적인 음악 전문가에 의해 불길하다고 평가된 'Sharks'라는 트랙과 함께 그 클립을 시청했다."
                      },
                      {
                        "id": "s_136_4",
                        "en": "Other participants watched the same clip accompanied by cheery background music.",
                        "ko": "다른 참가자들은 명랑한 배경음악이 곁들여진 동일한 클립을 시청했다."
                      },
                      {
                        "id": "s_136_5",
                        "en": "A third set of participants watched the clip with no music at all.",
                        "ko": "세 번째 참가자 집단은 음악이 전혀 없는 상태로 클립을 시청했다."
                      },
                      {
                        "id": "s_136_6",
                        "en": "After watching the clips, all the participants were asked to describe their attitudes toward sharks.",
                        "ko": "클립을 시청한 후 모든 참가자들은 상어에 대한 자신의 태도를 서술하도록 요청받았다."
                      },
                      {
                        "id": "s_136_7",
                        "en": "The results showed that participants who viewed the video with its original ominous music reported more negative attitudes toward sharks than those who viewed the same scenes set to cheery music or silence.",
                        "ko": "결과는 원래의 불길한 음악과 함께 영상을 본 참가자들이 명랑한 음악이나 무음으로 설정된 동일한 장면을 본 참가자들보다 상어에 대해 더 부정적인 태도를 보고했음을 보여주었다."
                      }
                    ]
                  },
                  {
                    "paraId": "p136_2",
                    "sentences": [
                      {
                        "id": "s_136_8",
                        "en": "Moreover, they determined that these negative attitudes were not simply due to the music alone, but rather the combination of the video and audio.",
                        "ko": "더욱이 그들은 이러한 부정적인 태도가 단순히 음악 자체 때문만이 아니라 영상과 오디오의 결합 때문이라는 것을 밝혀냈다."
                      },
                      {
                        "id": "s_136_9",
                        "en": "In a separate set of experiments, the subjects were asked to either listen to scary or cheery music, or sit in silence, without watching anything.",
                        "ko": "별도의 일련의 실험에서 피험자들은 아무것도 보지 않은 채 무서운 음악이나 명랑한 음악을 듣거나 침묵 속에 앉아 있도록 요청받았다."
                      },
                      {
                        "id": "s_136_10",
                        "en": "It turned out that there was no effect on the attitudes toward sharks among these subjects.",
                        "ko": "이 피험자들 사이에서는 상어에 대한 태도에 아무런 영향이 없는 것으로 나타났다."
                      }
                    ]
                  }
                ]
              },
              {
                "sectionId": "spec_read2_sec4",
                "page": 137,
                "heading": "Conservation & Marketing (생태 보존과 마케팅 효과)",
                "figureNote": "교과서 p.137의 Andrew Nosal 교수와 Elizabeth Keenan 교수의 인터뷰를 보세요",
                "paragraphs": [
                  {
                    "paraId": "p137_1",
                    "sentences": [
                      {
                        "id": "s_137_1",
                        "en": "The study also looked at how public attitudes toward sharks can affect efforts to save them.",
                        "ko": "그 연구는 또한 상어에 대한 대중의 태도가 상어를 구하려는 노력에 어떤 영향을 미칠 수 있는지 살펴보았다."
                      },
                      {
                        "id": "s_137_2",
                        "en": "“By highlighting that ominous background music is associated with negative attitudes toward sharks, we hope to start a conversation about ways we can improve public perception of these ecologically important animals,” says Andrew P. Nosal, an associate professor of biology at Point Loma Nazarene University.",
                        "ko": "\"불길한 배경음악이 상어에 대한 부정적인 태도와 결부되어 있다는 점을 강조함으로써, 우리는 생태학적으로 중요한 이 동물들에 대한 대중의 인식을 개선할 수 있는 방법에 대한 대화를 시작하기를 희망합니다.\"라고 포인트 로마 나사렛 대학교의 생물학 부교수인 Andrew P. Nosal은 말한다."
                      }
                    ]
                  },
                  {
                    "paraId": "p137_2",
                    "sentences": [
                      {
                        "id": "s_137_3",
                        "en": "Elizabeth Keenan, an assistant professor in the Marketing unit of Harvard Business School, says that negative public opinions about sharks continue to harm conservation efforts, which they are in desperate need of.",
                        "ko": "하버드 경영대학원 마케팅 부서의 조교수인 Elizabeth Keenan은 상어에 대한 부정적인 여론이 상어들에게 절실히 필요한 보존 노력에 계속해서 해를 끼치고 있다고 말한다."
                      },
                      {
                        "id": "s_137_4",
                        "en": "“Any organization that intends to positively promote sharks or any other creature should carefully consider the soundtracks they choose,” says Keenan.",
                        "ko": "\"상어나 다른 어떤 생명체를 긍정적으로 홍보하고자 하는 단체는 자신이 선택하는 사운드트랙을 신중하게 고려해야 합니다.\"라고 Keenan은 말한다."
                      },
                      {
                        "id": "s_137_5",
                        "en": "“While it may be tempting to include ominous soundtracks for entertainment value, for instance, our research shows there is a potential cost to doing so.”",
                        "ko": "\"예를 들어 오락적 가치를 위해 불길한 사운드트랙을 포함하고 싶은 유혹이 들 수 있지만, 우리의 연구는 그렇게 하는 데 잠재적인 대가가 따른다는 것을 보여줍니다.\""
                      }
                    ]
                  },
                  {
                    "paraId": "p137_3",
                    "sentences": [
                      {
                        "id": "s_137_6",
                        "en": "While this study focuses on sharks, the findings provide a general lesson about the marketing power of background music, which may well take a front seat toward influencing consumer choices.",
                        "ko": "이 연구는 상어에 초점을 맞추고 있지만, 그 결과는 소비자 선택에 영향을 미치는 데 있어 중요한 역할을 할 수도 있는 배경음악의 마케팅적 영향력에 대한 전반적인 교훈을 제공한다."
                      },
                      {
                        "id": "s_137_7",
                        "en": "“Atmospheric factors such as background music are known to affect consumers’ preferences,” says Keenan.",
                        "ko": "\"배경음악과 같은 분위기적 요인은 소비자의 선호도에 영향을 미치는 것으로 알려져 있습니다.\"라고 Keenan은 말한다."
                      },
                      {
                        "id": "s_137_8",
                        "en": "“The key lies in determining whether these factors are influencing consumers in ways that are in line with companies’ intended outcomes.”",
                        "ko": "\"핵심은 이러한 요인들이 기업의 의도된 결과와 일치하는 방식으로 소비자에게 영향을 미치고 있는지를 판단하는 데 있습니다.\""
                      }
                    ]
                  }
                ]
              }
            ]
          }
        }
      ]
    },
    {
      "id": "work_together",
      "cornerNumber": 4,
      "titleKo": "모둠 협동 프로젝트",
      "titleEn": "Work Together",
      "pageRange": "pp. 138-139",
      "priority": "P1",
      "activities": [
        {
          "activityId": "spec_work_together_p138",
          "type": "project_step",
          "title": "Making a Video About Music & Something Else: Step 1 & 2",
          "page": 138,
          "sourceRef": "Textbook p. 138",
          "data": {
            "figureNote": "교과서 p.138의 음악 치료(music therapy) 주제 조사와 4인 모둠 대화를 보세요",
            "pageRef": 138,
            "projectTitle": "Making a Video About Music & Something Else",
            "instruction": "As a group of four, pick one topic that is related to music and brainstorm about the topic with your classmates. Research the topic you picked to make an informative video. Be sure to cite your sources when searching for information.",
            "steps": [
              {
                "step": 1,
                "title": "Pick a Topic & Brainstorm",
                "titleKo": "주제 선정 및 브레인스토밍",
                "desc": "As a group of four, pick one topic that is related to music and brainstorm about the topic with your classmates.",
                "example": "Topic: music therapy"
              },
              {
                "step": 2,
                "title": "Research the Topic",
                "titleKo": "선정된 주제 심층 조사",
                "desc": "Research the topic you picked to make an informative video. Be sure to cite your sources when searching for information."
              }
            ],
            "dialogue": [
              {
                "speaker": "A",
                "en": "I want to research therapy related to music. Have you ever heard about music therapy?",
                "ko": "음악과 관련된 치료에 대해 조사하고 싶어. 음악 치료에 대해 들어본 적 있니?"
              },
              {
                "speaker": "B",
                "en": "I don't exactly know about music therapy. But sometimes I listen to music when I can't sleep. It relieves my mind. Maybe this is related to music therapy.",
                "ko": "음악 치료에 대해 정확히는 몰라. 하지만 잠이 안 올 때 가끔 음악을 들어. 마음이 편안해지거든. 아마 이것도 음악 치료와 관련이 있을 거야."
              },
              {
                "speaker": "C",
                "en": "That could be. I also get help from piano music when my mind is distracted. And many people get some medical help from music. I'm going to do some research on professional aspects of music therapy.",
                "ko": "그럴 수도 있겠다. 나도 마음이 산만할 때 피아노 음악에서 도움을 받아. 그리고 많은 사람들이 음악을 통해 의학적인 도움을 얻기도 해. 나는 음악 치료의 전문적인 측면에 대해 조사해 볼게."
              },
              {
                "speaker": "D",
                "en": "Okay, let's find some information about music therapy.",
                "ko": "좋아, 음악 치료에 대한 정보를 함께 찾아보자."
              }
            ],
            "researchQA": [
              {
                "qNum": 1,
                "question": "What is music therapy?",
                "answer": "the clinical use of music to accomplish individualized goals such as reducing stress and improving mood",
                "ko": "음악 치료란 무엇인가? 스트레스 감소 및 기분 개선과 같이 개별화된 목표를 달성하기 위한 음악의 임상적 사용"
              },
              {
                "qNum": 2,
                "question": "What happens during a music therapy session?",
                "answer": "create music / sing music / listen to music / move to music / discuss lyrics / play an instrument",
                "ko": "음악 치료 세션 중에는 무슨 일이 일어나는가? 음악 창작 / 노래 부르기 / 음악 감상 / 음악에 맞춰 움직이기 / 가사 토론 / 악기 연주"
              },
              {
                "qNum": 3,
                "question": "What are the potential benefits of music therapy?",
                "answer": "helps you relax / helps you explore your emotions / reduces anxiety or depression / eases your stress levels / boosts your confidence",
                "ko": "음악 치료의 잠재적 이점은 무엇인가? 휴식을 돕고 감정을 탐색하며 불안이나 우울을 줄이고 스트레스 수준을 완화하며 자신감을 북돋운다"
              }
            ]
          }
        },
        {
          "activityId": "spec_work_together_p139",
          "type": "project_step",
          "title": "Making a Video About Music & Something Else: Step 3 & 4",
          "page": 139,
          "sourceRef": "Textbook p. 139",
          "data": {
            "figureNote": "교과서 p.139의 스토리보드 3장면 구성과 학생 감상평을 보세요",
            "pageRef": 139,
            "instruction": "Make a storyboard for the video. Make and share your video. Leave your comments on other groups' videos.",
            "steps": [
              {
                "step": 3,
                "title": "Make a Storyboard",
                "titleKo": "스토리보드 제작",
                "desc": "Make a storyboard for the video."
              },
              {
                "step": 4,
                "title": "Share Video & Leave Comments",
                "titleKo": "영상 공유 및 상호 감상평",
                "desc": "Make and share your video. Leave your comments on other groups' videos."
              }
            ],
            "storyboard": [
              {
                "scene": "#1",
                "time": "1 min",
                "figureNote": "교과서 p.139의 스토리보드 1번 장면 그림을 보세요",
                "heading": "What is music therapy?",
                "script": "the clinical use of music to accomplish individualized goals such as reducing stress and improving mood"
              },
              {
                "scene": "#2",
                "time": "3 min",
                "figureNote": "교과서 p.139의 스토리보드 2번 장면 그림을 보세요",
                "heading": "What happens during music therapy?",
                "script": "Create music: You might compose music or write lyrics. Listen to music: Enjoy the sound and lyrics. Move to music: It can be as simple as tapping your feet or as complicated as a coordinated dance."
              },
              {
                "scene": "#3",
                "time": "3 min",
                "figureNote": "교과서 p.139의 스토리보드 3번 장면 그림을 보세요",
                "heading": "What are the potential benefits of music therapy?",
                "script": "Music is often linked to moods, and certain songs can make individuals feel diverse emotions such as happy, calm, energetic, or relaxed."
              }
            ],
            "comments": [
              {
                "student": "Sujin",
                "comment": "Interesting! After watching your video, I realized that music therapy is deeply related to my life."
              },
              {
                "student": "Wonjun",
                "comment": "Quite funny! I learned that singing songs and dancing to music can be the ways of using music therapy."
              }
            ],
            "checkPoint": [
              {
                "num": 1,
                "statement": "My group made an interesting and original video."
              },
              {
                "num": 2,
                "statement": "I participated in the project actively."
              },
              {
                "num": 3,
                "statement": "I watched other group's videos carefully."
              }
            ]
          }
        }
      ]
    }
  ]
}

OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
OUTPUT_FILE.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
print(f"✅ Generated: {OUTPUT_FILE} (size: {len(json.dumps(data, ensure_ascii=False))} bytes)")
