"""Usage: python .design/diff.py <design.png> <live.png> [band_px=500] [top=6]

Prints the worst-matching vertical bands and writes side-by-side crops to .design/cmp-*.jpg
"""
import sys
from PIL import Image, ImageChops, ImageStat

d_path, l_path = sys.argv[1], sys.argv[2]
band = int(sys.argv[3]) if len(sys.argv) > 3 else 500
top = int(sys.argv[4]) if len(sys.argv) > 4 else 6

d = Image.open(d_path).convert('RGB')
l = Image.open(l_path).convert('RGB')
W = max(d.width, l.width)

def pad(im):
    if im.width != W or im.height == 0:
        c = Image.new('RGB', (W, im.height), (255, 255, 255))
        c.paste(im, (0, 0))
        return c
    return im

d, l = pad(d), pad(l)
H = max(d.height, l.height)
if d.height != H:
    c = Image.new('RGB', (W, H), (255, 255, 255)); c.paste(d, (0, 0)); d = c
if l.height != H:
    c = Image.new('RGB', (W, H), (255, 255, 255)); c.paste(l, (0, 0)); l = c

diff = ImageChops.difference(d, l).convert('L')
print(f'design {Image.open(d_path).size}  live {Image.open(l_path).size}')

bands = []
for y in range(0, H, band):
    crop = diff.crop((0, y, W, min(y + band, H)))
    stat = ImageStat.Stat(crop)
    bands.append((stat.mean[0], y, min(y + band, H)))

bands.sort(reverse=True)
overall = ImageStat.Stat(diff).mean[0]
print(f'overall mean diff: {overall:.1f}')
for mean, y0, y1 in bands[:top]:
    print(f'  y={y0}-{y1}  meanDiff={mean:.1f}')

# write side-by-side crops for the worst bands
for i, (mean, y0, y1) in enumerate(bands[:top], 1):
    dc = d.crop((0, y0, W, y1))
    lc = l.crop((0, y0, W, y1))
    gap = 16
    comp = Image.new('RGB', (W * 2 + gap, y1 - y0), (30, 30, 30))
    comp.paste(dc, (0, 0))
    comp.paste(lc, (W + gap, 0))
    scale = min(1.0, 1300 / comp.width)
    comp = comp.resize((int(comp.width * scale), int(comp.height * scale)), Image.LANCZOS)
    comp.save(f'.design/cmp-{i}-y{y0}.jpg', quality=70)
    print(f'  wrote .design/cmp-{i}-y{y0}.jpg (left=DESIGN, right=LIVE)')
