/**
 * Centralized, typed builders for internal navigation targets.
 *
 * Pure string logic only (no React/Next.js APIs) so this file can be
 * imported from client components as well as `middleware.ts`, which runs on
 * the Edge runtime.
 */

const AUTOJOIN_PARAM = "autojoin";

function withQuery(
    pathname: string,
    params: Record<string, string | undefined>
): string {
    const search = new URLSearchParams();

    for (const [key, value] of Object.entries(params)) {
        if (value !== undefined) search.set(key, value);
    }

    const query = search.toString();
    return query ? `${pathname}?${query}` : pathname;
}

export const routes = {
    home: () => "/",
    login: (params?: { next?: string }) =>
        withQuery("/login", { next: params?.next }),
    /** The public join/participant view for one session, keyed by its ID. */
    spinSession: (sessionId: string, params?: { autojoin?: boolean }) =>
        withQuery(`/spin/${encodeURIComponent(sessionId)}`, {
            [AUTOJOIN_PARAM]: params?.autojoin ? "1" : undefined,
        }),
    /**
     * The authenticated member/host view of the current user's active
     * session — resolved server-side from their auth, not from a URL
     * param. Where a signed-in visitor belongs once they're part of a
     * session, instead of the guest `spinSession` room.
     */
    spinShared: () => "/spin/shared",
};

/** Whether `searchParams` carries the "auto-join this session" marker set by `routes.spinSession(..., { autojoin: true })`. */
export function hasAutojoinParam(searchParams: URLSearchParams): boolean {
    return searchParams.get(AUTOJOIN_PARAM) === "1";
}

/**
 * Resolves a `next` redirect target (as produced by `routes.login`) to a
 * safe, same-origin relative path — blocking protocol-relative URLs
 * (`//evil.com`) and anything else that isn't a local path, which would
 * otherwise be an open redirect.
 */
export function sanitizeNextPath(next: string | null | undefined): string {
    if (next && next.startsWith("/") && !next.startsWith("//")) {
        return next;
    }
    return routes.home();
}
