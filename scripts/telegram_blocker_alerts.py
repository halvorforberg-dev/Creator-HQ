#!/usr/bin/env python3
"""Send Telegram push alerts for *new, verified* Creator HQ operational blockers.

Triggered by a GitHub Actions push that actually changes data/production-alerts.json.
The previous version from the push base commit is the deduplication boundary.
Read-only unless sending a Telegram message; no tokens stored in the repository.
"""
import json
import os
import re
import subprocess
import sys
from datetime import datetime, timedelta, timezone
from pathlib import Path

from telegram_hq_bot import CHAT, TOKEN, send

ROOT = Path(__file__).resolve().parents[1]
ALERT_FILE = "data/production-alerts.json"
ALLOWED_LEVELS = {"blocker", "critical"}
ALLOWED_STATES = {"open", "resolved"}


def parse_alerts(raw):
    result = json.loads(raw)
    if not isinstance(result, dict) or not isinstance(result.get("alerts"), list):
        raise ValueError("Alert file needs an alerts list")
    return result["alerts"]


def previous_alerts(base_sha):
    """Read the previous *committed* file, not a stale local notification cache."""
    if not re.fullmatch(r"[a-fA-F0-9]{40}", base_sha or ""):
        raise RuntimeError("Missing valid previous commit SHA; refusing to risk duplicate notifications")
    commit = subprocess.run(["git", "cat-file", "-e", f"{base_sha}^{{commit}}"],
                            cwd=ROOT, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    if commit.returncode:
        raise RuntimeError("Previous commit unavailable; refusing to risk duplicate notifications")
    old = subprocess.run(["git", "show", f"{base_sha}:{ALERT_FILE}"],
                         cwd=ROOT, capture_output=True, text=True, encoding="utf-8")
    if old.returncode:
        # Initial creation of alerts file is expected to have no previous version.
        files = subprocess.run(["git", "ls-tree", "-r", "--name-only", base_sha, "--", ALERT_FILE],
                               cwd=ROOT, capture_output=True, text=True, encoding="utf-8", check=True)
        if files.stdout.strip():
            raise RuntimeError("Previous alert file unreadable")
        return []
    return parse_alerts(old.stdout)


def should_send(item, old_by_id, now=None):
    now = now or datetime.now(timezone.utc)
    if not isinstance(item, dict):
        return False
    if item.get("state") != "open" or item.get("severity") not in ALLOWED_LEVELS:
        return False
    if item.get("confirmed") is not True:
        return False
    ident = str(item.get("id", ""))
    if not re.fullmatch(r"[A-Za-z0-9][A-Za-z0-9_.:-]{3,120}", ident):
        return False
    if not str(item.get("summary", "")).strip() or not str(item.get("action", "")).strip():
        return False
    try:
        stamp = datetime.fromisoformat(str(item.get("confirmedAt", "")).replace("Z", "+00:00"))
        if not stamp.tzinfo:
            return False
        delta = now - stamp.astimezone(timezone.utc)
        if delta < -timedelta(minutes=10) or delta > timedelta(days=3):
            return False
    except (ValueError, TypeError):
        return False
    prior = old_by_id.get(ident)
    if not prior:
        return True
    if prior.get("state") != "open":
        return True
    # A confirmed change in the same issue can be re-alerted only by explicit revision bump.
    return int(item.get("notificationRevision", 1)) > int(prior.get("notificationRevision", 1))


def message(item):
    # Entries may be sourced from provider text: display them, never execute their content.
    return (
        "🚨 CREATOR HQ – PRODUKSJONSBLOKKERING\n\n"
        "Kanal: " + str(item.get("channel", "Creator HQ"))[:95] + "\n"
        "Problem: " + str(item["summary"])[:360] + "\n"
        "Hva som må gjøres: " + str(item["action"])[:450] + "\n"
        "Bekreftet: " + str(item.get("confirmedAt", ""))[:35] + "\n"
        "Kilde: " + str(item.get("source", "Autentisert plattformkontroll"))[:160] + "\n\n"
        "Varsel ved bekreftet stopp, ikke ved gammel rapport eller plan."
    )


def main():
    if not os.getenv("GITHUB_ACTIONS"):
        raise RuntimeError("Only run through the authenticated GitHub Actions alert workflow")
    if not TOKEN or not CHAT:
        raise RuntimeError("Telegram bot token or private chat ID is not configured")
    current = parse_alerts((ROOT / ALERT_FILE).read_text(encoding="utf-8"))
    old = previous_alerts(os.getenv("ALERT_PREVIOUS_COMMIT", ""))
    old_by_id = {str(i.get("id")): i for i in old if isinstance(i, dict) and i.get("id")}
    pending = [a for a in current if should_send(a, old_by_id)]
    if len(pending) > 10:
        raise RuntimeError("Too many new alerts at once; manual review required")
    for item in pending:
        send(CHAT, message(item))
    print(f"Telegram confirmed blocker notifications sent: {len(pending)}")


if __name__ == "__main__":
    main()
