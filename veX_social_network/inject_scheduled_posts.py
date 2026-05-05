#!/usr/bin/env python3
"""
veX Scheduled Post Injector

Reads pre-written posts from scheduled_posts/*.json, finds posts whose
timestamp is in the past, and injects them into posts.json if they
haven't been injected already.

Run locally:  python inject_scheduled_posts.py
GitHub Actions: triggered by cron (see .github/workflows/schedule_posts.yml)
"""

import json
import os
import glob
from datetime import datetime, timezone


def load_posts(posts_file):
    """Load the main posts.json file."""
    if not os.path.exists(posts_file):
        return []
    with open(posts_file, 'r', encoding='utf-8') as f:
        return json.load(f)


def save_posts(posts_file, posts):
    """Save posts back to posts.json."""
    with open(posts_file, 'w', encoding='utf-8') as f:
        json.dump(posts, f, indent=2, ensure_ascii=False)


def load_scheduled_posts(scheduled_dir):
    """Load all scheduled posts from JSON files in the directory."""
    all_scheduled = []
    pattern = os.path.join(scheduled_dir, '*.json')
    for filepath in sorted(glob.glob(pattern)):
        with open(filepath, 'r', encoding='utf-8') as f:
            posts = json.load(f)
            all_scheduled.extend(posts)
    return all_scheduled


def inject_due_posts(posts_file, scheduled_dir):
    """
    Main injection logic:
    1. Load existing posts and extract their IDs
    2. Load all scheduled posts
    3. Find posts that are due (timestamp in the past) and not already injected
    4. Insert them into posts.json in chronological order
    """
    existing_posts = load_posts(posts_file)
    existing_ids = {p.get('id') for p in existing_posts}

    scheduled_posts = load_scheduled_posts(scheduled_dir)

    now = datetime.now(timezone.utc)
    injected_count = 0

    for post in scheduled_posts:
        post_id = post.get('id')
        if not post_id:
            continue

        # Skip if already injected
        if post_id in existing_ids:
            continue

        # Parse timestamp and check if it's due
        ts_str = post.get('timestamp', '')
        try:
            # Handle both Z and +00:00 formats
            ts_str_clean = ts_str.replace('Z', '+00:00')
            post_time = datetime.fromisoformat(ts_str_clean)
        except (ValueError, TypeError):
            print(f"WARNING: Skipping post {post_id} — invalid timestamp: {ts_str}")
            continue

        if post_time <= now:
            existing_posts.append(post)
            existing_ids.add(post_id)
            injected_count += 1
            print(f"  INJECTED: [{post.get('handle', '?')}] {post.get('content', '')[:60]}...")

    if injected_count > 0:
        # Sort all posts by timestamp (newest first)
        def sort_key(p):
            ts = p.get('timestamp', '2000-01-01T00:00:00Z')
            # Keep pinned posts at top
            if p.get('pinned'):
                return '9999' + ts
            return ts

        existing_posts.sort(key=sort_key, reverse=True)
        save_posts(posts_file, existing_posts)
        print(f"\n[OK] Injected {injected_count} new post(s) into {posts_file}")
    else:
        print("No new posts to inject.")

    return injected_count


if __name__ == '__main__':
    # Paths relative to the script location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    posts_file = os.path.join(script_dir, 'posts.json')
    scheduled_dir = os.path.join(script_dir, 'scheduled_posts')

    if not os.path.exists(scheduled_dir):
        os.makedirs(scheduled_dir)
        print(f"Created {scheduled_dir} — add scheduled post JSON files here.")
    else:
        inject_due_posts(posts_file, scheduled_dir)
