"""Generate transparent SleeklyBuilt logo + favicon set from source artwork.

Uses corner flood-fill so intentional dark logo interiors stay opaque.
"""
from __future__ import annotations

from collections import deque
from pathlib import Path

import numpy as np
from PIL import Image

SRC = Path(
    r"C:\Users\Ojoh\.cursor\projects\d-dev-htdocs-ulnovatech\assets"
    r"\c__Users_Ojoh_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"86b3cb0b5ae16758c5fd2917c3653675_images_sleekly_logo-04ec51ab-6c0c-4040-834a-bd990f9ba0df.jpg"
)
ROOT = Path(__file__).resolve().parents[2]
OUT_BRAND = ROOT / "assets" / "brand"
OUT_IMG = ROOT / "assets" / "img"


def luminance(rgb: np.ndarray) -> np.ndarray:
    return 0.299 * rgb[:, :, 0] + 0.587 * rgb[:, :, 1] + 0.114 * rgb[:, :, 2]


def flood_background_mask(rgb: np.ndarray, seed_max_lum: float = 28.0, color_tol: float = 28.0) -> np.ndarray:
    """Mark pixels connected to image corners that match near-black background."""
    h, w = rgb.shape[:2]
    lum = luminance(rgb)
    is_dark = lum <= seed_max_lum
    bg = np.zeros((h, w), dtype=bool)
    q: deque[tuple[int, int]] = deque()

    for y, x in ((0, 0), (0, w - 1), (h - 1, 0), (h - 1, w - 1)):
        if is_dark[y, x]:
            bg[y, x] = True
            q.append((y, x))

    # Also seed along edges for solid letterbox bars
    for x in range(0, w, 8):
        for y in (0, h - 1):
            if is_dark[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))
    for y in range(0, h, 8):
        for x in (0, w - 1):
            if is_dark[y, x] and not bg[y, x]:
                bg[y, x] = True
                q.append((y, x))

    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if ny < 0 or nx < 0 or ny >= h or nx >= w or bg[ny, nx]:
                continue
            # Background if dark enough — keep interior logo blacks if enclosed
            if lum[ny, nx] <= color_tol:
                bg[ny, nx] = True
                q.append((ny, nx))
    return bg


def soft_alpha_simple(rgb: np.ndarray, bg: np.ndarray) -> np.ndarray:
    lum = luminance(rgb)
    alpha = np.full(lum.shape, 255, dtype=np.uint8)
    alpha[bg] = 0
    # Manual 1px feather without scipy
    for dy, dx in ((-1, 0), (1, 0), (0, -1), (0, 1)):
        shifted = np.roll(bg, shift=(dy, dx), axis=(0, 1))
        if dy < 0:
            shifted[dy:, :] = False
        elif dy > 0:
            shifted[:dy, :] = False
        if dx < 0:
            shifted[:, dx:] = False
        elif dx > 0:
            shifted[:, :dx] = False
        fringe = shifted & ~bg & (lum < 50)
        alpha[fringe] = np.minimum(alpha[fringe], 90)
    return alpha


def make_square(im: Image.Image, size: int, bg=(0, 0, 0, 0), scale: float = 0.78) -> Image.Image:
    canvas = Image.new("RGBA", (size, size), bg)
    iw, ih = im.size
    target = int(size * scale)
    ratio = min(target / iw, target / ih)
    nw, nh = max(1, int(iw * ratio)), max(1, int(ih * ratio))
    resized = im.resize((nw, nh), Image.Resampling.LANCZOS)
    ox = (size - nw) // 2
    oy = (size - nh) // 2
    canvas.paste(resized, (ox, oy), resized)
    return canvas


def content_bbox(alpha: np.ndarray, pad: int = 24) -> tuple[int, int, int, int]:
    ys, xs = np.where(alpha > 20)
    h, w = alpha.shape
    return (
        max(0, int(xs.min()) - pad),
        max(0, int(ys.min()) - pad),
        min(w, int(xs.max()) + pad + 1),
        min(h, int(ys.max()) + pad + 1),
    )


def main() -> None:
    OUT_BRAND.mkdir(parents=True, exist_ok=True)
    OUT_IMG.mkdir(parents=True, exist_ok=True)

    source = Image.open(SRC).convert("RGB")
    source.save(OUT_BRAND / "sleeklybuilt-logo-source.jpg", quality=95)
    rgb = np.array(source)

    bg = flood_background_mask(rgb)
    alpha = soft_alpha_simple(rgb, bg)
    full = Image.fromarray(np.dstack([rgb, alpha]))

    x0, y0, x1, y1 = content_bbox(alpha, pad=24)
    full_cropped = full.crop((x0, y0, x1, y1))

    # Icon above text gap (~row 579)
    icon_bottom = 575
    icon = full.crop((x0, y0, x1, min(icon_bottom + 24, rgb.shape[0])))
    ia = np.array(icon)[:, :, 3]
    ix0, iy0, ix1, iy1 = content_bbox(ia, pad=16)
    icon = icon.crop((ix0, iy0, ix1, iy1))

    full_path = OUT_IMG / "sleeklybuilt-logo.png"
    full_cropped.save(full_path, optimize=True)
    print("full", full_cropped.size, "bg_px", int(bg.sum()))

    mark_hi = make_square(icon, 512, bg=(0, 0, 0, 0), scale=0.92)
    mark_path = OUT_IMG / "sleeklybuilt-mark.png"
    mark_hi.save(mark_path, optimize=True)
    print("mark", mark_hi.size)

    og = Image.new("RGBA", (1200, 630), (7, 9, 13, 255))
    fw, fh = full_cropped.size
    target_w = 520
    ratio = target_w / fw
    nw, nh = int(fw * ratio), int(fh * ratio)
    logo_og = full_cropped.resize((nw, nh), Image.Resampling.LANCZOS)
    og.paste(logo_og, ((1200 - nw) // 2, (630 - nh) // 2), logo_og)
    og.convert("RGB").save(OUT_IMG / "sleeklybuilt-og.png", quality=92)

    for s in (16, 32, 48, 64, 128, 180, 192, 512):
        make_square(icon, s, bg=(0, 0, 0, 0), scale=0.82).save(
            OUT_IMG / f"favicon-{s}.png", optimize=True
        )
    make_square(icon, 32, bg=(0, 0, 0, 0), scale=0.82).save(OUT_IMG / "favicon.png", optimize=True)
    make_square(icon, 180, bg=(7, 9, 13, 255), scale=0.7).save(
        OUT_IMG / "apple-touch-icon.png", optimize=True
    )

    ico_imgs = [make_square(icon, s, bg=(0, 0, 0, 0), scale=0.82) for s in (16, 32, 48)]
    ico_path = ROOT / "favicon.ico"
    # Pillow embeds listed sizes when saving from the largest frame
    ico_imgs[-1].save(ico_path, format="ICO", sizes=[(16, 16), (32, 32), (48, 48)])
    print("ico", ico_path, ico_path.stat().st_size, "bytes")

    (OUT_BRAND / "sleeklybuilt-logo.png").write_bytes(full_path.read_bytes())
    (OUT_BRAND / "sleeklybuilt-mark.png").write_bytes(mark_path.read_bytes())
    (OUT_IMG / "favicon.ico").write_bytes(ico_path.read_bytes())

    m = np.array(mark_hi)
    print("mark corner rgba", tuple(m[0, 0]))
    print("done")


if __name__ == "__main__":
    main()
