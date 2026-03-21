import {NextResponse} from "next/server";
import {getUserProfileService} from "@/domain/profile/get-user-profile";
import {updateUserProfileDomain} from "@/domain/profile/update-user-profile";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
    try {
        const profile = await getUserProfileService();

        if (!profile) {
            return NextResponse.json({ message: "User profile not found" }, { status: 404 });
        }

        return NextResponse.json(profile, { status: 200 });
    } catch (error) {
        console.error("[GET /api/v1/user-profile]", error);

        return NextResponse.json({ message: "Failed to fetch user profile" }, { status: 500 });
    }
}

export async function PUT(request: Request){
    const body = await request.json();

    // call the domain layer
    const updatedProfile = await updateUserProfileDomain(body)
    if (!updatedProfile) {
        return NextResponse.json({ message: "Failed to update user profile" }, { status: 500 });
    }

    return NextResponse.json({ message: "User profile updated successfully" }, { status: 200 });
}