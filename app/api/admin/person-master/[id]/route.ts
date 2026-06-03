import { prisma } from "@/lib/prisma";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { NextRequest, NextResponse } from "next/server";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";

// get Person master by id 
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        //get the Person Master Data
        const user = await prisma.serviceDeptPerson.findFirst({
            include: {
                ServiceDepartment: true,
                Users:true
            },
            where: {
                DeptPersonID: BigInt(id),
            }
        })
        if (user) {
            return NextResponse.json({ success: true, message: "Get Person Master Successfull", data: user ? [user] : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get Person Master Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting person master ${e}`);
        return NextResponse.json({ success: false, message: "Get Person Master Failed", data: [] }, { status: 500 });
    }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;
        const body = await req.json();
        const { ServiceDeptID, Role } = body;
        
        const roles = ["admin", "hod", "technician", "user"];
        await Promise.all([
            redis.del(redisKeys.personMaster.key),
            ...roles.map(r => redis.del(`${redisKeys.personMaster.key}:${r}`))
        ]);
        
        const oldPerson = await prisma.serviceDeptPerson.findUnique({
            where: { DeptPersonID: BigInt(id) }
        });
        if (oldPerson?.ServiceDeptID) {
            await redis.del(`hodTechnicians:${oldPerson.ServiceDeptID}`);
        }
        if (ServiceDeptID) {
            await redis.del(`hodTechnicians:${ServiceDeptID}`);
        }

        //update the Person Master Data
        const user = await prisma.serviceDeptPerson.update({
            data: {
                ServiceDeptID: BigInt(ServiceDeptID),
            },
            where: {
                DeptPersonID: BigInt(id),
            }
        })

        // update user role
        if(user.UserID){

            await prisma.users.update({
                data: {
                    Role: Role,
                },
                where: {
                    UserID: BigInt(user.UserID),
                }
            })
                return NextResponse.json({ success: true, message: "Update Person Master Successfull", data: user ? [user] : [] } as ApiResponse, { status: 200 });
        }else{
                return NextResponse.json({ success: false, message: "Update Person Master Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in updating person master ${e}`);
        return NextResponse.json({ success: false, message: "Update Person Master Failed", data: [] }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {

    try {
        const { id } = await params;

        const roles = ["admin", "hod", "technician", "user"];
        await Promise.all([
            redis.del(redisKeys.personMaster.key),
            ...roles.map(r => redis.del(`${redisKeys.personMaster.key}:${r}`))
        ]);
        
        const oldPerson = await prisma.serviceDeptPerson.findUnique({
            where: { DeptPersonID: BigInt(id) }
        });
        if (oldPerson?.ServiceDeptID) {
            await redis.del(`hodTechnicians:${oldPerson.ServiceDeptID}`);
        }
        
        //delete the Person Master Data
        const user = await prisma.serviceDeptPerson.delete({
            where: {
                DeptPersonID: BigInt(id),
            }
        })
        if(user.UserID){

            const userRole = await prisma.users.update({
                data:{
                    Role: "user",
                },
                where: {
                    UserID: BigInt(user.UserID),
                }
            })
            if(userRole){
                return NextResponse.json({ success: true, message: "Delete Person Master Successfull", data: user ? [user] : [] } as ApiResponse, { status: 200 });
            }else{
                return NextResponse.json({ success: false, message: "Delete Person Master Failed", data: [] }, { status: 400 });
            }
        }else{
            return NextResponse.json({ success: false, message: "Delete Person Master Failed", data: [] }, { status: 400 });
        }
    } catch (e) {
        if(e instanceof PrismaClientKnownRequestError){
            if(e.code === "P2003"){
                return NextResponse.json({ success: false, message: "Personnel is assigned to some request", data: [] }, { status: 409 });
            }
        }
        console.log(`Error in deleting person master ${e}`);
        return NextResponse.json({ success: false, message: "Delete Person Master Failed", data: [] }, { status: 500 });
    }
}