import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
//types

interface IPersonMasterBody {
    FullName: string;
    Email: string;
    Phone: number;
    Department: string;
    ProfilePhoto: string;
    IsVerified: boolean;
    Username: string;
    Role: string;
    Password: string;

}

interface IPersonMasterResponse {
    success: boolean;
    message: string;
    data: any[];
}
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
            return NextResponse.json({ success: true, message: "Get Person Master Successfull", data: user ? [user] : [] } as IPersonMasterResponse, { status: 200 });
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
        const { ServiceDeptID, Role,FullName,Email,Phone } = body;
        
        
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
                    FullName: FullName,
                    Email: Email,
                    Phone: Phone,
                },
                where: {
                    UserID: BigInt(user.UserID),
                }
            })
                return NextResponse.json({ success: true, message: "Update Person Master Successfull", data: user ? [user] : [] } as IPersonMasterResponse, { status: 200 });
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

        
        //delete the Person Master Data
        const user = await prisma.serviceDeptPerson.delete({
            where: {
                DeptPersonID: BigInt(id),
            }
        })
        if(user.UserID){

            const userRole = await prisma.users.update({
                data:{
                    Role: "User",
                },
                where: {
                    UserID: BigInt(user.UserID),
                }
            })
            if(userRole){
                return NextResponse.json({ success: true, message: "Delete Person Master Successfull", data: user ? [user] : [] } as IPersonMasterResponse, { status: 200 });
            }else{
                return NextResponse.json({ success: false, message: "Delete Person Master Failed", data: [] }, { status: 400 });
            }
        }else{
            return NextResponse.json({ success: false, message: "Delete Person Master Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in deleting person master ${e}`);
        return NextResponse.json({ success: false, message: "Delete Person Master Failed", data: [] }, { status: 500 });
    }
}