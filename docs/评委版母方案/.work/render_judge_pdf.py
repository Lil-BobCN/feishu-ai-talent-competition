#!/usr/bin/env python3
"""Render the judge edition Markdown as a formal A4 management report."""

from __future__ import annotations

import argparse
import base64
import html
import re
import subprocess
import unicodedata
from pathlib import Path

import markdown
from bs4 import BeautifulSoup, Tag
try:
    from pypdf import PdfReader
except ModuleNotFoundError:
    from PyPDF2 import PdfReader


CSS = r"""
@page {
  size: A4;
  margin: 19mm 17mm 19mm;

  @top-left {
    content: "圣农集团经营智能中枢方案";
    color: #5f6872;
    font-family: "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 7.5pt;
  }

  @top-right {
    content: "比赛评审稿  |  2026.07";
    color: #7a838c;
    font-family: "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 7.5pt;
  }

  @bottom-left {
    content: "公开资料核验 + 方案设计，内部能力待现场确认";
    color: #7a838c;
    font-family: "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 7pt;
  }

  @bottom-right {
    content: "第 " counter(page) " / " counter(pages) " 页";
    color: #4e5965;
    font-family: "PingFang SC", "Hiragino Sans GB", sans-serif;
    font-size: 7.5pt;
  }
}

@page cover {
  margin: 0;

  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-left { content: none; }
  @bottom-right { content: none; }
}

@page toc {
  margin: 18mm 18mm 20mm;

  @top-left { content: none; }
  @top-right { content: none; }
  @bottom-left { content: "圣农集团经营智能中枢方案"; }
}

:root {
  color-scheme: light;
  --paper: oklch(0.992 0.004 245);
  --ink: oklch(0.26 0.025 250);
  --body: oklch(0.34 0.018 250);
  --muted: oklch(0.53 0.014 250);
  --rule: oklch(0.87 0.012 245);
  --rule-dark: oklch(0.72 0.024 245);
  --navy: oklch(0.38 0.078 245);
  --navy-deep: oklch(0.29 0.065 245);
  --navy-soft: oklch(0.955 0.018 245);
  --blue-gray: oklch(0.93 0.018 245);
  --warm: oklch(0.47 0.11 30);
  --warm-soft: oklch(0.965 0.022 35);
}

* { box-sizing: border-box; }

html, body {
  margin: 0;
  color: var(--body);
  background: var(--paper);
  font-family: "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
  font-size: 10.35pt;
  line-height: 1.67;
  letter-spacing: 0;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.markdown-body { width: 100%; }

.cover {
  page: cover;
  width: 210mm;
  height: 297mm;
  padding: 24mm 25mm 22mm;
  display: flex;
  flex-direction: column;
  break-after: page;
  background: var(--paper);
}

.cover-rule {
  width: 100%;
  height: 1.5mm;
  margin-bottom: 8mm;
  background: var(--navy-deep);
}

.cover-kicker {
  color: var(--navy-deep);
  font-size: 10pt;
  font-weight: 600;
}

.cover-brand {
  width: 62mm;
  margin-top: 5mm;
  padding: 3.3mm 4.5mm;
  background: var(--navy-deep);
}

.cover-brand img {
  display: block;
  width: 49mm;
  height: auto;
}

.cover-main {
  margin: auto 0;
  padding: 8mm 0 15mm;
  border-top: 0.25mm solid var(--rule-dark);
  border-bottom: 0.25mm solid var(--rule-dark);
}

.cover h1 {
  max-width: 155mm;
  margin: 0;
  color: var(--navy-deep);
  font-size: 30pt;
  font-weight: 700;
  line-height: 1.28;
}

.cover-subtitle {
  max-width: 145mm;
  margin-top: 8mm;
  color: var(--body);
  font-size: 15pt;
  line-height: 1.55;
}

.cover-meta {
  display: grid;
  grid-template-columns: 25mm 1fr;
  gap: 2.2mm 6mm;
  margin-top: 14mm;
  font-size: 9.2pt;
}

.cover-meta dt {
  margin: 0;
  color: var(--muted);
}

.cover-meta dd {
  margin: 0;
  color: var(--ink);
}

.cover-note {
  margin-top: 10mm;
  color: var(--muted);
  font-size: 8.4pt;
}

.cover-culture {
  display: flex;
  justify-content: space-between;
  gap: 8mm;
  margin-top: 8mm;
  padding-top: 4mm;
  border-top: 0.25mm solid var(--rule);
  color: var(--navy-deep);
  font-size: 9pt;
}

.cover-culture cite {
  color: var(--muted);
  font-size: 7.5pt;
  font-style: normal;
}

.toc-page {
  page: toc;
  min-height: 245mm;
  break-after: page;
}

.toc-heading {
  margin: 0;
  padding: 0 0 6mm;
  color: var(--navy-deep);
  border-bottom: 0.5mm solid var(--navy-deep);
  font-size: 24pt;
  line-height: 1.25;
}

.toc-intro {
  margin: 4mm 0 11mm;
  color: var(--muted);
  font-size: 9pt;
}

.toc-columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14mm;
}

.toc-group-title {
  margin: 0 0 5mm;
  padding-bottom: 2mm;
  color: var(--navy);
  border-bottom: 0.25mm solid var(--rule-dark);
  font-size: 10pt;
  font-weight: 700;
}

.toc-entry {
  display: grid;
  grid-template-columns: auto auto 1fr auto;
  align-items: baseline;
  gap: 2mm;
  margin: 0 0 4.2mm;
  color: var(--ink);
  font-size: 9.35pt;
  line-height: 1.45;
  text-decoration: none;
}

.toc-entry .number {
  min-width: 8mm;
  color: var(--navy);
  font-weight: 700;
}

.toc-entry .leader {
  height: 0.9em;
  border-bottom: 0.2mm dotted var(--rule-dark);
}

.toc-entry .page-number {
  min-width: 7mm;
  color: var(--muted);
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.report-section {
  width: 100%;
}

.report-section.chapter-start {
  break-before: page;
  page-break-before: always;
}

.report-section.compact-start {
  break-before: auto;
  page-break-before: auto;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--ink);
  font-weight: 700;
  line-height: 1.4;
  letter-spacing: 0;
  break-after: avoid;
  page-break-after: avoid;
}

h2 {
  margin: 0 0 7mm;
  padding: 0 0 4mm;
  border-bottom: 0.55mm solid var(--navy-deep);
  color: var(--navy-deep);
  font-size: 18.5pt;
  break-inside: avoid;
  page-break-inside: avoid;
  position: relative;
}

h2::before {
  content: attr(data-section-label);
  display: block;
  margin-bottom: 2.2mm;
  color: var(--warm);
  font-size: 7.6pt;
  font-weight: 600;
}

h2::after {
  content: "";
  position: absolute;
  top: 4mm;
  right: 0;
  width: 36mm;
  height: 7mm;
  background-image: var(--section-logo, none);
  background-repeat: no-repeat;
  background-position: right center;
  background-size: contain;
  filter: brightness(0);
  opacity: 0.035;
}

h3 {
  margin: 7mm 0 3mm;
  padding-bottom: 1.7mm;
  border-bottom: 0.2mm solid var(--rule);
  color: var(--navy);
  font-size: 13pt;
}

h4 {
  margin: 5mm 0 2mm;
  color: var(--ink);
  font-size: 11.2pt;
}

p {
  margin: 2.5mm 0;
  text-align: justify;
  text-justify: inter-ideograph;
  orphans: 3;
  widows: 3;
}

ul, ol {
  margin: 2.5mm 0 3.5mm;
  padding-left: 7mm;
}

li {
  margin: 0.9mm 0;
  padding-left: 0.5mm;
}

blockquote {
  margin: 4mm 0;
  padding: 3.2mm 4.2mm;
  color: oklch(0.36 0.035 245);
  background: var(--navy-soft);
  border: 0.25mm solid oklch(0.83 0.025 245);
  break-inside: avoid;
  page-break-inside: avoid;
}

blockquote p:first-child { margin-top: 0; }
blockquote p:last-child { margin-bottom: 0; }

hr {
  margin: 7mm 0;
  border: 0;
  border-top: 0.25mm solid var(--rule);
}

strong { color: var(--ink); }
em { color: var(--navy); }

a {
  color: var(--navy);
  text-decoration: underline;
  text-decoration-thickness: 0.12mm;
  text-underline-offset: 0.5mm;
}

code {
  padding: 0.25mm 0.8mm;
  color: oklch(0.43 0.1 32);
  background: var(--warm-soft);
  border-radius: 0.6mm;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 0.86em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

pre {
  margin: 3.5mm 0 4.5mm;
  padding: 3.6mm 4mm;
  color: oklch(0.31 0.023 250);
  background: oklch(0.965 0.006 245);
  border: 0.25mm solid var(--rule);
  border-radius: 0.8mm;
  font-family: "SFMono-Regular", Menlo, Consolas, monospace;
  font-size: 7.75pt;
  line-height: 1.48;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
}

pre code {
  padding: 0;
  color: inherit;
  background: transparent;
  border-radius: 0;
  font-size: inherit;
}

.mermaid {
  width: 100%;
  margin: 4mm 0 5mm;
  padding: 4mm 3mm;
  text-align: center;
  background: oklch(0.98 0.005 245);
  border: 0.25mm solid var(--rule);
  break-inside: avoid;
  page-break-inside: avoid;
}

.mermaid svg {
  display: inline-block;
  max-width: 100%;
  max-height: 194mm;
  width: auto;
  height: auto;
}

pre.mermaid-fallback {
  color: var(--warm);
  background: var(--warm-soft);
}

table {
  width: 100%;
  margin: 3.5mm 0 5mm;
  border-collapse: collapse;
  table-layout: auto;
  font-size: 8.25pt;
  line-height: 1.46;
}

th, td {
  padding: 1.65mm 1.9mm;
  vertical-align: top;
  border: 0.2mm solid oklch(0.83 0.014 245);
  overflow-wrap: anywhere;
  word-break: break-word;
}

th {
  color: var(--navy-deep);
  background: var(--blue-gray);
  font-weight: 700;
  text-align: left;
}

tbody tr:nth-child(even) td {
  background: oklch(0.977 0.004 245);
}

thead { display: table-header-group; }
tr { break-inside: avoid; page-break-inside: avoid; }

table.cols-5, table.cols-6, table.cols-7, table.cols-8 {
  font-size: 7.35pt;
  line-height: 1.4;
}

.appendix-section {
  font-size: 9.65pt;
  line-height: 1.58;
}

.appendix-section h2 {
  border-bottom-color: var(--rule-dark);
  font-size: 17.2pt;
}

.appendix-section h3 { font-size: 12.1pt; }
.appendix-section table { font-size: 7.75pt; }
.appendix-section table.cols-5,
.appendix-section table.cols-6,
.appendix-section table.cols-7,
.appendix-section table.cols-8 { font-size: 7pt; }

.appendix-section pre {
  font-size: 7.15pt;
  line-height: 1.42;
}

img, svg { max-width: 100%; height: auto; }

@media screen {
  html { background: oklch(0.93 0.006 245); }
  body {
    width: 210mm;
    margin: 12mm auto;
    padding: 19mm 17mm;
    box-shadow: 0 0 0 1px var(--rule-dark);
  }
  .cover { margin: -19mm -17mm 19mm; }
}
"""


def slug(text: str) -> str:
    value = re.sub(r"[^\w\u4e00-\u9fff]+", "-", text.lower()).strip("-")
    return value or "section"


def split_heading(text: str) -> tuple[str, str]:
    match = re.match(r"^(\d+\.|附录\s+[A-Z]：?)\s*(.*)$", text)
    if not match:
        return "", text
    return match.group(1).rstrip("："), match.group(2)


def make_toc(soup: BeautifulSoup, headings: list[Tag], page_map: dict[str, int]) -> Tag:
    section = soup.new_tag("section", attrs={"class": "toc-page"})
    title = soup.new_tag("h1", attrs={"class": "toc-heading"})
    title.string = "目录"
    section.append(title)
    intro = soup.new_tag("p", attrs={"class": "toc-intro"})
    intro.string = "主报告说明方案如何回应企业命题，技术附录提供访谈、接口、数据和验收依据。"
    section.append(intro)

    columns = soup.new_tag("div", attrs={"class": "toc-columns"})
    for group_name, group in (
        ("主报告", [h for h in headings if not h.get_text(strip=True).startswith("附录")]),
        ("技术附录", [h for h in headings if h.get_text(strip=True).startswith("附录")]),
    ):
        wrapper = soup.new_tag("div", attrs={"class": "toc-group"})
        group_title = soup.new_tag("h2", attrs={"class": "toc-group-title"})
        group_title.string = group_name
        wrapper.append(group_title)
        for heading in group:
            heading_text = heading.get_text(" ", strip=True)
            number, label = split_heading(heading_text)
            anchor = heading.get("id", slug(heading_text))
            entry = soup.new_tag("a", href=f"#{anchor}", attrs={"class": "toc-entry"})
            number_node = soup.new_tag("span", attrs={"class": "number"})
            number_node.string = number
            label_node = soup.new_tag("span", attrs={"class": "label"})
            label_node.string = label
            leader = soup.new_tag("span", attrs={"class": "leader"})
            page_node = soup.new_tag("span", attrs={"class": "page-number"})
            page_node.string = str(page_map.get(heading_text, "-"))
            entry.extend([number_node, label_node, leader, page_node])
            wrapper.append(entry)
        columns.append(wrapper)
    section.append(columns)
    return section


def make_cover(
    soup: BeautifulSoup,
    title_node: Tag,
    metadata_node: Tag | None,
    logo_data_uri: str | None,
) -> Tag:
    metadata: list[tuple[str, str]] = []
    if metadata_node is not None:
        for line in metadata_node.get_text("\n", strip=True).splitlines():
            if "：" in line:
                key, value = line.split("：", 1)
                metadata.append((key.strip(), value.strip()))
    meta_map = dict(metadata)

    cover = soup.new_tag("section", attrs={"class": "cover"})
    rule = soup.new_tag("div", attrs={"class": "cover-rule"})
    cover.append(rule)
    kicker = soup.new_tag("div", attrs={"class": "cover-kicker"})
    kicker.string = "圣农集团数字化经营方案"
    cover.append(kicker)
    if logo_data_uri:
        brand = soup.new_tag("div", attrs={"class": "cover-brand"})
        logo = soup.new_tag("img", src=logo_data_uri, alt="圣农")
        brand.append(logo)
        cover.append(brand)

    main = soup.new_tag("div", attrs={"class": "cover-main"})
    title = soup.new_tag("h1")
    title.string = title_node.get_text(" ", strip=True)
    main.append(title)
    subtitle = soup.new_tag("div", attrs={"class": "cover-subtitle"})
    subtitle.string = meta_map.get("副标题", "从经营异常快速响应到集团经营决策")
    main.append(subtitle)
    cover.append(main)

    dl = soup.new_tag("dl", attrs={"class": "cover-meta"})
    for key in ("文档性质", "版本日期", "事实范围"):
        if key not in meta_map:
            continue
        dt = soup.new_tag("dt")
        dt.string = key
        dd = soup.new_tag("dd")
        dd.string = meta_map[key]
        dl.extend([dt, dd])
    cover.append(dl)
    note = soup.new_tag("p", attrs={"class": "cover-note"})
    note.string = "本稿用于方案评审。公开事实、方案设计和待企业确认事项在正文中分别说明。"
    cover.append(note)
    culture = soup.new_tag("div", attrs={"class": "cover-culture"})
    value = soup.new_tag("span")
    value.string = "坚持长期主义，不负信赖"
    source = soup.new_tag("cite")
    source.string = "圣农价值观｜来源：2024 年社会责任报告"
    culture.extend([value, source])
    cover.append(culture)
    return cover


def build_html(
    source_path: Path,
    mermaid_js_path: Path,
    page_map: dict[str, int],
    logo_path: Path | None,
    drop_appendix_g: bool = False,
) -> str:
    source = source_path.read_text(encoding="utf-8")
    rendered = markdown.markdown(
        source,
        extensions=["extra", "sane_lists", "toc"],
        output_format="html5",
    )
    soup = BeautifulSoup(rendered, "html.parser")

    for heading in soup.find_all("h2"):
        previous = heading.find_previous_sibling()
        if previous is not None and previous.name == "hr":
            previous.decompose()

    for pre in list(soup.find_all("pre")):
        code = pre.find("code")
        classes = code.get("class", []) if code is not None else []
        if code is None or "language-mermaid" not in classes:
            continue
        chart = soup.new_tag("div", attrs={"class": "mermaid"})
        chart["data-mermaid-source"] = code.get_text()
        chart.string = code.get_text()
        pre.replace_with(chart)

    title_node = soup.find("h1")
    metadata_node = title_node.find_next_sibling() if title_node is not None else None
    if metadata_node is not None and metadata_node.name != "blockquote":
        metadata_node = None
    logo_data_uri = None
    if logo_path is not None and logo_path.exists():
        encoded_logo = base64.b64encode(logo_path.read_bytes()).decode("ascii")
        logo_data_uri = f"data:image/png;base64,{encoded_logo}"
    cover = (
        make_cover(soup, title_node, metadata_node, logo_data_uri)
        if title_node is not None
        else None
    )
    if title_node is not None:
        title_node.decompose()
    if metadata_node is not None:
        metadata_node.decompose()

    toc_heading = next((h for h in soup.find_all("h2") if h.get_text(strip=True) == "目录"), None)
    if toc_heading is not None:
        node = toc_heading.find_next_sibling()
        while node is not None and node.name != "h2":
            next_node = node.find_next_sibling()
            node.decompose()
            node = next_node
        toc_heading.decompose()

    if drop_appendix_g:
        appendix_g = next(
            (
                h
                for h in soup.find_all("h2")
                if h.get_text(" ", strip=True).startswith("附录 G：")
            ),
            None,
        )
        if appendix_g is not None:
            node = appendix_g.find_next_sibling()
            appendix_g.decompose()
            while node is not None and node.name != "h2":
                next_node = node.find_next_sibling()
                node.decompose()
                node = next_node

    headings = list(soup.find_all("h2"))
    for heading in headings:
        text = heading.get_text(" ", strip=True)
        heading["id"] = heading.get("id", slug(text))

    toc = make_toc(soup, headings, page_map)

    for index, heading in enumerate(list(soup.find_all("h2"))):
        text = heading.get_text(" ", strip=True)
        is_appendix = text.startswith("附录")
        section = soup.new_tag(
            "section",
            attrs={
                "class": [
                    "report-section",
                    "appendix-section" if is_appendix else "main-section",
                    "compact-start"
                    if text.startswith(("3.", "6.", "7.", "附录 B", "附录 C", "附录 D", "附录 E", "附录 F"))
                    else "chapter-start",
                ]
            },
        )
        number, _ = split_heading(text)
        heading["data-section-label"] = f"{'技术附录' if is_appendix else '主报告'}  /  {number}"
        heading.insert_before(section)
        section.append(heading.extract())
        node = section.find_next_sibling()
        while node is not None and node.name != "h2":
            next_node = node.find_next_sibling()
            section.append(node.extract())
            node = next_node

    for table in soup.find_all("table"):
        columns = max(
            (len(row.find_all(["th", "td"], recursive=False)) for row in table.find_all("tr")),
            default=0,
        )
        table["class"] = table.get("class", []) + [f"cols-{min(columns, 8)}"]

    if cover is not None:
        soup.insert(0, cover)
    insert_after = cover if cover is not None else None
    if insert_after is not None:
        insert_after.insert_after(toc)
    else:
        soup.insert(0, toc)

    title = cover.find("h1").get_text(" ", strip=True) if cover else source_path.stem
    logo_css = (
        f":root {{ --section-logo: url('{logo_data_uri}'); }}" if logo_data_uri else ""
    )
    mermaid_src = html.escape(mermaid_js_path.resolve().as_uri(), quote=True)
    mermaid_script = f"""
  <script src=\"{mermaid_src}\"></script>
  <script>
    (async () => {{
      const charts = Array.from(document.querySelectorAll('.mermaid'));
      if (!charts.length) {{ document.documentElement.dataset.mermaidStatus = 'none'; return; }}
      mermaid.initialize({{
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        flowchart: {{ useMaxWidth: true, htmlLabels: true, curve: 'linear', nodeSpacing: 28, rankSpacing: 38 }},
        themeVariables: {{
          fontFamily: 'PingFang SC, Hiragino Sans GB, sans-serif',
          primaryColor: '#edf3f7', primaryTextColor: '#263746', primaryBorderColor: '#54728b',
          lineColor: '#687987', secondaryColor: '#f5f7f8', tertiaryColor: '#fafafa'
        }}
      }});
      try {{
        await mermaid.run({{ querySelector: '.mermaid' }});
        document.documentElement.dataset.mermaidStatus = 'ready';
      }} catch (error) {{
        for (const chart of charts) {{
          const fallback = document.createElement('pre');
          fallback.className = 'mermaid-fallback';
          fallback.textContent = chart.dataset.mermaidSource || chart.textContent;
          chart.replaceWith(fallback);
        }}
        document.documentElement.dataset.mermaidStatus = 'fallback';
      }}
    }})();
  </script>
"""
    return f"""<!doctype html>
<html lang=\"zh-CN\">
<head>
  <meta charset=\"utf-8\">
  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1\">
  <title>{html.escape(title)}</title>
  <style>{CSS}\n{logo_css}</style>
</head>
<body>
  <main class=\"markdown-body\">{soup}</main>
  {mermaid_script}
</body>
</html>
"""


def print_pdf(chrome: Path, html_path: Path, pdf_path: Path) -> None:
    command = [
        str(chrome),
        "--headless=new",
        "--disable-gpu",
        "--no-pdf-header-footer",
        "--run-all-compositor-stages-before-draw",
        "--virtual-time-budget=8000",
        f"--print-to-pdf={pdf_path}",
        html_path.resolve().as_uri(),
    ]
    result = subprocess.run(command, check=False, capture_output=True, text=True)
    if result.returncode != 0 or not pdf_path.exists():
        raise RuntimeError(result.stderr or result.stdout or "Chrome PDF render failed")


def extract_heading_pages(pdf_path: Path, headings: list[str]) -> dict[str, int]:
    pages = [page.extract_text() or "" for page in PdfReader(str(pdf_path)).pages]
    result: dict[str, int] = {}
    for heading in headings:
        compact_heading = re.sub(r"\s+", "", unicodedata.normalize("NFKC", heading)).replace("⻜", "飞")
        for page_number, page_text in enumerate(pages[2:], start=3):
            compact_page = re.sub(r"\s+", "", unicodedata.normalize("NFKC", page_text)).replace("⻜", "飞")
            if compact_heading in compact_page:
                result[heading] = page_number
                break
    return result


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("html", type=Path)
    parser.add_argument("pdf", type=Path)
    parser.add_argument("--mermaid-js", required=True, type=Path)
    parser.add_argument("--logo", type=Path)
    parser.add_argument("--drop-appendix-g", action="store_true")
    parser.add_argument(
        "--chrome",
        type=Path,
        default=Path("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"),
    )
    args = parser.parse_args()

    args.html.parent.mkdir(parents=True, exist_ok=True)
    args.pdf.parent.mkdir(parents=True, exist_ok=True)
    draft_pdf = args.pdf.with_suffix(".draft.pdf")

    raw = markdown.markdown(args.source.read_text(encoding="utf-8"), extensions=["extra", "toc"])
    raw_soup = BeautifulSoup(raw, "html.parser")
    headings = [
        h.get_text(" ", strip=True)
        for h in raw_soup.find_all("h2")
        if h.get_text(strip=True) != "目录"
        and not (args.drop_appendix_g and h.get_text(" ", strip=True).startswith("附录 G："))
    ]

    args.html.write_text(
        build_html(args.source, args.mermaid_js, {}, args.logo, args.drop_appendix_g),
        encoding="utf-8",
    )
    print_pdf(args.chrome, args.html, draft_pdf)
    page_map = extract_heading_pages(draft_pdf, headings)

    args.html.write_text(
        build_html(
            args.source,
            args.mermaid_js,
            page_map,
            args.logo,
            args.drop_appendix_g,
        ),
        encoding="utf-8",
    )
    print_pdf(args.chrome, args.html, args.pdf)
    draft_pdf.unlink(missing_ok=True)

    print(f"HTML: {args.html}")
    print(f"PDF: {args.pdf}")
    print("TOC: " + ", ".join(f"{heading}={page_map.get(heading, '?')}" for heading in headings))


if __name__ == "__main__":
    main()
