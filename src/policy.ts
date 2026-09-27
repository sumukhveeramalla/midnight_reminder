export function getLocalDateString(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export function isInMidnightWindow(d: Date): boolean {
  const hour = d.getHours();
  return hour >= 0 && hour < 6;
}

export function shouldRemind(currentDate: Date, lastReminderDate: string | undefined): boolean {
  if (!isInMidnightWindow(currentDate)) {
    return false;
  }
  const today = getLocalDateString(currentDate);
  return lastReminderDate !== today;
}
