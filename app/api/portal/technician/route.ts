import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//types

interface ITechnicianResponse {
    success: boolean;
    message: string;
    data: any[];
}

// GET - Get all service requests (for technician dashboard)
export async function GET(req: NextRequest) {
    try {
        const requests = await prisma.serviceRequest.findMany();

        if (requests) {
            return NextResponse.json(
                { success: true, message: "Get All Requests Successful", data: [requests] } as ITechnicianResponse,
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { success: false, message: "No Requests Found", data: [] } as ITechnicianResponse,
                { status: 404 }
            );
        }
    } catch (e) {
        console.log(`Error in getting all requests: ${e}`);
        return NextResponse.json(
            { success: false, message: "Get All Requests Failed", data: [] } as ITechnicianResponse,
            { status: 500 }
        );
    }
}
