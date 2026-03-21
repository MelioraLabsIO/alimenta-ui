import { NextResponse } from "next/server";
import {getAllMealsService} from "@/domain/meals/get-meal-entries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    const meals = await getAllMealsService();

    return NextResponse.json(meals, { status: 200 });
}
