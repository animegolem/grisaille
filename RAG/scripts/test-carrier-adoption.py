#!/usr/bin/env python3
"""Isolated Grisaille carrier adoption drill; never touches a live mailbox."""
import contextlib
import importlib.util
import io
from datetime import datetime, timedelta, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
from types import SimpleNamespace
import unittest

spec = importlib.util.spec_from_file_location('carrier', Path(__file__).with_name('carrier.py'))
carrier = importlib.util.module_from_spec(spec)
spec.loader.exec_module(carrier)


class Adoption(unittest.TestCase):
    def setUp(self):
        self.tmp = TemporaryDirectory()
        self.addCleanup(self.tmp.cleanup)
        self.repo = Path(self.tmp.name)
        carrier.DB_DIR = self.repo / 'index'
        carrier.DB = carrier.DB_DIR / 'index.db'
        carrier.CHANNEL = '.relay'
        self.out = self.repo / '.relay' / 'outbox'
        self.out.mkdir(parents=True)
        self.args = SimpleNamespace(repo=str(self.repo))

    def call(self, function, **kwargs):
        with contextlib.redirect_stdout(io.StringIO()):
            function(SimpleNamespace(repo=str(self.repo), **kwargs))

    def publish(self, body, name='review'):
        target = self.out / (name + '.md')
        tmp = target.with_suffix('.tmp')
        tmp.write_text(f'---\nsubmission: {name}\nround: 1\n---\n{body}\n')
        tmp.replace(target)
        self.call(carrier.cmd_sync)
        return target

    def status(self):
        return carrier.delivery_status(self.repo)

    def test_t1_overwrite_acks_only_read_immutable_event(self):
        self.publish('first')
        old = self.status()['events'][0]
        artifact = next(carrier.carrier_dir(self.repo).glob('*' + old['event_id'] + '.md'))
        self.assertIn('first', artifact.read_text())
        self.assertEqual(carrier.digest_of(artifact), old['digest'])
        self.publish('second')
        self.call(carrier.cmd_ack, event_id=old['event_id'])
        states = {e['event_id']: e['state'] for e in self.status()['events']}
        self.assertEqual(states[old['event_id']], 'acked')
        self.assertEqual(list(states.values()).count('pending'), 1)
        self.assertIn('first', artifact.read_text())

    def test_t2_atomic_publication_ignores_torn_temp(self):
        tmp = self.out / 'review.tmp'
        tmp.write_text('---\nsubmission: review\nround: 1\n---\npartial')
        self.call(carrier.cmd_sync)
        self.assertEqual(self.status()['event_count'], 0)
        tmp.write_text(tmp.read_text() + ' complete\n')
        tmp.replace(self.out / 'review.md')
        self.call(carrier.cmd_sync)
        self.call(carrier.cmd_sync)
        self.assertEqual(self.status()['event_count'], 1)
        artifact = next(carrier.carrier_dir(self.repo).glob('*.md'))
        self.assertIn('partial complete', artifact.read_text())

    def test_t3_unread_age_survives_later_scan(self):
        self.publish('unread')
        before = self.status()
        future = datetime.now(timezone.utc) + timedelta(minutes=31)
        class Later(datetime):
            @classmethod
            def now(cls, tz=None):
                return future if tz else future.replace(tzinfo=None)
        original = carrier.datetime
        try:
            carrier.datetime = Later
            self.call(carrier.cmd_sync)
            after = self.status()
            self.assertEqual(after['oldest_pending_ts'], before['oldest_pending_ts'])
            age = future - carrier.parse_ts(after['oldest_pending_ts'])
            self.assertGreaterEqual(age.total_seconds(), 30 * 60)
            self.assertEqual(after['pending_count'], 1)
        finally:
            carrier.datetime = original

    def test_t4_index_loss_rebuild_keeps_receipts_and_orphan(self):
        self.publish('processed', 'old')
        old = self.status()['events'][0]
        self.call(carrier.cmd_ack, event_id=old['event_id'])
        self.publish('still unread', 'pending')
        before = {e['event_id']: (e['state'], e['created_ts']) for e in self.status()['events']}
        carrier.DB.unlink()  # Only the disposable fixture's derived index.
        self.publish('arrived during loss', 'orphan')
        self.call(carrier.cmd_rebuild)
        after = self.status()
        self.assertEqual(after['event_count'], 3)
        self.assertEqual(after['pending_count'], 2)
        states = {e['event_id']: (e['state'], e['created_ts']) for e in after['events']}
        for event, facts in before.items():
            self.assertEqual(states[event], facts)
        self.assertEqual(len({e['event_id'] for e in after['events']}), 3)


if __name__ == '__main__':
    unittest.main(verbosity=2)
