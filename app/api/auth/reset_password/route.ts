import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { IResetPasswordBody } from "@/types";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { Email, Password }: IResetPasswordBody = body;

        const user = await prisma.users.findFirst({
            where: { Email }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "User not found",
                data: []
            }, { status: 404 });
        }

        // Hash the new password before storing
        const hashedPassword = await bcrypt.hash(Password, 12);

        await prisma.users.update({
            where: {
                UserID: user.UserID
            },
            data: {
                Password: hashedPassword
            }
        });

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
            data: []
        });
    } catch (error) {
        console.error("Reset password error:", error);
        return NextResponse.json({
            success: false,
            message: "Internal server error",
            data: []
        }, { status: 500 });
    }
}