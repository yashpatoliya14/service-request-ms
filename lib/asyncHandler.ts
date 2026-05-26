import { NextRequest, NextResponse } from "next/server"

export const asyncHandler = (fn: (req: NextRequest, context: any) => Promise<NextResponse>) => {
    return async (req: NextRequest, context: any) => {
        try {
            return fn(req, context)
        } catch (error) {
            console.error(`Error caught from asyncHandler: ${error}`);
            return NextResponse.json({ success: false, message: "Internal server error", data: [] }, { status: 500 })
        }
    }
}