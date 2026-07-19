#!/usr/bin/env python3
"""Convert a Markdown source into a print-ready HTML document.

The HTML is printed to PDF by the local Chrome installation so Chinese text,
tables, links, and page layout are handled by a real browser engine.
"""

from __future__ import annotations

import argparse
import html
from pathlib import Path

import markdown
from bs4 import BeautifulSoup


CSS = r"""
@page {
  size: A4;
  margin: 17mm 15mm 18mm;
}

:root {
  color-scheme: light;
  --ink: #182230;
  --muted: #5b6878;
  --rule: #d8dee7;
  --soft: #f5f7fa;
  --accent: #123f63;
  --accent-soft: #eaf2f8;
  --code: #f3f5f7;
}

* {
  box-sizing: border-box;
}

html {
  background: #ffffff;
}

body {
  margin: 0;
  color: var(--ink);
  background: #ffffff;
  font-family: "PingFang SC", "Hiragino Sans GB", "STHeiti", "Arial Unicode MS", sans-serif;
  font-size: 10.2pt;
  line-height: 1.72;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.markdown-body {
  max-width: 100%;
}

.cover {
  min-height: 245mm;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 12mm 8mm 20mm;
}

.cover h1 {
  margin: 0 0 16mm;
  padding-bottom: 9mm;
  color: var(--accent);
  border-bottom: 1.2mm solid var(--accent);
  font-size: 27pt;
  line-height: 1.3;
  letter-spacing: 0;
}

.cover blockquote {
  margin: 0;
  padding: 0 0 0 6mm;
  color: var(--muted);
  border-left: 1.2mm solid #9fb6c7;
  font-size: 11pt;
  line-height: 1.9;
}

h1, h2, h3, h4, h5, h6 {
  color: var(--accent);
  font-weight: 700;
  line-height: 1.35;
  break-after: avoid;
  page-break-after: avoid;
}

h1 {
  margin: 12mm 0 5mm;
  font-size: 22pt;
}

h2 {
  margin: 11mm 0 5mm;
  padding: 3mm 0 2.5mm 4mm;
  border-left: 1.7mm solid var(--accent);
  border-bottom: 0.3mm solid var(--rule);
  font-size: 17pt;
  page-break-before: always;
  break-before: page;
}

h3 {
  margin: 7mm 0 3mm;
  padding-bottom: 1.5mm;
  border-bottom: 0.2mm solid var(--rule);
  font-size: 13pt;
}

h4 {
  margin: 5mm 0 2mm;
  font-size: 11.2pt;
}

p {
  margin: 2.5mm 0;
  orphans: 3;
  widows: 3;
}

ul, ol {
  margin: 2.5mm 0 3mm;
  padding-left: 7mm;
}

li {
  margin: 0.9mm 0;
  padding-left: 0.5mm;
}

blockquote {
  margin: 4mm 0;
  padding: 2.5mm 4mm;
  color: #35485a;
  background: var(--accent-soft);
  border-left: 1mm solid #7f9eb6;
  break-inside: avoid;
  page-break-inside: avoid;
}

blockquote p:first-child {
  margin-top: 0;
}

blockquote p:last-child {
  margin-bottom: 0;
}

hr {
  margin: 7mm 0;
  border: 0;
  border-top: 0.3mm solid var(--rule);
}

strong {
  color: #102f4b;
}

em {
  color: #38556e;
}

a {
  color: #0b5d8f;
  text-decoration: underline;
  text-decoration-thickness: 0.15mm;
}

code {
  padding: 0.35mm 1.2mm;
  color: #8a3d19;
  background: #fff3eb;
  border-radius: 0.8mm;
  font-family: "SFMono-Regular", Menlo, "Courier New", monospace;
  font-size: 0.88em;
  overflow-wrap: anywhere;
  word-break: break-word;
}

pre {
  margin: 4mm 0;
  padding: 4mm 4.5mm;
  color: #243342;
  background: var(--code);
  border: 0.25mm solid #dce2e8;
  border-left: 1mm solid #7995aa;
  border-radius: 1mm;
  font-family: "SFMono-Regular", Menlo, "Courier New", monospace;
  font-size: 8.4pt;
  line-height: 1.5;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  word-break: break-word;
  break-inside: auto;
  page-break-inside: auto;
}

.mermaid {
  width: 100%;
  margin: 4mm 0 5mm;
  padding: 3mm 2mm;
  text-align: center;
  background: #fbfcfd;
  border: 0.25mm solid #dce2e8;
  border-left: 1mm solid #7995aa;
  border-radius: 1mm;
  break-inside: avoid;
  page-break-inside: avoid;
}

.mermaid svg {
  display: inline-block;
  max-width: 100%;
  max-height: 205mm;
  width: auto;
  height: auto;
}

pre.mermaid-fallback {
  color: #8a3d19;
  background: #fff8f2;
  border-left-color: #c26d39;
}

pre code {
  padding: 0;
  color: inherit;
  background: transparent;
  border-radius: 0;
  font-size: inherit;
}

table {
  width: 100%;
  margin: 4mm 0 5mm;
  border-collapse: collapse;
  table-layout: auto;
  font-size: 8.5pt;
  line-height: 1.48;
  break-inside: auto;
  page-break-inside: auto;
}

th, td {
  padding: 1.8mm 2mm;
  vertical-align: top;
  border: 0.25mm solid #cbd4de;
  overflow-wrap: anywhere;
  word-break: break-word;
}

th {
  color: #153d5d;
  background: #eaf1f6;
  font-weight: 700;
}

thead {
  display: table-header-group;
}

tr {
  page-break-inside: avoid;
  break-inside: avoid;
}

table.cols-5, table.cols-6, table.cols-7, table.cols-8 {
  font-size: 7.5pt;
}

table.cols-7, table.cols-8 {
  line-height: 1.4;
}

dl {
  margin: 3mm 0;
}

dt {
  margin-top: 2mm;
  font-weight: 700;
}

dd {
  margin-left: 6mm;
}

img, svg {
  max-width: 100%;
  height: auto;
}

@media screen {
  body {
    max-width: 210mm;
    margin: 12mm auto;
    padding: 0 15mm;
    box-shadow: 0 0 0 1px #e5e7eb;
  }
}
"""


def build_html(source_path: Path, mermaid_js_path: Path | None = None) -> str:
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

    mermaid_count = 0
    for pre in soup.find_all("pre"):
        code = pre.find("code")
        classes = code.get("class", []) if code is not None else []
        if code is None or "language-mermaid" not in classes:
            continue
        source = code.get_text()
        chart = soup.new_tag("div", attrs={"class": "mermaid"})
        chart["data-mermaid-source"] = source
        chart.string = source
        pre.replace_with(chart)
        mermaid_count += 1

    first_heading = soup.find("h1")
    if first_heading is not None:
        cover = soup.new_tag("section", attrs={"class": "cover"})
        next_node = first_heading.find_next_sibling()
        cover.append(first_heading.extract())
        if next_node is not None and next_node.name == "blockquote":
            cover.append(next_node.extract())
        soup.insert(0, cover)

    for table in soup.find_all("table"):
        columns = max(
            (len(row.find_all(["th", "td"], recursive=False)) for row in table.find_all("tr")),
            default=0,
        )
        table["class"] = table.get("class", []) + [f"cols-{min(columns, 8)}"]

    title = first_heading.get_text(" ", strip=True) if first_heading else source_path.stem
    mermaid_script = ""
    if mermaid_count and mermaid_js_path is not None:
        mermaid_src = html.escape(mermaid_js_path.resolve().as_uri(), quote=True)
        mermaid_script = f"""
  <script src=\"{mermaid_src}\"></script>
  <script>
    (async () => {{
      const charts = Array.from(document.querySelectorAll('.mermaid'));
      if (!charts.length) {{
        document.documentElement.dataset.mermaidStatus = 'none';
        return;
      }}
      mermaid.initialize({{
        startOnLoad: false,
        securityLevel: 'strict',
        theme: 'base',
        flowchart: {{
          useMaxWidth: true,
          htmlLabels: true,
          curve: 'basis',
          nodeSpacing: 32,
          rankSpacing: 42
        }},
        themeVariables: {{
          fontFamily: 'PingFang SC, Hiragino Sans GB, STHeiti, Arial Unicode MS, sans-serif',
          primaryColor: '#eaf2f8',
          primaryTextColor: '#182230',
          primaryBorderColor: '#386784',
          lineColor: '#506474',
          secondaryColor: '#f5f7fa',
          tertiaryColor: '#ffffff'
        }}
      }});
      try {{
        await mermaid.run({{ querySelector: '.mermaid' }});
        document.documentElement.dataset.mermaidStatus = 'ready';
      }} catch (error) {{
        console.error('Mermaid render failed:', error);
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
    return """<!doctype html>
<html lang="zh-CN">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{title}</title>
  <style>{css}</style>
</head>
<body>
  <main class="markdown-body">
    {body}
  </main>
  {mermaid_script}
</body>
</html>
""".format(title=title, css=CSS, body=str(soup), mermaid_script=mermaid_script)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("source", type=Path)
    parser.add_argument("output", type=Path)
    parser.add_argument("--mermaid-js", type=Path)
    args = parser.parse_args()
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(build_html(args.source, args.mermaid_js), encoding="utf-8")
    print(args.output)


if __name__ == "__main__":
    main()
