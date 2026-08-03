import { apiFetch } from "@/apiClient/client";
import { SharedSession } from "@/app/(app)/spin/shared/types";

export function getSpinSession(): Promise<SharedSession> {
    return apiFetch("/api/v1/spin-sessions/active");
}
