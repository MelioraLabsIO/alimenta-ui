import debug from "debug";
import { getSession } from "@/lib/supabase/session";

const BASE_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:8080"
        : process.env.NEXT_PUBLIC_API_URL;

interface ApiFetchConfig {
    useSession?: boolean;
}

export async function apiFetch<T = unknown>(
    path: string,
    options?: RequestInit
): Promise<T>;
export async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit | undefined,
    config: ApiFetchConfig
): Promise<T>;
export async function apiFetch<T = unknown>(
    path: string,
    options?: RequestInit,
    config: ApiFetchConfig = {}
): Promise<T> {
    const { useSession = true } = config;
    const session = useSession ? await getSession() : null;

    const routeDebug = debug(`apiFetch`);
    routeDebug(process.env.NEXT_PUBLIC_API_URL);

    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
            ...(session
                ? { Authorization: `Bearer ${session.access_token}` }
                : {}),
        },
        // cache: "no-store",
    });

    routeDebug(`Request to ${path} returned status ${response.status}`);

    if (!response.ok) {
        throw new Error(`API error ${response.status}`);
    }

    // Some endpoints (e.g. DELETE) return a status with no body — 204, or
    // 200 with an empty payload. `response.json()` throws on an empty body,
    // so only parse when there's actually something to parse.
    const text = await response.text();
    return (text ? JSON.parse(text) : undefined) as T;
}
