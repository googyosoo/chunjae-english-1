import os
import sys
import json
import re
import glob
import subprocess
from datetime import datetime

# 검증 제외 대상 키 (화이트리스트: 한국어 번역, 해설, 피드백, 식별자, 링크, 템플릿 태그, UI 레이블, 문항 안내 등)
WHITELIST_KEYS = {
    'ko', 'korean', 'translation', 'explanation', 'feedback', 'instruction_ko',
    'title_ko', 'tip', 'koreanMeaning', 'description', 'notes', 'teacherNotes',
    'id', 'lessonId', 'activityId', 'type', 'role', 'audioUrl', 'youtubeUrl',
    'sourceUrl', 'speaker', 'label', 'timestamp', 'alt', 'image', 'imageUrl',
    'sourceCitation', 'sourceRef', 'page', 'pageRange', 'school',
    'title', 'subtitle', 'heading', 'titleEn', 'titleKo', 'topic',
    'step', 'cornerTitle', 'priority', 'template', 'rubric', 'example',
    'writingTip', 'usefulExpressions', 'positiveAnswer', 'negativeAnswer',
    'sampleAnswer', 'grammarTip', 'meaning', 'category', 'categories',
    'sample', 'dialogueTemplate', 'videoTitle', 'instruction', 'expression',
    'statement', 'fullAnswer', 'prompt', 'question_ko', 'invitingRemarks',
    'ruleExplanation', 'ruleName', 'reason', 'corrections', 'target'
}

def clean_invisible_chars(text):
    """PDF 조판용 제로위드 문자(\u200b~\u200f), ASCII 제어문자, 불릿 기호, 특수 공백, U+FFFD 등을 완전 제거/치환"""
    t = re.sub(r'[\u2000-\u200f\u2028-\u202f\ufeff\u2022]', ' ', text)
    t = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', ' ', t)
    t = t.replace('\ufffd', ' ').replace('’', "'").replace('‘', "'").replace('“', '"').replace('”', '"')
    t = t.replace('—', ' ').replace('–', ' ')
    t = re.sub(r'\[blank[^\]]*\]', ' ', t)
    return t

def filter_page_headers_footers(text):
    """페이지 경계에서 문장을 끊어먹는 페이지 번호 및 반복 헤더/푸터 제거"""
    lines = text.split('\n')
    filtered = []
    for line in lines:
        stripped = line.strip()
        if re.match(r'^\d{1,3}$', stripped):
            continue
        if re.match(r'^(?:\d{1,3}\s+)?(?:Scripts|Answers|Sources|Lesson\s*\d+|Digital Well-being|Spark Your Creativity|Special Lesson)(?:\s+\d{1,3})?$', stripped, re.IGNORECASE):
            continue
        filtered.append(line)
    return '\n'.join(filtered)

def load_raw_texts(raw_dir):
    """raw_dir 내의 페이지별 텍스트를 1~180 순서대로 순차 로딩하여 연속된 단어 시퀀스 풀 생성"""
    raw_pages = {}
    combined_raw_tokens = []
    
    # 페이지 번호 순서(1..180)로 순차 순회하여 페이지 경계 문장 단절 방지
    for p in range(1, 180):
        fitz_file = os.path.join(raw_dir, f'p{p}_fitz.txt')
        plain_file = os.path.join(raw_dir, f'p{p}.txt')
        layout_file = os.path.join(raw_dir, f'p{p}_layout.txt')
        
        page_texts = []
        for candidate in [fitz_file, plain_file, layout_file]:
            if os.path.exists(candidate):
                try:
                    with open(candidate, 'r', encoding='utf-8', errors='ignore') as fp:
                        txt = filter_page_headers_footers(fp.read())
                        page_texts.append(txt)
                except Exception as e:
                    print(f"Warning reading {candidate}: {e}")
        
        if page_texts:
            merged_page = "\n".join(page_texts)
            raw_pages[p] = merged_page
            combined_raw_tokens.extend(tokenize_words(merged_page))
                
    full_tokens_str = " ".join(combined_raw_tokens)
    return raw_pages, full_tokens_str, combined_raw_tokens

def tokenize_words(text):
    """조판 문자 정제 후 순수 영문/숫자 토큰 단위 추출"""
    t = clean_invisible_chars(text)
    return [w.lower() for w in re.findall(r"[A-Za-z0-9]+", t)]

def extract_strings_with_context(data, parent_key=''):
    """JSON 트리 순회하며 (키, 값) 추출"""
    if isinstance(data, str):
        yield (parent_key, data)
    elif isinstance(data, dict):
        for k, v in data.items():
            yield from extract_strings_with_context(v, k)
    elif isinstance(data, list):
        for item in data:
            yield from extract_strings_with_context(item, parent_key)

def check_ngram_overlap(sentence_tokens, raw_tokens_list, n=5, threshold=0.8):
    """5단어 n-gram 겹침 비율 80% 이상인지 확인"""
    if len(sentence_tokens) < n:
        target = " ".join(sentence_tokens)
        return target in " ".join(raw_tokens_list)
    
    ngrams = []
    for i in range(len(sentence_tokens) - n + 1):
        ngrams.append(" ".join(sentence_tokens[i:i+n]))
    
    raw_str = " ".join(raw_tokens_list)
    matches = sum(1 for ng in ngrams if ng in raw_str)
    ratio = matches / len(ngrams)
    return ratio >= threshold

def verify_sentence(sentence_tokens, full_tokens_str, raw_tokens_list):
    """한 영문 문장이 원문에 존재하는지 검증"""
    if len(sentence_tokens) < 4:
        return True, 1.0 # 4단어 미만은 통과
    
    target_str = " ".join(sentence_tokens)
    
    # 1. 완벽한 연속 단어 시퀀스 일치
    if target_str in full_tokens_str:
        return True, 1.0
    
    # 2. 5단어 n-gram 겹침 80% 이상 검사
    if check_ngram_overlap(sentence_tokens, raw_tokens_list, n=min(5, len(sentence_tokens)), threshold=0.8):
        return True, 0.85
        
    return False, 0.0

def run_zod_validation(json_path):
    """Node check-schema.ts를 호출하여 Zod 스키마 검증 (Windows npx.cmd 지원)"""
    npx_cmd = 'npx.cmd' if sys.platform == 'win32' else 'npx'
    cmd = [npx_cmd, 'tsx', 'pipeline/check-schema.ts', json_path]
    try:
        proc = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True, timeout=30, shell=True)
        out = proc.stdout.strip()
        if out:
            res = json.loads(out)
            return res.get('success', False), res.get('errors', [])
        return False, [f"No output from schema checker. Stderr: {proc.stderr}"]
    except Exception as e:
        return False, [str(e)]

def main():
    if len(sys.argv) < 2:
        print("Usage: python pipeline/verify.py <content/lesson-01.json>")
        sys.exit(1)

    json_path = sys.argv[1]
    if not os.path.exists(json_path):
        print(f"Error: {json_path} does not exist.")
        sys.exit(1)

    basename = os.path.basename(json_path)
    lesson_id = os.path.splitext(basename)[0] # lesson-01

    with open(json_path, 'r', encoding='utf-8') as fp:
        lesson_data = json.load(fp)

    raw_dir = os.path.join(os.path.dirname(__file__), 'raw', lesson_id)
    if not os.path.exists(raw_dir):
        print(f"Error: raw directory {raw_dir} not found. Run pipeline/extract.py {lesson_id} first.")
        sys.exit(1)

    raw_pages, full_tokens_str, raw_tokens_list = load_raw_texts(raw_dir)

    print(f"Verifying {json_path} against raw textbook texts in {raw_dir}...")

    # 1. Zod 스키마 검증
    schema_ok, schema_errors = run_zod_validation(json_path)

    # 2. 영어 문자열 추출 및 원문 대조
    candidate_sentences = []
    unverified_sentences = []
    verified_count = 0

    for key, text in extract_strings_with_context(lesson_data):
        if key in WHITELIST_KEYS:
            continue
        if text.startswith('http://') or text.startswith('https://') or text.endswith('.mp3') or text.endswith('.png'):
            continue
        
        # [blank] 치환
        cleaned = re.sub(r'\[blank[^\]]*\]', ' ', text)
        
        # 문장 단위 분리 (. ! ? \n) - 약어 U.S. 등을 위해 마침표 뒤 공백 또는 줄끝 체크
        parts = re.split(r'(?:\r?\n|[.!?]+(?:\s+|$))', cleaned)
        for part in parts:
            part_str = part.strip()
            # 영단어 토큰 추출
            tokens = tokenize_words(part_str)
            if len(tokens) >= 4:
                phrase = " ".join(tokens)
                candidate_sentences.append((key, phrase))
                ok, ratio = verify_sentence(tokens, full_tokens_str, raw_tokens_list)
                if ok:
                    verified_count += 1
                else:
                    unverified_sentences.append((key, phrase))

    # 3. 필수 필드 (page, sourceRef) 검사
    missing_pages = []
    missing_sources = []
    for corner in lesson_data.get('corners', []):
        c_title = corner.get('titleEn', corner.get('id', 'Untitled'))
        for act in corner.get('activities', []):
            act_id = act.get('activityId', 'unknown')
            if 'page' not in act:
                missing_pages.append(f"{c_title} -> {act_id}")
            act_data = act.get('data', {})
            if ('youtubeUrl' in act_data or 'videoTitle' in act_data):
                if 'sourceRef' not in act and 'sourceRef' not in act_data and 'sourceCitation' not in act_data:
                    missing_sources.append(f"{c_title} -> {act_id}")

    # 리포트 생성
    reports_dir = os.path.join(os.path.dirname(__file__), 'reports')
    os.makedirs(reports_dir, exist_ok=True)
    report_file = os.path.join(reports_dir, f"{lesson_id}.md")

    is_success = schema_ok and len(unverified_sentences) == 0 and len(missing_pages) == 0 and len(missing_sources) == 0

    with open(report_file, 'w', encoding='utf-8') as rp:
        rp.write(f"# Verification Report: {lesson_id}\n\n")
        rp.write(f"- Date: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}\n")
        rp.write(f"- Target: `{json_path}`\n")
        rp.write(f"- Overall Status: **{'PASS' if is_success else 'FAIL'}**\n\n")
        
        rp.write("## 1. Zod Schema Validation\n")
        if schema_ok:
            rp.write("- Status: **PASS** (100% Valid)\n\n")
        else:
            rp.write(f"- Status: **FAIL** ({len(schema_errors)} errors)\n")
            for err in schema_errors[:20]:
                rp.write(f"  - `{err}`\n")
            rp.write("\n")

        rp.write("## 2. Textbook Raw Text Verification (>= 4 words)\n")
        rp.write(f"- Total Candidate Sentences: {len(candidate_sentences)}\n")
        rp.write(f"- Verified Sentences: {verified_count}\n")
        rp.write(f"- Unverified Sentences: {len(unverified_sentences)}\n\n")

        if unverified_sentences:
            rp.write("### Unverified Sentence List:\n")
            for key, phrase in unverified_sentences:
                rp.write(f"- `[{key}]` \"{phrase}\"\n")
            rp.write("\n")
        else:
            rp.write("- All English textbook sentences verified against raw textbook pages (0 unverified sentences)!\n\n")

        rp.write("## 3. Required Metadata Fields\n")
        rp.write(f"- Missing `page` attributes: {len(missing_pages)}\n")
        for mp in missing_pages:
            rp.write(f"  - {mp}\n")
        rp.write(f"- Missing `sourceRef` attributes: {len(missing_sources)}\n")
        for ms in missing_sources:
            rp.write(f"  - {ms}\n")
        rp.write("\n")

    print(f"\nReport written to {report_file}")
    print(f"Summary: Schema={schema_ok}, Unverified={len(unverified_sentences)}, MissingPages={len(missing_pages)}, MissingSources={len(missing_sources)}")

    if is_success:
        print("RESULT: SUCCESS - All verification checks passed!")
        sys.exit(0)
    else:
        print("RESULT: FAILED - Issues found. See report for details.")
        sys.exit(1)

if __name__ == '__main__':
    main()
