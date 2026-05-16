import { NextRequest, NextResponse } from "next/server";
import {createMealEntryRepository as createMealEntry} from "@/repositories/meals/create-meal-entry";
import {deleteMealEntryRepository as deleteMealEntry} from "@/repositories/meals/delete-meal-entry";
import {createClient} from "@/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();

    const mealSaved = await createMealEntry(body, user.id)
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

