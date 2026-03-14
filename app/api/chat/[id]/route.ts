import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const messages = await prisma.serviceRequestReply.findMany({
            where: {
                ServiceRequestID: Number(id),
            },
            orderBy: {
                Created: "asc",
            },
        });
        return NextResponse.json({ success: true, message: "Messages fetched successfully", data: messages });
    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
    }
}
