#!/usr/bin/env python3
"""Render a CapCut draft (the 1122 template layout) with ffmpeg.

Reproduces: main video (trimmed) + outro on track 0, logo overlay on track 1,
using the clip scale/transform/volume stored in draft_info.json.

Usage: render_from_draft.py --name 1129 --out final.mp4 [--web web.mp4]
"""
import argparse, json, subprocess
from pathlib import Path

ROOT = Path.home() / "Movies/CapCut/User Data/Projects/com.lveditor.draft"
US = 1_000_000


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--name", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--web", help="also write a small H.264 copy for the web page")
    a = ap.parse_args()

    d = json.loads((ROOT / a.name / "draft_info.json").read_text())
    W, H = d["canvas_config"]["width"], d["canvas_config"]["height"]
    mats = {v["id"]: v for v in d["materials"]["videos"]}
    main_seg, outro_seg = d["tracks"][0]["segments"][:2]
    logo_seg = d["tracks"][1]["segments"][0]
    main, outro, logo = (mats[s["material_id"]] for s in (main_seg, outro_seg, logo_seg))

    keep = main_seg["source_timerange"]["duration"] / US
    o_start = outro_seg["source_timerange"]["start"] / US
    o_dur = outro_seg["source_timerange"]["duration"] / US

    # CapCut fits the image to the canvas, then applies clip scale and a
    # transform in [-1, 1] canvas half-units (y up).
    c = logo_seg["clip"]
    fit = min(W / logo["width"], H / logo["height"])
    lw = round(logo["width"] * fit * c["scale"]["x"])
    lh = round(logo["height"] * fit * c["scale"]["y"])
    cx = W / 2 + c["transform"]["x"] * W / 2
    cy = H / 2 - c["transform"]["y"] * H / 2
    lx, ly = round(cx - lw / 2), round(cy - lh / 2)

    mv, ov = main_seg.get("volume", 1.0), outro_seg.get("volume", 1.0)
    fit_v = f"scale={W}:{H}:force_original_aspect_ratio=decrease,pad={W}:{H}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=30"
    fc = (
        f"[0:v]trim=0:{keep},setpts=PTS-STARTPTS,{fit_v}[mv];"
        f"[2:v]scale={lw}:{lh}[lg];"
        f"[mv][lg]overlay={lx}:{ly}:shortest=1[m];"
        f"[1:v]trim={o_start}:{o_start + o_dur},setpts=PTS-STARTPTS,{fit_v}[o];"
        f"[0:a]atrim=0:{keep},asetpts=PTS-STARTPTS,volume={mv},aresample=48000[ma];"
        f"[1:a]atrim={o_start}:{o_start + o_dur},asetpts=PTS-STARTPTS,volume={ov},aresample=48000[oa];"
        f"[m][ma][o][oa]concat=n=2:v=1:a=1[v][a]"
    )
    subprocess.run([
        "ffmpeg", "-y", "-v", "error",
        "-i", main["path"], "-i", outro["path"], "-loop", "1", "-i", logo["path"],
        "-filter_complex", fc, "-map", "[v]", "-map", "[a]",
        "-c:v", "libx264", "-crf", "18", "-preset", "medium", "-pix_fmt", "yuv420p",
        "-c:a", "aac", "-b:a", "192k", "-movflags", "+faststart", a.out], check=True)
    print(f"logo {lw}x{lh} at ({lx},{ly}); main {keep:.2f}s + outro {o_dur:.2f}s -> {a.out}")

    if a.web:
        Path(a.web).parent.mkdir(parents=True, exist_ok=True)
        subprocess.run([
            "ffmpeg", "-y", "-v", "error", "-i", a.out, "-vf", "scale=720:1280",
            "-c:v", "libx264", "-crf", "28", "-preset", "slow", "-pix_fmt", "yuv420p",
            "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", a.web], check=True)
        print(f"web copy -> {a.web} ({Path(a.web).stat().st_size / 1e6:.1f} MB)")


if __name__ == "__main__":
    main()
