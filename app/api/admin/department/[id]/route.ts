import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// get department by id 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {   
        const { id } = await params;
        //get the department Data
        const department = await prisma.serviceDepartment.findFirst({
            where: {
                ServiceDeptID: BigInt(id),
            }
        })
        if (department) {
            return NextResponse.json({ success: true, message: "Get Department Successfull", data: department ? [department] : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get Department Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting department ${e}`);
        return NextResponse.json({ success: false, message: "Get Department Failed", data: [] }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const body = await req.json();
        const { DeptName } = body;
        await redis.del(redisKeys.departments.key);
        //update the Person Master Data
        const department = await prisma.serviceDepartment.update({
            data: {
                DeptName: DeptName,
            },
            where: {
                ServiceDeptID: BigInt(id),
            }
        })
        if (department) {
            return NextResponse.json({ success: true, message: "Update Department Successfull", data: department ? [department] : [] } as ApiResponse, { status: 200 });
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
        await redis.del(redisKeys.departments.key);
        //delete the department Data
        const department = await prisma.serviceDepartment.delete({
            where: {
                ServiceDeptID: BigInt(id),
            }
        })
        if (department) {
            return NextResponse.json({ success: true, message: "Delete Department Successfull", data: department ? [department] : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Delete Department Failed", data: [] }, { status: 400 });
        }
    } catch (e: any) {
        console.log(`Error in deleting department ${e}`);

        // Foreign key constraint violation — department is in use
        if (e?.code === "P2003") {
            return NextResponse.json(
                { success: false, message: "Cannot delete this department because it is currently associated with technicians or request types. Please reassign or remove them first.", data: [] },
                { status: 409 }
            );
        }

        return NextResponse.json({ success: false, message: "Delete Department Failed", data: [] }, { status: 500 });
    }
}