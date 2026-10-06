# Bedtime Test

A [Pi coding agent](https://github.com/earendil-works/pi-coding-agent) extension that displays a gentle notification during the midnight window (00:00–05:59), reminding you once per local day.

## What it does

- Monitors the time while Pi sessions are active
- Triggers a single `🌙 Midnight reminder` notification whenever the local time is between midnight and 6:00 AM
- Prevents duplicate reminders on the same day by tracking history in the session branch

## Install

Clone the repository:
```bash
git clone <repo-url>
cd midnight_reminder
```

## Usage

### Quick run
Load the extension directly from the project directory:
```bash
pi --extension ./bedtime-test.ts
```
This starts Pi with the midnight reminder active for the current session.

### Install permanently
Add the extension to Pi so it loads automatically on every session:
```bash
pi install ./bedtime-test.ts
```

To verify it's installed:
```bash
pi list
```

To remove it later:
```bash
pi remove bedtime-test
```

### When the reminder appears
- The reminder is shown when your local time is between 00:00 and 05:59.
- Only one reminder is shown per day, preventing repeated notifications on the same date.
- The reminder works automatically while your Pi session is running.

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
| `bedtime-test.ts` | Pi extension entry point — starts an interval check on `session_start`, cleans up on `session_shutdown` |
| `src/policy.ts` | Pure logic: `isInMidnightWindow`, `shouldRemind`, `getLocalDateString` |
| `src/policy.test.ts` | Unit tests for the policy functions |

### Reminder flow

1. When a Pi session starts, the extension checks the time immediately and continues checking every 30 seconds.
2. If the time is between 00:00–05:59 and no reminder has been shown for that day, it displays the reminder and records the date to prevent another reminder on the same day.

## License

MIT
