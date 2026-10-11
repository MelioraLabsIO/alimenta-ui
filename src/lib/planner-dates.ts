/**
 * Local-calendar date helpers for the planner. Days are keyed as
 * `YYYY-MM-DD` in the user's timezone and weeks start on Monday.
 */

export const DOW_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const DOW_LONG = [
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
    "Sunday",
];
const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
];

export function toDayKey(d: Date): string {
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${d.getFullYear()}-${m}-${day}`;
}

export function fromDayKey(key: string): Date {
    return new Date(`${key}T00:00:00`);
}

export function addDays(d: Date, n: number): Date {
    const x = new Date(d);
    x.setDate(x.getDate() + n);
    return x;
}

export function startOfDay(d: Date): Date {
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function startOfWeek(d: Date): Date {
    const x = startOfDay(d);
    x.setDate(x.getDate() - dowIndex(x));
    return x;
}

/** 0 = Monday … 6 = Sunday. */
export function dowIndex(d: Date): number {
    return (d.getDay() + 6) % 7;
}

/** The 7 days of the week containing `d`. */
export function weekDays(d: Date): Date[] {
    const start = startOfWeek(d);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

/**
 * Whole weeks covering the month of `d` (5 or 6 rows), Monday-first, padded
 * with the neighbouring months' days.
 */
export function monthGridDays(d: Date): Date[] {
    const start = startOfWeek(new Date(d.getFullYear(), d.getMonth(), 1));
    const days = Array.from({ length: 42 }, (_, i) => addDays(start, i));
    const lastRowOutside = days
        .slice(35)
        .every((x) => x.getMonth() !== d.getMonth());
    return lastRowOutside ? days.slice(0, 35) : days;
}

export function formatRange(d: Date, view: "week" | "month"): string {
    if (view === "month") return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
    const [start, end] = [startOfWeek(d), addDays(startOfWeek(d), 6)];
    const short = (x: Date) => MONTHS[x.getMonth()].slice(0, 3);
    return start.getMonth() === end.getMonth()
        ? `${short(start)} ${start.getDate()} – ${end.getDate()}`
        : `${short(start)} ${start.getDate()} – ${short(end)} ${end.getDate()}`;
}

/** "Monday, Oct 12" */
export function formatDayTitle(d: Date): string {
    return `${DOW_LONG[dowIndex(d)]}, ${MONTHS[d.getMonth()].slice(0, 3)} ${d.getDate()}`;
}

/** "Today", "Tomorrow", "In 3 days", "2 days ago"… */
export function formatRelativeDay(d: Date, today: Date): string {
    const rel = Math.round((startOfDay(d).getTime() - today.getTime()) / 864e5);
    if (rel === 0) return "Today";
    if (rel === 1) return "Tomorrow";
    if (rel === -1) return "Yesterday";
    return rel > 0 ? `In ${rel} days` : `${-rel} days ago`;
}
