from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "posts" / "015-yc-klantengesprekken.png"

W, H = 1080, 1350
INK = "#111111"
PAPER = "#F5F0E6"
ORANGE = "#F15A24"
YELLOW = "#F2C94C"
BUREAU = "#2F4858"
MUTED = "#D8D1C4"

GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(path, size):
    return ImageFont.truetype(path, size)


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
    for size in (66, 62, 58, 54, 50):
        face = font(GEORGIA_BOLD, size)
        lines = wrap(draw, text, face, 910)
        if len(lines) <= 6:
            return face, lines, int(size * 1.14)
    face = font(GEORGIA_BOLD, 46)
    return face, wrap(draw, text, face, 910), 54


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


def draw_office_scene(draw):
    draw.rectangle((56, 790, 1024, 1108), fill="#EEE7DA", outline=INK, width=4)
    draw.rectangle((96, 836, 462, 1028), fill="#FFFFFF", outline=INK, width=3)
    draw.rectangle((502, 836, 984, 1066), fill="#FFFFFF", outline=INK, width=3)
    draw.text((126, 872), "50 klantengesprekken", font=font(ARIAL_BOLD, 26), fill=INK)
    for i, line in enumerate(("1. korting?", "2. factuur?", "3. werkt dit in Excel?")):
        draw.text((126, 924 + i * 35), line, font=font(ARIAL, 27), fill=INK)
    draw.text((532, 872), "YC CHECKLIST", font=font(ARIAL_BOLD, 27), fill=INK)
    for i, line in enumerate(("traction", "probleem", "co-founder", "geen jargon")):
        y = 918 + i * 34
        draw.rectangle((532, y + 5, 554, y + 27), outline=INK, width=2)
        if i < 2:
            draw.line((535, y + 17, 543, y + 25), fill=ORANGE, width=4)
            draw.line((543, y + 25, 556, y + 8), fill=ORANGE, width=4)
        draw.text((568, y), line, font=font(ARIAL, 26), fill=INK)


def main():
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img, "RGBA")

    for y in range(0, H, 28):
        draw.line((0, y, W, y), fill=(216, 209, 196, 72), width=1)

    draw.rectangle((0, 0, W, 158), fill=INK)
    draw.text((70, 58), "ECONOMIE", font=font(ARIAL_BOLD, 34), fill=PAPER)
    draw.ellipse((980, 58, 1018, 96), fill=ORANGE)
    draw.line((70, 178, 1010, 178), fill=INK, width=4)

    headline = "Vlaamse founder praat met 50 klanten en ontdekt dat iedereen vooral korting wil"
    face, lines, spacing = headline_font(draw, headline)
    y = 238
    for line in lines:
        draw.text((70, y), line, font=face, fill=INK)
        y += spacing

    draw.rectangle((70, y + 26, 246, y + 38), fill=ORANGE)
    deck = "Pitchdeck tijdelijk vervangen door WhatsApp van nonkel Luc."
    deck_face = font(GEORGIA, 34)
    deck_y = y + 74
    for line in wrap(draw, deck, deck_face, 820):
        draw.text((70, deck_y), line, font=deck_face, fill=BUREAU)
        deck_y += 42

    draw_office_scene(draw)

    draw.rectangle((0, 1172, W, H), fill=INK)
    draw_logo(draw, 894, 1208, 0.9)
    draw.text((70, 1228), "DE RAASKALDERIJ", font=font(ARIAL_BOLD, 24), fill=PAPER)
    draw.text((70, 1262), "Ambachtelijk geraas sinds 1836", font=font(ARIAL, 22), fill=MUTED)
    draw.line((70, 1300, 770, 1300), fill=ORANGE, width=4)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, quality=96)
    print(OUT)


if __name__ == "__main__":
    main()
