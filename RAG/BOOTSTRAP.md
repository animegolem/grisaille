# Grisaille workflow adoption — 2026-09-08

The owner designated this canonical seat Review Lead and task
`01a08093-8623-7222-8a98-7bf72785abd4` Code Lead. SPEC.md records the accepted
product direction; the first assignment authorizes round-1 review only.

The repository moved intact from `/Users/golem/git/mpd-ui-prototype` to
`/Users/golem/git/grisaille`. Prototype Git history remains on `codex/prototype`;
`main` is the integration branch. Executable/bundle/state identity is still
MusicPrototype until AI-IMP-013 explicitly migrates it. No product source was
changed by this adoption.

## Source and local amendments

Tooling source: `/Users/golem/git/_tooling_/Agent Skills/repo-bootstrap` at
`8adc76cbdb758f41b08acf4955060966adc2d9fa`. `bootstrap-source.json` records the
43 source file hashes. The installed skill was refreshed from that source after
backing up its previous content under
`/Users/golem/.codex/skill-backups/repo-bootstrap-20260908-053902`.

Templates/references are reference material, not active runtime configuration.
Project amendments: tracked canonical protocol; `.relay` carrier wrapper;
executable shell script modes; role entry points; independent second-review
charter; epic publication limits; bounded waiting; exact-event ACK ritual; and
the isolated four-case carrier drill. Templates preserve their source content.
The ACK ritual avoids a mutable-path read/ack race without modifying the carrier.

## Validation evidence

- Skill source/installed parity: 43 content files; skill validator passed using
  temporary `uv --with pyyaml` because the available Python lacked PyYAML.
- Product: typecheck passed; 63 tests, 257 assertions, 11 files; standalone Bun
  build passed (181 modules); macOS bundle packaging passed at the new root.
- Ticket validator: 23 epic/implementation files passed before adding the log.
  Run the full gate again on the reviewed commit. Index is generated.
- Existing runtime fixtures: 20 passed. Index generator smoke fixture exited 0;
  it printed a non-repository diagnostic in its temporary fixture.
- Carrier adoption: four isolated tests passed (overwrite/exact ACK, atomic
  publication, simulated unread age, index loss/rebuild/orphan recovery).
- Manual channel scan and carrier sync succeeded with zero initial events.

These checks establish local tooling and build evidence. Native interaction,
listening, long-session recovery and future feature acceptance remain in
HUMAN-TESTING.md. New features have not been implemented by the bootstrap.

## Runtime and delivery limits

No LaunchAgent, global lifecycle hook, conversation-memory hook, activity
projection or unattended poller was installed. The source runtime instructions
require a separate live installation/target drill; AI-IMP-015 carries it.
Until that is activated, the leads use explicit task delivery and bounded
channel scans. Delivery never creates a recipient ACK or implementation start.
The owner is preparing the remote; AI-IMP-014 records the missing URL. Local
round-1 review can proceed before publication is configured.

The final reviewed base, created clone, assignment delivery and actual start
receipt belong in the ready letter and WORK-LEDGER.md. Do not infer them from
this adoption document or from a generated ticket status.
