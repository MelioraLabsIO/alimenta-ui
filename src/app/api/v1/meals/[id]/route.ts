import {NextRequest, NextResponse} from "next/server";
import {deleteMealEntryRepository as deleteMealEntry} from "@/repositories/meals/delete-meal-entry";
import {updateMealEntryRepository as updateMealEntry} from "@/repositories/meals/update-meal-entry";
import {createClient} from "@/lib/supabase/server";

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
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await ctx.params;

    if (!id) {
        return NextResponse.json({error: "Meal ID is required"}, {status: 400});
    }

    const body = await request.json();

    const updatedMeal = await updateMealEntry(id, body, user.id);

    if (!updatedMeal) {
        return NextResponse.json({error: "Failed to update meal entry"}, {status: 500});
    }

    return NextResponse.json(updatedMeal, {status: 200});
}
