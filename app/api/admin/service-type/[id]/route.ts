import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// get service type by id 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {   
        const { id } = await params;
        //get the service type Data
        const serviceType = await prisma.serviceType.findFirst({
            where: {
                ServiceTypeID: BigInt(id),
            }
        })
        if (serviceType) {
            return NextResponse.json({ success: true, message: "Get Service Type Successfull", data: serviceType ? [serviceType] : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get Service Type Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting service type ${e}`);
        return NextResponse.json({ success: false, message: "Get Service Type Failed", data: [] }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const body = await req.json();
        const { ServiceTypeName } = body;
        await redis.del(redisKeys.serviceTypes.key);
        //update the Person Master Data
        const serviceType = await prisma.serviceType.update({
            data: {
                ServiceTypeName: ServiceTypeName,
            },
            where: {
                ServiceTypeID: BigInt(id),
            }
        })
        if (serviceType) {
            return NextResponse.json({ success: true, message: "Update Service Type Successfull", data: serviceType ? [serviceType] : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Update Department Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in updating department ${e}`);
        return NextResponse.json({ success: false, message: "Update Department Failed", data: [] }, { status: 500 });
    }
}
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        await redis.del(redisKeys.serviceTypes.key);
        //delete the service type Data
        const serviceType = await prisma.serviceType.delete({
            where: {
                ServiceTypeID: BigInt(id),
            }
        })
        if (serviceType) {
            return NextResponse.json({ success: true, message: "Delete Service Type Successfull", data: serviceType ? [serviceType] : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Delete Service Type Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in deleting service type ${e}`);
        return NextResponse.json({ success: false, message: "Delete Service Type Failed", data: [] }, { status: 500 });
    }
}