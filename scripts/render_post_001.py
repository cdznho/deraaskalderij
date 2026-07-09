from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "posts" / "001-wachtlijst.png"

W = H = 1080
INK = "#111111"
PAPER = "#F5F0E6"
MUTED = "#6F6A61"
ORANGE = "#F15A24"
YELLOW = "#F2C94C"
GREY = "#D8D1C4"

GEORGIA = "/System/Library/Fonts/Supplemental/Georgia.ttf"
GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
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


def centered_text(draw, xy, text, face, fill):
    x, y = xy
    box = draw.textbbox((0, 0), text, font=face)
    draw.text((x - (box[2] - box[0]) / 2, y), text, font=face, fill=fill)


def draw_logo(draw, cx, cy, r):
    draw.ellipse((cx - r, cy - r, cx + r, cy + r), fill=PAPER, outline=INK, width=8)
    draw.ellipse((cx - r + 15, cy - r + 15, cx + r - 15, cy + r - 15), outline=INK, width=2)
    logo_font = font(GEORGIA_BOLD, 58)
    box = draw.textbbox((0, 0), "DR", font=logo_font)
    draw.text((cx - (box[2] - box[0]) / 2 - 5, cy - 35), "DR", font=logo_font, fill=INK)
    draw.ellipse((cx + 42, cy + 15, cx + 56, cy + 29), fill=ORANGE)
    draw.rectangle((cx - 20, cy - 60, cx + 20, cy - 54), fill=YELLOW)


def main():
    img = Image.new("RGB", (W, H), PAPER)
    draw = ImageDraw.Draw(img)

    # Subtle newsprint bands.
    for y in range(0, H, 8):
        if y % 24 == 0:
            draw.line((0, y, W, y), fill="#EFE8DA", width=1)

    margin = 70
    draw.rectangle((margin, margin, W - margin, 154), fill=INK)
    draw.text((104, 101), "BINNENLAND", font=font(ARIAL_BOLD, 30), fill=PAPER)
    draw.ellipse((942, 94, 978, 130), fill=ORANGE)

    draw.line((margin, 198, W - margin, 198), fill=INK, width=5)

    headline = "Vlaamse overheid lanceert wachtlijst voor mensen die op wachtlijst willen"
    headline_font = font(GEORGIA_BOLD, 76)
    lines = wrap(draw, headline, headline_font, 900)
    y = 290
    for line in lines:
        draw.text((88, y), line, font=headline_font, fill=INK)
        y += 92

    draw.ellipse((902, y + 10, 966, y + 74), fill=ORANGE)
    draw.line((88, 742, 992, 742), fill=INK, width=2)
    draw.text((88, 800), "Voorlopig alleen toegankelijk na afspraak.", font=font(ARIAL, 34), fill=MUTED)

    draw_logo(draw, 900, 910, 78)

    draw.text((88, 968), "DE RAASKALDERIJ", font=font(ARIAL_BOLD, 22), fill=INK)
    draw.text((88, 1000), "Ambachtelijk geraas sinds 1836", font=font(ARIAL, 22), fill=MUTED)

    OUT.parent.mkdir(parents=True, exist_ok=True)
    img.save(OUT, quality=95)
    print(OUT)


if __name__ == "__main__":
    main()
