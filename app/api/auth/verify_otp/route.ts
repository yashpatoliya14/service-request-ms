import { generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


interface IVerifyOtpBody {
    Email: string;
    Otp: number;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { Email, Otp }: IVerifyOtpBody = body;

        let user = await prisma.tempUser.findFirst({
            where: {
                Email,
                Otp: Otp,
                OtpExpired: {
                    gte: new Date()
                }
            }
        });

        if (!user) {
            return NextResponse.json({
                success: false,
                message: "Invalid OTP",
                data: []
            });
        }


        user = await prisma.users.create({
            data: {
                Email: user.Email,
                Password: user.Password,
                FullName: user.FullName,
                Username: user.Username,
                ProfilePhoto: user.ProfilePhoto,
                IsVerified: user.IsVerified,
                Phone: user.Phone,
                Role: user.Role
            }
        });

        await prisma.tempUser.deleteMany({
            where: {
                Email
            }
        });

        const token = generateToken(user.id, user.email, user.role);

        return NextResponse.json({
            success: true,
            message: "User verified successfully",
            data: [user],
            token: token
        });


    } catch (error) {
        return NextResponse.json({
            success: false,
            message: "Internal server error " + error,
            data: []
        }, { status: 500 });
    }
}