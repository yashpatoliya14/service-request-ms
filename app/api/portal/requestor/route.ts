import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";
import { invalidateRequestCache } from "@/lib/redis-helpers";


// Create Requestor  
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ServiceRequestTypeID, RequestorID, Title, Description, ServiceDepartmentID } = body;

        // Validation
        if (!ServiceRequestTypeID || !RequestorID || !Title || !Description || !ServiceDepartmentID) {
            return NextResponse.json({
                success: false,
                message: "Missing required fields: ServiceRequestTypeID, RequestorID, Title, Description, Priority, ServiceDepartmentID",
                data: []
            }, { status: 400 });
        }

        // check if auto-assignment mapping exists for this request type
        const mapping = await prisma.serviceRequestTypeWisePerson.findFirst({
            where: {
                ServiceRequestTypeID: BigInt(ServiceRequestTypeID)
            }
        });

        const assignedToID = mapping ? mapping.ServicePersonID : null;

        // Dynamically find the default and assigned statuses
        const [defaultStatus, assignedStatus] = await Promise.all([
            prisma.serviceRequestStatus.findFirst({ where: { IsDefault: true } }),
            prisma.serviceRequestStatus.findFirst({ where: { IsAssigned: true } }),
        ]);

        // Set status based on assignment logic
        let statusID: number | undefined;
        if (assignedToID && assignedStatus) {
            // If personnel is assigned, use "Assigned" status
            statusID = assignedStatus.ServiceRequestStatusID;
            console.log('Using assigned status:', assignedStatus.ServiceRequestStatusName);
        } else if (defaultStatus) {
            // If no assignment, use "Default" status (typically "In Progress" or "Pending")
            statusID = defaultStatus.ServiceRequestStatusID;
            console.log('Using default status:', defaultStatus.ServiceRequestStatusName);
        } else {
            // Fallback - create a default status if none exists
            console.log('No status found, using fallback');
            statusID = 1; // Assuming 1 is a fallback status ID
        }
        const requestType = await prisma.serviceRequestType.findFirst({
            where: {
                ServiceRequestTypeID: BigInt(ServiceRequestTypeID)
            }
        })
        //create a requestor
        const requestor = await prisma.serviceRequest.create({
            data: {
                ServiceRequestTypeID: BigInt(ServiceRequestTypeID),
                RequestorID: BigInt(RequestorID),
                Title: Title,
                Description: Description,
                StatusID: statusID,
                Priority: requestType?.DefaultPriority,
                AssignedToID: assignedToID,
                ServiceDepartmentID: BigInt(ServiceDepartmentID),
            }
        })
        if (requestor) {
            await invalidateRequestCache(requestor.ServiceRequestID);
            const statusName = assignedToID && assignedStatus
                ? assignedStatus.ServiceRequestStatusName
                : defaultStatus?.ServiceRequestStatusName || 'Unknown';

            const message = assignedToID
                ? `Request created and assigned to personnel. Status: ${statusName}`
                : `Request created successfully. Status: ${statusName}`;

            return NextResponse.json({
                success: true,
                message,
                data: [requestor],
                metadata: {
                    assignedTo: assignedToID ? 'Yes' : 'No',
                    status: statusName
                }
            } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Request Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating requestor ${e}`);
        return NextResponse.json({ success: false, message: "Requestor Creation Failed", data: [] }, { status: 500 });
    }
}

// get all requestors
export async function GET(req: NextRequest) {
    try {
        const cacheKey = `${redisKeys.requestorHistory.key}:all`;
        const redisData = await redis.get(cacheKey);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json({ success: true, message: "Get All Requestors Successfull", data: parsed ? parsed : [] } as ApiResponse, { status: 200 });
        }

        //get the requestors Data
        const requestors = await prisma.serviceRequest.findMany()
        if (requestors) {
            await redis.set(cacheKey, JSON.stringify(requestors), { 'PX': redisKeys.requestorHistory.ttl });
            return NextResponse.json({ success: true, message: "Get All Requestors Successfull", data: requestors ? requestors : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Requestors Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all requestors ${e}`);
        return NextResponse.json({ success: false, message: "Get All Requestors Failed", data: [] }, { status: 500 });
    }
}
