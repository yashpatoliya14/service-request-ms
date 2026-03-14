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


// update the assignment 
export async function PATCH(req: NextRequest,{params}: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { AssignedToID } = body;

        //update a assignment
        const assignment = await prisma.serviceRequest.update({
            data:{
                AssignedToID:BigInt(AssignedToID),
                StatusID:3,
            },
            where:{
                ServiceRequestID:BigInt(id),
            },
            include:{
                ServiceRequestStatus:true
            }
        })
        if (assignment) {
            return NextResponse.json({ success: true, message: "Assignment Updated Successfull", data: [assignment] } as IHodResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Assignment Update Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in updating assignment ${e}`);
        return NextResponse.json({ success: false, message: "Assignment Update Failed", data: [] }, { status: 500 });
    }
}

