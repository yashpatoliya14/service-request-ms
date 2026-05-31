import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// Create Service Request Type  
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ServiceTypeID,ServiceDeptID,ServiceRequestTypeName,DefaultPriority,IsActive } = body;
        await redis.del(redisKeys.requestTypes.key);
        //create a service request type
        const serviceRequestType = await prisma.serviceRequestType.create({
            data: {
                RequestTypeName:ServiceRequestTypeName,
                ServiceTypeID:BigInt(ServiceTypeID),
                ServiceDeptID:BigInt(ServiceDeptID),
                DefaultPriority: DefaultPriority.toUpperCase(),
                IsActive:IsActive,
            }
        })
        if (serviceRequestType) {
            return NextResponse.json({ success: true, message: "Service Request Type Created Successfull", data: [serviceRequestType] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Service Request Type Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating service request type ${e}`);
        return NextResponse.json({ success: false, message: "Service Request Type Creation Failed", data: [] }, { status: 500 });
    }
}

// get all Service Request Types
export async function GET(req: NextRequest) {
    try {
 const redisData = await redis.get(redisKeys.requestTypes.key);
        if(redisData){
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            
            return NextResponse.json({ success: true, message: "Get Service Request Type Successfull", data: parsed ? [parsed] : [] } as ApiResponse, { status: 200 });
        }
        //get the Service Request Types Data
        const serviceRequestTypes = await prisma.serviceRequestType.findMany({
            include:{
                ServiceDepartment:true,
                ServiceType:true
            }
        })

        if (serviceRequestTypes) {
        await redis.set(redisKeys.requestTypes.key,JSON.stringify(serviceRequestTypes),{'EX':redisKeys.requestTypes.ttl})
        
            return NextResponse.json({ success: true, message: "Get All Service Request Types Successfull", data: serviceRequestTypes ? serviceRequestTypes : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Service Request Types Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all service request types ${e}`);
        return NextResponse.json({ success: false, message: "Get All Service Request Types Failed", data: [] }, { status: 500 });
    }
}
