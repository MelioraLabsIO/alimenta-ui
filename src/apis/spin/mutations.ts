import { apiFetch } from "@/apiClient/client";
import { CreateSessionResponse } from "@/app/(app)/spin/shared/types";

export function createSpinSession(): Promise<CreateSessionResponse> {
    return apiFetch("/api/v1/spin-sessions", { method: "POST" });
}
