import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
//types
interface IServiceRequestTypeBody {
    ServiceTypeID: string;
    ServiceDept:string;
    ServiceRequestTypeName:string;
    DefaultPriority:number;
    IsActive:boolean;    
}

interface IServiceRequestTypeResponse {
    success: boolean;
    message: string;
    data: any[];
}

// get service request type by id 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {   
        const { id } = await params;
        //get the service type Data
        const serviceRequestType = await prisma.serviceRequestType.findFirst({
            where: {
                ServiceRequestTypeID: BigInt(id),
            },
            include:{
                ServiceDepartment:true,
                ServiceType:true
            }
        })
        if (serviceRequestType) {
            return NextResponse.json({ success: true, message: "Get Service Request Type Successfull", data: serviceRequestType ? [serviceRequestType] : [] } as IServiceRequestTypeResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get Service Request Type Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting service request type ${e}`);
        return NextResponse.json({ success: false, message: "Get Service Request Type Failed", data: [] }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const body = await req.json();
        const { RequestTypeName,DefaultPriority,IsActive,ServiceTypeID,ServiceDeptID } = body;
        //update the Person Master Data
        const serviceRequestType = await prisma.serviceRequestType.update({
            data: {
                RequestTypeName: RequestTypeName,
                DefaultPriority:DefaultPriority,
                IsActive:IsActive,
                ServiceTypeID:BigInt(ServiceTypeID),
                ServiceDeptID:BigInt(ServiceDeptID),
            },
            where: {
                ServiceRequestTypeID: BigInt(id),
            }
        })
        if (serviceRequestType) {
            return NextResponse.json({ success: true, message: "Update Service Request Type Successfull", data: serviceRequestType ? [serviceRequestType] : [] } as IServiceRequestTypeResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Update Service Request Type Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in updating service request type ${e}`);
        return NextResponse.json({ success: false, message: "Update Department Failed", data: [] }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;

        //delete the service type Data
        const serviceRequestType = await prisma.serviceRequestType.delete({
            where: {
                ServiceRequestTypeID: BigInt(id),
            }
        })
        if (serviceRequestType) {
            return NextResponse.json({ success: true, message: "Delete Service Request Type Successfull", data: serviceRequestType ? [serviceRequestType] : [] } as IServiceRequestTypeResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Delete Service Request Type Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in deleting service request type ${e}`);
        return NextResponse.json({ success: false, message: "Delete Service Request Type Failed", data: [] }, { status: 500 });
    }
}