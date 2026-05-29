import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";


// Create Person Master  
export async function POST(req: NextRequest) {
    try {

        const body = await req.json();
        const { FullName, Email, Phone, Role, ServiceDeptID,Password } = body;

        let user = await prisma.users.findFirst({
            where: {
                Email: Email,
            }
        })
        
        if(!user){
            //create a user
            user = await prisma.users.create({
                data: {
                    FullName,
                    Email,
                    Username: Email.substring(0, Email.indexOf("@")),
                    Phone,
                    IsVerified: true,
                    Role: Role,
                    Password: bcrypt.hashSync(Password, 10),
                }
            })
            if(!user){
                return NextResponse.json({ success: false, message: "User Creation Failed", data: [] } as ApiResponse, { status: 400 });
            }
        }

        //create a person master
        const personMaster = await prisma.serviceDeptPerson.create({
            data: {
                ServiceDeptID: ServiceDeptID ? BigInt(ServiceDeptID) : null,
                UserID: user.UserID,
                IsActive: true,
            }
        })

        if (personMaster) {
            return NextResponse.json({ success: true, message: "Person Master Created Successfull", data: [personMaster] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Person Master Creation Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in creating person master ${e}`);
        return NextResponse.json({ success: false, message: "Person Master creation failed", data: [] }, { status: 500 });
    }
}

// get all Person master
export async function GET(req: NextRequest) {
    try {
        const role = req.nextUrl.searchParams.get("role");

        //get the Persons Master Data
        const users = await prisma.serviceDeptPerson.findMany({
            include: {
                ServiceDepartment: true,
                Users:true,

            },
            where: {
                IsActive: true,
                ...(role && {
                    Users: {
                        Role: role
                    }
                })
            }
        })
        console.log(users);
        
        if (users) {
            return NextResponse.json({ success: true, message: "Get All Person Masters Successfull", data: users ? users : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Person Master Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all person master ${e}`);
        return NextResponse.json({ success: false, message: "Get All Person Master Failed", data: [] }, { status: 500 });
    }
}
