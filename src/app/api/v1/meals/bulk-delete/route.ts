import {NextRequest, NextResponse} from "next/server";
import {bulkDeleteMealEntries} from "@/domain/meals/bulk-delete-meal-entries";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function DELETE(request: NextRequest) {
    const body = await request.json();
    const { ids } = body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return NextResponse.json({error: "ids must be a non-empty array"}, {status: 400});
    }

    const result = await bulkDeleteMealEntries(ids);

    return NextResponse.json({count: result.count}, {status: 200});
}
