import { getDetailsFromToken } from "@/lib/auth";
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

interface IUserDetail{
    userId: string;
    email: string;
    role: string;
    fullName: string;
    username: string;
    iat?: number;
    exp?: number;
}


// Create assignment  
export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { ServiceRequestID, AssignedToID } = body;

        // Check if request is already in a terminal (completed) status
        const existingRequest = await prisma.serviceRequest.findUnique({
            where: { ServiceRequestID: BigInt(ServiceRequestID) },
            include: { ServiceRequestStatus: true }
        });

        if (existingRequest?.ServiceRequestStatus?.IsTerminal) {
            return NextResponse.json(
                { success: false, message: "Cannot assign — this request is already completed.", data: [] },
                { status: 409 }
            );
        }

        // Dynamically find the "assigned" status
        const assignedStatus = await prisma.serviceRequestStatus.findFirst({
            where: { IsAssigned: true }
        });

        //create a assignment
        const assignment = await prisma.serviceRequest.update({
            data:{
                AssignedToID:BigInt(AssignedToID),
                StatusID: assignedStatus?.ServiceRequestStatusID ,
            },
            where:{
                ServiceRequestID:BigInt(ServiceRequestID),
            },
            include:{
                ServiceRequestStatus:true
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
    const userDetail:IUserDetail | null = getDetailsFromToken(req);
    if(userDetail=== null){
        return NextResponse.json({ success: false, message: "Unauthorized", data: [] }, { status: 401 });
    }
    if(userDetail.role !== "hod" ){
        return NextResponse.json({ success: false, message: "Unauthorized", data: [] }, { status: 401 });
    }

    try {
        const findPersonnel = await prisma.serviceDeptPerson.findFirst({
            where:{
                UserID:BigInt(userDetail.userId),
                IsActive:true,
            },
            include:{
                ServiceDepartment:true,
                Users:true,
            }
        })

        if(!findPersonnel){
            return NextResponse.json({ success: false, message: "Unauthorized", data: [] }, { status: 401 });
        }
        const requests = await prisma.serviceRequest.findMany({
            where: {
                ServiceDepartmentID:findPersonnel.ServiceDepartment?.ServiceDeptID,
                
            },
            include: {
                ServiceRequestStatus: true,
                Users: true,
                ServiceRequestType: true,
            },
        });
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
