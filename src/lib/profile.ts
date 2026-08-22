import type { UserProfile } from "@/core/types/models/profile";

/**
 * Two-letter monogram for a profile's avatar fallback, taken from the first
 * and last name. Returns an empty string when there's no profile yet, leaving
 * it to the caller to decide what stands in for it while loading.
 */
export function getProfileInitials(
    profile: Pick<UserProfile, "firstName" | "lastName"> | null | undefined
): string {
    if (!profile) return "";

    const first = profile.firstName?.[0] ?? "";
    const last = profile.lastName?.[0] ?? "";

    return `${first}${last}`.toUpperCase();
}

/**
 * Monogram for a bare display name, for the places that never see a profile
 * record — guests pick a single free-form name when they join. Uses the first
 * and last word, or just the initial when the name is one word.
 */
export function getInitialsFromName(name: string | null | undefined): string {
    const words = name?.trim().split(/\s+/).filter(Boolean) ?? [];

    if (words.length === 0) return "";
    if (words.length === 1) return words[0].charAt(0).toUpperCase();

    return `${words[0].charAt(0)}${words[words.length - 1].charAt(0)}`.toUpperCase();
}
