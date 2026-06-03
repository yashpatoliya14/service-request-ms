import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";


// Create Department  
export async function POST(req: NextRequest) {
    try {

        const user = await getDetailsFromToken(req)
        if (!user) {
            return NextResponse.json({ success: false, message: "User Not Found", data: [] }, { status: 400 });
        }
        if(user.role !== "admin") {
            return NextResponse.json({ success: false, message: "Unauthorized", data: [] }, { status: 401 });
        }
        const body = await req.json();
        const { DeptName } = body;

        await redis.del(redisKeys.departments.key);

        //create a user
        const department = await prisma.serviceDepartment.create({
            data: {
                DeptName:DeptName,
                
            }
        })
        if (department) {
            return NextResponse.json({ success: true, message: "Department Created Successfull", data: [department] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Department Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating department ${e}`);
        return NextResponse.json({ success: false, message: "Department Creation Failed", data: [] }, { status: 500 });
    }
}

// get all Departments
export async function GET(req: NextRequest) {
    try {
        const redisData = await redis.get(redisKeys.departments.key);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json({ success: true, message: "Get All Departments Successfull", data: parsed ? parsed : [] } as ApiResponse, { status: 200 });
        }

        //get the Departments Data
        const departments = await prisma.serviceDepartment.findMany()
        if (departments) {
            await redis.set(redisKeys.departments.key, JSON.stringify(departments), { 'PX': redisKeys.departments.ttl });
            return NextResponse.json({ success: true, message: "Get All Departments Successfull", data: departments ? departments : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Departments Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all departments ${e}`);
        return NextResponse.json({ success: false, message: "Get All Departments Failed", data: [] }, { status: 500 });
    }
}
