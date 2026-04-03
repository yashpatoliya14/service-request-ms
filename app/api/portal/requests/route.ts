import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

// Get All Requests  
export async function GET(req: NextRequest) {
    try {
        const user = getDetailsFromToken(req);
        if (!user) {
            return NextResponse.json({ success: false, message: "User not found", data: [] }, { status: 404 });
        }

        const requests = await prisma.serviceRequest.findMany({
            where: {
                RequestorID: BigInt(user.userId),
                OR: [
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
                ]
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
        console.log(requests);
        if (requests) {
            return NextResponse.json({ success: true, message: "Get All Requests Successfull", data: [requests] }, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Requests Failed", data: [] }, { status: 400 });
        }

    } catch (error) {
        console.log(error);
        return NextResponse.json({ success: false, message: "Internal server error", data: [] }, { status: 500 });
    }
}