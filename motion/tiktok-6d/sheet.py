# Contact sheet: tiles frames with their timecodes for review.  python3 sheet.py <framesdir> <fps> <out.png> [cols] [every]
import sys, glob, os
from PIL import Image, ImageDraw, ImageFont
d, fps, out = sys.argv[1], float(sys.argv[2]), sys.argv[3]
cols = int(sys.argv[4]) if len(sys.argv) > 4 else 6
every = int(sys.argv[5]) if len(sys.argv) > 5 else 1
files = sorted(glob.glob(os.path.join(d, 'f*.png')) + glob.glob(os.path.join(d, 'f*.jpg')))[::every]
if not files: sys.exit('no frames')
im0 = Image.open(files[0]); tw = 270; th = int(im0.height * tw / im0.width)
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * tw, rows * (th + 22)), (20, 20, 20))
dr = ImageDraw.Draw(sheet)
try: fnt = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf', 14)
except Exception: fnt = ImageFont.load_default()
for i, f in enumerate(files):
    n = int(os.path.basename(f)[1:6]); t = n / fps
    im = Image.open(f).convert('RGB').resize((tw, th), Image.LANCZOS)
    x, y = (i % cols) * tw, (i // cols) * (th + 22)
    sheet.paste(im, (x, y)); dr.text((x + 6, y + th + 4), f'{t:6.2f}s  #{n}', fill=(230, 230, 230), font=fnt)
sheet.save(out); print(out, sheet.size, len(files), 'frames')
