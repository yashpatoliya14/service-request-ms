import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//types

interface IRequestorBody {
    ServiceRequestTypeID: string;
    RequestorID: string;
    Title: string;
    Description: string;
    Priority: string;

}

interface IRequestorResponse {
    success: boolean;
    message: string;
    data: any[];
}


// update a status
export async function PATCH(req: NextRequest) {
    try {

        const body = await req.json();
        const { ServiceRequestTypeID, StatusID } = body;


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
            return NextResponse.json({ success: true, message: "Requestor Created Successfull", data: [requestor] } as IRequestorResponse, { status: 200 });
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

        // Get all requests assigned to this technician
        const requests = await prisma.serviceRequest.findMany({
            where: {
                AssignedToID: BigInt(deptPerson.DeptPersonID),
            },
        });

        if (requests) {
            return NextResponse.json(
                { success: true, message: "Get Technician Requests Successful", data: [requests] } as IRequestorResponse,
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
            return NextResponse.json(
                { success: true, message: "Request Status Updated Successfully", data: [updatedRequest] } as IRequestorResponse,
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
