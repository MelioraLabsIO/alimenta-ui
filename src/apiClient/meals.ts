import { apiFetch } from "./client";

export function getMeals() {
    return apiFetch("/api/v1/meals");
}