import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// GET - Get status by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const status = await prisma.serviceRequestStatus.findFirst({
            where: { ServiceRequestStatusID: parseInt(id) },
        });

        if (status) {
            return NextResponse.json(
                { success: true, message: "Get Status Successful", data: [status] } as ApiResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json({ success: false, message: "Status Not Found", data: [] }, { status: 404 });
        }
    } catch (e) {
        console.log(`Error in getting status: ${e}`);
        return NextResponse.json({ success: false, message: "Get Status Failed", data: [] }, { status: 500 });
    }
}

// PATCH - Update status by ID
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const {
            ServiceRequestStatusName,
            Sequence,
            Description,
            ServiceRequestStatusCssClass,
            IsAllowedForTechnician,
            IsDefault,
            IsAssigned,
            IsTerminal,
        } = body;

        await redis.del(redisKeys.statusMaster.key);

        const status = await prisma.serviceRequestStatus.update({
            where: { ServiceRequestStatusID: parseInt(id) },
            data: {
                ServiceRequestStatusName,
                Sequence: Sequence !== undefined ? parseFloat(Sequence) : undefined,
                Description,
                ServiceRequestStatusCssClass,
                IsAllowedForTechnician,
                IsDefault,
                IsAssigned,
                IsTerminal,
                Modified: new Date(),
            },
        });

        if (status) {
            return NextResponse.json(
                { success: true, message: "Status Updated Successfully", data: [status] } as ApiResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json({ success: false, message: "Status Update Failed", data: [] }, { status: 400 });
        }
    } catch (e) {
        console.log(`Error in updating status: ${e}`);
        return NextResponse.json({ success: false, message: "Status Update Failed", data: [] }, { status: 500 });
    }
}

// DELETE - Delete status by ID
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        await redis.del(redisKeys.statusMaster.key);

        const status = await prisma.serviceRequestStatus.delete({
            where: { ServiceRequestStatusID: parseInt(id) },
        });

        if (status) {
            return NextResponse.json(
                { success: true, message: "Status Deleted Successfully", data: [status] } as ApiResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json({ success: false, message: "Status Delete Failed", data: [] }, { status: 400 });
        }
    } catch (e) {
        console.log(`Error in deleting status: ${e}`);
        return NextResponse.json({ success: false, message: "Status Delete Failed", data: [] }, { status: 500 });
    }
}
