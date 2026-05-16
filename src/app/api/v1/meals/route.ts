import { NextRequest, NextResponse } from "next/server";
import {createMealEntry} from "@/domain/meals/create-meal-entry";
import {deleteMealEntry} from "@/domain/meals/delete-meal-entry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const body = await request.json();

    const mealSaved = await createMealEntry(body)
    if (!mealSaved) {
        return NextResponse.json({ error: "Failed to create meal entry" }, { status: 500 })
    }

    return NextResponse.json(mealSaved, { status: 201 })
}

export async function DELETE(request: NextRequest) {
    const {searchParams} = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) {
        return NextResponse.json({ error: "Meal ID is required" }, { status: 400 });
    }

    const deletedMeal = await deleteMealEntry(id)
    if (!deletedMeal) {
        return NextResponse.json({ error: "Meal not found" }, { status: 404 });
    }

    return NextResponse.json(deletedMeal, { status: 200 })
}

