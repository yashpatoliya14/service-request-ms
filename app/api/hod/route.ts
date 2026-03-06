import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

//types

interface IHodBody {
    ServiceRequestTypeID: string;
    RequestNo: string;
    RequestorID: string;
    AssignedToID: string;
    StatusID: string;
    Title: string;
    Description: string;
    Priority: string; 
}

interface IHodResponse {
    success: boolean;
    message: string;
    data: any[];
}


// Create assignment  
export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { ServiceRequestID, AssignedToID } = body;

        //create a assignment
        const assignment = await prisma.serviceRequest.update({
            data:{
                AssignedToID:BigInt(AssignedToID),
            },
            where:{
                ServiceRequestID:BigInt(ServiceRequestID),
            }
        })
        if (assignment) {
            return NextResponse.json({ success: true, message: "Assignment Created Successfull", data: [assignment] } as IHodResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Assignment Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating assignment ${e}`);
        return NextResponse.json({ success: false, message: "Assignment Creation Failed", data: [] }, { status: 500 });
    }
}


// Get All Requests  
export async function GET(req: NextRequest) {
    try {
        //get all requests
        const requests = await prisma.serviceRequest.findMany()
        if (requests) {
            return NextResponse.json({ success: true, message: "Get All Requests Successfull", data: [requests] } as IHodResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Requests Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all requests ${e}`);
        return NextResponse.json({ success: false, message: "Get All Requests Failed", data: [] }, { status: 500 });
    }
}
