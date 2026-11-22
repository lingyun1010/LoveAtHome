# Weekly Friday video runbook

Produces one Chinese 9:16 educational video plus copy, and publishes it on the
GitHub Pages daily page (`daily/`, https://lingyun1010.github.io/LoveAtHome/daily/).
Never put anything under `client/public/` (that ships to loveathome.com.au).

Local paths (Mac):
- Repo: `/Users/lingyunzhao/Documents/ChatGPT/Love At Home 2`
- Assets + weekly outputs: `~/Desktop/loveathome/` (`weekly/` subfolder)
- CapCut template project: `1122` in `~/Movies/CapCut/User Data/Projects/com.lveditor.draft/`
  (NotebookLM video, trimmed ~3.13 s to drop the "Gemini Notebook" end card, then
  `结尾竖版中文带语音.mov`; `brand.png` logo bottom-right)

`DATE` = today as `YYYY-MM-DD`, `MMDD` = today as `MMDD`.

## 1. Topic and source document
- Read `daily/posts.js` and do not repeat a topic already published.
- Pick one practical question for Sydney seniors / family carers (Support at Home,
  aged care fees and contributions, eligibility, home modifications, assistive tech,
  CHSP, NDIS pathways, My Aged Care assessments).
- Research only current official Australian sources (myagedcare.gov.au, health.gov.au,
  servicesaustralia.gov.au, ndis.gov.au). Write a Chinese source document with:
  the question, plain explanation, practical steps, exceptions/caveats, official URLs
  with access date. No invented rates, percentages, stories or promises.
  Save as `~/Desktop/loveathome/weekly/DATE_source.md`.

## 2. NotebookLM (Claude in Chrome, the user is signed in)
- Open https://notebooklm.google.com, Create notebook, name it `LAH — <topic> — ZH`.
- Add the source document as pasted text.
- Studio → **Video Overview** (opens "Customize Video Overview"):
  Format **Short**, language **中文（简体）**, Custom topic:
  `只回答一个问题：<question>。用中文解说和中文画面文字，语气平和、清楚、尊重，不做推销。只用资料中的事实和注意事项，不夸大资格或资助承诺，不编造案例，用简单的话解释澳洲养老术语。结尾简短建议联系 Love At Home 了解服务。`
  → **Generate now**. Asking in the chat box does NOT reliably generate a video.
- Wait (about 8–10 min) until the new item appears in Studio, then its ⋮ → Download.
- Move the download to `~/Desktop/loveathome/weekly/DATE_notebooklm.mp4`.
  Check it is 720x1280 and 60–120 s with ffprobe.

## 3. CapCut project + render
- Check the end card still starts ~3 s before the end:
  `ffmpeg -sseof -5 -i <video> -vf "fps=2,scale=180:-1,tile=10x1" -frames:v 1 tail.png`
  and look at it. If it differs, pass `--cut-end <seconds>`.
- CapCut must be closed. Then:
  ```
  python3 tools/weekly-video/capcut_swap.py --video ~/Desktop/loveathome/weekly/DATE_notebooklm.mp4 --name MMDD
  python3 tools/weekly-video/render_from_draft.py --name MMDD \
      --out ~/Desktop/loveathome/weekly/DATE_final.mp4 --web daily/videos/DATE.mp4
  ```
  The CapCut project `MMDD` stays editable; `DATE_final.mp4` is full quality for
  social media, `daily/videos/DATE.mp4` is the small web copy (~2 MB).
- Grab a frame mid-video and at the outro to confirm logo + outro look right.

## 4. Copy + page
Add a new object at the top of `window.DAILY_POSTS` in `daily/posts.js`:
`date`, `title` (【1分钟视频】...), `video: "videos/DATE.mp4"`, and three sections:
`📌 发布标题`, `📝 正文内容` (one block, plain text, emoji OK, no markdown symbols,
facts only from the source document, end with a gentle Love At Home CTA),
`🏷️ 话题标签（Tags）` (always include #爱家护理 #LoveAtHome).

## 5. Publish
Branch from `origin/main`, commit `daily/` changes, open a PR, squash-merge it.
The "Deploy frontend preview to GitHub Pages" workflow deploys on push to main.
Verify `https://lingyun1010.github.io/LoveAtHome/daily/posts.js` contains the new
title and `.../daily/videos/DATE.mp4` returns 200.
