import { getDetailsFromToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";

// Get current user details from JWT token
export async function GET(req: NextRequest) {
    const user = getDetailsFromToken(req);

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Not authenticated", data: [] },
            { status: 401 }
        );
    }

    return NextResponse.json({
        success: true,
        message: "Authenticated",
        data: [{
            userId: user.userId,
            email: user.email,
            role: user.role,
            fullName: user.fullName,
            username: user.username
        }]
    }, { status: 200 });
}
