const BASE_URL =
    process.env.NODE_ENV === "development"
        ? "http://localhost:3000"
        : process.env.NEXT_PUBLIC_API_URL;

export async function apiFetch(path: string, options?: RequestInit) {
    console.log("NODE_ENV:", process.env.NODE_ENV)
    console.log("BASE_URL:", BASE_URL)
    console.log("NEXT_PUBLIC_API_URL:", process.env.NEXT_PUBLIC_API_URL)
    const response = await fetch(`${BASE_URL}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            ...(options?.headers || {}),
        },
        cache: "no-store",
    });

    if (!response.ok) {
        throw new Error(`API error ${response.status}`);
    }

    return response.json();
}