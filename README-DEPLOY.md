# AI Nexus India — deployment guide

This is a refreshed version of your site at `ainexusindia.github.io/ainexusindia`.
It's plain HTML/CSS/JS — no build step, no server, no paid services — so it drops
straight into GitHub Pages the same way your current site works.

## What's new

- **Redesigned front end** — same content and sections you had (AI Learning,
  Career Hub, Education, Cyber Security, Science, YouTube, Contact), restyled
  with a distinct look (deep indigo + marigold + jade), responsive down to
  mobile, with working keyboard focus states.
- **"AI Pulse" section** — a live daily AI news feed, split into "For everyone"
  and "For tech readers." It reads from `assets/data/news.json`.
- **Automatic daily updates** — a GitHub Actions workflow
  (`.github/workflows/daily-ai-news.yml`) runs every morning, pulls fresh AI
  headlines from free public RSS feeds (no API key, no cost), and commits the
  update to `news.json` automatically. You don't have to do anything for this
  to keep running.
- **"Nexi" — a built-in assistant** — a chat bubble (bottom-right) that answers
  common questions about the site (what is generative AI, where's the cyber
  security content, is this free, how to contact you, etc.) using a small
  built-in knowledge base. Important: **this is a rule-based guide-bot, not a
  live AI model** — it can't hold an open-ended conversation. I built it this
  way on purpose so it works instantly, for free, with no API key and no
  ongoing cost. See "Upgrading Nexi to a real AI model" below if you want to
  change that later.

## 1. Deploy it (5–10 minutes)

Since your GitHub Pages URL is `ainexusindia.github.io/ainexusindia`, your
Pages site is served from the `ainexusindia/ainexusindia` repository.

1. Go to your repo: `github.com/ainexusindia/ainexusindia`
2. Delete or rename your current `index.html` if you want to keep a backup
   (e.g. rename it `index-old.html`).
3. Upload every file in this bundle **preserving the folder structure**:
   - `index.html` → repo root
   - `assets/css/style.css`
   - `assets/js/main.js`
   - `assets/data/news.json`
   - `.github/workflows/daily-ai-news.yml`
   - `scripts/fetch_news.py`

   Easiest way: on GitHub, use **Add file → Upload files**, then drag the
   whole unzipped folder in — GitHub preserves subfolders when you drag a
   folder in through the web uploader. (If it doesn't pick up the `.github`
   folder because it's hidden on your computer, create the file manually:
   **Add file → Create new file**, type `.github/workflows/daily-ai-news.yml`
   as the filename — GitHub creates the folders for you — and paste the
   content in.)
4. Commit directly to your default branch (the one Pages serves from).
5. Wait 1–2 minutes, then visit `ainexusindia.github.io/ainexusindia` and
   hard-refresh (Ctrl/Cmd+Shift+R) to bypass any cached version.

That's it — hosting stays exactly as free as it is today, nothing new to pay
for.

## 2. Turn on the daily automation

GitHub Actions is enabled by default on most repos, but double-check:

1. Go to the **Actions** tab of your repo.
2. You should see a workflow called **"Daily AI Pulse update."** If GitHub
   shows a banner asking you to enable Actions, click to enable it.
3. It's scheduled for 03:30 UTC (9:00 AM IST) daily. You can also trigger it
   manually any time: **Actions → Daily AI Pulse update → Run workflow.**
4. After it runs, check `assets/data/news.json` in your repo — you should see
   a new commit from `ai-nexus-news-bot` with today's date.

No API key, no secret, no billing setup needed for this — it uses GitHub's
own free Actions minutes and public RSS feeds.

**One thing worth knowing:** I can't run this for you from inside a chat —
I don't have a process that stays running day to day. This GitHub Action is
what actually does the "update every day" part; it runs on GitHub's servers
whether or not you or I are around. If you ever want the news picks
tuned differently (more/fewer stories, different sources, different
categorisation), come back and ask me to adjust `scripts/fetch_news.py` and
I'll edit it for you.

## 3. Optional upgrades

### Upgrading Nexi to a real AI model
Right now Nexi matches keywords against a fixed list in `assets/js/main.js`
(see the `NEXI_KB` array) — no API key, totally free, but it can't answer
anything outside that list. To make it a genuine conversational AI, you'd
need two things I can't provide inside a static GitHub Pages site:
1. An API key from an AI provider (e.g. Anthropic) — this has a small
   pay-as-you-go cost, though light chat traffic is typically cheap.
2. A small serverless backend (e.g. a free Cloudflare Worker) to hold that
   key securely — API keys can't safely live in front-end JavaScript, since
   anyone could view-source and steal them.

If you want to go this route later, come back and I can write the Worker
code and the updated widget for you — just know it's a bit more setup than
the current version, and isn't purely "free forever" the way RSS-based news
is.

### AI-written plain-language news summaries
Right now each news card's summary comes straight from the original RSS
feed. If you'd like a genuinely simplified "explain this to my grandmother"
version alongside the technical one, that also needs an AI API key (used
inside the GitHub Action, kept as a repository secret — never exposed to
visitors). Ask me and I'll extend `fetch_news.py` to do this once you have a
key.

### Adding more news sources
Edit the `FEEDS` list near the top of `scripts/fetch_news.py` — any standard
RSS feed URL works.

## File map

```
index.html                          → the page itself
assets/css/style.css                → all styling
assets/js/main.js                   → nav, news loader, Nexi assistant
assets/data/news.json               → today's AI Pulse content (auto-updated)
scripts/fetch_news.py               → pulls fresh news from RSS feeds
.github/workflows/daily-ai-news.yml → runs fetch_news.py every day, commits the result
```
