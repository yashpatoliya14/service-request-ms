import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";

// Create Service Type  
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { ServiceTypeName } = body;

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

        //get the Service Types Data
        const serviceTypes = await prisma.serviceType.findMany()
        if (serviceTypes) {
            return NextResponse.json({ success: true, message: "Get All Service Types Successfull", data: serviceTypes ? serviceTypes : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Service Types Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all service types ${e}`);
        return NextResponse.json({ success: false, message: "Get All Service Types Failed", data: [] }, { status: 500 });
    }
}
