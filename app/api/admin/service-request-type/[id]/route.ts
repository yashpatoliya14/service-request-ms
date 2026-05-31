import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redisKeys } from "@/lib/redis-keys";
import { redis } from "@/lib/redis";

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
            return NextResponse.json({ success: true, message: "Get Service Request Type Successfull", data: serviceRequestType ? [serviceRequestType] : [] } as ApiResponse, { status: 200 });
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
        await redis.del(redisKeys.requestTypes.key);
        //update the Person Master Data
        const serviceRequestType = await prisma.serviceRequestType.update({
            data: {
                RequestTypeName: RequestTypeName,
                DefaultPriority:DefaultPriority.toUpperCase(),
                IsActive:IsActive,
                ServiceTypeID:BigInt(ServiceTypeID),
                ServiceDeptID:BigInt(ServiceDeptID),
            },
            where: {
                ServiceRequestTypeID: BigInt(id),
            }
        })
        if (serviceRequestType) {
            return NextResponse.json({ success: true, message: "Update Service Request Type Successfull", data: serviceRequestType ? [serviceRequestType] : [] } as ApiResponse, { status: 200 });
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
        await redis.del(redisKeys.requestTypes.key);
        //delete the service type Data
        const serviceRequestType = await prisma.serviceRequestType.delete({
            where: {
                ServiceRequestTypeID: BigInt(id),
            }
        })
        if (serviceRequestType) {
            return NextResponse.json({ success: true, message: "Delete Service Request Type Successfull", data: serviceRequestType ? [serviceRequestType] : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Delete Service Request Type Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in deleting service request type ${e}`);
        return NextResponse.json({ success: false, message: "Delete Service Request Type Failed", data: [] }, { status: 500 });
    }
}