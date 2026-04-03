import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const request = await prisma.serviceRequest.findFirst({
            where: {
                ServiceRequestID: Number(id),
            },
            include: {
                ServiceRequestStatus: true,
            },
        });
        if (!request) {
            return NextResponse.json({ success: false, message: "Request not found" }, { status: 404 });
        }
        const isDraftOrUnset =
            request.ServiceRequestStatus?.IsTerminal === true
            if (isDraftOrUnset) {
                return NextResponse.json({ success: false, message: "Request is not active" }, { status: 400 });
            }
            console.log("Request is not active ");
            console.log(request);
            console.log(isDraftOrUnset);
        const messages = await prisma.serviceRequestReply.findMany({
            where: {
                ServiceRequestID: Number(id),
            },
            include: {
                Users: {
                    select: {
                        FullName: true,
                        Role: true,
                    }
                }
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
