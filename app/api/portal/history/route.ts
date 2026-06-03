import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// Get All Requests  
export async function GET(req: NextRequest) {
    try {
        const user = getDetailsFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found", data: [] }, { status: 404 });
        }

        const cacheKey = `${redisKeys.requestorHistory.key}:${user.userId}`;
        const redisData = await redis.get(cacheKey);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json({ success: true, message: "Get All Requests History Successfull", data: parsed ? parsed : [] } as ApiResponse, { status: 200 });
        }

        //get all requests
        const requests = await prisma.serviceRequest.findMany({
            where: {
                RequestorID: BigInt(user.userId),
            },
            include: {
                ServiceRequestStatus: true,
                ServiceRequestType: {
                    include: { 
                        ServiceDepartment: true
                    }
                }
            }
        })
        if (requests) {
            await redis.set(cacheKey, JSON.stringify([requests]), { 'PX': redisKeys.requestorHistory.ttl });
            return NextResponse.json({ success: true, message: "Get All Requests History Successfull", data: [requests] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Requests History Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all requests ${e}`);
        return NextResponse.json({ success: false, message: "Get All Requests History Failed", data: [] }, { status: 500 });
    }
}