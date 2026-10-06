/**
 * Kicker + title the app header shows for each top-level route. Pages don't
 * render their own `<h1>`; the shell does, so every screen opens the same way.
 */

export type PageHeading = { kicker: string; title: string };

const STATIC_HEADINGS: Record<string, PageHeading> = {
    log: { kicker: "Add it by hand or just describe it", title: "Log a meal" },
    spin: { kicker: "Let fate pick dinner", title: "Spin the wheel" },
    history: { kicker: "Everything you've logged, by day", title: "History" },
    insights: {
        kicker: "What your meals are telling you",
        title: "Insights",
    },
    plans: { kicker: "Plan ahead, look back", title: "Planner" },
    settings: { kicker: "Profile, preferences and AI", title: "Settings" },
};

function greeting(now: Date) {
    const hour = now.getHours();
    if (hour < 12) return "morning";
    if (hour < 18) return "afternoon";
    return "evening";
}

export function getPageHeading(
    pathname: string,
    options: { firstName?: string | null; now?: Date } = {}
): PageHeading {
    const segment = pathname.split("/").filter(Boolean)[0] ?? "";
    const known = STATIC_HEADINGS[segment];
    if (known) return known;

    const now = options.now ?? new Date();
    const name = options.firstName?.trim();

    return {
        kicker: now.toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            day: "numeric",
        }),
        title: name
            ? `Good ${greeting(now)}, ${name}`
            : `Good ${greeting(now)}`,
    };
}
