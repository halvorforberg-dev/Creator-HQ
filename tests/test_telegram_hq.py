"""Offline smoke tests; never require Telegram or OpenAI credentials."""
import importlib.util
import os
import unittest
from pathlib import Path
from unittest.mock import patch

SCRIPT = Path(__file__).resolve().parents[1] / "scripts" / "telegram_hq_bot.py"
SPEC = importlib.util.spec_from_file_location("creator_hq_bot", SCRIPT)
bot = importlib.util.module_from_spec(SPEC)
SPEC.loader.exec_module(bot)

class TestCreatorHQBot(unittest.TestCase):
    def setUp(self):
        self.data = bot.sources()
    def test_snapshot_has_editorial_brief(self):
        self.assertIn("focus_channels",self.data["brief"])
        self.assertEqual(len(self.data["brief"]["focus_channels"]),3)
    def test_status_labels_saved_sources(self):
        text = bot.status(self.data)
        self.assertIn("Kildedatoer",text)
        self.assertIn("ikke sanntid",text)
        self.assertIn("Bizarre Past",text)
    def test_plan_does_not_pretend_booked(self):
        text=bot.reply("/plan",self.data)
        self.assertIn("ikke bookinger",text)
        self.assertIn("9.11.2026",text)
    def test_existing_commands_without_api_key(self):
        with patch.object(bot,"OPENAI_KEY",""):
            for cmd in ("/status","/alerts","/today","/week","/channels","/help","/ideas","/improve"):
                self.assertTrue(bot.reply(cmd,self.data).strip(),cmd)
            self.assertIn("OPENAI_API_KEY",bot.reply("Hva blir publisert?",self.data))
    def test_live_metrics_snapshot_representation(self):
        text = bot.metric_summary(self.data, include_top=True)
        self.assertIn("Bizarre Past", text)
        self.assertIn("What If in 40 Seconds", text)
        self.assertIn("Little Wild Adventures", text)
        self.assertIn("ikke sanntid", text)
        self.assertIn("Analytics ikke tilkoblet", text)

    def test_weekly_contains_verified_metrics(self):
        text=bot.weekly(self.data)
        self.assertIn("FAKTISKE MÅLINGER", text)
        self.assertIn("Retention og CTR", text)

    def test_alerts_does_not_pretend_live(self):
        result=bot.reply("/alerts",self.data)
        self.assertIn("bekreftede",result.lower())
        self.assertTrue("ikke en sanntidssjekk" in result or "ikke live" in result)

    def test_unknown_command(self):
        self.assertIn("Ukjent",bot.reply("/nonsense",self.data))

if __name__ == "__main__":
    unittest.main()
