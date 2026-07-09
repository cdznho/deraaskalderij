from pathlib import Path
from PIL import Image, ImageDraw, ImageFont


ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "assets" / "drafts" / "highlights"
W, H = 1080, 1920
INK = "#111111"
PAPER = "#F5F0E6"
ORANGE = "#F15A24"
YELLOW = "#F2C94C"
MUTED = "#D8D1C4"
GEORGIA_BOLD = "/System/Library/Fonts/Supplemental/Georgia Bold.ttf"
ARIAL = "/System/Library/Fonts/Supplemental/Arial.ttf"
ARIAL_BOLD = "/System/Library/Fonts/Supplemental/Arial Bold.ttf"


def font(path, size):
    return ImageFont.truetype(path, size)


def draw_centered(draw, text, y, face, color):
    box = draw.textbbox((0, 0), text, font=face)
    draw.text(((W - (box[2] - box[0])) / 2, y), text, font=face, fill=color)


def cover(label, filename, accent):
    image = Image.new("RGB", (W, H), INK)
    draw = ImageDraw.Draw(image)
    draw.rectangle((55, 55, W - 55, H - 55), outline=PAPER, width=5)
    draw.rectangle((55, 55, W - 55, 205), fill=accent)
    draw_centered(draw, "DE RAASKALDERIJ", 102, font(ARIAL_BOLD, 27), INK)
    draw.ellipse((315, 690, 765, 1140), outline=PAPER, width=12)
    draw.ellipse((350, 725, 730, 1105), outline=MUTED, width=3)
    draw_centered(draw, "DR", 795, font(GEORGIA_BOLD, 162), PAPER)
    draw.ellipse((691, 983, 732, 1024), fill=ORANGE)
    draw.rectangle((492, 736, 588, 748), fill=YELLOW)
    draw_centered(draw, label, 1230, font(ARIAL_BOLD, 42), PAPER)
    draw_centered(draw, "AMBACHTELIJK GERAAST", 1300, font(ARIAL, 22), MUTED)
    image.save(OUT / filename, quality=96)


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    cover("START HIER", "highlight-start-hier.png", ORANGE)
    cover("BESTE KOPPEN", "highlight-beste-koppen.png", YELLOW)
    cover("REDACTIEBRIEF", "highlight-redactiebrief.png", ORANGE)
    print(OUT)


if __name__ == "__main__":
    main()
