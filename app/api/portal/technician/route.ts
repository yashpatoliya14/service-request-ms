import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// GET - Get only service requests assigned to the logged-in technician
export async function GET(req: NextRequest) {
    const userDetail = getDetailsFromToken(req);
    if (!userDetail) {
        return NextResponse.json(
            { success: false, message: "Unauthorized", data: [] },
            { status: 401 }
        );
    }

    if (userDetail.role !== "technician") {
        return NextResponse.json(
            { success: false, message: "Unauthorized", data: [] },
            { status: 401 }
        );
    }

    try {
        // Validate userId exists
        if (!userDetail.userId) {
            return NextResponse.json(
                { success: false, message: "Invalid user ID", data: [] },
                { status: 400 }
            );
        }

        const cacheKey = `${redisKeys.technicianRequests.key}:${userDetail.userId}`;
        const redisData = await redis.get(cacheKey);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json(
                { success: true, message: "Get Assigned Requests Successful", data: parsed ? parsed : [] } as ApiResponse,
                { status: 200 }
            );
        }

        // Find the technician's DeptPerson record
        const personnel = await prisma.serviceDeptPerson.findFirst({
            where: {
                UserID: BigInt(userDetail.userId),
                IsActive: true,
            },
        });

        if (!personnel) {
            return NextResponse.json(
                { success: false, message: "Technician not found in any department", data: [] },
                { status: 404 }
            );
        }

        // Only fetch requests assigned to this technician
        const requests = await prisma.serviceRequest.findMany({
            where: {
                AssignedToID: personnel.DeptPersonID,
            },
            include: {
                ServiceRequestStatus: true,
                Users: true,
                ServiceRequestType: true,
            },
        });

        if (requests) {
            await redis.set(cacheKey, JSON.stringify([requests]), { 'PX': redisKeys.technicianRequests.ttl });
        }

        return NextResponse.json(
            { success: true, message: "Get Assigned Requests Successful", data: [requests] } as ApiResponse,
            { status: 200 }
        );
    } catch (e) {
        console.log(`Error in getting technician requests: ${e}`);
        return NextResponse.json(
            { success: false, message: "Get Requests Failed", data: [] } as ApiResponse,
            { status: 500 }
        );
    }
}
