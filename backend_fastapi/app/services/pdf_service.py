from pathlib import Path
from typing import Optional, Literal
from loguru import logger

import pypandoc
from weasyprint import HTML

from app.services.diagram_service import diagram_service


TMP_DIR = Path("/tmp/vaultmind_pdfs")
TMP_DIR.mkdir(parents=True, exist_ok=True)


Section = dict
"""
Deterministic structured section:
{
    "type": "text" | "diagram" | "image",
    "heading": str | None,
    "content": str | None,        # markdown for text, mermaid-like definition for diagram
    "image_path": str | None      # absolute path for image sections
}
"""


class PDFService:
    def generate(
        self,
        title: str,
        sections: list[Section],
        filename: Optional[str] = None,
    ) -> str:
        title = title or "Document"
        filename = filename or f"{title}.pdf"

        body_parts: list[str] = []

        for section in sections:
            sec_type = section.get("type", "text")
            heading = section.get("heading")
            content = section.get("content") or ""

            if heading:
                body_parts.append(f"<h2>{heading}</h2>")

            if sec_type == "image":
                image_path = section.get("image_path")
                if image_path and Path(image_path).exists():
                    img_w = "100%"
                    body_parts.append(
                        f"<img src='file://{Path(image_path).resolve()}' style='width:{img_w};height:auto;' />"
                    )
                else:
                    body_parts.append("<pre>Missing diagram/image</pre>")
            elif sec_type == "diagram":
                diagram_path = diagram_service.render_mermaid_like(content or "")
                if diagram_path:
                    body_parts.append(
                        f"<img src='file://{Path(diagram_path).resolve()}' style='width:100%;height:auto;' />"
                    )
                else:
                    body_parts.append("<pre>Diagram rendering failed</pre>")
            else:
                md = content if content.strip() else " "
                html_content = pypandoc.convert_text(
                    md,
                    to="html",
                    format="md",
                    extra_args=["--wrap=none"],
                )
                body_parts.append(f"<div class='markdown'>{html_content}</div>")

        styled_html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>{title}</title>
<style>
  @page {{
    size: A4;
    margin: 18mm 16mm 18mm 16mm;
  }}
  body {{
    font-family: "Helvetica Neue", Arial, sans-serif;
    font-size: 11pt;
    line-height: 1.55;
    color: #1f1f1f;
  }}
  h1 {{
    font-size: 20pt;
    font-weight: 700;
    margin-bottom: 10px;
  }}
  h2 {{
    font-size: 14pt;
    font-weight: 700;
    margin-top: 18px;
    margin-bottom: 8px;
    border-bottom: 1px solid #e2e8f0;
    padding-bottom: 4px;
  }}
  .markdown p {{ margin: 0 0 10px; }}
  .markdown ul, .markdown ol {{ margin: 0 0 10px 18px; padding-left: 10px; }}
  .markdown li {{ margin-bottom: 4px; }}
  .markdown code {{
    background: #f4f4f5;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 10.2pt;
  }}
  .markdown pre {{
    background: #f4f4f5;
    padding: 10px;
    border-radius: 6px;
    font-size: 10pt;
    line-height: 1.45;
    margin-bottom: 12px;
    white-space: pre-wrap;
  }}
  .markdown blockquote {{
    border-left: 3px solid #cbd5e1;
    padding-left: 10px;
    color: #334155;
    margin: 0 0 10px;
  }}
  .markdown table {{
    border-collapse: collapse;
    width: 100%;
    margin-bottom: 12px;
    font-size: 10.5pt;
  }}
  .markdown th, .markdown td {{
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
  }}
  .markdown th {{ background: #f1f5f9; }}
  img {{
    max-width: 100%;
    height: auto;
    margin-bottom: 12px;
    display: block;
  }}
</style>
</head>
<body>
<h1>{title}</h1>
{"".join(body_parts)}
</body>
</html>
"""

        out_path = TMP_DIR / filename
        HTML(string=styled_html).write_pdf(str(out_path))
        return str(out_path)


pdf_service = PDFService()
