import { prisma } from "@/lib/prisma";
import { generateToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendOtpViaEmail } from "@/services/auth";

interface ISignupBody {
    FullName: string;
    Email: string;
    Phone: number;
    ProfilePhoto: string;
    IsVerified: boolean;
    Password: string;
    Username: string;
    ProfileImageUrl: string;
}

interface ISignupResponse {
    success: boolean;
    message: string;
    data: [{}];
}

// User level signup only 
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { FullName, Email, Phone, ProfilePhoto, Password }: ISignupBody = body;
        // Check if user already exists
        const existingUser = await prisma.users.findFirst({
            where: {  Email }
        });

        if (existingUser) {
            return NextResponse.json(
                { success: false, message: "User already exists with this email", data: [] },
                { status: 409 }
            );
        }

        // Hash the password before storing
        const hashedPassword = await bcrypt.hash(Password, 12);

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

        const status: boolean = await sendOtpViaEmail(Email, otp);

        if (status) {
            const user = await prisma.tempUser.upsert({
                where: { Email },
                update: {
                    Otp: otp,
                    OtpExpired: otpExpiry,
                    Password: hashedPassword,
                    FullName,
                    Username: Email.slice(0, Email.indexOf('@')),
                    ProfilePhoto,
                    IsVerified: false,
                    Phone,
                    Role: "user"
                },
                create: {
                    Email,
                    Otp: otp,
                    OtpExpired: otpExpiry,
                    Password: hashedPassword,
                    FullName,
                    Username: Email.slice(0, Email.indexOf('@')),
                    ProfilePhoto,
                    IsVerified: false,
                    Phone,
                    Role: "user"
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