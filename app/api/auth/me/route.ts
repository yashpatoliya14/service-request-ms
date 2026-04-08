import { getDetailsFromToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import { Interface } from "readline";

interface UserProfile {
    UserID: string;
    Email: string;
    Role: string;
    FullName: string;
    Username: string;
    ProfilePhoto?: string;
}


// Get current user details from JWT token
export async function GET(req: NextRequest) {
    const user = getDetailsFromToken(req);

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Not authenticated", data: [] },
            { status: 401 }
        );
    }

    const updateUser = await prisma.users.findUnique({
        where: { UserID: BigInt(user.userId) }
    });

    return NextResponse.json({
        success: true,
        message: "Authenticated",
        data: [{
            UserID: updateUser?.UserID.toString() || "",
            Email: updateUser?.Email || "",
            Role: updateUser?.Role || "",
            FullName: updateUser?.FullName || "",
            Username: updateUser?.Username || "",
            ProfilePhoto: updateUser?.ProfilePhoto || ""
        } as UserProfile]
    }, { status: 200 });
}


export async function POST(req:NextRequest){

    const user = getDetailsFromToken(req);

    if (!user) {
        return NextResponse.json(
            { success: false, message: "Not authenticated", data: [] },
            { status: 401 }
        );
    }

    const body = await req.json();
    const { ProfilePhoto, FullName } = body;
    
    try{
        const updatedUser = await prisma.users.update({
            where: { UserID: BigInt(user.userId) },
            data: { ProfilePhoto, FullName }
        });
        
        return NextResponse.json({
            success: true,
            message: "User profile updated successfully",
            data: [updatedUser]
        }, { status: 200 });
    }catch(e:any){
        return NextResponse.json({
            success: false,
            message: e.message,
            data: []
        }, { status: 500 });
    }

}


