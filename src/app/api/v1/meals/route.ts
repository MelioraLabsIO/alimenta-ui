import { NextResponse } from "next/server";
import { getMeals } from "@/repositories/meals/get-meals";

export const runtime = "nodejs";

export async function GET() {
    const meals = await getMeals();
    return NextResponse.json(meals, { status: 200 });
}
