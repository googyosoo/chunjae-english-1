"""
독립 검수 스크립트 (Claude 작성, Antigravity 수정 금지)

교과서 PDF 원문을 직접 읽어 content/lesson-XX.json을 대조한다.
pipeline/verify.py와 별개로 동작하며, 이 스크립트가 ERROR 0건이어야 작업 완료로 보고할 수 있다.

사용법
  python qa/audit.py lesson-02            # 한 단원
  python qa/audit.py --all                # content/ 의 모든 단원
  python qa/audit.py --all --dist dist    # + 빌드 결과물에 교과서 문장이 새는지 검사
  옵션: --pdf <경로>  (기본: pipeline/lessons.json 의 pdfPath, 또는 환경변수 TEXTBOOK_PDF)

결과: 콘솔 요약 + qa/reports/<lesson>.md, ERROR가 있으면 종료 코드 1
"""
import argparse, glob, json, os, re, sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
REPORT_DIR = ROOT / "qa" / "reports"

# 원문 대조를 하지 않는 키: 한국어, 식별자, 메타데이터만
SKIP_KEYS = {
    "ko", "korean", "translation", "meaningKo", "koreanMeaning", "explanation", "feedback", "hint",
    "tip", "desc", "description", "alt", "id", "lessonId", "activityId", "sectionId", "evidenceSentenceId",
    "type", "role", "speaker", "label", "letter", "pos", "priority", "page", "pageRange", "pageRef",
    "sourceRef", "school", "instruction_ko", "question_ko", "titleKo", "title_ko", "labelKo",
    "placeholder", "skillDesc", "writingTip", "grammarTip", "ruleExplanation", "ruleName", "corner",
}
# 화면용 제목: 교과서에 없으면 WARN (지어낸 소제목 탐지)
UI_KEYS = {"topic", "title", "titleEn", "heading", "subtitle", "cornerTitle", "uiLabel", "videoTitle",
           "sourceCitation", "section", "skillName", "skillTitle", "projectTitle", "articleTitle"}
# 교사가 설계한 평가 기준 등: 교과서 밖 영어 허용(집계만)
AUTHORED_KEYS = {"criterion", "guideline", "rubric", "teacherNote", "aiPrompt", "fullAnswer", "template"}
URL_KEYS_HINT = ("url", "Url", "URL")
IMAGE_KEYS = {"asset", "image", "imageUrl", "img", "src", "thumbnail"}
IMAGE_RE = re.compile(r"\.(png|jpe?g|webp|gif|svg)(\?|$)|/api/asset", re.I)
YT_RE = re.compile(r"(?:v=|embed/|youtu\.be/)([\w-]{11})")
FORBIDDEN_RE = re.compile(r"\bundefined\b|\bTODO\b|lorem ipsum|dQw4w9WgXcQ", re.I)


def norm(s: str) -> str:
    s = s.replace("’", "'").replace("‘", "'").replace("“", '"').replace("”", '"')
    s = re.sub(r"[^a-z0-9]+", " ", s.lower())
    return " ".join(s.split())


def load_lessons_meta():
    p = ROOT / "pipeline" / "lessons.json"
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else {}


def page_list(rng):
    if not rng:
        return []
    a, b = rng
    return list(range(int(a), int(b) + 1))


class PdfText:
    """PDF에서 쪽 텍스트를 직접 읽는다. PDF가 없으면 pipeline/raw로 대체하고 경고한다."""

    def __init__(self, pdf_path, lesson):
        self.lesson, self.mode, self.doc, self.reader = lesson, None, None, None
        if pdf_path and Path(pdf_path).exists():
            try:
                import fitz  # PyMuPDF
                self.doc, self.mode = fitz.open(pdf_path), "pymupdf"
            except ImportError:
                try:
                    from pypdf import PdfReader
                    self.reader, self.mode = PdfReader(pdf_path), "pypdf"
                except ImportError:
                    pass
        if not self.mode:
            self.mode = "raw-fallback"

    def page(self, n):
        if self.mode == "pymupdf":
            pg = self.doc[n - 1]
            blocks = sorted(pg.get_text("blocks"), key=lambda b: (round(b[0] / 150), b[1]))
            return pg.get_text() + "\n" + "\n".join(b[4] for b in blocks)
        if self.mode == "pypdf":
            return self.reader.pages[n - 1].extract_text() or ""
        out = []
        for suffix in ("", "_layout", "_fitz"):
            f = ROOT / "pipeline" / "raw" / self.lesson / f"p{n}{suffix}.txt"
            if f.exists():
                out.append(f.read_text(encoding="utf-8", errors="ignore"))
        return "\n".join(out)


def segments(text):
    t = re.sub(r"\(\s*pp?\.\s*[\d\s,~\-\u2013]+\)", " ", text)
    t = re.sub(r"\[[^\]]*\]|_{2,}|\(\s*[a-z]+(\s*/\s*[a-z]+)+\s*\)", " | ", t)
    for part in re.split(r"[|\n]|(?<=[.!?])\s+", t):
        n = norm(part)
        if len(n.split()) >= 4:
            yield part.strip(), n


def match_ratio(n, hay, hay_ns):
    """1.0 = 그대로 있음. 4단어 묶음 일치 비율을 돌려준다(쪽 넘김·여백 질문으로 끊긴 문장 대비)."""
    if n in hay or n.replace(" ", "") in hay_ns:
        return 1.0
    w = n.split()
    grams = [" ".join(w[i:i + 4]) for i in range(len(w) - 3)]
    return sum(g in hay for g in grams) / len(grams) if grams else 0.0


def walk(o, path="", key=""):
    if isinstance(o, dict):
        for k, v in o.items():
            yield from walk(v, f"{path}.{k}", k)
    elif isinstance(o, list):
        for i, x in enumerate(o):
            yield from walk(x, f"{path}[{i}]", key)
    else:
        yield path, key, o


def pages_of(value):
    out = []
    if isinstance(value, int):
        out.append(value)
    elif isinstance(value, str):
        for a, b in re.findall(r"(\d{1,3})\s*[-~–]\s*(\d{1,3})", value):
            out += list(range(int(a), int(b) + 1))
        out += [int(x) for x in re.findall(r"\d{1,3}", value)]
    return out


def audit_lesson(lesson_id, meta, pdf_override, dist_dir):
    data_path = ROOT / "content" / f"{lesson_id}.json"
    data = json.loads(data_path.read_text(encoding="utf-8"))
    m = meta.get(lesson_id, {})
    pages = m.get("pages", {})
    pdf_path = pdf_override or os.environ.get("TEXTBOOK_PDF") or m.get("pdfPath")
    src = PdfText(pdf_path, lesson_id)

    main_pages = page_list(pages.get("main"))
    groups = {k: " ".join(src.page(p) for p in page_list(pages.get(k))) for k in ("main", "scripts", "answers", "sources")}
    hay = norm(" ".join(groups.values()))
    hay_ns = hay.replace(" ", "")
    answers_hay = norm(groups["answers"] + " " + groups["main"])
    sources_raw = re.sub(r"\s+", "", groups["sources"])

    errors, warns, info = [], [], {"checked": 0, "authored": 0, "source": src.mode}
    if src.mode == "raw-fallback":
        warns.append(("원문", "-", f"PDF를 열지 못해 pipeline/raw로 대조함(독립성 낮음). PDF 경로 확인: {pdf_path}"))
    if not hay.strip():
        errors.append(("원문", "-", "원문 텍스트가 비어 있음. lessons.json 쪽 범위와 PDF 경로 확인"))

    for path, key, val in walk(data):
        if not isinstance(val, str):
            continue
        # 1) 이미지 금지 정책
        if key in IMAGE_KEYS or IMAGE_RE.search(val):
            errors.append(("이미지 금지", path, val[:100] + " → 이미지 대신 '교과서 p.N 참고' 쪽수 안내로 바꿀 것"))
            continue
        # 2) 금지 문자열
        if FORBIDDEN_RE.search(val):
            errors.append(("금지 문자열", path, val[:100]))
        # 3) 링크 출처
        if val.startswith("http"):
            yt = YT_RE.search(val)
            if yt and yt.group(1) not in sources_raw:
                errors.append(("출처 없는 영상", path, f"{val} → Sources 쪽에 이 영상 ID가 없음"))
            elif not yt:
                dom = re.sub(r"^https?://(www\.)?", "", val).split("/")[0]
                if dom and dom not in sources_raw:
                    errors.append(("출처 없는 링크", path, val))
            continue
        if key in SKIP_KEYS or re.search(r"[가-힣]", val):
            continue
        # 4) 원문 대조
        is_content_heading = key in {"heading", "subtitle", "topic", "section"} or re.search(
            r"(sections|paragraphs|dialogues|parts|passages)\[\d+\]\.(title|titleEn)$", path)
        if key in UI_KEYS and not is_content_heading:
            continue  # 앱 화면용 라벨(코너·활동 제목)은 대조하지 않음
        for raw, n in segments(val):
            info["checked"] += 1
            r = match_ratio(n, hay, hay_ns)
            if r >= 0.75:
                continue
            if key in AUTHORED_KEYS:
                info["authored"] += 1
            elif key in UI_KEYS:
                warns.append(("교과서에 없는 소제목", path, raw[:120]))
            elif r >= 0.5:
                warns.append(("부분 일치(쪽 넘김·단 나눔 가능성, 눈으로 확인)", path, raw[:120]))
            else:
                errors.append(("원문 불일치", path, raw[:120]))

    # 5) 정답 노출·정답 대조
    def visit(o, path=""):
        if isinstance(o, dict):
            ans = o.get("answer")
            ans_list = ans if isinstance(ans, list) else [ans] if isinstance(ans, str) else []
            for a in ans_list:
                if not isinstance(a, str):
                    continue
                na = norm(a)
                if len(na.split()) >= 2:
                    for k2 in ("prompt", "sentence", "question", "text", "template", "statement"):
                        v2 = o.get(k2)
                        if isinstance(v2, str) and na in norm(v2):
                            errors.append(("정답 노출", f"{path}.{k2}", f"문제 문장에 정답 '{a}'이(가) 들어 있음"))
                if len(na) >= 3 and not re.search(r"[가-힣]", a) and na not in answers_hay and na.replace(" ", "") not in answers_hay.replace(" ", ""):
                    warns.append(("정답 대조 실패", f"{path}.answer", f"'{a}'이(가) Answers/본문 쪽에 없음"))
            for k, v in o.items():
                visit(v, f"{path}.{k}")
        elif isinstance(o, list):
            for i, x in enumerate(o):
                visit(x, f"{path}[{i}]")
    visit(data)

    # 6) 쪽 누락·순서
    covered = set()
    for corner in data.get("corners", []):
        last = 0
        for act in corner.get("activities", []):
            ps = [p for p in pages_of(act.get("page", "")) + pages_of(act.get("pageRange", "")) if p in main_pages]
            for _, k, v in walk(act):
                if k in ("page", "pageRange"):
                    covered.update(p for p in pages_of(v) if p in main_pages)
            if not ps:
                errors.append(("쪽 번호 없음", f"{corner.get('id')}/{act.get('activityId')}", "활동마다 교과서 쪽(page) 필수"))
                continue
            if min(ps) < last:
                warns.append(("순서 역전", f"{corner.get('id')}/{act.get('activityId')}", f"p.{min(ps)}가 앞 활동(p.{last})보다 앞쪽"))
            last = max(last, min(ps))
    missing = [p for p in main_pages if p not in covered]
    # 단원 표지·흐름 쪽(처음 2쪽)은 제외
    missing = [p for p in missing if p not in main_pages[:2]]
    if missing:
        errors.append(("쪽 누락", "-", f"어떤 활동도 다루지 않는 쪽: {missing} → 빠진 코너가 없는지 확인"))

    # 7) 빌드 결과물 누출
    if dist_dir:
        blob = " ".join(Path(f).read_text(encoding="utf-8", errors="ignore") for f in glob.glob(str(ROOT / dist_dir / "assets" / "*.js")))
        if not blob:
            warns.append(("dist", dist_dir, "빌드 결과물이 없음. npm run build 후 다시 실행"))
        for path, key, val in walk(data):
            if isinstance(val, str) and key not in UI_KEYS and len(val.split()) >= 6 and not re.search(r"[가-힣]", val):
                if val[:40] in blob:
                    errors.append(("번들 누출", path, val[:80]))

    return errors, warns, info


def write_report(lesson_id, errors, warns, info):
    REPORT_DIR.mkdir(parents=True, exist_ok=True)
    lines = [f"# QA 검수 보고서: {lesson_id}", "",
             f"- 원문 출처: {info['source']}",
             f"- 대조한 영어 문장: {info['checked']} (교사 설계 문구 {info['authored']}건 제외)",
             f"- ERROR {len(errors)}건 / WARN {len(warns)}건",
             f"- 판정: **{'통과' if not errors else '불통과'}**", ""]
    for title, items in (("ERROR (반드시 수정)", errors), ("WARN (확인 후 수정 또는 사유 기록)", warns)):
        lines.append(f"## {title}")
        lines += [f"- [{c}] `{p}` — {m}" for c, p, m in items] or ["- 없음"]
        lines.append("")
    (REPORT_DIR / f"{lesson_id}.md").write_text("\n".join(lines), encoding="utf-8")


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("lesson", nargs="?")
    ap.add_argument("--all", action="store_true")
    ap.add_argument("--pdf")
    ap.add_argument("--dist")
    a = ap.parse_args()
    lessons = sorted(Path(f).stem for f in glob.glob(str(ROOT / "content" / "lesson-*.json"))) if a.all else [a.lesson]
    if not lessons or lessons == [None]:
        ap.error("단원 id 또는 --all 을 지정")
    meta, failed = load_lessons_meta(), False
    for lid in lessons:
        e, w, info = audit_lesson(lid, meta, a.pdf, a.dist)
        write_report(lid, e, w, info)
        failed |= bool(e)
        print(f"[{lid}] 원문={info['source']} 대조={info['checked']} ERROR={len(e)} WARN={len(w)} → {'통과' if not e else '불통과'}  (qa/reports/{lid}.md)")
        for c, p, m in e[:15]:
            print(f"   ERROR [{c}] {p} — {m}")
        if len(e) > 15:
            print(f"   … 외 {len(e) - 15}건은 보고서 참고")
    sys.exit(1 if failed else 0)


if __name__ == "__main__":
    main()
