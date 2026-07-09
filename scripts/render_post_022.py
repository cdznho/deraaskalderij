from pathlib import Path
from PIL import Image, ImageDraw, ImageEnhance, ImageFilter, ImageFont


ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "assets" / "sources" / "022-mohammed-marokko-vuvuzelas.png"
OUT = ROOT / "assets" / "posts" / "022-mohammed-marokko-vuvuzelas.png"

W, H = 1080, 1350
INK = "#111111"
PAPER = "#F5F0E6"
ORANGE = "#F15A24"
YELLOW = "#F2C94C"
WHITE = "#FFFFFF"
MUTED = "#D8D1C4"
GREEN = "#0B8F4D"
RED = "#C1272D"

GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(path, size):
    return ImageFont.truetype(path, size)


def cover_crop(img, size, vertical_focus=0.5, horizontal_focus=0.5):
    src_w, src_h = img.size
    dst_w, dst_h = size
    scale = max(dst_w / src_w, dst_h / src_h)
    resized = img.resize((round(src_w * scale), round(src_h * scale)), Image.LANCZOS)
    left = round((resized.width - dst_w) * horizontal_focus)
    top = round((resized.height - dst_h) * vertical_focus)
    return resized.crop((left, top, left + dst_w, top + dst_h))


def contain_fit(img, size):
    src_w, src_h = img.size
    dst_w, dst_h = size
    scale = min(dst_w / src_w, dst_h / src_h)
    return img.resize((round(src_w * scale), round(src_h * scale)), Image.LANCZOS)


def wrap(draw, text, face, max_width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
        candidate = word if not current else f"{current} {word}"
        if draw.textbbox((0, 0), candidate, font=face)[2] <= max_width:
            current = candidate
        else:
            if current:
                lines.append(current)
            current = word
    if current:
        lines.append(current)
    return lines


def headline_font(draw, text):
    for size in (58, 54, 50, 46, 42):
        face = font(GEORGIA_BOLD, size)
        lines = wrap(draw, text, face, 940)
        if len(lines) <= 4:
            return face, lines, int(size * 1.18)
    face = font(GEORGIA_BOLD, 40)
    return face, wrap(draw, text, face, 940), 48


def draw_logo(draw, x, y, scale=1.0):
    r = int(42 * scale)
    cx, cy = x + r, y + r
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=PAPER, outline=INK, width=max(3, int(5 * scale)))
    draw.ellipse((cx - r + 8, cy - r + 8, cx + r - 8, cy + r - 8), outline=INK, width=max(1, int(2 * scale)))
    face = font(GEORGIA_BOLD, int(38 * scale))
    box = draw.textbbox((0, 0), "DR", font=face)
    draw.text((cx - (box[2] - box[0]) / 2 - int(2 * scale), cy - int(24 * scale)), "DR", font=face, fill=INK)
    draw.ellipse((cx + int(25 * scale), cy + int(11 * scale), cx + int(35 * scale), cy + int(21 * scale)), fill=ORANGE)
    draw.rectangle((cx - int(14 * scale), cy - int(35 * scale), cx + int(14 * scale), cy - int(31 * scale)), fill=YELLOW)


def draw_stamp(draw):
    draw.rectangle((70, 725, 286, 765), fill=ORANGE)
    draw.text((92, 733), "BRUSSEL", font=font(ARIAL_BOLD, 20), fill=INK)
    draw.rectangle((732, 725, 1010, 779), fill=(17, 17, 17, 225))
    draw.text((754, 739), "VUVUZELA-STAND", font=font(ARIAL_BOLD, 23), fill=PAPER)
    draw.ellipse((962, 737, 992, 767), fill=GREEN)


def main():
    base = Image.open(SRC).convert("RGB")
    base = ImageEnhance.Color(base).enhance(1.06)
    base = ImageEnhance.Contrast(base).enhance(1.08)
    base = base.filter(ImageFilter.UnsharpMask(radius=1.0, percent=110, threshold=3))

    img = cover_crop(base, (W, H), vertical_focus=0.45, horizontal_focus=0.5)
    img = img.filter(ImageFilter.GaussianBlur(radius=7))
    img = ImageEnhance.Brightness(img).enhance(0.55)
    draw = ImageDraw.Draw(img, "RGBA")

    draw.rectangle((0, 0, W, 152), fill=(17, 17, 17, 255))
    draw.rectangle((0, 152, W, 820), fill=(0, 0, 0, 42))
    draw.rectangle((0, 820, W, H), fill=(17, 17, 17, 245))

    hero = contain_fit(base, (910, 560))
    px = (W - hero.width) // 2
    py = 176
    img.paste(hero, (px, py))
    draw.rectangle((px, py, px + hero.width, py + hero.height), outline=PAPER, width=6)
    draw.rectangle((0, 700, W, 820), fill=(0, 0, 0, 76))

    draw.text((70, 58), "VOETBAL", font=font(ARIAL_BOLD, 32), fill=WHITE)
    draw.ellipse((936, 58, 974, 96), fill=RED)
    draw.ellipse((980, 58, 1018, 96), fill=GREEN)
    draw_stamp(draw)

    headline = "Mohammed (29) belooft een hete nacht in Parijs vanavond"
    face, lines, spacing = headline_font(draw, headline)
    y = 864
    for line in lines:
        draw.text((70, y), line, font=face, fill=PAPER)
        y += spacing

    draw.line((70, y + 20, 1010, y + 20), fill=ORANGE, width=5)
    deck_font = font(ARIAL, 28)
    deck = "Om 22u kan het daar volgens hem nog altijd 28 graden zijn."
    deck_y = y + 54
    for line in wrap(draw, deck, deck_font, 790):
        draw.text((70, deck_y), line, font=deck_font, fill=MUTED)
        deck_y += 34

    draw_logo(draw, 900, 1222, 0.88)
    draw.text((70, 1282), "DE RAASKALDERIJ", font=font(ARIAL_BOLD, 23), fill=PAPER)
    draw.text((70, 1314), "Ambachtelijk geraas sinds 1836", font=font(ARIAL, 22), fill=MUTED)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, quality=96)
    print(OUT)


if __name__ == "__main__":
    main()
