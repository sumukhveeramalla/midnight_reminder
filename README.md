# Midnight Reminder

A [Pi coding agent](https://github.com/earendil-works/pi-coding-agent) extension that displays a gentle notification during the midnight window (00:00–05:59), reminding you once per local day.

## What it does

- Monitors the time while Pi sessions are active
- Triggers a single `🌙 Midnight reminder` notification whenever the local time is between midnight and 6:00 AM
- Prevents duplicate reminders on the same day by tracking history in the session branch

## Install

1. Copy or symlink this extension into your Pi extensions directory:
   ```bash
   # macOS/Linux example
   ln -s "$(pwd)" ~/.config/pi/extensions/midnight-reminder
   ```
2. Restart Pi or reload extensions.

## Development

Install dependencies (only `tsx` is used for tests):

```bash
npm install
```

### Run tests

```bash
npm test
```

Tests cover:
- Midnight window detection (`00:00`–`05:59`)
- Reminder deduplication logic
- Date string formatting

## How it works

| File | Purpose |
|------|---------|
| `midnight-reminder.ts` | Pi extension entry point — starts an interval check on `session_start`, cleans up on `session_shutdown` |
| `src/policy.ts` | Pure logic: `isInMidnightWindow`, `shouldRemind`, `getLocalDateString` |
| `src/policy.test.ts` | Unit tests for the policy functions |

### Reminder flow

1. On session start, the extension checks immediately and then every 30 seconds
2. If the current hour is `0–5` and no reminder was recorded for today, it:
   - Shows a Pi UI notification
   - Appends a history entry so the reminder won't fire again until the next day

## License

MIT
