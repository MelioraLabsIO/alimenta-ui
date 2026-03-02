import { NextResponse } from "next/server";
import {analyzeMeal} from "@/core/analyze";

export async function POST(req: Request) {
    const baseUrl = process.env.ALIMENTA_AI_SERVICE_URL;   // https://xxxxx.up.railway.app || http://localhost:8000
    const apiKey = process.env.ALIMENTA_AI_SERVICE_KEY;    // the secret

    if (!baseUrl || !apiKey) {
        return NextResponse.json(
            { error: "Missing ALIMENTA_AI_SERVICE_URL or ALIMENTA_AI_SERVICE_KEY" },
            { status: 500 }
        );
    }

    const body = await req.json();

    const upstream = await fetch(`${baseUrl}/analyze`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            // Your FastAPI now accepts either header; pick one:
            "Authorization": `Bearer ${apiKey}`,
            // or: "X-API-Key": apiKey,
        },
        body: JSON.stringify(body),
        cache: "no-store",
    });

    const anotherResponse = await analyzeMeal(body)
    console.log("anotherResponse: ", anotherResponse)

    const text = await upstream.text();
    return new NextResponse(text, {
        status: upstream.status,
        headers: {
            "Content-Type": upstream.headers.get("content-type") ?? "application/json",
        },
    });
}