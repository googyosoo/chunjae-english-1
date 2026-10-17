import json, os, re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

# 교과서 원문 텍스트 로드
with open(ROOT / 'tmp/lesson3_raw.json', 'r', encoding='utf-8') as f:
    raw = json.load(f)

lesson3_data = {
  "lessonNumber": 3,
  "title": "Healthy Plate, Healthy Planet",
  "topic": "Environment & Food",
  "topicQuestion": "How can we make our food culture sustainable?",
  "hashtags": [
    "#food_culture",
    "#future_foods",
    "#vertical_farming",
    "#eco-friendly_recipes"
  ],
  "pageRange": "pp. 56-79",
  "school": "심인고등학교",
  "corners": [
    {
      "id": "introduction",
      "cornerNumber": 1,
      "titleKo": "단원 도입 & 토픽 질문",
      "titleEn": "Introduction",
      "pageRange": "pp. 56-57",
      "priority": "P1",
      "activities": [
        {
          "activityId": "l3_intro_topic_question",
          "type": "topic_reflection",
          "title": "Topic Question 사전·사후 성찰",
          "page": 56,
          "sourceRef": "Textbook p. 56 & p. 79",
          "data": {
            "topicQuestion": "How can we make our food culture sustainable?",
            "topicSampleAnswer": "We can reduce real meat consumption, change our diets, and upcycle food.",
            "hashtags": [
              "#food_culture",
              "#future_foods",
              "#vertical_farming",
              "#eco-friendly_recipes"
            ],
            "lessonFlow": [
              {
                "step": "1",
                "cornerTitle": "Communicate on Topic: Sustainable Food Culture",
                "page": "pp. 58-59"
              },
              {
                "step": "2",
                "cornerTitle": "Before You Read: Background & Vocabulary Check",
                "page": "p. 60"
              },
              {
                "step": "3",
                "cornerTitle": "Read: The Future of Food & Read Further",
                "page": "pp. 61-66, 69"
              },
              {
                "step": "4",
                "cornerTitle": "After You Read: Summary & Details",
                "page": "pp. 67-68"
              },
              {
                "step": "5",
                "cornerTitle": "Share Your Thoughts: Food Upcycling",
                "page": "pp. 70-71"
              },
              {
                "step": "6",
                "cornerTitle": "Language Focus: Word Uses & Grammar in Context",
                "page": "pp. 72-73"
              },
              {
                "step": "7",
                "cornerTitle": "Write & Present: Proposing Eco-friendly School Meals",
                "page": "pp. 74-76"
              },
              {
                "step": "8",
                "cornerTitle": "Go Global: Eco-friendly Recipes & Wrap Up",
                "page": "pp. 77-79"
              }
            ]
          }
        }
      ]
    },
    {
      "id": "communicate",
      "cornerNumber": 2,
      "titleKo": "듣기·말하기",
      "titleEn": "Communicate on Topic",
      "pageRange": "pp. 58-59",
      "priority": "P1",
      "activities": [
        {
          "activityId": "l3_comm_watch_think",
          "type": "watch_and_think",
          "title": "A. Watch and Think (영상 시청 & 핵심어 선택)",
          "page": 58,
          "sourceRef": "Textbook p. 58, Scripts p. 146, Sources p. 169",
          "data": {
            "watchAndThink": {
              "videoTitle": "Food for everyone - Farming in the future",
              "youtubeUrl": "https://www.dw.com/en/food-for-everyone-farming-in-the-future/video-63543942",
              "sourceCitation": "DW Documentary, Food for everyone - Farming in the future, 2022 (p. 169)",
              "script": [
                {
                  "id": "l3_wt_1",
                  "speaker": "M",
                  "en": "We need to feed more and more people globally.",
                  "ko": "우리는 전 세계적으로 점점 더 많은 사람들을 먹여 살려야 합니다."
                },
                {
                  "id": "l3_wt_2",
                  "speaker": "M",
                  "en": "But intensive farming is a big threat to the environment and the human race.",
                  "ko": "하지만 집약적 농업은 환경과 인류에게 큰 위협입니다."
                },
                {
                  "id": "l3_wt_3",
                  "speaker": "M",
                  "en": "If we keep using traditional farming practices, by the year 2050, we will need an additional land area as large as the size of Brazil.",
                  "ko": "우리가 전통적인 농업 관행을 계속 유지한다면, 2050년까지 브라질 크기만 한 추가적인 토지가 필요할 것입니다."
                },
                {
                  "id": "l3_wt_4",
                  "speaker": "M",
                  "en": "It's time to switch to sustainable farming practices and new food sources.",
                  "ko": "이제 지속 가능한 농업 관행과 새로운 식량원으로 전환해야 할 때입니다."
                },
                {
                  "id": "l3_wt_5",
                  "speaker": "M",
                  "en": "If we want to support the global food chain, we need to find various alternative food sources.",
                  "ko": "우리가 전 세계 식량 사슬을 지탱하고자 한다면, 다양한 대체 식량원을 찾아야 합니다."
                },
                {
                  "id": "l3_wt_6",
                  "speaker": "M",
                  "en": "What food will we eat in the future?",
                  "ko": "우리는 미래에 어떤 음식을 먹게 될까요?"
                }
              ],
              "checkQuestion": "Watch the video and choose the right word.",
              "statement": "We need to switch to intensive / sustainable farming practices and new food sources for the environment and our survival.",
              "options": [
                "intensive",
                "sustainable"
              ],
              "answer": "sustainable",
              "yourThoughtsQuestion": "What could be an alternative food source in the future?",
              "yourThoughtsSample": "Insects could be an alternative food source in the future."
            }
          }
        },
        {
          "activityId": "l3_comm_listen_answer",
          "type": "listen_and_answer",
          "title": "B. Listen and Answer (대화 듣기 및 사실 확인)",
          "page": 58,
          "sourceRef": "Textbook p. 58, Scripts p. 146, Answers p. 157",
          "data": {
            "listenAndAnswer": {
              "dialogues": [
                {
                  "id": "l3_d1",
                  "title": "Dialogue 1",
                  "script": [
                    {
                      "id": "l3_d1_1",
                      "speaker": "B",
                      "en": "I need something sweet. I think I'll have some chocolate.",
                      "ko": "단 게 좀 필요해. 초콜릿을 좀 먹어야겠어."
                    },
                    {
                      "id": "l3_d1_2",
                      "speaker": "G",
                      "en": "You're a huge chocolate lover, aren't you?",
                      "ko": "너 정말 초콜릿 좋아하는구나, 그렇지 않니?"
                    },
                    {
                      "id": "l3_d1_3",
                      "speaker": "B",
                      "en": "You can say that again. I can't imagine my life without chocolate.",
                      "ko": "네 말이 맞아. 초콜릿 없는 내 삶은 상상할 수 없어."
                    },
                    {
                      "id": "l3_d1_4",
                      "speaker": "G",
                      "en": "I see, but did you know that you might not be able to have it in the future?",
                      "ko": "그렇구나, 하지만 미래에는 초콜릿을 먹지 못할 수도 있다는 거 알고 있었니?"
                    },
                    {
                      "id": "l3_d1_5",
                      "speaker": "B",
                      "en": "What are you talking about?",
                      "ko": "무슨 소리야?"
                    },
                    {
                      "id": "l3_d1_6",
                      "speaker": "G",
                      "en": "Because of global warming, some foods are endangered, and believe it or not, chocolate is one of them.",
                      "ko": "지구 온난화 때문에 몇몇 음식들이 멸종 위기에 처해 있고, 믿기 어렵겠지만 초콜릿도 그중 하나야."
                    },
                    {
                      "id": "l3_d1_7",
                      "speaker": "B",
                      "en": "What? No way! I had no idea that global warming would affect my life so much.",
                      "ko": "뭐라고? 말도 안 돼! 지구 온난화가 내 삶에 이렇게 큰 영향을 미칠 줄은 전혀 몰랐어."
                    },
                    {
                      "id": "l3_d1_8",
                      "speaker": "G",
                      "en": "I think we really should pay attention to environmental issues in everyday life.",
                      "ko": "우리는 일상생활에서 환경 문제에 정말 주의를 기울여야 한다고 생각해."
                    },
                    {
                      "id": "l3_d1_9",
                      "speaker": "B",
                      "en": "You said it.",
                      "ko": "네 말이 맞아."
                    }
                  ],
                  "quiz": {
                    "question": "What are the speakers mainly talking about?",
                    "options": [
                      "a. their favorite types of chocolate",
                      "b. the main cause of climate change",
                      "c. chocolate being under threat due to global warming"
                    ],
                    "answer": "c"
                  }
                },
                {
                  "id": "l3_d2",
                  "title": "Dialogue 2",
                  "script": [
                    {
                      "id": "l3_d2_1",
                      "speaker": "W",
                      "en": "Hello, viewers. Today, What's in My Dish? is visiting a very special restaurant. Let me introduce today's chef, Felix Taylor. So, what's so special about your dishes, Felix?",
                      "ko": "안녕하세요, 시청자 여러분. 오늘 'What's in My Dish?'는 아주 특별한 식당을 방문합니다. 오늘의 요리사 Felix Taylor를 소개합니다. Felix, 당신의 요리에는 어떤 특별한 점이 있나요?"
                    },
                    {
                      "id": "l3_d2_2",
                      "speaker": "M",
                      "en": "Hello. Welcome to Green Restaurant. We serve various kinds of soy meat dishes.",
                      "ko": "안녕하세요. Green Restaurant에 오신 것을 환영합니다. 저희는 다양한 종류의 콩고기 요리를 제공합니다."
                    },
                    {
                      "id": "l3_d2_3",
                      "speaker": "W",
                      "en": "Soy meat? It's made from soybeans, isn't it?",
                      "ko": "콩고기요? 콩으로 만들어지는 것 맞죠?"
                    },
                    {
                      "id": "l3_d2_4",
                      "speaker": "M",
                      "en": "That's right. Even though it looks like regular meat, it's made from 100% soybeans. It's similar to real meat even in its taste and texture.",
                      "ko": "맞습니다. 일반 고기처럼 보이지만 100% 콩으로 만들어집니다. 맛과 식감까지 실제 고기와 비슷합니다."
                    },
                    {
                      "id": "l3_d2_5",
                      "speaker": "W",
                      "en": "Do we need to eat more soy meat?",
                      "ko": "우리가 콩고기를 더 많이 먹어야 하나요?"
                    },
                    {
                      "id": "l3_d2_6",
                      "speaker": "M",
                      "en": "Yes. It's important to cut down on real meat consumption and try to eat a plant-based diet for the environment.",
                      "ko": "네. 환경을 위해 실제 육류 소비를 줄이고 채식 위주의 식단을 섭취하려고 노력하는 것이 중요합니다."
                    },
                    {
                      "id": "l3_d2_7",
                      "speaker": "W",
                      "en": "I see. Do diners enjoy your restaurant's soy meat dishes?",
                      "ko": "그렇군요. 손님들이 식당의 콩고기 요리를 좋아하나요?"
                    },
                    {
                      "id": "l3_d2_8",
                      "speaker": "M",
                      "en": "Yes, they love our soy meat dishes. Some diners prefer soy meat over regular meat because it's better for their health. Try this soy meat coconut curry.",
                      "ko": "네, 저희 콩고기 요리를 아주 좋아하십니다. 어떤 손님들은 건강에 더 좋다는 이유로 일반 고기보다 콩고기를 선호하시기도 합니다. 이 콩고기 코코넛 카레를 드셔보세요."
                    },
                    {
                      "id": "l3_d2_9",
                      "speaker": "W",
                      "en": "Cool. I'm curious about the texture. [pause] Wow! I can't believe it's made from soybeans. It's really tasty.",
                      "ko": "좋네요. 식감이 궁금하네요. [잠시 후] 와! 콩으로 만들었다는 게 믿기지 않네요. 정말 맛있습니다."
                    },
                    {
                      "id": "l3_d2_10",
                      "speaker": "M",
                      "en": "Thanks. Let me show you our kitchen and teach you how to make some soy meat dishes.",
                      "ko": "감사합니다. 저희 주방을 보여드리고 몇 가지 콩고기 요리 만드는 법을 알려드리겠습니다."
                    }
                  ],
                  "quiz": {
                    "question": "Find the incorrect information about soy meat among ⓐ~ⓒ and correct it.",
                    "options": [
                      "ⓐ It is made from 100% soybeans and is plant-based.",
                      "ⓑ Its texture is very different from that of real meat.",
                      "ⓒ Some diners prefer it over regular meat because it is better for their health."
                    ],
                    "answer": "(ⓑ) very different from → similar to"
                  }
                }
              ]
            }
          }
        },
        {
          "activityId": "l3_comm_listen_write",
          "type": "listen_and_write",
          "title": "C. Listen and Write (강의 듣고 노트 완성)",
          "page": 59,
          "sourceRef": "Textbook p. 59, Scripts pp. 146-147, Answers p. 157",
          "data": {
            "listenAndWrite": {
              "title": "Sustainable Shopping Tips",
              "chartTitle": "Tips for Sustainable Shopping",
              "chartData": [
                {
                  "percentage": 100,
                  "item": "zero-waste grocery stores: everything sold in bulk, no [plastic] packaging allowed",
                  "hasBlank": True,
                  "correctWord": "plastic"
                },
                {
                  "percentage": 50,
                  "item": "avoid [unnecessary] packaging (e.g. buy unpackaged fruit and vegetables)",
                  "hasBlank": True,
                  "correctWord": "unnecessary"
                },
                {
                  "percentage": 50,
                  "item": "bring [reusable] bags to the store ask for paper bags instead of plastic ones",
                  "hasBlank": True,
                  "correctWord": "reusable"
                }
              ],
              "summarySentence": "Make better choices by buying unpackaged fruit and vegetables and bringing reusable bags."
            }
          }
        },
        {
          "activityId": "l3_comm_chance_express",
          "type": "write_and_talk",
          "title": "D. Chance to Express (의견 나누기 & 실천 방안 제안)",
          "page": 59,
          "sourceRef": "Textbook p. 59, Answers p. 157",
          "data": {
            "writeAndTalk": {
              "prompt": "Think about the ideas to reduce plastic waste when purchasing things, and write another idea of your own.",
              "options": [
                "shopping online: choose online shopping sites which use paper for packaging",
                "getting food to go: bring our own reusable containers"
              ],
              "dialogueTemplate": "A: What should we do to reduce plastic waste?\nB: I think we should bring our own reusable containers when getting food to go.\nA: That's a good idea. That would be helpful."
            }
          }
        }
      ]
    },
    {
      "id": "read",
      "cornerNumber": 3,
      "titleKo": "본문 리더",
      "titleEn": "Read: The Future of Food",
      "pageRange": "pp. 60-66, 69",
      "priority": "P1",
      "activities": [
        {
          "activityId": "l3_read_before",
          "type": "before_you_read",
          "title": "Before You Read (배경지식 & 어휘 점검)",
          "page": 60,
          "sourceRef": "Textbook p. 60, Answers p. 157",
          "data": {
            "readBefore": {
              "backgroundCheck": [
                {
                  "id": "bc_1",
                  "statement": "Match the pictures with the expressions from the box. Have you ever heard of or tried any of these foods?",
                  "options": [
                    "ⓐ algae",
                    "ⓑ 3D printed food",
                    "ⓒ food made from insects",
                    "ⓓ lab-grown meat"
                  ],
                  "pageRef": 60,
                  "figureNote": "교과서 60쪽 음식 사진 4종(배양육, 미세조류, 곤충 식품, 3D 프린팅 푸드) 참고"
                }
              ],
              "vocabularyCheck": [
                {
                  "id": "vc_1",
                  "sentence": "A lack of sleep or poor sleep quality can [accelerate] the aging process.",
                  "options": [
                    "conventional",
                    "accelerate",
                    "habitat",
                    "convert"
                  ],
                  "answer": "accelerate"
                },
                {
                  "id": "vc_2",
                  "sentence": "The firm's dress code was very [conventional], requiring employees to wear suits and ties.",
                  "options": [
                    "conventional",
                    "accelerate",
                    "habitat",
                    "convert"
                  ],
                  "answer": "conventional"
                },
                {
                  "id": "vc_3",
                  "sentence": "There is technology that can be used to [convert] voice to text.",
                  "options": [
                    "conventional",
                    "accelerate",
                    "habitat",
                    "convert"
                  ],
                  "answer": "convert"
                },
                {
                  "id": "vc_4",
                  "sentence": "The bears' natural [habitat] is diminishing due to global warming.",
                  "options": [
                    "conventional",
                    "accelerate",
                    "habitat",
                    "convert"
                  ],
                  "answer": "habitat"
                }
              ]
            }
          }
        },
        {
          "activityId": "l3_read_main",
          "type": "reading_viewer",
          "title": "Main Text: The Future of Food",
          "pageRange": "pp. 61-66",
          "page": 61,
          "sourceRef": "Textbook pp. 61-66, Sources p. 168",
          "data": {
            "readingViewer": {
              "titleEn": "The Future of Food",
              "sections": [
                {
                  "sectionId": "sec_1",
                  "titleEn": "Introduction & Environmental Impact",
                  "page": 61,
                  "pageRange": "pp. 61-62",
                  "paragraphs": [
                    {
                      "paragraphId": "p_61_1",
                      "page": 61,
                      "sentences": [
                        {
                          "id": "s_61_1",
                          "en": "Food is the essence of life as it fuels us, brings us together, and connects communities to their cultures.",
                          "ko": "음식은 우리에게 에너지를 공급하고, 우리를 하나로 모으며, 지역 사회를 그들의 문화와 연결해 주기 때문에 삶의 본질입니다."
                        },
                        {
                          "id": "s_61_2",
                          "en": "What and how we eat is also crucial in sustaining all life on this planet.",
                          "ko": "우리가 무엇을 어떻게 먹는가는 이 지구상의 모든 생명을 유지하는 데에도 매우 중요합니다."
                        },
                        {
                          "id": "s_61_3",
                          "en": "According to the UN population prospects report, by 2050, the global population is expected to increase to around 10 billion.",
                          "ko": "유엔 인구 전망 보고서에 따르면, 2050년까지 전 세계 인구는 약 100억 명으로 증가할 것으로 예상됩니다."
                        },
                        {
                          "id": "s_61_4",
                          "en": "This means that, to feed everyone, it will take 56% more food than is produced in the world today.",
                          "ko": "이는 모든 사람을 먹여 살리기 위해 오늘날 전 세계에서 생산되는 것보다 56% 더 많은 식량이 필요할 것임을 의미합니다."
                        },
                        {
                          "id": "s_61_5",
                          "en": "Unfortunately, there is not enough agricultural land available to provide larger future populations with the kinds of diet people are eating in most countries today.",
                          "ko": "불행히도 오늘날 대부분의 국가에서 사람들이 먹고 있는 종류의 식단을 미래의 더 많은 인구에게 제공할 수 있을 만큼 이용 가능한 농경지가 충분하지 않습니다."
                        }
                      ]
                    },
                    {
                      "paragraphId": "p_62_1",
                      "page": 62,
                      "sentences": [
                        {
                          "id": "s_62_1",
                          "en": "In addition to this, industrial food systems generate more than one third of all greenhouse gas emissions.",
                          "ko": "이에 더하여, 산업화된 식품 시스템은 전체 온실가스 배출량의 3분의 1 이상을 생성합니다."
                        },
                        {
                          "id": "s_62_2",
                          "en": "The processes we rely on to produce, transport, and store meals and raw ingredients, not to mention the landfills covered with food waste, are speeding up climate change.",
                          "ko": "음식물 쓰레기로 덮인 매립지는 말할 것도 없고, 식사와 원재료를 생산, 운송, 저장하기 위해 우리가 의존하는 과정들이 기후 변화를 가속화하고 있습니다."
                        },
                        {
                          "id": "s_62_3",
                          "en": "Animal-based foods, including red meat, milk products, and farmed shrimp, are generally associated with the highest greenhouse gas emissions.",
                          "ko": "붉은 고기, 유제품, 양식 새우를 포함한 동물성 식품은 일반적으로 가장 높은 온실가스 배출량과 관련이 있습니다."
                        },
                        {
                          "id": "s_62_4",
                          "en": "Especially, our meat production accelerates global warming significantly, uses shrinking supplies of fresh water, destroys forests and grasslands, and damages soil.",
                          "ko": "특히 우리의 육류 생산은 지구 온난화를 크게 가속화하고, 줄어드는 담수 공급량을 소비하며, 숲과 초원을 파괴하고 토양을 훼손합니다."
                        },
                        {
                          "id": "s_62_5",
                          "en": "Basically, we are in a tight bind of our own making.",
                          "ko": "기본적으로 우리는 스스로가 자초한 진퇴양난의 곤경에 처해 있습니다."
                        },
                        {
                          "id": "s_62_6",
                          "en": "Against this reality, it is vital for us to seek sustainable alternatives to our current diets.",
                          "ko": "이러한 현실에 맞서, 우리의 현재 식단에 대한 지속 가능한 대안을 찾는 것이 우리에게 매우 중요합니다."
                        },
                        {
                          "id": "s_62_7",
                          "en": "Let us explore some ways we could be eating in the near future.",
                          "ko": "가까운 미래에 우리가 먹을 수 있는 몇 가지 방법들을 탐구해 봅시다."
                        }
                      ]
                    }
                  ],
                  "marginalQuestions": [
                    {
                      "id": "mq_1",
                      "question": "How is food the essence of life?",
                      "answer": "It fuels us, brings us together, and connects communities to their cultures.",
                      "page": 61
                    },
                    {
                      "id": "mq_2",
                      "question": "How much more food will it take to feed the expected global population in 2050?",
                      "answer": "It will take 56% more food than is produced in the world today.",
                      "page": 61
                    },
                    {
                      "id": "mq_3",
                      "question": "What kinds of food are generally associated with the highest greenhouse gas emissions?",
                      "answer": "Animal-based foods, including red meat, milk products, and farmed shrimp, are generally associated with the highest greenhouse gas emissions.",
                      "page": 62
                    },
                    {
                      "id": "mq_4",
                      "question": "Is there anything you have been personally doing to make the food culture more sustainable?",
                      "answer": "Lately, I've been trying to eat less red meat and eat more beans instead.",
                      "page": 62
                    }
                  ],
                  "pageRef": 62,
                  "figureNote": "교과서 62쪽 식품 1kg당 온실가스 배출량 차트 참고"
                },
                {
                  "sectionId": "sec_2",
                  "titleEn": "Lab-grown Meat",
                  "page": 63,
                  "paragraphs": [
                    {
                      "paragraphId": "p_63_1",
                      "page": 63,
                      "sentences": [
                        {
                          "id": "s_63_1",
                          "en": "Lab-grown meat is animal flesh grown inside a laboratory.",
                          "ko": "배양육은 실험실 내부에서 재배된 동물의 살코기입니다."
                        },
                        {
                          "id": "s_63_2",
                          "en": "It is an alternative to red meat obtained by increasingly unsustainable farming practices.",
                          "ko": "이는 점점 더 지속 불가능해지는 농업 관행에서 얻어지는 붉은 고기에 대한 대안입니다."
                        },
                        {
                          "id": "s_63_3",
                          "en": "Studies show that producing lab-grown meat by using renewable energy would have a significantly lower carbon footprint than raising farm animals and making meat products in the most sustainable way.",
                          "ko": "연구에 따르면 재생 에너지를 사용하여 배양육을 생산하는 것은 가축을 기르고 가장 지속 가능한 방식으로 육류 제품을 만드는 것보다 탄소 발자국이 현저히 낮을 것입니다."
                        },
                        {
                          "id": "s_63_4",
                          "en": "This is how lab-grown meat is made.",
                          "ko": "배양육은 이렇게 만들어집니다."
                        },
                        {
                          "id": "s_63_5",
                          "en": "To begin with, lab scientists carefully remove a small number of cells from an animal.",
                          "ko": "우선, 실험실 과학자들은 동물에게서 소량의 세포를 조심스럽게 추출합니다."
                        },
                        {
                          "id": "s_63_6",
                          "en": "Then, they multiply and grow the harvested cells, and they produce real tissue, which is quite similar to conventional meat in terms of texture and smell.",
                          "ko": "그런 다음 수확한 세포를 증식시키고 배양하여 실제 조직을 만들어 내는데, 이는 질감과 냄새 면에서 일반 고기와 매우 유사합니다."
                        },
                        {
                          "id": "s_63_7",
                          "en": "In this way, they can transform lab-grown cells into steak, chicken breasts, or hamburger meat.",
                          "ko": "이런 방식으로 연구자들은 실험실에서 키운 세포를 스테이크, 닭가슴살 또는 햄버거 패티 고기로 변형시킬 수 있습니다."
                        },
                        {
                          "id": "s_63_8",
                          "en": "The final product itself is a real cut of meat, ready to be cooked.",
                          "ko": "최종 생산물 자체는 요리할 준비가 된 실제 고기 조각입니다."
                        }
                      ]
                    }
                  ],
                  "marginalQuestions": [
                    {
                      "id": "mq_5",
                      "question": "What is lab-grown meat?",
                      "answer": "It is animal flesh grown inside a laboratory.",
                      "page": 63
                    },
                    {
                      "id": "mq_6",
                      "question": "What is the first step in making lab-grown meat?",
                      "answer": "Lab scientists carefully remove a small number of cells from an animal.",
                      "page": 63
                    },
                    {
                      "id": "mq_7",
                      "question": "What kinds of meat can lab-grown cells be transformed into?",
                      "answer": "They can be transformed into steak, chicken breasts, or hamburger meat.",
                      "page": 63
                    }
                  ],
                  "pageRef": 63,
                  "figureNote": "교과서 63쪽 배양육 생산 과정 그림(removing cells → multiplying and growing → meat) 참고"
                },
                {
                  "sectionId": "sec_3",
                  "titleEn": "Insects",
                  "page": 64,
                  "paragraphs": [
                    {
                      "paragraphId": "p_64_1",
                      "page": 64,
                      "sentences": [
                        {
                          "id": "s_64_1",
                          "en": "Even though eating insects may seem strange to some people, they have been part of human diets for a very long time.",
                          "ko": "곤충을 먹는 것이 어떤 사람들에게는 낯설게 보일지 모르지만, 곤충은 아주 오랜 시간 동안 인류 식단의 일부였습니다."
                        },
                        {
                          "id": "s_64_2",
                          "en": "In fact, insect eating is practiced in about 130 countries!",
                          "ko": "실제로 곤충 식용은 약 130개국에서 행해지고 있습니다!"
                        },
                        {
                          "id": "s_64_3",
                          "en": "Insects will be important in the fight against hunger and climate change.",
                          "ko": "곤충은 기아와 기후 변화와의 싸움에서 중요한 역할을 할 것입니다."
                        },
                        {
                          "id": "s_64_4",
                          "en": "They use much fewer resources than farm animals to produce the same amount of protein and can be raised on food waste, which makes raising them very cost-effective.",
                          "ko": "곤충은 같은 양의 단백질을 생산하는 데 가축보다 훨씬 적은 자원을 사용하며 음식물 쓰레기로 사육될 수 있어, 사육 효율성이 매우 높습니다."
                        },
                        {
                          "id": "s_64_5",
                          "en": "The main barrier to using insects as a source of protein is the negative image they have.",
                          "ko": "곤충을 단백질원으로 사용하는 데 있어서 주된 걸림돌은 곤충이 가진 부정적인 이미지입니다."
                        },
                        {
                          "id": "s_64_6",
                          "en": "Insects are associated with disease and dirt, so manufacturers of insect food products must overcome this to successfully win the public over.",
                          "ko": "곤충은 질병 및 먼지와 연관되어 있으므로, 곤충 식품 제조업체들은 대중의 마음을 성공적으로 사로잡기 위해 이를 극복해야 합니다."
                        },
                        {
                          "id": "s_64_7",
                          "en": "One solution has been to change the look of the insects, by drying and grinding them into powder.",
                          "ko": "한 가지 해결책은 곤충을 건조시키고 가루로 갈아서 곤충의 겉모습을 바꾸는 것이었습니다."
                        },
                        {
                          "id": "s_64_8",
                          "en": "Rich in protein, insect flour is gaining popularity as a healthier replacement for wheat flour.",
                          "ko": "단백질이 풍부한 곤충 밀가루는 밀가루의 더 건강한 대체품으로 인기를 얻고 있습니다."
                        },
                        {
                          "id": "s_64_9",
                          "en": "In addition, insect oils are a promising field; they are already being used in some parts of the world for cooking.",
                          "ko": "게다가 곤충 기름도 유망한 분야인데, 세계 일부 지역에서는 이미 요리에 사용되고 있습니다."
                        }
                      ]
                    }
                  ],
                  "marginalQuestions": [
                    {
                      "id": "mq_8",
                      "question": "What makes raising insects cost-effective?",
                      "answer": "They use much fewer resources than farm animals to produce the same amount of protein and can be raised on food waste.",
                      "page": 64
                    },
                    {
                      "id": "mq_9",
                      "question": "What is the main barrier to using insects as a source of protein?",
                      "answer": "It is the negative image they have.",
                      "page": 64
                    }
                  ],
                  "pageRef": 64,
                  "figureNote": "교과서 64쪽 곤충 가루 및 식용 곤충 가공식품 사진 참고"
                },
                {
                  "sectionId": "sec_4",
                  "titleEn": "3D Printed Food",
                  "page": 65,
                  "paragraphs": [
                    {
                      "paragraphId": "p_65_1",
                      "page": 65,
                      "sentences": [
                        {
                          "id": "s_65_1",
                          "en": "3D food printing has the potential to save the environment, while revolutionizing food production; for example, it can convert alternative ingredients such as proteins from insects into delicious meals.",
                          "ko": "3D 식품 프린팅은 식품 생산에 혁명을 일으키는 동시에 환경을 보호할 잠재력을 가지고 있습니다. 예를 들어, 곤충에서 추출한 단백질과 같은 대체 원료를 맛있는 식사로 전환할 수 있습니다."
                        },
                        {
                          "id": "s_65_2",
                          "en": "The underlying concept for food printing is the same as any other 3D printing.",
                          "ko": "식품 프린팅의 기본 개념은 다른 모든 3D 프린팅과 동일합니다."
                        },
                        {
                          "id": "s_65_3",
                          "en": "In 3D food printing, various inks – liquid forms of food – are placed one layer at a time to build complex 3D constructs with full textures and customized nutrients.",
                          "ko": "3D 식품 프린팅에서는 액체 형태의 음식인 다양한 잉크를 한 번에 한 층씩 쌓아 완전한 식감과 맞춤형 영양소를 갖춘 복합적인 3차원 구조물을 만듭니다."
                        },
                        {
                          "id": "s_65_4",
                          "en": "3D food printing can be readily undertaken in many parts of the globe.",
                          "ko": "3D 식품 프린팅은 세계 여러 곳에서 쉽게 수행될 수 있습니다."
                        },
                        {
                          "id": "s_65_5",
                          "en": "Various food inks with adequate nutrients and favorable flavors can be sent to areas that are hard to get to, where food can be printed on site.",
                          "ko": "적절한 영양소와 좋은 맛을 지닌 다양한 식품 잉크를 접근하기 어려운 지역으로 보내 그곳에서 음식을 직접 인쇄할 수 있습니다."
                        },
                        {
                          "id": "s_65_6",
                          "en": "In this way, 3D printed food with necessary nutrients can be provided for large populations in areas affected by a natural disaster or a crisis developed by humans.",
                          "ko": "이런 방식으로 필수 영양소를 갖춘 3D 프린팅 식품은 자연재해나 인간에 의해 발생한 위기의 영향을 받는 지역의 많은 사람들에게 제공될 수 있습니다."
                        }
                      ]
                    }
                  ],
                  "marginalQuestions": [
                    {
                      "id": "mq_10",
                      "question": "How is food made in 3D food printing?",
                      "answer": "In 3D food printing, various inks – liquid forms of food – are placed one layer at a time to build complex 3D constructs with full textures and customized nutrients.",
                      "page": 65
                    },
                    {
                      "id": "mq_11",
                      "question": "What would you like to make using 3D food printing?",
                      "answer": "I would like to make various kinds of meat.",
                      "page": 65
                    }
                  ],
                  "pageRef": 65,
                  "figureNote": "교과서 65쪽 3D 식품 프린터 작동 및 조형물 사진 참고"
                },
                {
                  "sectionId": "sec_5",
                  "titleEn": "Algae",
                  "page": 66,
                  "paragraphs": [
                    {
                      "paragraphId": "p_66_1",
                      "page": 66,
                      "sentences": [
                        {
                          "id": "s_66_1",
                          "en": "Algae are the fastest growing plant organisms in nature and a great alternative source of vitamins, proteins, and minerals.",
                          "ko": "조류(Algae)는 자연에서 가장 빠르게 자라는 식물 유기체이며 비타민, 단백질, 미네랄의 훌륭한 대체원입니다."
                        },
                        {
                          "id": "s_66_2",
                          "en": "Not only full of nutrients, they are also easy to grow and don't take up precious land space as they are grown in water.",
                          "ko": "영양소가 풍부할 뿐만 아니라, 물에서 자라기 때문에 기르기 쉽고 귀중한 토지 공간을 차지하지 않습니다."
                        },
                        {
                          "id": "s_66_3",
                          "en": "They can grow in places where normal food crops wouldn't survive and yield much higher productivity than crops grown on land.",
                          "ko": "그것들은 일반 식량 작물이 생존할 수 없는 곳에서도 자랄 수 있으며 땅에서 자라는 작물보다 훨씬 더 높은 생산성을 산출합니다."
                        },
                        {
                          "id": "s_66_4",
                          "en": "In addition, they create very rich habitats for plants and animals.",
                          "ko": "게다가 그것들은 동식물을 위한 매우 풍요로운 서식지를 만듭니다."
                        },
                        {
                          "id": "s_66_5",
                          "en": "On top of that, algae are very good at trapping carbon themselves, which helps slow down global warming.",
                          "ko": "더욱이 조류는 스스로 탄소를 포집하는 데 매우 뛰어나며, 이는 지구 온난화를 늦추는 데 도움이 됩니다."
                        },
                        {
                          "id": "s_66_6",
                          "en": "Individual diets are complex and culturally influenced.",
                          "ko": "개인의 식단은 복잡하고 문화적인 영향을 받습니다."
                        },
                        {
                          "id": "s_66_7",
                          "en": "It is a huge task to change one's diet to reduce the impact of food on climate, and not everyone can or will take the step forward.",
                          "ko": "식량이 기후에 미치는 영향을 줄이기 위해 식단을 바꾸는 것은 엄청난 과제이며, 모든 사람이 한 걸음 앞으로 나아갈 수 있거나 나아가려 하지는 않을 것입니다."
                        },
                        {
                          "id": "s_66_8",
                          "en": "However, with the increasing demand for food and its effects on global warming, we ourselves need to start considering bringing changes to our diets.",
                          "ko": "그러나 증가하는 식량 수요와 그것이 지구 온난화에 미치는 영향을 고려할 때, 우리 스스로가 식단에 변화를 가져오는 것을 고려하기 시작해야 합니다."
                        },
                        {
                          "id": "s_66_9",
                          "en": "It's time for everyone to be a little more familiar with the unfamiliar.",
                          "ko": "이제 모든 사람이 낯선 것에 조금 더 익숙해져야 할 때입니다."
                        }
                      ]
                    }
                  ],
                  "marginalQuestions": [
                    {
                      "id": "mq_12",
                      "question": "What is the nutritional benefit of algae?",
                      "answer": "They are a great alternative source of vitamins, proteins, and minerals.",
                      "page": 66
                    },
                    {
                      "id": "mq_13",
                      "question": "What is the advantage of algae in terms of global warming?",
                      "answer": "Algae are very good at trapping carbon themselves, which helps slow down global warming.",
                      "page": 66
                    },
                    {
                      "id": "mq_14",
                      "question": "Among the four kinds of food which are introduced in the text, which do you think will be the most popular in 2050?",
                      "answer": "I think algae will be used and consumed most because people are already familiar with them.",
                      "page": 66
                    }
                  ],
                  "pageRef": 66,
                  "figureNote": "교과서 66쪽 미세조류(Algae) 수확 및 배양 시설 사진 참고"
                }
              ]
            }
          }
        },
        {
          "activityId": "l3_read_further",
          "type": "read_further",
          "title": "Read Further: No Sunlight, No Soil - Indoor Vertical Farming",
          "page": 69,
          "sourceRef": "Textbook p. 69, Sources p. 169",
          "data": {
            "readFurther": {
              "titleEn": "No Sunlight, No Soil - Indoor Vertical Farming",
              "paragraphs": [
                {
                  "paragraphId": "rf_1",
                  "page": 69,
                  "sentences": [
                    {
                      "id": "rf_s_1",
                      "en": "Perfectly shaped tomatoes grow under purple lighting.",
                      "ko": "완벽한 모양의 토마토가 보라색 조명 아래에서 자랍니다."
                    },
                    {
                      "id": "rf_s_2",
                      "en": "Here in the facility, the intensity and timing of light and the nutrients in the water supply are all controlled.",
                      "ko": "여기 시설에서는 빛의 세기와 시간, 급수되는 물의 영양분이 모두 제어됩니다."
                    },
                    {
                      "id": "rf_s_3",
                      "en": "This indoor vertical farming facility is able to produce fresh fruit and vegetables all year round.",
                      "ko": "이 실내 수직 농업 시설은 일 년 내내 신선한 과일과 채소를 생산할 수 있습니다."
                    }
                  ]
                },
                {
                  "paragraphId": "rf_2",
                  "page": 69,
                  "sentences": [
                    {
                      "id": "rf_s_4",
                      "en": "Vertical farming refers to producing foods in vertically stacked layers integrated into other structures, usually without the need of soil or natural light.",
                      "ko": "수직 농업은 일반적으로 흙이나 자연광 없이 다른 구조물에 통합된 수직으로 쌓인 층에서 식량을 생산하는 것을 말합니다."
                    },
                    {
                      "id": "rf_s_5",
                      "en": "Since the plants are stacked above each other, it reduces the amount of space needed to grow crops.",
                      "ko": "식물들이 서로의 위에 층층이 쌓여 있기 때문에, 작물을 기르는 데 필요한 공간의 양을 줄여 줍니다."
                    }
                  ]
                },
                {
                  "paragraphId": "rf_3",
                  "page": 69,
                  "sentences": [
                    {
                      "id": "rf_s_6",
                      "en": "Another advantage of indoor vertical farming is that maintaining the ideal conditions can reduce the time to harvest.",
                      "ko": "실내 수직 농업의 또 다른 장점은 이상적인 조건을 유지함으로써 수확까지 걸리는 시간을 단축할 수 있다는 것입니다."
                    },
                    {
                      "id": "rf_s_7",
                      "en": "\"For traditional farming, if the climate is good, you have five to six harvests a year,\" says the manager of the facility.",
                      "ko": "\"전통 농업의 경우 기후가 좋으면 1년에 5~6회 수확합니다.\"라고 시설 관리자가 말합니다."
                    },
                    {
                      "id": "rf_s_8",
                      "en": "\"In indoor farming, we're now getting roughly 17 harvests out of that same period.\"",
                      "ko": "\"실내 농업에서는 동일한 기간 동안 대략 17번의 수확을 거두고 있습니다.\""
                    }
                  ]
                },
                {
                  "paragraphId": "rf_4",
                  "page": 69,
                  "sentences": [
                    {
                      "id": "rf_s_9",
                      "en": "There is also the benefit of a reduced need for water.",
                      "ko": "물에 대한 필요량이 줄어드는 이점도 있습니다."
                    },
                    {
                      "id": "rf_s_10",
                      "en": "Any excess water that a plant cannot absorb will drop down to the plants below.",
                      "ko": "식물이 흡수하지 못한 잉여의 물은 아래에 있는 식물로 떨어집니다."
                    },
                    {
                      "id": "rf_s_11",
                      "en": "The manager says the farm uses 95% less water than farming in a field.",
                      "ko": "관리자는 이 농장이 노지 농업보다 물을 95% 덜 사용한다고 말합니다."
                    },
                    {
                      "id": "rf_s_12",
                      "en": "\"Every time water moves through the system, it's captured and reused.\"",
                      "ko": "\"물이 시스템을 통과할 때마다 포집되어 재사용됩니다.\""
                    }
                  ]
                },
                {
                  "paragraphId": "rf_5",
                  "page": 69,
                  "sentences": [
                    {
                      "id": "rf_s_13",
                      "en": "However, indoor vertical farming has an Achilles' heel: energy consumption.",
                      "ko": "그러나 실내 수직 농업에는 치명적인 약점(아킬레스건)이 있습니다. 바로 에너지 소비입니다."
                    },
                    {
                      "id": "rf_s_14",
                      "en": "It has been criticized for the high energy input it requires.",
                      "ko": "그것은 요구되는 높은 에너지 투입량 때문에 비판을 받아 왔습니다."
                    },
                    {
                      "id": "rf_s_15",
                      "en": "\"Solar power could help bring down energy costs,\" the manager says.",
                      "ko": "\"태양광 발전이 에너지 비용을 낮추는 데 도움이 될 수 있습니다.\"라고 관리자는 말합니다."
                    },
                    {
                      "id": "rf_s_16",
                      "en": "\"Large scale farms will have solar panels on each roof. It might support 10 to 15% of our needs.\"",
                      "ko": "\"대규모 농장은 각 지붕에 태양광 패널을 설치하게 될 것이며, 그것이 우리 필요량의 10~15%를 충당할 수 있을 것입니다.\""
                    }
                  ]
                },
                {
                  "paragraphId": "rf_6",
                  "page": 69,
                  "sentences": [
                    {
                      "id": "rf_s_17",
                      "en": "This farm wants to fill supply chain gaps rather than replace outside fields.",
                      "ko": "이 농장은 야외 농경지를 대체하기보다는 공급망의 공백을 메우기를 원합니다."
                    },
                    {
                      "id": "rf_s_18",
                      "en": "\"Much of our fruit and vegetables will still be grown under the sun and in soil, which is why it is super important that we also invest in sustainable field farming,\" the manager says.",
                      "ko": "\"우리의 많은 과일과 채소는 여전히 태양 아래 흙에서 자랄 것이며, 이것이 바로 우리가 지속 가능한 노지 농업에도 투자해야 하는 매우 중요한 이유입니다.\"라고 관리자는 말합니다."
                    }
                  ]
                }
              ],
              "marginalQuestion": {
                "question": "Find out about what kinds of fruit and vegetables can be grown through vertical farming.",
                "answer": "Green peppers and strawberries can be grown through vertical farming.",
                "page": 69
              },
              "pageRef": 69,
              "figureNote": "교과서 69쪽 실내 수직 농장(Indoor Vertical Farm) 보라색 조명 재배 시설 사진 참고"
            }
          }
        }
      ]
    },
    {
      "id": "after_read",
      "cornerNumber": 4,
      "titleKo": "읽기 후 활동",
      "titleEn": "After You Read",
      "pageRange": "pp. 67-68",
      "priority": "P1",
      "activities": [
        {
          "activityId": "l3_after_details",
          "type": "details_tf",
          "title": "A. Details T/F (본문 내용 사실 확인)",
          "page": 67,
          "sourceRef": "Textbook p. 67, Answers p. 158",
          "data": {
            "detailsTf": [
              {
                "id": "dt_1",
                "statement": "Plant-based food production accounts for most of all greenhouse gas emissions from food production.",
                "answer": "F",
                "explanation": "Animal-based foods, not plant-based foods, are generally associated with the highest greenhouse gas emissions."
              },
              {
                "id": "dt_2",
                "statement": "Even though not all people eat insects as an alternative protein source, insect eating is practiced in about 130 countries.",
                "answer": "T",
                "explanation": "In fact, insect eating is practiced in about 130 countries."
              },
              {
                "id": "dt_3",
                "statement": "Algae provide much higher productivity than crops grown on land and create habitats for plants and animals.",
                "answer": "T",
                "explanation": "They yield much higher productivity than crops grown on land and create very rich habitats for plants and animals."
              },
              {
                "id": "dt_4",
                "statement": "Changing one's diet is simple and easy because people are concerned about climate change.",
                "answer": "F",
                "explanation": "Individual diets are complex and culturally influenced, and it is a huge task to change one's diet."
              }
            ]
          }
        },
        {
          "activityId": "l3_after_summary",
          "type": "summary_fill_in",
          "title": "B. Summary (미래 식량 핵심 요약 완성)",
          "page": 67,
          "sourceRef": "Textbook p. 67, Answers p. 157",
          "data": {
            "summaryFillIn": {
              "wordsBox": [
                "tissue",
                "grow",
                "affected",
                "converting",
                "change",
                "laboratory"
              ],
              "categories": [
                {
                  "category": "Lab-grown Meat",
                  "items": [
                    {
                      "text": "animal flesh grown inside a(n) [laboratory]",
                      "answer": "laboratory"
                    },
                    {
                      "text": "making process: animal → removing cells → multiplying and growing → real [tissue]",
                      "answer": "tissue"
                    }
                  ]
                },
                {
                  "category": "Insects",
                  "items": [
                    {
                      "text": "use fewer resources than farm animals for the same amount of protein"
                    },
                    {
                      "text": "dried and grinded into powder to [change] the look",
                      "answer": "change"
                    }
                  ]
                },
                {
                  "category": "3D Printed Food",
                  "items": [
                    {
                      "text": "made from [converting] alternative ingredients into delicious meals",
                      "answer": "converting"
                    },
                    {
                      "text": "can be provided in areas [affected] by a disaster",
                      "answer": "affected"
                    }
                  ]
                },
                {
                  "category": "Algae",
                  "items": [
                    {
                      "text": "source of vitamins, proteins, and minerals"
                    },
                    {
                      "text": "easy to [grow] and don't take up land space",
                      "answer": "grow"
                    }
                  ]
                }
              ]
            }
          }
        },
        {
          "activityId": "l3_after_reading_skill",
          "type": "reading_skill",
          "title": "C. Reading Skill: Using transitional expressions (연결어 활용)",
          "page": 68,
          "sourceRef": "Textbook p. 68, Answers p. 158",
          "data": {
            "readingSkill": {
              "skillTitle": "Using transitional expressions",
              "explanationKo": "연결어는 글을 밀접하게 연결하여 구성하는 구실을 합니다. 다양한 연결어를 주의 깊게 살피며 글을 읽으면 글의 구조와 흐름을 효과적으로 파악할 수 있고, 주제와 글쓴이의 의도도 명확하게 이해할 수 있습니다.",
              "types": [
                {
                  "type": "Example",
                  "expressions": "for example, for instance, specifically"
                },
                {
                  "type": "Additional Support",
                  "expressions": "additionally, also, besides, furthermore, in addition, moreover"
                },
                {
                  "type": "Contrast",
                  "expressions": "but, however, on the other hand, nevertheless, in contrast, on the contrary"
                },
                {
                  "type": "Similarity",
                  "expressions": "also, in the same way, likewise, similarly"
                },
                {
                  "type": "Sequence",
                  "expressions": "first, second, third, next, then, finally"
                },
                {
                  "type": "Cause and Effect",
                  "expressions": "accordingly, consequently, so, therefore, thus"
                },
                {
                  "type": "Conclusion",
                  "expressions": "finally, in conclusion, in the end, thus, therefore"
                },
                {
                  "type": "Summary",
                  "expressions": "in brief, briefly, to summarize, in sum, to sum up"
                }
              ],
              "passage": "It has been confirmed by much research that insects do not heavily impact the environment. They require little water and attention to grow and can survive perfectly fine on waste. [Furthermore], it was found that insects have a great conversion rate of nutrients to protein. [For example], chickens convert 33% of what they eat to protein, while the black soldier fly converts 50% to protein. On top of that, insects contain all the essential nutrients like vitamin B12, iron, and so on. [In brief], insects require fewer resources to grow and have high nutritional value.",
              "exercises": [
                {
                  "id": "rs_1",
                  "options": ["Similarly", "Furthermore"],
                  "answer": "Furthermore"
                },
                {
                  "id": "rs_2",
                  "options": ["For example", "Consequently"],
                  "answer": "For example"
                },
                {
                  "id": "rs_3",
                  "options": ["In brief", "In contrast"],
                  "answer": "In brief"
                }
              ]
            }
          }
        }
      ]
    },
    {
      "id": "share_thoughts",
      "cornerNumber": 5,
      "titleKo": "생각 나누기",
      "titleEn": "Share Your Thoughts: Food Upcycling",
      "pageRange": "pp. 70-71",
      "priority": "P2",
      "activities": [
        {
          "activityId": "l3_share_step1",
          "type": "video_discussion",
          "title": "Step 1. Food Upcycling 레스토랑 영상 및 리뷰 탐구",
          "page": 70,
          "sourceRef": "Textbook p. 70, Scripts p. 147, Sources p. 171",
          "data": {
            "step1": {
              "video": {
                "title": "Turning Food Waste Into a Fine Dining Experience – Rest in Oslo is Redefining Sustainability",
                "youtubeUrl": "https://www.youtube.com/watch?v=fCl0-lMsCxc",
                "sourceCitation": "Anders & Kaitlin, Turning Food Waste Into a Fine Dining Experience, 2020 (p. 171)"
              },
              "script": [
                {
                  "id": "st_s_1",
                  "speaker": "W",
                  "en": "You've heard of upcycling clothes and furniture, but would you eat upcycled food?",
                  "ko": "옷이나 가구를 업사이클링한다는 말은 들어보셨겠지만, 업사이클된 음식을 드셔보시겠습니까?"
                },
                {
                  "id": "st_s_2",
                  "speaker": "W",
                  "en": "Here are some innovative restaurants dedicated to reducing food waste.",
                  "ko": "음식물 쓰레기 감소에 헌신하는 혁신적인 식당 몇 곳을 소개합니다."
                },
                {
                  "id": "st_s_3",
                  "speaker": "W",
                  "en": "It is a gorgeous space calling attention to a serious mission: saving our planet.",
                  "ko": "이곳은 지구를 구한다는 진지한 사명에 주의를 환기하는 아름다운 공간입니다."
                },
                {
                  "id": "st_s_4",
                  "speaker": "W",
                  "en": "They use ugly or extra produce.",
                  "ko": "그들은 못생기거나 남는 농산물을 사용합니다."
                },
                {
                  "id": "st_s_5",
                  "speaker": "W",
                  "en": "Here, the pizza is upcycled.",
                  "ko": "여기서 피자는 업사이클링됩니다."
                },
                {
                  "id": "st_s_6",
                  "speaker": "W",
                  "en": "It contains what is left over from making cheese and oat milk.",
                  "ko": "치즈와 오트 밀크를 만들고 남은 찌꺼기가 피자에 들어갑니다."
                },
                {
                  "id": "st_s_7",
                  "speaker": "W",
                  "en": "This restaurant operates on a super unique concept.",
                  "ko": "이 레스토랑은 대단히 독특한 콘셉트로 운영됩니다."
                },
                {
                  "id": "st_s_8",
                  "speaker": "W",
                  "en": "They offer fine dining of elegant dishes made with ingredients that are left over from making other food or vegetables that would normally go to waste because they're too ugly.",
                  "ko": "그들은 다른 음식을 만들고 남은 재료나 너무 못생겨서 보통 버려지곤 했던 채소로 만든 우아한 고급 요리를 제공합니다."
                },
                {
                  "id": "st_s_9",
                  "speaker": "W",
                  "en": "A lot of food never found its way to stores because of their weird shapes.",
                  "ko": "이상한 모양 때문에 많은 농산물들이 상점에 유통되지 못했습니다."
                },
                {
                  "id": "st_s_10",
                  "speaker": "W",
                  "en": "They've lifted this produce up and made it special.",
                  "ko": "그들은 이러한 농산물의 가치를 끌어올려 특별하게 만들었습니다."
                },
                {
                  "id": "st_s_11",
                  "speaker": "W",
                  "en": "Sustainability is getting more trendy, and food upcycling is paving the way for future food sustainability.",
                  "ko": "지속 가능성이 점점 더 트렌드가 되고 있으며, 푸드 업사이클링은 미래 식품 지속 가능성의 길을 열어가고 있습니다."
                }
              ],
              "quiz": {
                "question": "What is the best title for the video?",
                "options": [
                  "a. The Best Restaurants Offering Exotic Dining",
                  "b. Insufficient Food Supply for Rural Restaurants",
                  "c. Upcycled Food: A Sustainable Way of Reducing Food Waste"
                ],
                "answer": "c"
              },
              "reviewFillIn": {
                "boxWords": [
                  "reduce",
                  "waste",
                  "upcycled"
                ],
                "reviews": [
                  {
                    "reviewer": "Tim S.",
                    "text": "This is my favorite restaurant ever. By eating [upcycled] food, you can help [reduce] food waste while enjoying a tasty, stylish dish.",
                    "answers": ["upcycled", "reduce"]
                  },
                  {
                    "reviewer": "Amy10",
                    "text": "Here you can have elegant dishes made with ugly vegetables that would normally go to [waste]. I am always delighted with whatever I order. The servers are nice, too.",
                    "answers": ["waste"]
                  }
                ]
              },
              "talkAboutVideo": {
                "question": "Would you try some of the upcycled food from the video? Why or why not?",
                "sampleAnswer": "Yes, I would. I can reduce food waste by consuming upcycled food."
              }
            }
          }
        },
        {
          "activityId": "l3_share_step2_3",
          "type": "idea_sharing",
          "title": "Step 2 & 3. 푸드 업사이클링 아이디어 탐구 및 발표",
          "page": 71,
          "sourceRef": "Textbook p. 71",
          "data": {
            "step2": {
              "ideas": [
                {
                  "material": "avocado seeds",
                  "desc": "They can be turned into eco-friendly forks and knives, which can be easily and naturally decomposed in landfills."
                },
                {
                  "material": "coffee grounds",
                  "desc": "They are processed to create eyeglass frames, which can be used as fertilizer after use."
                }
              ]
            },
            "step3": {
              "dialogue": [
                {
                  "speaker": "A",
                  "en": "How can we upcycle food?",
                  "ko": "우리는 어떻게 음식을 업사이클링할 수 있을까?"
                },
                {
                  "speaker": "B",
                  "en": "I read an article and found something interesting about avocado seeds.",
                  "ko": "기사를 읽다가 아보카도 씨앗에 대한 흥미로운 사실을 발견했어."
                },
                {
                  "speaker": "A",
                  "en": "Oh, yeah? What did you find out about avocado seeds?",
                  "ko": "아, 그래? 아보카도 씨앗에 대해 무엇을 알게 되었니?"
                },
                {
                  "speaker": "B",
                  "en": "They can be turned into eco-friendly forks and knives, which can be easily and naturally decomposed in landfills.",
                  "ko": "그것들은 매립지에서 쉽고 자연스럽게 분해될 수 있는 친환경 포크와 나이프로 바뀔 수 있대."
                },
                {
                  "speaker": "A",
                  "en": "Really? That sounds really amazing.",
                  "ko": "정말? 정말 놀랍다."
                },
                {
                  "speaker": "B",
                  "en": "I'm telling you, that was something beyond my imagination! I think it's important to discover new ways of upcycling food waste for our environment.",
                  "ko": "정말이지 상상 이상이었어! 환경을 위해 음식물 쓰레기를 업사이클링하는 새로운 방법을 발견하는 것이 중요하다고 생각해."
                }
              ],
              "checkPoint": [
                "1. I can talk about various ideas to upcycle food.",
                "2. I expressed my ideas clearly.",
                "3. I listened to others carefully."
              ]
            }
          }
        }
      ]
    },
    {
      "id": "language_focus",
      "cornerNumber": 6,
      "titleKo": "언어 탐구",
      "titleEn": "Language Focus",
      "pageRange": "pp. 72-73",
      "priority": "P2",
      "activities": [
        {
          "activityId": "l3_lang_words_phrases",
          "type": "words_and_phrases",
          "title": "A & B. Word Uses & Common Phrases",
          "page": 72,
          "sourceRef": "Textbook p. 72, Answers p. 158",
          "data": {
            "wordUses": {
              "word": "yield",
              "meanings": [
                {
                  "label": "a",
                  "definition": "v. to produce or provide",
                  "example": "Last year, this land yielded a good harvest."
                },
                {
                  "label": "b",
                  "definition": "v. to give way to arguments, demands, or pressure",
                  "example": "The artist yielded to critics and changed the design."
                },
                {
                  "label": "c",
                  "definition": "n. the full amount of an agricultural or industrial product",
                  "example": "Crop yields have risen steadily for decades at the global level."
                }
              ],
              "sentences": [
                {
                  "id": "wu_1",
                  "text": "Over a 15-year period, the average milk yield of cows in the country increased by 34%.",
                  "answer": "c"
                },
                {
                  "id": "wu_2",
                  "text": "Despite continued pressure to give up the occupied territory, they will not yield.",
                  "answer": "b"
                },
                {
                  "id": "wu_3",
                  "text": "Burning waste yields energy that can be efficiently converted into electricity.",
                  "answer": "a"
                }
              ]
            },
            "commonPhrases": {
              "boxPhrases": [
                "relies on",
                "the same as",
                "is associated with"
              ],
              "bookExamples": [
                "The processes we rely on to produce, transport, and store meals are speeding up climate change.",
                "Animal-based foods are generally associated with the highest greenhouse gas emissions.",
                "The underlying concept for food printing is the same as any other 3D printing."
              ],
              "exercises": [
                {
                  "id": "cp_1",
                  "sentence": "Running for president successfully _______ political ads and campaign events.",
                  "answer": "relies on"
                },
                {
                  "id": "cp_2",
                  "sentence": "My opinion is not _______ yours because we don't experience life in the same way.",
                  "answer": "the same as"
                },
                {
                  "id": "cp_3",
                  "sentence": "According to research, taking frequent short breaks at work _______ increased productivity.",
                  "answer": "is associated with"
                }
              ]
            }
          }
        },
        {
          "activityId": "l3_lang_grammar",
          "type": "grammar_in_context",
          "title": "C. Grammar in Context (강조 용법 재귀대명사 & 독립부정사구)",
          "page": 73,
          "sourceRef": "Textbook p. 73, Answers p. 158",
          "data": {
            "grammarInContext": {
              "part1": {
                "ruleName": "재귀대명사의 강조 용법 (Emphatic Use of Reflexive Pronouns)",
                "explanation": "주어, 목적어, 보어를 강조하기 위해 쓰이는 재귀대명사로, 생략해도 문장의 기본 성분이 성립합니다.",
                "mainTextExamples": [
                  "The final product itself is a real cut of meat, ready to be cooked.",
                  "On top of that, algae are very good at trapping carbon themselves, which helps slow down global warming."
                ],
                "passage": "I made the plan myself for this trip to Budapest, the capital of Hungary. It is a city that captured my heart from the moment I arrived. Among the sites I visited, I recommend the Hungarian Parliament. When it is lit up with a thousand points of light at night, it is reflected on the water of the Danube River. The reflection itself will take your breath away.",
                "exercises": [
                  {
                    "id": "gr1_1",
                    "template": "Even though he had never attended school [himself], he wanted to send his brother to university.",
                    "answer": "himself"
                  },
                  {
                    "id": "gr1_2",
                    "template": "Sometimes, people don't realize that they [themselves] can help make a better future.",
                    "answer": "themselves"
                  }
                ]
              },
              "part2": {
                "ruleName": "독립부정사구 관용표현 (Parenthetical Infinitives)",
                "explanation": "문장 전체를 수식하는 독립부정사구로 말하는 사람의 태도나 입장을 덧붙입니다.",
                "boxPhrases": [
                  "To make matters worse",
                  "To be honest",
                  "To put it another way"
                ],
                "mainTextExamples": [
                  "To begin with, lab scientists carefully remove a small number of cells from an animal."
                ],
                "exercises": [
                  {
                    "id": "gr2_1",
                    "template": "Does she have the right work experience and skills? [ ], can she do the job?",
                    "answer": "To put it another way"
                  },
                  {
                    "id": "gr2_2",
                    "template": "We couldn't find a hotel in the city. [ ], all the plane tickets were sold out.",
                    "answer": "To make matters worse"
                  },
                  {
                    "id": "gr2_3",
                    "template": "A: What did you think of the movie?\nB: [ ], it wasn't very good.",
                    "answer": "To be honest"
                  }
                ]
              }
            }
          }
        }
      ]
    },
    {
      "id": "write_present",
      "cornerNumber": 7,
      "titleKo": "쓰기 스튜디오",
      "titleEn": "Write & Present: Proposing Eco-friendly School Meals",
      "pageRange": "pp. 74-76",
      "priority": "P2",
      "activities": [
        {
          "activityId": "l3_write_proposal",
          "type": "writing_studio",
          "title": "Proposing Eco-friendly School Meals (친환경 급식 제안서)",
          "pageRange": "pp. 74-76",
          "page": 74,
          "sourceRef": "Textbook pp. 74-76, Answers pp. 158-159",
          "data": {
            "writingWorkspace": {
              "modelWriting": {
                "title": "Model Proposal for Eco-friendly School Meals",
                "text": "I think too much food waste from the school cafeteria is a serious problem because this has a bad impact on the environment. In order to solve this problem, we need to involve students in planning school meals. First, we can survey students' food preferences so that they can be reflected in school meal planning. However, we need to let them know that nutritional value must be considered when it comes to planning school lunches. Second, we can have a contest for creative menu items. We can give a prize to the student who comes up with the most brilliant idea. By participating in planning school meals and creating new menu items, students will be more likely to clean their plates, which will help reduce food waste.",
                "headingsBox": [
                  "Problem",
                  "Proposed solutions",
                  "Expected results"
                ],
                "sections": [
                  {
                    "name": "(A) Problem",
                    "text": "I think too much food waste from the school cafeteria is a serious problem because this has a bad impact on the environment."
                  },
                  {
                    "name": "(B) Proposed solutions",
                    "text": "In order to solve this problem, we need to involve students in planning school meals. First, we can survey students' food preferences so that they can be reflected in school meal planning. However, we need to let them know that nutritional value must be considered when it comes to planning school lunches. Second, we can have a contest for creative menu items. We can give a prize to the student who comes up with the most brilliant idea."
                  },
                  {
                    "name": "(C) Expected results",
                    "text": "By participating in planning school meals and creating new menu items, students will be more likely to clean their plates, which will help reduce food waste."
                  }
                ]
              },
              "step1Analyze": {
                "instruction": "Analyze the text and label each part with an appropriate heading from the box.",
                "answers": {
                  "(A)": "Problem",
                  "(B)": "Proposed solutions",
                  "(C)": "Expected results"
                }
              },
              "step2Outline": {
                "problem": "too much food waste",
                "solutions": [
                  "involve students in planning school meals",
                  "survey students' food preferences",
                  "have a contest for creative menu items"
                ],
                "expectedResults": [
                  "students will be more likely to clean their plates",
                  "reduce food waste"
                ]
              },
              "step3Draft": {
                "rubric": [
                  {
                    "criterion": "문제 상황이 명확하게 제시되었는가?",
                    "maxScore": 25,
                    "descriptors": {
                      "우수": "급식 문제점과 환경적 영향이 명확히 기술됨",
                      "보통": "문제점이 언급되었으나 구체성이 다소 부족함"
                    }
                  },
                  {
                    "criterion": "구체적이고 실현 가능한 해결 방안 2가지가 제시되었는가?",
                    "maxScore": 35,
                    "descriptors": {
                      "우수": "학생 참여 유도 및 창의적 식단 공모전 등 실현 가능한 방안 제시",
                      "보통": "해결 방안이 1가지만 제시되었거나 모호함"
                    }
                  },
                  {
                    "criterion": "해결 방안에 따른 기대 효과가 논리적으로 도출되었는가?",
                    "maxScore": 25,
                    "descriptors": {
                      "우수": "음식물 쓰레기 감축 등 기대 효과가 논리적으로 연결됨",
                      "보통": "기대 효과 서술이 미흡함"
                    }
                  },
                  {
                    "criterion": "조동사 및 문법 규칙이 바르게 적용되었는가?",
                    "maxScore": 15,
                    "descriptors": {
                      "우수": "문법적 오류 없이 조동사 동사원형 규칙을 준수함",
                      "보통": "사소한 문법적 오류가 1~2개 있음"
                    }
                  }
                ]
              },
              "step4Revise": {
                "editingPractice": {
                  "textWithErrors": "There is widespread agreement that consumers should switches to sustainable diets. To do this, different levels of measures will is necessary. For one, we can places a major emphasis on sustainable eating habits.",
                  "corrections": [
                    {
                      "original": "switches",
                      "corrected": "switch",
                      "explanation": "조동사(should) 뒤에는 동사의 원형(switch)을 씁니다."
                    },
                    {
                      "original": "will is",
                      "corrected": "will be",
                      "explanation": "조동사(will) 뒤에는 be동사의 원형(be)을 씁니다."
                    },
                    {
                      "original": "places",
                      "corrected": "place",
                      "explanation": "조동사(can) 뒤에는 동사의 원형(place)을 씁니다."
                    }
                  ]
                }
              }
            }
          }
        }
      ]
    },
    {
      "id": "go_global",
      "cornerNumber": 8,
      "titleKo": "세계의 친환경 요리 & Wrap Up",
      "titleEn": "Go Global & Wrap Up",
      "pageRange": "pp. 77-79",
      "priority": "P2",
      "activities": [
        {
          "activityId": "l3_go_global_recipes",
          "type": "eco_friendly_recipes",
          "title": "Go Global: Eco-friendly Recipes",
          "page": 77,
          "sourceRef": "Textbook p. 77, Sources p. 169",
          "data": {
            "goGlobal": {
              "intro": "What you put on your plate matters to both you and the earth. When you fuel your body with plant-based food, you can reduce both the risk of getting many diseases and your carbon footprint. Here are some eco-friendly recipes from around the world.",
              "recipes": [
                {
                  "name": "Bibimbap with Crispy Tofu",
                  "steps": [
                    "1 To make the sauce, put water, soy sauce, gochujang, and sesame oil in a bowl and stir.",
                    "2 Bake tofu in the oven until it is fully cooked.",
                    "3 Put rice in a bowl. Add the baked tofu, mushrooms, a fried egg, sliced avocados, and so on.",
                    "4 Add sesame seeds on top and serve with the sauce."
                  ]
                },
                {
                  "name": "Vegan Burritos",
                  "steps": [
                    "1 Lay out a tortilla and put some vegetables on it.",
                    "2 Add some avocado slices, then top with some bean sauce.",
                    "3 Fold the bottom up, bring the sides in, and then roll it up.",
                    "4 Cut in half and serve."
                  ]
                },
                {
                  "name": "Spring Rolls",
                  "steps": [
                    "1 Dip a rice paper wrapper into a bowl of water and put it on a plate.",
                    "2 Lay vegetables and herbs on top of the rice paper.",
                    "3 Fold the left and right sides of the wrapper and tightly roll it up.",
                    "4 Serve with peanut sauce."
                  ]
                }
              ],
              "sourceCitation": "THE SIMPLE VEGANISTA, VEGAN BURRITO 외 다수 (p. 169)"
            }
          }
        },
        {
          "activityId": "l3_wrap_up_activities",
          "type": "wrap_up_activities",
          "title": "Wrap Up: Part A, B, C",
          "page": 78,
          "sourceRef": "Textbook p. 78, Scripts p. 147, Answers p. 159",
          "data": {
            "partA": {
              "question": "What is the girl going to drink?",
              "options": [
                "a. coffee",
                "b. orange juice",
                "c. watermelon juice"
              ],
              "answer": "c. watermelon juice",
              "script": [
                {
                  "speaker": "G",
                  "en": "So, what are you going to have?"
                },
                {
                  "speaker": "B",
                  "en": "I'm going to have watermelon juice."
                },
                {
                  "speaker": "G",
                  "en": "I didn't know that you liked watermelon juice because you always order coffee."
                },
                {
                  "speaker": "B",
                  "en": "Well, I like to drink fresh fruit juice when the fruit is in season because that's when it tastes the best. Also, it's important to consume seasonal fruits for the environment."
                },
                {
                  "speaker": "G",
                  "en": "Really? How so?"
                },
                {
                  "speaker": "B",
                  "en": "Growing fruits out of season requires a lot of energy for artificial heating or lighting. So, trying seasonal drinks makes you a green consumer."
                },
                {
                  "speaker": "G",
                  "en": "That makes sense. Then, I'll go with watermelon juice, too."
                },
                {
                  "speaker": "B",
                  "en": "Good choice!"
                }
              ]
            },
            "partB": {
              "instruction": "Think of some ways to make eco-friendly dishes and practice the dialogue with a classmate.",
              "dialogue": [
                {
                  "speaker": "A",
                  "en": "What should we do to make eco-friendly dishes?"
                },
                {
                  "speaker": "B",
                  "en": "I think we should use plant-based ingredients to reduce our impact on the planet."
                },
                {
                  "speaker": "A",
                  "en": "That's a great idea."
                }
              ]
            },
            "partC": {
              "passage": "Algae are the fastest growing plant organisms in nature and a great alternative source of vitamins, proteins, and minerals. Not only full of nutrients, they are also easy to grow and don't take up precious land space as they are grown in water. They can grow in places where normal food crops wouldn't survive and yield much higher productivity than crops grown on land. In addition, they create very rich habitats for plants and animals. On top of that, algae are very good at trapping carbon themselves, which helps slow down global warming.",
              "quiz1": {
                "question": "Which one is NOT correct according to the passage?",
                "options": [
                  "a. Algae grow in the same environment as normal food crops.",
                  "b. Algae make habitats for other creatures and can trap carbon themselves.",
                  "c. Algae are full of nutrients, and they don't take up land space since they grow in water."
                ],
                "answer": "a"
              },
              "quiz2": {
                "question": "Write the topic of the passage using the given expressions. (benefits / algae / a source of food)",
                "answer": "benefits of algae as a source of food"
              }
            }
          }
        },
        {
          "activityId": "l3_lesson_summary",
          "type": "lesson_summary",
          "title": "Lesson Summary & Topic Reflection",
          "page": 79,
          "sourceRef": "Textbook p. 79, Answers p. 159",
          "data": {
            "selfCheck": [
              {
                "corner": "Communicate on Topic",
                "statement": "I learned about various ways to practice sustainable food culture."
              },
              {
                "corner": "Read",
                "statement": "I read about future foods that might help solve the food crisis."
              },
              {
                "corner": "Share Your Thoughts",
                "statement": "I talked about creative ideas to upcycle food."
              },
              {
                "corner": "Write & Present",
                "statement": "I wrote a proposal for eco-friendly school meals."
              },
              {
                "corner": "Go Global",
                "statement": "I read about eco-friendly recipes from around the world."
              }
            ],
            "thinkBack": {
              "q1": "What was the most interesting part of this lesson? Why?",
              "q2": "How can we make our food culture sustainable?",
              "sampleAnswer": "We can reduce real meat consumption, change our diets, and upcycle food."
            }
          }
        }
      ]
    }
  ]
}

# Write to content/lesson-03.json
target_file = ROOT / 'content' / 'lesson-03.json'
with open(target_file, 'w', encoding='utf-8') as f:
    json.dump(lesson3_data, f, ensure_ascii=False, indent=2)

print(f"Successfully generated {target_file}")
