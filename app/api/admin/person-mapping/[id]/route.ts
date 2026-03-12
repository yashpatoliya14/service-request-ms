import { NextRequest, NextResponse } from "next/server";

// Placeholder - person mapping by ID operations
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    return NextResponse.json({ success: false, message: "Not implemented", data: [] }, { status: 501 });
}
