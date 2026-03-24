import {NextRequest, NextResponse} from "next/server";
import {deleteMealEntry} from "@/domain/meals/delete-meal-entry";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";


export async function DELETE(
    _request: NextRequest,
    ctx: RouteContext<'/api/v1/meals/[id]'>
) {
    const result = await ctx.params;
    const id = result.id

    if (!id) {
        return NextResponse.json({error: "Meal ID is required"}, {status: 400});
    }

    const deletedMeal = await deleteMealEntry(id);

    if (!deletedMeal) {
        return NextResponse.json({error: "Meal not found"}, {status: 404});
    }

    return NextResponse.json(deletedMeal, {status: 200});
}