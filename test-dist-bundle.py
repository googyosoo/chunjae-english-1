import os
import glob

phrases = [
    'pull the plug',
    'Old habits die hard',
    'Volunteering has a great deal of benefits',
    'Six Strings is a cool place',
    'momentarily let down my guard',
    'Kobe bryant inspired a generation',
]

dist_files = glob.glob('dist/**/*', recursive=True)
dist_files = [f for f in dist_files if os.path.isfile(f)]

print(f'Checking {len(dist_files)} files in dist/...')

found_total = 0
for phrase in phrases:
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

print('-----------------------------------------')
if found_total == 0:
    print('RESULT: SUCCESS - Exactly 0 textbook sentences found in production dist bundle!')
else:
    print(f'RESULT: FAILED - {found_total} textbook sentences found in dist bundle!')
