import type { SpinSession } from "./types";

/**
 * A shared spin session becomes permanently read-only the moment a winner is
 * picked. The backend sets `status` to `"complete"` and persists it, so the
 * lock survives a page reload. Once locked, no one may join, add / change /
 * clear a food choice, remove a participant, or spin again — only leaving the
 * session (or the host deleting it) stays allowed.
 *
 * `hasLiveWinner` closes the sub-second gap between the `spin.completed`
 * WebSocket event and the session refetch that carries the new status, so the
 * UI locks the instant the wheel result lands rather than a beat later.
 */
export function isSpinSessionComplete(
    session: Pick<SpinSession, "status"> | null | undefined,
    hasLiveWinner = false
): boolean {
    return session?.status === "complete" || hasLiveWinner;
}
