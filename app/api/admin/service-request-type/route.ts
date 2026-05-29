import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";

// Create Service Request Type  
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ServiceTypeID,ServiceDeptID,ServiceRequestTypeName,DefaultPriority,IsActive } = body;

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

        //get the Service Request Types Data
        const serviceRequestTypes = await prisma.serviceRequestType.findMany({
            include:{
                ServiceDepartment:true,
                ServiceType:true
            }
        })
        if (serviceRequestTypes) {
            return NextResponse.json({ success: true, message: "Get All Service Request Types Successfull", data: serviceRequestTypes ? serviceRequestTypes : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Service Request Types Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all service request types ${e}`);
        return NextResponse.json({ success: false, message: "Get All Service Request Types Failed", data: [] }, { status: 500 });
    }
}
