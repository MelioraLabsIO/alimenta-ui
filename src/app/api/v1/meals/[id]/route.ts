import {NextRequest, NextResponse} from "next/server";
import {deleteMealEntry} from "@/domain/meals/delete-meal-entry";
import {updateMealEntry} from "@/domain/meals/update-meal-entry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function DELETE(
    _request: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    if (!id) {
        return NextResponse.json({error: "Meal ID is required"}, {status: 400});
    }

    const deletedMeal = await deleteMealEntry(id);

    if (!deletedMeal) {
        return NextResponse.json({error: "Meal not found"}, {status: 404});
    }

    return NextResponse.json(deletedMeal, {status: 200});
}

export async function PUT(
    request: NextRequest,
    ctx: { params: Promise<{ id: string }> }
) {
    const { id } = await ctx.params;

    if (!id) {
        return NextResponse.json({error: "Meal ID is required"}, {status: 400});
    }

    const body = await request.json();

    const updatedMeal = await updateMealEntry(id, body);

    if (!updatedMeal) {
        return NextResponse.json({error: "Failed to update meal entry"}, {status: 500});
    }

    return NextResponse.json(updatedMeal, {status: 200});
}
