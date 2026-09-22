#!/usr/bin/env python3
"""
Builds the animated neighborhood scene in the hero of index.html.

Run:  python3 tools/build-skyline.py

It regenerates three parallax layers of houses and writes them straight into
index.html between the SKYLINE:START / SKYLINE:END markers. The shapes are
inline SVG (not an <img>) so the stylesheet can colour the layers and light
the windows.

Deterministic: the same SEED always produces the same street. Change SEED,
re-run, and commit if you want a different neighbourhood.
"""
import random
import re
import pathlib

SEED = 20260922
W = 1600            # layer viewBox width
PAGE = pathlib.Path(__file__).resolve().parent.parent / 'index.html'


def gable(x, y, w, h, roof, over=6):
    pts = f"{x - over},{y - h} {x + w / 2},{y - h - roof} {x + w + over},{y - h}"
    return (f'<polygon points="{pts}"/>', f'<rect x="{x}" y="{y - h}" width="{w}" height="{h}"/>')


def hip(x, y, w, h, roof, over=5):
    inset = w * 0.26
    pts = (f"{x - over},{y - h} {x + inset:.1f},{y - h - roof} "
           f"{x + w - inset:.1f},{y - h - roof} {x + w + over},{y - h}")
    return (f'<polygon points="{pts}"/>', f'<rect x="{x}" y="{y - h}" width="{w}" height="{h}"/>')


def boxy(x, y, w, h):
    return (f'<rect x="{x - 4}" y="{y - h - 7}" width="{w + 8}" height="7"/>',
            f'<rect x="{x}" y="{y - h}" width="{w}" height="{h}"/>')


def tree(x, y, h):
    r = h * 0.38
    return (f'<rect x="{x - 2}" y="{y - h * 0.42:.1f}" width="4" height="{h * 0.42:.1f}"/>'
            f'<ellipse cx="{x}" cy="{y - h * 0.64:.1f}" rx="{r:.1f}" ry="{h * 0.44:.1f}"/>')


def pin(x, y, i):
    """A map marker floating over a rooftop — the listing cue."""
    return (f'<g class="sky__pin" style="animation-delay:{i * 1.7:.1f}s">'
            f'<path d="M{x} {y + 17} L{x - 6} {y + 5} A9 9 0 1 1 {x + 6} {y + 5} Z"/>'
            f'<circle class="sky__pin-eye" cx="{x}" cy="{y - 2}" r="3.4"/></g>')


def windows(rng, x, y, w, h, lit_ratio):
    cols = max(2, int(w // 26))
    rows = max(1, int((h - 16) // 26))
    pw, ph = 11, 13
    gx, gy = w / cols, (h - 14) / rows
    dark, lit = [], []
    for r in range(rows):
        for c in range(cols):
            wx = x + gx * c + (gx - pw) / 2
            wy = y - h + 9 + gy * r
            if wy + ph > y - 4:
                continue
            if rng.random() < lit_ratio:
                # Staggered, so the street lights up over several seconds
                lit.append(f'<rect x="{wx:.1f}" y="{wy:.1f}" width="{pw}" height="{ph}" rx="1" '
                           f'style="animation-delay:{rng.uniform(0, 7):.2f}s;'
                           f'animation-duration:{rng.uniform(4.5, 9):.2f}s"/>')
            else:
                dark.append(f'<rect x="{wx:.1f}" y="{wy:.1f}" width="{pw}" height="{ph}" rx="1"/>')
    return ''.join(dark), ''.join(lit)


def layer(name, seed, base_y, heights, roofs_r, widths, gaps, lit_ratio, vb_h,
          trees=0, pins=0):
    rng = random.Random(seed)
    roof_svg, body_svg, dark, lit, green, marks = [], [], [], [], [], []
    tops = []
    x = -40
    while x < W + 40:
        w = rng.randint(*widths)
        h = rng.randint(*heights)
        roof = rng.randint(*roofs_r)
        kind = rng.random()
        if kind < 0.46:
            r, b = gable(x, base_y, w, h, roof)
            top = base_y - h - roof
        elif kind < 0.78:
            r, b = hip(x, base_y, w, h, int(roof * 0.6))
            top = base_y - h - roof * 0.6
        else:
            r, b = boxy(x, base_y, w, h)
            top = base_y - h - 7
        roof_svg.append(r)
        body_svg.append(b)
        tops.append((x + w / 2, top))
        d, l = windows(rng, x, base_y, w, h, lit_ratio)
        dark.append(d)
        lit.append(l)
        if kind < 0.46 and rng.random() < 0.4:
            cx = x + w * rng.uniform(0.6, 0.78)
            roof_svg.append(f'<rect x="{cx:.1f}" y="{base_y - h - roof * 0.75:.1f}" '
                            f'width="9" height="{roof * 0.75 + 6:.1f}"/>')
        x += w + rng.randint(*gaps)

    for _ in range(trees):
        green.append(tree(rng.randint(0, W), base_y + rng.randint(-2, 4), rng.randint(38, 66)))

    inner = [t for t in tops if 240 < t[0] < 1360]
    for i, (px, py) in enumerate(rng.sample(inner, min(pins, len(inner)))):
        marks.append(pin(round(px), round(max(34, py - 26)), i))

    return (f'<svg class="sky sky--{name}" viewBox="0 0 {W} {vb_h}" '
            f'preserveAspectRatio="xMidYMax slice" aria-hidden="true" focusable="false">'
            f'<g class="sky__built">{"".join(roof_svg)}{"".join(body_svg)}</g>'
            f'<g class="sky__pane">{"".join(dark)}</g>'
            f'<g class="sky__lit">{"".join(lit)}</g>'
            f'<g class="sky__tree">{"".join(green)}</g>'
            f'{"".join(marks)}</svg>')


scene = (
    layer('far',  SEED,      base_y=132, heights=(34, 62),   roofs_r=(16, 26), widths=(46, 86),
          gaps=(6, 20),  lit_ratio=.20, vb_h=140) +
    layer('mid',  SEED + 7,  base_y=176, heights=(58, 96),   roofs_r=(24, 40), widths=(70, 122),
          gaps=(10, 30), lit_ratio=.34, vb_h=184, trees=5) +
    layer('near', SEED + 13, base_y=224, heights=(86, 138),  roofs_r=(34, 56), widths=(104, 176),
          gaps=(18, 48), lit_ratio=.42, vb_h=232, trees=6, pins=3)
)

html = PAGE.read_text(encoding='utf-8')
new, n = re.subn(
    r'(<!-- SKYLINE:START -->).*?(<!-- SKYLINE:END -->)',
    lambda m: m.group(1) + '\n' + scene + '\n      ' + m.group(2),
    html, flags=re.S)
if not n:
    raise SystemExit('SKYLINE markers not found in index.html')
PAGE.write_text(new, encoding='utf-8')
print(f'scene written into index.html — {len(scene) // 1024}KB of inline SVG')
