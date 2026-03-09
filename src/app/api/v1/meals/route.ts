import { NextResponse } from "next/server";
import { getAllMealsService } from "@/services/meals/get-meal-entries";

export const runtime = "nodejs";

export async function GET() {
    const meals = await getAllMealsService();
    return NextResponse.json(meals, { status: 200 });
}
