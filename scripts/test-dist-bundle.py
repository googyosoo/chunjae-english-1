import os
import glob
import sys

# 교과서 핵심 원문 문장들 (프로덕션 JS 번들에 노출되어서는 안 됨)
textbook_phrases = [
    'pull the plug',
    'Old habits die hard',
    'Volunteering has a great deal of benefits',
    'Six Strings is a cool place',
    'momentarily let down my guard',
    'Kobe bryant inspired a generation',
    'I check my phone while I eat',
    'to think carefully and deeply',
    'ill CU l8r',
]

# 보안 및 테스트 뒷문 제거 검증 문자열 (배포용 코드에서 0건이어야 함)
forbidden_code_phrases = [
    '__E2E_USER__',
    '/content/lesson-01.json',
]

dist_files = glob.glob('dist/**/*', recursive=True)
dist_files = [f for f in dist_files if os.path.isfile(f) and (f.endswith('.js') or f.endswith('.html'))]

print(f'Checking {len(dist_files)} JS/HTML files in dist/...')

found_total = 0

print('\n[1] 교과서 원문 텍스트 번들 누출 검사:')
for phrase in textbook_phrases:
    found_count = 0
    for f in dist_files:
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
                if phrase.lower() in content.lower():
                    found_count += 1
                    print(f'  [FOUND] "{phrase}" in {f}')
        except Exception:
            pass
    if found_count == 0:
        print(f'  [PASS] "{phrase}": 0 matches in dist')
    else:
        found_total += found_count

print('\n[2] 테스트 뒷문 및 우회 경로 제거 검사:')
for phrase in forbidden_code_phrases:
    found_count = 0
    for f in dist_files:
        try:
            with open(f, 'r', encoding='utf-8', errors='ignore') as fp:
                content = fp.read()
                if phrase in content:
                    found_count += 1
                    print(f'  [FOUND BACKDOOR] "{phrase}" in {f}')
        except Exception:
            pass
    if found_count == 0:
        print(f'  [PASS] "{phrase}": 0 matches in dist')
    else:
        found_total += found_count

print('\n-----------------------------------------')
if found_total == 0:
    print('RESULT: SUCCESS - 0 textbook sentences and 0 backdoor strings found in production dist!')
    sys.exit(0)
else:
    print(f'RESULT: FAILED - {found_total} forbidden strings found in dist bundle!')
    sys.exit(1)
