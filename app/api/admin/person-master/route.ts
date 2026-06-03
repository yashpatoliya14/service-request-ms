import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { ApiResponse } from "@/types";
import { redis } from "@/lib/redis";
import { redisKeys } from "@/lib/redis-keys";


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

        const roles = ["admin", "hod", "technician", "user"];
        await Promise.all([
            redis.del(redisKeys.personMaster.key),
            ...roles.map(r => redis.del(`${redisKeys.personMaster.key}:${r}`))
        ]);

        if (ServiceDeptID) {
            await redis.del(`hodTechnicians:${ServiceDeptID}`);
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
        const cacheKey = role ? `${redisKeys.personMaster.key}:${role}` : redisKeys.personMaster.key;

        const redisData = await redis.get(cacheKey);
        if (redisData) {
            const parsed = JSON.parse(redisData);
            console.log("from cached");
            return NextResponse.json({ success: true, message: "Get All Person Masters Successfull", data: parsed ? parsed : [] } as ApiResponse, { status: 200 });
        }

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
            await redis.set(cacheKey, JSON.stringify(users), { 'PX': redisKeys.personMaster.ttl });
            return NextResponse.json({ success: true, message: "Get All Person Masters Successfull", data: users ? users : [] } as ApiResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "Get All Person Master Failed", data: [] }, { status: 400 });
        }
    } catch (e) {

        console.log(`Error in getting all person master ${e}`);
        return NextResponse.json({ success: false, message: "Get All Person Master Failed", data: [] }, { status: 500 });
    }
}
