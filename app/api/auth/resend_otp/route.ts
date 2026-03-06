import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendOtpViaEmail } from "@/services/auth";


// User level signup only 
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { Email }: { Email: string } = body;
        console.log(body);
        // Check if user already exists
        const existingUser = await prisma.tempUser.findFirst({
            where: { Email }
        });

        if (!existingUser) {
            return NextResponse.json(
                { success: false, message: "User Not Exists", data: [] },
                { status: 409 }
            );
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        let status: boolean = await sendOtpViaEmail(Email, otp);

        if (status) {
            const user = await prisma.tempUser.update({
                where: {
                    Email
                },
                data: {
                    Otp: otp,
                    OtpExpired: otpExpiry
                }
            });

            return NextResponse.json({
                success: true,
                message: "OTP sent successfully",
                data: [user]
            });
        } else {
            return NextResponse.json({
                success: false,
                message: "Failed to send OTP",
                data: []
            });
        }
    } catch (error: any) {
        console.error("Signup error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", data: [] },
            { status: 500 }
        );
    }
}   