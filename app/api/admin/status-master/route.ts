import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// POST - Create a new status
export async function POST(req: NextRequest) {
    try {
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

        // Get next available ID
        const maxId = await prisma.serviceRequestStatus.aggregate({
            _max: { ServiceRequestStatusID: true },
        });
        const nextId = (maxId._max.ServiceRequestStatusID || 0) + 1;

        const status = await prisma.serviceRequestStatus.create({
            data: {
                ServiceRequestStatusID: nextId,
                ServiceRequestStatusName,
                Sequence: Sequence ? parseFloat(Sequence) : nextId,
                Description: Description || null,
                ServiceRequestStatusCssClass: ServiceRequestStatusCssClass || null,
                IsAllowedForTechnician: IsAllowedForTechnician ?? false,
                IsDefault: IsDefault ?? false,
                IsAssigned: IsAssigned ?? false,
                IsTerminal: IsTerminal ?? false,
            },
        });

        if (status) {
            return NextResponse.json(
                { success: true, message: "Status Created Successfully", data: [status] } as ApiResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json({ success: false, message: "Status Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {
        console.log(`Error in creating status: ${e}`);
        return NextResponse.json({ success: false, message: "Status Creation Failed", data: [] }, { status: 500 });
    }
}

// GET - Get all statuses
export async function GET() {
    try {
        const redisData = await redis.get(redisKeys.statusMaster.key);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json({ success: true, message: "Get All Statuses Successful", data: parsed ? parsed : [] } as ApiResponse, { status: 200 });
        }

        const statuses = await prisma.serviceRequestStatus.findMany({
            orderBy: { Sequence: "asc" },
        });

        if (statuses) {
            await redis.set(redisKeys.statusMaster.key, JSON.stringify(statuses), { 'PX': redisKeys.statusMaster.ttl });
            return NextResponse.json(
                { success: true, message: "Get All Statuses Successful", data: statuses || [] } as ApiResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json({ success: false, message: "Get All Statuses Failed", data: [] }, { status: 400 });
        }
    } catch (e) {
        console.log(`Error in getting all statuses: ${e}`);
        return NextResponse.json({ success: false, message: "Get All Statuses Failed", data: [] }, { status: 500 });
    }
}
