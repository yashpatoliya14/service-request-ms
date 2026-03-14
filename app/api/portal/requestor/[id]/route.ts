import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


//types
interface IRequestorBody {
    ServiceRequestTypeID: number;
    RequestorID: number;
    Title: string;
    Description: string;
    Priority: number;    
}

interface IRequestorResponse {
    success: boolean;
    message: string;
    data: any[];
}
// get requestor by id 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {   
        const { id } = await params;
        //get the requestor Data
        const requestor = await prisma.serviceRequest.findFirst({
            where: {
                ServiceRequestID: BigInt(id),
            },
            include: {
                ServiceRequestStatus: true,
                ServiceRequestType: true,
                ServiceDeptPerson: {
                    include: {
                        Users: true,
                    }
                }
            }
        })
        if (requestor) {
            return NextResponse.json({ success: true, message: "Get Requestor Successfull", data: requestor ? [requestor] : [] } as IRequestorResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get Requestor Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting requestor ${e}`);
        return NextResponse.json({ success: false, message: "Get Requestor Failed", data: [] }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const body = await req.json();
        const { ServiceRequestTypeID, RequestorID, Title, Description, Priority } = body;
        //update the requestor Data
        const requestor = await prisma.serviceRequest.update({
            data: {
                ServiceRequestTypeID: BigInt(ServiceRequestTypeID),
                RequestorID: BigInt(RequestorID),
                Title: Title,
                Description: Description,
                Priority: Priority,
            },
            where: {
                ServiceRequestID: BigInt(id),
            }
        })
        if (requestor) {
            return NextResponse.json({ success: true, message: "Update Requestor Successfull", data: requestor ? [requestor] : [] } as IRequestorResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Update Requestor Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in updating requestor ${e}`);
        return NextResponse.json({ success: false, message: "Update Requestor Failed", data: [] }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;

        //delete the requestor Data
        const requestor = await prisma.serviceRequest.delete({
            where: {
                ServiceRequestID: BigInt(id),
            }
        })
        if (requestor) {
            return NextResponse.json({ success: true, message: "Delete Requestor Successfull", data: requestor ? [requestor] : [] } as IRequestorResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Delete Requestor Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in deleting requestor ${e}`);
        return NextResponse.json({ success: false, message: "Delete Requestor Failed", data: [] }, { status: 500 });
    }
}