import { asyncHandler } from "@/lib/asyncHandler";
import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Get Active requests for Requester with cursor pagination
export const GET = asyncHandler(async (req: NextRequest, context: any) => {
    const user = getDetailsFromToken(req);
    if (!user) {
        return NextResponse.json({ success: false, message: "User not found", data: [] }, { status: 404 });
    }

    const { searchParams } = new URL(req.url);
    const cursor = searchParams.get("cursor");
    const limit = parseInt(searchParams.get("limit") || "5");
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "ALL";
    const dept = searchParams.get("dept") || "ALL";

    // 1. Build Query Filters
    const where: any = {
        RequestorID: BigInt(user.userId),
    };

    // Filter by Active status (Default or Assigned) unless a specific status filter is applied
    if (status !== "ALL") {
        where.StatusID = parseInt(status);
    } else {
        where.OR = [
            {
                ServiceRequestStatus: {
                    IsDefault: true
                }
            },
            {
                ServiceRequestStatus: {
                    IsAssigned: true
                }
            }
        ];
    }

    if (dept !== "ALL") {
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

    // 2. Fetch requests (fetch limit + 1 items to determine if hasNextPage)
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

    // 3. Compute stats for dashboard metrics across all user requests
    const [totalCount, pendingCount, closedCount] = await Promise.all([
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

    const activeCount = Math.max(0, totalCount - pendingCount - closedCount);

    const stats = {
        total: totalCount,
        pending: pendingCount,
        active: activeCount,
        closed: closedCount
    };

    // Return in the 2D array format [ { requests, nextCursor, hasNextPage, stats } ] for apiClient compatibility
    return NextResponse.json({
        success: true,
        message: "Get All Requests Successful",
        data: [
            {
                requests: paginatedRequests,
                nextCursor,
                hasNextPage,
                stats
            }
        ]
    }, { status: 200 });
});