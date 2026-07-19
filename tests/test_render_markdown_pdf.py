import importlib.util
import tempfile
import unittest
from pathlib import Path

from bs4 import BeautifulSoup


MODULE_PATH = (
    Path(__file__).resolve().parents[1] / "tmp" / "pdfs" / "render_markdown_pdf.py"
)
SPEC = importlib.util.spec_from_file_location("render_markdown_pdf", MODULE_PATH)
MODULE = importlib.util.module_from_spec(SPEC)
assert SPEC.loader is not None
SPEC.loader.exec_module(MODULE)


class RenderMarkdownPdfTests(unittest.TestCase):
    def test_removes_redundant_rule_immediately_before_page_break_heading(self):
        source = "# Cover\n\n> Subtitle\n\nBody\n\n---\n\n## Section\n"

        with tempfile.TemporaryDirectory() as temp_dir:
            source_path = Path(temp_dir) / "source.md"
            source_path.write_text(source, encoding="utf-8")
            soup = BeautifulSoup(MODULE.build_html(source_path), "html.parser")

        heading = soup.find("h2")
        self.assertIsNotNone(heading)
        previous = heading.find_previous_sibling()
        self.assertTrue(previous is None or previous.name != "hr")

    def test_caps_mermaid_height_so_heading_and_diagram_fit_on_a4(self):
        self.assertIn("max-height: 205mm", MODULE.CSS)

    def test_does_not_add_fixed_footer_that_overlaps_paginated_content(self):
        source = "# Cover\n\n> Subtitle\n\n## Section\n\nBody\n"

        with tempfile.TemporaryDirectory() as temp_dir:
            source_path = Path(temp_dir) / "source.md"
            source_path.write_text(source, encoding="utf-8")
            soup = BeautifulSoup(MODULE.build_html(source_path), "html.parser")

        self.assertIsNone(soup.select_one(".print-footer"))


if __name__ == "__main__":
    unittest.main()
