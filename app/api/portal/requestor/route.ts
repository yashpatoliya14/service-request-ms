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


// Create Requestor  
export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { ServiceRequestTypeID, RequestorID, Title, Description, Priority } = body;

        // check if auto-assignment mapping exists for this request type
        const mapping = await prisma.serviceRequestTypeWisePerson.findFirst({
            where: {
                ServiceRequestTypeID: BigInt(ServiceRequestTypeID)
            }
        });

        const assignedToID = mapping ? mapping.ServicePersonID : null;
        // set status to 3 (In Progress) if mapped, otherwise 1 (Pending)
        const statusID = assignedToID ? 3 : 1;

        //create a requestor
        const requestor = await prisma.serviceRequest.create({
            data: {
                ServiceRequestTypeID:BigInt(ServiceRequestTypeID),
                RequestorID:BigInt(RequestorID),
                Title:Title,
                Description:Description,
                Priority:Priority,
                StatusID:statusID,
                AssignedToID:assignedToID,
            }
        })
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

// get all requestors
export async function GET(req: NextRequest) {
    try {

        //get the requestors Data
        const requestors = await prisma.serviceRequest.findMany()
        if (requestors) {
            return NextResponse.json({ success: true, message: "Get All Requestors Successfull", data: requestors ? requestors : [] } as IRequestorResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Requestors Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all requestors ${e}`);
        return NextResponse.json({ success: false, message: "Get All Requestors Failed", data: [] }, { status: 500 });
    }
}
