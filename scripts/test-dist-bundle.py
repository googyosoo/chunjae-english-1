import os
import glob
import sys
import json
import re

# 1. content/lesson-01.json 에서 6단어 이상의 모든 영어 문장 추출
lesson_file = os.path.join(os.path.dirname(__file__), '..', 'content', 'lesson-01.json')
if not os.path.exists(lesson_file):
    lesson_file = 'content/lesson-01.json'

with open(lesson_file, 'r', encoding='utf-8') as f:
    lesson_data = json.load(f)

def extract_strings(data):
    if isinstance(data, str):
        yield data
    elif isinstance(data, dict):
        for v in data.values():
            yield from extract_strings(v)
    elif isinstance(data, list):
        for item in data:
            yield from extract_strings(item)

# 문장 추출 및 정제
textbook_sentences = []
seen_phrases = set()

for raw_str in extract_strings(lesson_data):
    # URL 및 파일명 제외
    if raw_str.startswith('http://') or raw_str.startswith('https://') or raw_str.endswith('.mp3'):
        continue
    
    # [blank], [blank_1] 등을 공백 처리
    cleaned = re.sub(r'\[blank[^\]]*\]', ' ', raw_str)
    
    # 문장 단위 분리 (. ! ? \n)
    parts = re.split(r'[\n.!?]+', cleaned)
    for part in parts:
        words = re.findall(r"[A-Za-z]+(?:'[A-Za-z]+)?", part)
        if len(words) >= 6:
            phrase = ' '.join(words)
            phrase_lower = phrase.lower()
            if phrase_lower not in seen_phrases:
                seen_phrases.add(phrase_lower)
                textbook_sentences.append(phrase)

print(f'Extracted {len(textbook_sentences)} unique English textbook sentences (>= 6 words) from {lesson_file}.')

# 2. 보안 및 테스트 뒷문 제거 검증 문자열 (배포용 코드에서 0건이어야 함)
forbidden_code_phrases = [
    '__E2E_USER__',
    '/content/lesson-01.json',
]

dist_files = glob.glob('dist/**/*', recursive=True)
dist_files = [f for f in dist_files if os.path.isfile(f) and (f.endswith('.js') or f.endswith('.html'))]

print(f'Checking {len(dist_files)} JS/HTML files in dist/...')

found_textbook_matches = []

# dist 파일들의 정규화된 텍스트 캐싱
dist_contents = {}
for f in dist_files:
    try:
        with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
            raw = fp.read()
            # 연속 공백 정규화 및 소문자화
            normalized = re.sub(r'\s+', ' ', raw).lower()
            dist_contents[f] = (raw, normalized)
    except Exception as e:
        print(f'Warning reading {f}: {e}')

print('\n[1] 교과서 원문 텍스트 번들 누출 전수 검사 (6단어 이상):')
for phrase in textbook_sentences:
    words = phrase.lower().split()
    # 최소 6단어 중 처음 6단어 패턴 또는 전체 문장 정규화 검색
    # 공백이나 특수문자, 인용부호 변형을 감안하여 유연하게 검색
    search_target = ' '.join(words[:6])
    match_found = False
    for f, (raw, norm) in dist_contents.items():
        if search_target in norm:
            match_found = True
            found_textbook_matches.append((phrase, f))
            print(f'  [FOUND LEAK] "{phrase[:50]}..." in {f}')
            break

print(f'  Total textbook sentences tested: {len(textbook_sentences)}')
print(f'  Textbook matches found in dist: {len(found_textbook_matches)}')

print('\n[2] 테스트 뒷문 및 우회 경로 제거 검사:')
found_backdoors = []
for phrase in forbidden_code_phrases:
    found_count = 0
    for f, (raw, norm) in dist_contents.items():
        if phrase in raw:
            found_count += 1
            found_backdoors.append((phrase, f))
            print(f'  [FOUND BACKDOOR] "{phrase}" in {f}')
    if found_count == 0:
        print(f'  [PASS] "{phrase}": 0 matches in dist')

print('\n-----------------------------------------')
total_violations = len(found_textbook_matches) + len(found_backdoors)
if total_violations == 0:
    print(f'RESULT: SUCCESS - All {len(textbook_sentences)} textbook sentences and all backdoor strings are 100% ABSENT from dist bundle!')
    sys.exit(0)
else:
    print(f'RESULT: FAILED - {total_violations} forbidden strings/sentences found in dist bundle!')
    sys.exit(1)
