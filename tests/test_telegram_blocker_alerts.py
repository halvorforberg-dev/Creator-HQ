"""Tests for conditional, deduplicated Creator HQ Telegram push alerts."""
import importlib.util
import sys
import unittest
from datetime import datetime, timezone, timedelta
from pathlib import Path
from unittest.mock import patch

SCRIPTS = Path(__file__).resolve().parents[1] / "scripts"
sys.path.insert(0, str(SCRIPTS))
spec = importlib.util.spec_from_file_location("telegram_blocker_alerts", SCRIPTS / "telegram_blocker_alerts.py")
notify = importlib.util.module_from_spec(spec)
spec.loader.exec_module(notify)


class BlockerAlerts(unittest.TestCase):
    def setUp(self):
        self.now = datetime(2026, 11, 4, 22, 0, tzinfo=timezone.utc)
        self.item = {
            "id": "aituber.2026-11-04.failed",
            "channel": "Little Wild Adventures",
            "severity": "blocker",
            "state": "open",
            "confirmed": True,
            "confirmedAt": "2026-11-04T21:00:00+00:00",
            "source": "AI Tuber status check",
            "summary": "Export failed",
            "action": "Review failed clip; do not publish",
            "notificationRevision": 1,
        }

    def test_first_confirmed_blocker_sends(self):
        self.assertTrue(notify.should_send(self.item, {}, now=self.now))

    def test_same_issue_not_repeated_after_rewrite(self):
        self.assertFalse(notify.should_send(self.item, {self.item["id"]: dict(self.item)}, now=self.now))

    def test_same_issue_new_escalation_sends(self):
        old = dict(self.item)
        newer = {**self.item, "notificationRevision": 2}
        self.assertTrue(notify.should_send(newer, {self.item["id"]: old}, now=self.now))

    def test_missing_confirmation_and_warning_are_not_sent(self):
        for updates in ({"confirmed": False}, {"severity": "warning"}, {"state": "resolved"},
                        {"confirmedAt": "2026-10-01T21:00:00Z"}, {"confirmedAt": "unknown"}):
            self.assertFalse(notify.should_send({**self.item, **updates}, {}, now=self.now), updates)

    def test_requires_action(self):
        self.assertFalse(notify.should_send({**self.item, "action": ""}, {}, now=self.now))

    def test_status_reopened_sends(self):
        old = {**self.item, "state": "resolved"}
        self.assertTrue(notify.should_send(self.item, {self.item["id"]: old}, now=self.now))

    def test_message_has_action_not_fake_live_claim(self):
        text = notify.message(self.item)
        self.assertIn("PRODUKSJONSBLOKKERING", text)
        self.assertIn(self.item["action"], text)
        self.assertNotIn("LIVE", text)

    def test_invalid_schema_rejected(self):
        with self.assertRaises(ValueError):
            notify.parse_alerts('{"alert":"not a list"}')

if __name__ == "__main__":
    unittest.main()
