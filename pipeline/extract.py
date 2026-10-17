import os
import sys
import json
import subprocess
import fitz
from PIL import Image

def load_lesson_config(lesson_id):
    config_path = os.path.join(os.path.dirname(__file__), 'lessons.json')
    with open(config_path, 'r', encoding='utf-8') as f:
        data = json.load(f)
    if lesson_id not in data:
        raise ValueError(f"Unknown lesson: {lesson_id}. Available: {list(data.keys())}")
    return data[lesson_id]

def extract_text_for_page(pdf_path, page_num, raw_dir):
    os.makedirs(raw_dir, exist_ok=True)
    plain_out = os.path.join(raw_dir, f'p{page_num}.txt')
    layout_out = os.path.join(raw_dir, f'p{page_num}_layout.txt')

    # 1. pdftotext 일반 판
    try:
        subprocess.run(
            ['pdftotext', '-enc', 'UTF-8', '-f', str(page_num), '-l', str(page_num), pdf_path, plain_out],
            check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
    except Exception:
        pass

    # 2. pdftotext -layout 판
    try:
        subprocess.run(
            ['pdftotext', '-layout', '-enc', 'UTF-8', '-f', str(page_num), '-l', str(page_num), pdf_path, layout_out],
            check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
    except Exception:
        pass

    # 3. fitz 고품질 유니코드 텍스트 추출 (드롭캡/레이아웃 누락 방지)
    try:
        fitz_out = os.path.join(raw_dir, f'p{page_num}_fitz.txt')
        doc = fitz.open(pdf_path)
        page_text = doc[page_num - 1].get_text()
        with open(fitz_out, 'w', encoding='utf-8') as f:
            f.write(page_text)
    except Exception as e:
        print(f"Warning extracting fitz text for p{page_num}: {e}")

def render_page_image(pdf_path, page_num, img_dir):
    os.makedirs(img_dir, exist_ok=True)
    out_prefix = os.path.join(img_dir, f'p{page_num}')
    try:
        subprocess.run(
            ['pdftoppm', '-png', '-r', '150', '-f', str(page_num), '-l', str(page_num), pdf_path, out_prefix],
            check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE
        )
        # pdftoppm generates prefix-01.png or prefix-1.png or prefix-001.png
        # Rename to clean p{page_num}.png
        for f in os.listdir(img_dir):
            if f.startswith(f'p{page_num}-') and f.endswith('.png'):
                old_path = os.path.join(img_dir, f)
                new_path = os.path.join(img_dir, f'p{page_num}.png')
                if os.path.exists(new_path):
                    os.remove(new_path)
                os.rename(old_path, new_path)
                break
    except Exception as e:
        # fitz fallback
        doc = fitz.open(pdf_path)
        page = doc[page_num - 1]
        pix = page.get_pixmap(dpi=150)
        pix.save(os.path.join(img_dir, f'p{page_num}.png'))

def main():
    if len(sys.argv) < 2:
        print("Usage: python pipeline/extract.py <lesson-01 | lesson-02>")
        sys.exit(1)

    lesson_id = sys.argv[1]
    config = load_lesson_config(lesson_id)
    pdf_path = config.get('pdfPath')
    if not os.path.exists(pdf_path):
        fallback = 'C:/Users/user/Desktop/고등_영어1(강상구)_교과서.pdf'
        if os.path.exists(fallback):
            pdf_path = fallback
        else:
            raise FileNotFoundError(f"PDF not found at {pdf_path}")

    raw_dir = os.path.join(os.path.dirname(__file__), 'raw', lesson_id)
    img_dir = os.path.join(raw_dir, 'images')
    os.makedirs(raw_dir, exist_ok=True)

    pages_to_extract = set()
    pages_cfg = config['pages']
    for category in ['main', 'scripts', 'answers', 'sources']:
        if category in pages_cfg:
            start, end = pages_cfg[category]
            for p in range(start, end + 1):
                pages_to_extract.add(p)

    sorted_pages = sorted(list(pages_to_extract))
    print(f"Extracting {len(sorted_pages)} pages for {lesson_id} from {pdf_path}...")

    for p in sorted_pages:
        extract_text_for_page(pdf_path, p, raw_dir)
        render_page_image(pdf_path, p, img_dir)

    print(f"Extraction complete! Raw text saved to {raw_dir}")

if __name__ == '__main__':
    main()
