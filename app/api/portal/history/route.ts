import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//types

interface IPortalHistoryBody {
    RequestorID: string;
}

interface IPortalHistoryResponse {
    success: boolean;
    message: string;
    data: any[];
}

// Get All Requests  
export async function POST(req: NextRequest) {
    try {
        const user = await req.json();

        //get all requests
        const requests = await prisma.serviceRequest.findMany({
            where: {
                RequestorID: BigInt(user.RequestorID),
            }
        })
        if (requests) {
            return NextResponse.json({ success: true, message: "Get All Requests History Successfull", data: [requests] } as IPortalHistoryResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Requests History Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all requests ${e}`);
        return NextResponse.json({ success: false, message: "Get All Requests History Failed", data: [] }, { status: 500 });
    }
}