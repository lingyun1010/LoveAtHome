#!/usr/bin/env python3
"""Clone a CapCut draft (template) and swap its main NotebookLM video.

Template layout (CapCut project "1122"):
  track 0: [NotebookLM video, trimmed to drop its end card] + [Love At Home outro]
  track 1: brand.png logo (bottom-right), same length as the trimmed main video

Usage:
  capcut_swap.py --video NEW.mp4 --name 1129 [--template 1122] [--cut-end 3.133333]

CapCut must be closed while this runs (it rewrites root_meta_info.json).
"""
import argparse, json, shutil, subprocess, sys, time, uuid
from pathlib import Path

ROOT = Path.home() / "Movies/CapCut/User Data/Projects/com.lveditor.draft"
US = 1_000_000


def probe(path):
    out = subprocess.check_output([
        "ffprobe", "-v", "error", "-select_streams", "v:0",
        "-show_entries", "stream=width,height:format=duration", "-of", "json", str(path)])
    j = json.loads(out)
    s = j["streams"][0]
    return int(float(j["format"]["duration"]) * US), s["width"], s["height"]


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--video", required=True)
    ap.add_argument("--name", required=True)
    ap.add_argument("--template", default="1122")
    ap.add_argument("--cut-end", type=float, default=3.133333,
                    help="seconds of NotebookLM end card to drop")
    a = ap.parse_args()

    if subprocess.run(["pgrep", "-x", "CapCut"], capture_output=True).returncode == 0:
        sys.exit("CapCut is running; quit it first.")

    video = Path(a.video).resolve()
    src, dst = ROOT / a.template, ROOT / a.name
    if dst.exists():
        sys.exit(f"{dst} already exists")
    dur, w, h = probe(video)
    keep = dur - int(a.cut_end * US)

    shutil.copytree(src, dst)
    old_dir, new_dir = str(src), str(dst)

    # --- draft_info.json: swap main material, retime segments ---
    info_p = dst / "draft_info.json"
    d = json.loads(info_p.read_text())
    main_seg = d["tracks"][0]["segments"][0]
    mat = next(v for v in d["materials"]["videos"] if v["id"] == main_seg["material_id"])
    old_name = mat["material_name"]
    mat.update(path=str(video), material_name=video.name, duration=dur, width=w, height=h,
               local_material_id=str(uuid.uuid4()))
    main_seg["source_timerange"] = {"start": 0, "duration": keep}
    main_seg["target_timerange"] = {"start": 0, "duration": keep}
    t = keep
    for seg in d["tracks"][0]["segments"][1:]:
        seg["target_timerange"]["start"] = t
        t += seg["target_timerange"]["duration"]
    for track in d["tracks"][1:]:          # logo overlay spans the main video only
        for seg in track["segments"]:
            seg["target_timerange"] = {"start": 0, "duration": keep}
            seg["source_timerange"] = {"start": 0, "duration": keep}
    d["duration"] = t
    d["id"] = str(uuid.uuid4()).upper()
    text = json.dumps(d, ensure_ascii=False, separators=(",", ":"))
    for f in ("draft_info.json", "draft_info.json.bak", "template-2.tmp"):
        (dst / f).write_text(text)

    # --- draft_meta_info.json ---
    meta_p = dst / "draft_meta_info.json"
    m = json.loads(meta_p.read_text().replace(old_dir, new_dir))
    new_id = str(uuid.uuid4()).upper()
    now = int(time.time() * US)
    m.update(draft_name=a.name, draft_id=new_id, tm_duration=t,
             tm_draft_create=now, tm_draft_modified=now)
    meta_p.write_text(json.dumps(m, ensure_ascii=False))

    kv = dst / "key_value.json"
    if kv.exists():
        kv.write_text(kv.read_text().replace(old_name, video.name))
    (dst / "draft_cover.jpg").unlink(missing_ok=True)

    # --- register in CapCut's project list ---
    root_p = ROOT / "root_meta_info.json"
    shutil.copy(root_p, root_p.with_suffix(".json.bak"))
    r = json.loads(root_p.read_text())
    entry = next(e for e in r["all_draft_store"] if e["draft_fold_path"] == old_dir)
    entry = json.loads(json.dumps(entry).replace(old_dir, new_dir))
    entry.update(draft_name=a.name, draft_id=new_id, tm_duration=t,
                 tm_draft_create=now, tm_draft_modified=now, draft_cover="")
    r["all_draft_store"].insert(0, entry)
    r["draft_ids"] = r.get("draft_ids", 0) + 1
    root_p.write_text(json.dumps(r, ensure_ascii=False))

    print(f"Created CapCut draft '{a.name}': main {keep/US:.2f}s + outro, total {t/US:.2f}s")


if __name__ == "__main__":
    main()
