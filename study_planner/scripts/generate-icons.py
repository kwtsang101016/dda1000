"""Generate PNG home-screen icons from the SVG design."""

from __future__ import annotations

from pathlib import Path

try:
    from PIL import Image, ImageDraw
except ImportError:
    raise SystemExit("Install Pillow: pip install pillow")

ROOT = Path(__file__).resolve().parent.parent / "public"
BG = "#0c0e14"
PANEL = "#1a1f2a"
ACCENT = "#6366f1"
TEXT = "#a5b4fc"
BAR = "#818cf8"


def draw_icon(size: int) -> Image.Image:
    img = Image.new("RGB", (size, size), BG)
    draw = ImageDraw.Draw(img)
    margin = size // 10
    radius = size // 6
    draw.rounded_rectangle(
        (margin, margin, size - margin, size - margin),
        radius=radius,
        fill=PANEL,
        outline=ACCENT,
        width=max(2, size // 64),
    )

    # "STA" block
    font_size = size // 5
    try:
        from PIL import ImageFont

        font = ImageFont.truetype("arial.ttf", font_size)
    except OSError:
        font = ImageFont.load_default()

    text = "STA"
    bbox = draw.textbbox((0, 0), text, font=font)
    tw = bbox[2] - bbox[0]
    th = bbox[3] - bbox[1]
    draw.text(((size - tw) / 2, size * 0.28 - th / 2), text, fill=TEXT, font=font)

    # Mini bar chart
    base_y = int(size * 0.72)
    bar_w = size // 12
    gap = size // 20
    xs = size // 2 - (3 * bar_w + 2 * gap) // 2
    heights = [0.35, 0.55, 0.45]
    for i, h in enumerate(heights):
        x = xs + i * (bar_w + gap)
        bh = int(size * h * 0.35)
        draw.rounded_rectangle(
            (x, base_y - bh, x + bar_w, base_y),
            radius=bar_w // 4,
            fill=ACCENT if i == 1 else BAR,
        )

    return img


def main() -> None:
    icons_dir = ROOT / "icons"
    icons_dir.mkdir(parents=True, exist_ok=True)

    sizes = {
        "apple-touch-icon.png": 180,
        "icons/icon-192.png": 192,
        "icons/icon-512.png": 512,
    }

    for name, px in sizes.items():
        out = ROOT / name
        out.parent.mkdir(parents=True, exist_ok=True)
        draw_icon(px).save(out, format="PNG")
        print(f"Wrote {out}")


if __name__ == "__main__":
    main()
