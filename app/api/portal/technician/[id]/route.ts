import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";
import { invalidateRequestCache } from "@/lib/redis-helpers";


// update a status
export async function PATCH(req: NextRequest) {
    try {

        const body = await req.json();
        const { ServiceRequestTypeID, StatusID } = body;

        await invalidateRequestCache(ServiceRequestTypeID);

        const requestor = await prisma.serviceRequest.update({
            where: {
                ServiceRequestID: BigInt(ServiceRequestTypeID),
            },
            data: {
                StatusID: Number(StatusID),
            }
        })
        console.log(requestor);

        if (requestor) {
            await invalidateRequestCache(ServiceRequestTypeID);
            return NextResponse.json({ success: true, message: "Requestor Created Successfull", data: [requestor] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Requestor Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating requestor ${e}`);
        return NextResponse.json({ success: false, message: "Requestor Creation Failed", data: [] }, { status: 500 });
    }
}


// GET - Get all requests assigned to a technician by ID
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;

        const cacheKey = `${redisKeys.technicianRequests.key}:${id}`;
        const redisData = await redis.get(cacheKey);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json(
                { success: true, message: "Get Technician Requests Successful", data: parsed ? parsed : [] } as ApiResponse,
                { status: 200 }
            );
        }

        // get from dept person
        const deptPerson = await prisma.serviceDeptPerson.findUnique({
            where: {
                UserID: BigInt(id),
            },
        });

        if (!deptPerson) {
            return NextResponse.json(
                { success: false, message: "Technician Not Found", data: [] },
                { status: 404 }
            );
        }
        const statuses = await prisma.serviceRequestStatus.findMany({
            where: {
                OR: [
                    { IsAssigned: true },
                    { IsAllowedForTechnician: true }
                ],
            },
        });
        // Get all requests assigned to this technician
        const requests = await prisma.serviceRequest.findMany({
            where: {
                AssignedToID: BigInt(deptPerson.DeptPersonID),
                StatusID: {
                    in: statuses.map((status) => status.ServiceRequestStatusID),
                }
            },
        });

        if (requests) {
            await redis.set(cacheKey, JSON.stringify([requests]), { 'PX': redisKeys.technicianRequests.ttl });
            return NextResponse.json(
                { success: true, message: "Get Technician Requests Successful", data: [requests] } as ApiResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: "No Requests Found", data: [] },
                { status: 404 }
            );
        }
    } catch (e) {
        console.log(`Error in getting technician requests: ${e}`);
        return NextResponse.json(
            { success: false, message: "Get Technician Requests Failed", data: [] },
            { status: 500 }
        );
    }
}


// PUT - Update the status of a service request by ID
export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { StatusID } = body;

        if (!StatusID) {
            return NextResponse.json(
                { success: false, message: "StatusID is required", data: [] },
                { status: 400 }
            );
        }

        await invalidateRequestCache(id);

        // Update the request status
        const updatedRequest = await prisma.serviceRequest.update({
            where: {
                ServiceRequestID: BigInt(id),
            },
            data: {
                StatusID: Number(StatusID),
            },
        });

        if (updatedRequest) {
            await invalidateRequestCache(id);
            return NextResponse.json(
                { success: true, message: "Request Status Updated Successfully", data: [updatedRequest] } as ApiResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: "Request Status Update Failed", data: [] },
                { status: 400 }
            );
        }
    } catch (e) {
        console.log(`Error in updating request status: ${e}`);
        return NextResponse.json(
            { success: false, message: "Request Status Update Failed", data: [] },
            { status: 500 }
        );
    }
}
