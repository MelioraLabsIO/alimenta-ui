

import { NextResponse } from "next/server";

export const runtime = "nodejs"; // safe default; remove if you want edge

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      service: "alimenta-ui",
      ts: new Date().toISOString(),
    },
    { status: 200 }
  );
}