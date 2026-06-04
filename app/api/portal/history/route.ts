import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// Get All Requests History with cursor pagination and server filtering
export async function GET(req: NextRequest) {
    try {
        const user = getDetailsFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found", data: [] }, { status: 404 });
        }

        const { searchParams } = new URL(req.url);
        const cursor = searchParams.get("cursor");
        const limit = parseInt(searchParams.get("limit") || "5");
        const search = searchParams.get("search") || "";
        const status = searchParams.get("status") || "all";
        const dept = searchParams.get("dept") || "all";

        // Create a composite cache key including all filter & pagination parameters
        const cacheKey = `${redisKeys.requestorHistory.key}:${user.userId}:cursor=${cursor || ""}:limit=${limit}:search=${search}:status=${status}:dept=${dept}`;
        
        const redisData = await redis.get(cacheKey);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached (history)");
            return NextResponse.json({ 
                success: true, 
                message: "Get All Requests History Successful", 
                data: parsed ? parsed : [] 
            } as ApiResponse, { status: 200 });
        }

        // 1. Build Query Filters
        const where: any = {
            RequestorID: BigInt(user.userId),
        };

        if (status !== "all" && status !== "ALL") {
            where.ServiceRequestStatus = {
                ServiceRequestStatusName: status
            };
        }

        if (dept !== "all" && dept !== "ALL") {
            where.ServiceRequestType = {
                ServiceDepartment: {
                    DeptName: dept
                }
            };
        }

        if (search) {
            const isNumeric = /^\d+$/.test(search);
            where.AND = [
                {
                    OR: [
                        { Title: { contains: search, mode: "insensitive" } },
                        isNumeric ? { ServiceRequestID: BigInt(search) } : undefined
                    ].filter(Boolean) as any
                }
            ];
        }

        // 2. Fetch history page
        const requests = await prisma.serviceRequest.findMany({
            where,
            take: limit + 1,
            cursor: cursor ? { ServiceRequestID: BigInt(cursor) } : undefined,
            skip: cursor ? 1 : 0,
            orderBy: {
                ServiceRequestID: "desc"
            },
            include: {
                ServiceRequestStatus: true,
                ServiceRequestType: {
                    include: { 
                        ServiceDepartment: true
                    }
                }
            }
        });

        const hasNextPage = requests.length > limit;
        const paginatedRequests = hasNextPage ? requests.slice(0, limit) : requests;
        const nextCursor = hasNextPage && paginatedRequests.length > 0
            ? paginatedRequests[paginatedRequests.length - 1].ServiceRequestID.toString()
            : null;

        // 3. Compute stats for history metrics across all requestor requests
        const [totalCount, pendingCount, completedCount] = await Promise.all([
            prisma.serviceRequest.count({
                where: { RequestorID: BigInt(user.userId) }
            }),
            prisma.serviceRequest.count({
                where: {
                    RequestorID: BigInt(user.userId),
                    OR: [
                        { ServiceRequestStatus: { IsDefault: true } },
                        { ServiceRequestStatus: null, StatusID: null }
                    ]
                }
            }),
            prisma.serviceRequest.count({
                where: {
                    RequestorID: BigInt(user.userId),
                    ServiceRequestStatus: { IsTerminal: true }
                }
            })
        ]);

        const stats = {
            total: totalCount,
            pending: pendingCount,
            completed: completedCount
        };

        const resultData = [
            {
                requests: paginatedRequests,
                nextCursor,
                hasNextPage,
                stats
            }
        ];

        // Cache the formatted data in Redis
        await redis.set(cacheKey, JSON.stringify(resultData), { "PX": redisKeys.requestorHistory.ttl });

        return NextResponse.json({ 
            success: true, 
            message: "Get All Requests History Successful", 
            data: resultData 
        } as ApiResponse, { status: 200 });

    } catch (e) {
        console.log(`Error in getting requests history: ${e}`);
        return NextResponse.json({ success: false, message: "Get All Requests History Failed", data: [] }, { status: 500 });
    }
}