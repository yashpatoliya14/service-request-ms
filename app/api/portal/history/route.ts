import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";

// Get All Requests  
export async function GET(req: NextRequest) {
    try {
        const user = getDetailsFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found", data: [] }, { status: 404 });
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
            return NextResponse.json({ success: true, message: "Get All Requests History Successfull", data: [requests] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Requests History Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all requests ${e}`);
        return NextResponse.json({ success: false, message: "Get All Requests History Failed", data: [] }, { status: 500 });
    }
}