import type { ExtensionAPI, ExtensionContext } from "@earendil-works/pi-coding-agent";

const REMINDER_TYPE = "midnight-reminder";

interface ReminderEntry {
	date: string; // YYYY-MM-DD local date
}

function getLocalDateString(d: Date): string {
	return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
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

function isInMidnightWindow(): boolean {
	const hour = new Date().getHours();
	return hour >= 0 && hour < 6;
}

export default function (pi: ExtensionAPI) {
	let intervalId: ReturnType<typeof setInterval> | null = null;

	pi.on("session_start", async (_event, ctx) => {
		// Defensive: clear any leaked interval before starting a new one
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}

		const check = async () => {
			if (!isInMidnightWindow()) return;

			const today = getLocalDateString(new Date());
			const lastDate = getLastReminderDate(ctx);

			if (lastDate === today) return;

			ctx.ui.notify("🌙 Midnight reminder", "info");
			pi.appendEntry<ReminderEntry>(REMINDER_TYPE, { date: today });
		};

		// Check immediately in case Pi started inside the window
		await check();

		intervalId = setInterval(() => {
			void check();
		}, 30000); // every 30 seconds
	});

	pi.on("session_shutdown", () => {
		if (intervalId) {
			clearInterval(intervalId);
			intervalId = null;
		}
	});
}
