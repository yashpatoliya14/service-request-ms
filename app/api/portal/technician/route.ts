import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//types

interface ITechnicianResponse {
    success: boolean;
    message: string;
    data: any[];
}

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

        return NextResponse.json(
            { success: true, message: "Get Assigned Requests Successful", data: [requests] } as ITechnicianResponse,
            { status: 200 }
        );
    } catch (e) {
        console.log(`Error in getting technician requests: ${e}`);
        return NextResponse.json(
            { success: false, message: "Get Requests Failed", data: [] } as ITechnicianResponse,
            { status: 500 }
        );
    }
}
