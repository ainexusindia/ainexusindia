#!/usr/bin/env python3
"""
AI Nexus India — daily AI news fetcher.

Pulls fresh AI-related headlines from a handful of free, public RSS feeds
(no API key required), lightly classifies each story as "General" (readable
by anyone) or "Tech" (more technical), and writes assets/data/news.json.

Run by .github/workflows/daily-ai-news.yml on a daily schedule.
"""

import json
import re
import sys
from datetime import datetime, timezone
from html import unescape
from pathlib import Path
from urllib.request import Request, urlopen

try:
    import feedparser
except ImportError:
    print("This script requires the 'feedparser' package: pip install feedparser")
    sys.exit(1)

# Free, public RSS feeds — no API key needed.
FEEDS = [
    ("MIT Technology Review", "https://www.technologyreview.com/feed/"),
    ("VentureBeat AI", "https://venturebeat.com/category/ai/feed/"),
    ("The Verge AI", "https://www.theverge.com/rss/ai-artificial-intelligence/index.xml"),
    ("TechCrunch AI", "https://techcrunch.com/category/artificial-intelligence/feed/"),
]

# Fallback if the feeds above are briefly unreachable: Google News RSS search.
FALLBACK_FEED = (
    "Google News",
    "https://news.google.com/rss/search?q=artificial%20intelligence%20when:1d&hl=en-IN&gl=IN&ceid=IN:en",
)

MAX_ITEMS = 10
OUTPUT_PATH = Path(__file__).resolve().parent.parent / "assets" / "data" / "news.json"

# Rough signal words for a "Tech" (more technical) vs "General" (everyday) tag.
TECH_WORDS = [
    "api", "benchmark", "parameter", "inference", "framework", "vulnerability",
    "llm", "gpu", "token", "fine-tun", "open-source", "open source", "sdk",
    "cve-", "exploit", "latency", "training run", "model weights", "quantiz",
    "context window", "agent framework", "kubernetes", "repo", "github",
]

TAG_RE = re.compile(r"<[^>]+>")


def clean_text(raw, limit=220):
    text = unescape(TAG_RE.sub("", raw or "")).strip()
    text = re.sub(r"\s+", " ", text)
    if len(text) > limit:
        text = text[:limit].rsplit(" ", 1)[0] + "\u2026"
    return text


def classify(title, summary):
    blob = (title + " " + summary).lower()
    return "Tech" if any(w in blob for w in TECH_WORDS) else "General"


def entry_date(entry):
    for key in ("published_parsed", "updated_parsed"):
        val = getattr(entry, key, None)
        if val:
            return datetime(*val[:6], tzinfo=timezone.utc)
    return datetime.now(timezone.utc)


def fetch_feed(name, url):
    items = []
    try:
        req = Request(url, headers={"User-Agent": "AINexusIndiaNewsBot/1.0"})
        with urlopen(req, timeout=20) as resp:
            raw = resp.read()
        parsed = feedparser.parse(raw)
        for entry in parsed.entries:
            title = clean_text(getattr(entry, "title", ""), limit=140)
            summary = clean_text(getattr(entry, "summary", "") or getattr(entry, "description", ""))
            link = getattr(entry, "link", "")
            if not title or not link:
                continue
            items.append({
                "title": title,
                "summary": summary or title,
                "url": link,
                "source": name,
                "date": entry_date(entry).strftime("%Y-%m-%d"),
                "category": classify(title, summary),
                "_sort": entry_date(entry),
            })
    except Exception as exc:  # noqa: BLE001 — keep the job alive on a single feed failure
        print(f"  ! could not fetch {name}: {exc}")
    return items


def dedupe(items):
    seen = set()
    out = []
    for item in items:
        key = re.sub(r"[^a-z0-9]", "", item["title"].lower())[:60]
        if key in seen:
            continue
        seen.add(key)
        out.append(item)
    return out


def main():
    all_items = []
    for name, url in FEEDS:
        print(f"Fetching {name}...")
        all_items.extend(fetch_feed(name, url))

    if not all_items:
        print("Primary feeds returned nothing, trying fallback...")
        all_items.extend(fetch_feed(*FALLBACK_FEED))

    all_items.sort(key=lambda i: i["_sort"], reverse=True)
    all_items = dedupe(all_items)[:MAX_ITEMS]
    for item in all_items:
        item.pop("_sort", None)

    if not all_items:
        print("No news items retrieved — leaving existing news.json untouched.")
        return

    payload = {
        "updated": datetime.now(timezone.utc).strftime("%Y-%m-%d"),
        "items": all_items,
    }

    OUTPUT_PATH.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH.write_text(json.dumps(payload, indent=2, ensure_ascii=False), encoding="utf-8")
    print(f"Wrote {len(all_items)} items to {OUTPUT_PATH}")


if __name__ == "__main__":
    main()
