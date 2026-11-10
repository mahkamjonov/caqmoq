"""SVG koʻylaklarni Edge orqali WebP suratga aylantiradi.
Ishga tushirish: python tools/rasterize.py <svg_papka> assets/shirts"""
import shutil
import subprocess
import sys
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

EDGE = r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe"


def convert(svg: Path, out_dir: Path) -> str:
    target = out_dir / f"{svg.stem}.webp"
    with tempfile.TemporaryDirectory() as tmp:
        png = Path(tmp) / "shot.png"
        subprocess.run(
            [EDGE, "--headless=new", "--disable-gpu", "--hide-scrollbars", "--force-device-scale-factor=1",
             "--window-size=800,1000", f"--user-data-dir={tmp}/profile", f"--screenshot={png}", svg.resolve().as_uri()],
            check=True, capture_output=True, timeout=120,
        )
        Image.open(png).convert("RGB").save(target, quality=82, method=6)
        shutil.rmtree(f"{tmp}/profile", ignore_errors=True)
    return svg.stem


def main() -> None:
    svg_dir, out_dir = Path(sys.argv[1]), Path(sys.argv[2])
    out_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(svg_dir.glob("*.svg"))
    with ThreadPoolExecutor(max_workers=6) as pool:
        done = sum(1 for _ in pool.map(lambda f: convert(f, out_dir), files))
    print(f"{done} ta surat tayyor")


if __name__ == "__main__":
    main()
