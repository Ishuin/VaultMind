"""
Deterministic diagram renderer for PDF pipeline.

Does not depend on mermaid-cli / Chromium / browser binaries.
Uses matplotlib + Pillow to render simple diagram styles.
"""
from pathlib import Path
from loguru import logger

import matplotlib
matplotlib.use("Agg")
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch

TMP_DIR = Path("/tmp/vaultmind_pdfs")
TMP_DIR.mkdir(parents=True, exist_ok=True)


class DiagramService:
    def render_mermaid_like(self, definition: str, width: int = 800, height: int = 600) -> str | None:
        definition = definition.strip()
        if not definition:
            return None

        out_path = TMP_DIR / f"diagram_{abs(hash(definition)) & 0xFFFFFFFF}.png"

        try:
            lines = [line.rstrip() for line in definition.splitlines() if line.strip()]
            first = next((line for line in lines if not line.strip().startswith("---")), lines[0] if lines else "")

            direction = "TD" if ("graph TD" in first or "flowchart TD" in first) else "LR"

            ordered: list[str] = []
            edges: list[tuple[str, str]] = []
            for line in lines:
                if "-->" in line:
                    parts = line.split("-->", 1)
                    if len(parts) == 2:
                        src, dst = parts[0].strip(), parts[1].strip()
                        edges.append((src, dst))
                        if src not in ordered:
                            ordered.append(src)
                        if dst not in ordered:
                            ordered.append(dst)

            if not ordered:
                ordered = lines[:]

            cols = max(1, len(ordered))
            fig_w = max(4, cols * 2.2)
            fig_h = max(3, cols * 1.3)
            fig, ax = plt.subplots(figsize=(fig_w, fig_h), dpi=150)
            ax.set_xlim(0, cols)
            ax.set_ylim(0, max(1, cols))
            ax.axis("off")
            fig.patch.set_alpha(0)

            for idx, label in enumerate(ordered):
                x = 0.5 if direction == "TD" else idx + 0.5
                y = cols - idx if direction == "TD" else 0.5
                box = FancyBboxPatch(
                    (x - 0.44, y - 0.24),
                    0.88,
                    0.48,
                    boxstyle="round,pad=0.04",
                    facecolor="#f1f5f9",
                    edgecolor="#334155",
                    linewidth=1.4,
                )
                ax.add_patch(box)
                ax.text(x, y, label, ha="center", va="center", fontsize=8, color="#0f172a")

            for src, dst in edges:
                if src in ordered and dst in ordered:
                    x1, y1 = (0.5, cols - ordered.index(src)) if direction == "TD" else (ordered.index(src) + 0.5, 0.5)
                    x2, y2 = (0.5, cols - ordered.index(dst)) if direction == "TD" else (ordered.index(dst) + 0.5, 0.5)
                    ax.annotate(
                        "",
                        xy=(x2, y2),
                        xytext=(x1, y1),
                        arrowprops=dict(arrowstyle="-|>", color="#475569", lw=1.2),
                    )

            fig.savefig(out_path, dpi=150, bbox_inches="tight", transparent=True)
            plt.close(fig)
            return str(out_path)
        except Exception as exc:
            logger.warning("Diagram render failed: {}", exc)
            try:
                plt.close("all")
            except Exception:
                pass
            return None


diagram_service = DiagramService()
