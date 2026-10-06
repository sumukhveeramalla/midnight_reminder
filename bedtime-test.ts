import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";
import { getLocalDateString, isInMidnightWindow, shouldRemind } from "./src/policy.js";

const REMINDER_TYPE = "bedtime-test";

interface ReminderEntry {
	date: string; // Stores the reminder date in local YYYY-MM-DD format
}

function getLastReminderDate(ctx: ExtensionContext): string | undefined {
	const branch = ctx.sessionManager.getBranch();
	for (let i = branch.length - 1; i >= 0; i--) {
		const entry = branch[i];
		if (entry.type === "custom" && entry.customType === REMINDER_TYPE) {
			return (entry.data as ReminderEntry | undefined)?.date;
		}
	}
	return undefined;
}

export default function (pi: ExtensionAPI) {
	let intervalId: ReturnType<typeof setInterval> | null = null;

	pi.on("session_start", async (_event, ctx) => {
		// Clear any existing timer before starting a new one
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		const check = async () => {
			const now = new Date();
			if (!isInMidnightWindow(now)) return;

			const today = getLocalDateString(now);
			const lastDate = getLastReminderDate(ctx);

			if (!shouldRemind(now, lastDate)) return;

			ctx.ui.notify("🌙 Bedtime reminder", "info");
			pi.appendEntry<ReminderEntry>(REMINDER_TYPE, { date: today });
		};

		// Check once when the session starts
		await check();

		intervalId = setInterval(() => {
			void check();
		}, 30000); // Check again every 30 seconds
	});

	pi.on("session_shutdown", () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	});

	pi.registerCommand("bedtime-test", {
		description: "Demonstrate midnight reminder behavior with simulated time",
		handler: async (_args, ctx) => {
			type Scenario = { time: string; desc: string };

			const scenarios: Scenario[] = [
				{ time: "2024-01-15T23:59:00", desc: "23:59 (outside midnight window)" },
				{ time: "2024-01-15T00:00:00", desc: "00:00 (midnight window — first reminder)" },
				{ time: "2024-01-15T02:30:00", desc: "02:30 same day (duplicate — should skip)" },
				{ time: "2024-01-16T00:00:00", desc: "00:00 next day (midnight window — new reminder)" },
			];

			const lines: string[] = [];
			let lastReminderDate: string | undefined = undefined;

			for (const s of scenarios) {
				const d = new Date(s.time);
				const window = isInMidnightWindow(d);
				const today = getLocalDateString(d);
				const remind = shouldRemind(d, lastReminderDate);

				if (remind) {
					lastReminderDate = today;
				}

				const action = remind ? "🔔 REMIND" : "⏭️  SKIP";
				lines.push(`${action} — ${s.desc}\n   hour=${d.getHours()}, today=${today}, last=${lastReminderDate ?? "none"}, inWindow=${window}`);
			}

			const result = "🌙 /bedtime-test Simulated Results:\n\n" + lines.join("\n\n");

			if (!ctx.isIdle()) {
				ctx.ui.notify("Agent is busy — results sent as follow-up", "info");
				pi.sendUserMessage(result, { deliverAs: "followUp" });
			} else {
				pi.sendUserMessage(result);
			}
		},
	});
}
