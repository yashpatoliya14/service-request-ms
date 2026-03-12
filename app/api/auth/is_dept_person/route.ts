import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface IPersonMasterResponse {
    success: boolean;
    message: string;
    data: any[];
}

export async function GET(req: NextRequest) {
    try {
        const email = req.nextUrl.searchParams.get("email");

        if (!email) {
            return NextResponse.json({ success: false, message: "Email is required", data: [] }, { status: 400 });
        }

        const user = await prisma.users.findFirst({
            where: {
                Email: email,
            }
        })

        if (!user) {
            return NextResponse.json({ success: false, message: "User is not dept person", data: [] }, { status: 400 });
        }
        console.log(user);
        if (user.Password !== null && user.Password.trim() !== "") {
            return NextResponse.json({ success: false, message: "User has already set password", data: [] }, { status: 400 });
        }
        const deptPerson = await prisma.serviceDeptPerson.findFirst({
            where: {
                UserID: user.UserID,
                IsActive: true,
            }
        })

        if (deptPerson) {
            return NextResponse.json({ success: true, message: "User is dept person", data: [user] } as IPersonMasterResponse, { status: 200 });
        } else {
            return NextResponse.json({ success: false, message: "User is not dept person", data: [] }, { status: 400 });
        }
    } catch (e) {
        console.log(`Error in getting dept person ${e}`);
        return NextResponse.json({ success: false, message: "Get dept person failed", data: [] }, { status: 500 });
    }
}
