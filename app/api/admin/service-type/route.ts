import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// Create Service Type  
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ServiceTypeName } = body;

        await redis.del(redisKeys.serviceTypes.key);

        //create a service type
        const serviceType = await prisma.serviceType.create({
            data: {
                ServiceTypeName:ServiceTypeName,
                
            }
        })
        if (serviceType) {
            return NextResponse.json({ success: true, message: "Service Type Created Successfull", data: [serviceType] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Service Type Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating service type ${e}`);
        return NextResponse.json({ success: false, message: "Service Type Creation Failed", data: [] }, { status: 500 });
    }
}

// get all Service Types
export async function GET(req: NextRequest) {
    try {
        const redisData = await redis.get(redisKeys.serviceTypes.key);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json({ success: true, message: "Get All Service Types Successfull", data: parsed ? parsed : [] } as ApiResponse, { status: 200 });
        }

        //get the Service Types Data
        const serviceTypes = await prisma.serviceType.findMany()
        if (serviceTypes) {
            await redis.set(redisKeys.serviceTypes.key, JSON.stringify(serviceTypes), { 'PX': redisKeys.serviceTypes.ttl });
            return NextResponse.json({ success: true, message: "Get All Service Types Successfull", data: serviceTypes ? serviceTypes : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Service Types Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all service types ${e}`);
        return NextResponse.json({ success: false, message: "Get All Service Types Failed", data: [] }, { status: 500 });
    }
}
