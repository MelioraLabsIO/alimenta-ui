import { NextRequest, NextResponse } from "next/server";
import { getAllMealsService } from "@/domain/meals/get-meal-entries";
import {createMealEntry} from "@/domain/meals/create-meal-entry";
import {deleteMealEntry} from "@/domain/meals/delete-meal-entry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
    const searchParams = request.nextUrl.searchParams;
    const range = searchParams.get("range");

    let from: Date | undefined;
    let to: Date | undefined;

    if (range === "this-week") {
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0 is Sunday, 1 is Monday, etc.
        const diff = now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust when day is Sunday
        
        from = new Date(now.setDate(diff));
        from.setHours(0, 0, 0, 0);

        to = new Date();
        to.setHours(23, 59, 59, 999);
    }

    const meals = await getAllMealsService(from, to);

    return NextResponse.json(meals, { status: 200 });
}


export async function POST(request: NextRequest) {
    const body = await request.json();
    console.log("body:", body)

    const mealSaved = await createMealEntry(body)
    return NextResponse.json(mealSaved, { status: 201 })
}

export async function DELETE(request: NextRequest) {
    const {searchParams} = new URL(request.url)
    const id = searchParams.get("id")
    console.log("id", id)
    if (!id) {
        return NextResponse.json({ error: "Meal ID is required" }, { status: 400 });
    }

    const deletedMeal = await deleteMealEntry(id)
    console.log("deletedMeal:", deletedMeal)
    if (!deletedMeal) {
        return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(deletedMeal, { status: 200 })
}