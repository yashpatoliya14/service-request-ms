import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";


// update the assignment 
export async function PATCH(req: NextRequest,{params}: { params: Promise<{ id: string }> }) {
    try {
        const { id } = await params;
        const body = await req.json();
        const { AssignedToID } = body;

        // Check if request is already in a terminal (completed) status
        const existingRequest = await prisma.serviceRequest.findUnique({
            where: { ServiceRequestID: BigInt(id) },
            include: { ServiceRequestStatus: true }
        });

        if (existingRequest?.ServiceRequestStatus?.IsTerminal) {
            return NextResponse.json(
                { success: false, message: "Cannot reassign — this request is already completed.", data: [] },
                { status: 409 }
            );
        }

        // Dynamically find the "assigned" status
        const assignedStatus = await prisma.serviceRequestStatus.findFirst({
            where: { IsAssigned: true }
        });

        //update a assignment
        const assignment = await prisma.serviceRequest.update({
            data:{
                AssignedToID:BigInt(AssignedToID),
                StatusID: assignedStatus?.ServiceRequestStatusID ?? 3,
            },
            where:{
                ServiceRequestID:BigInt(id),
            },
            include:{
                ServiceRequestStatus:true
            }
        })
        if (assignment) {
            return NextResponse.json({ success: true, message: "Assignment Updated Successfull", data: [assignment] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Assignment Update Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in updating assignment ${e}`);
        return NextResponse.json({ success: false, message: "Assignment Update Failed", data: [] }, { status: 500 });
    }
}

