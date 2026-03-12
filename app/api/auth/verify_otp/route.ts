import { generateToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";


interface IVerifyOtpBody {
    Email: string;
    Otp: string;
    isForgotPassword?: boolean;
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { Email, Otp, isForgotPassword }: IVerifyOtpBody = body;

        const tempUser = await prisma.tempUser.findFirst({
            where: {
                Email,
                Otp: Otp,
                OtpExpired: {
                    gte: new Date()
                }
            }
        });

        if (!tempUser) {
            return NextResponse.json({
                success: false,
                message: "Invalid or expired OTP",
                data: []
            });
        }

        // For forgot password flow: just verify OTP and clean up
        if (isForgotPassword) {
            await prisma.tempUser.deleteMany({
                where: { Email }
            });

            return NextResponse.json({
                success: true,
                message: "OTP verified successfully",
                data: []
            });
        }

        // For signup flow: create user from tempUser data
        const newUser = await prisma.users.create({
            data: {
                Email: tempUser.Email || "",
                Password: tempUser.Password,
                FullName: tempUser.FullName,
                Username: tempUser.Username,
                ProfilePhoto: tempUser.ProfilePhoto,
                IsVerified: true,
                Phone: tempUser.Phone,
                Role: tempUser.Role
            }
        });

        await prisma.tempUser.deleteMany({
            where: { Email }
        });

        const token = generateToken({
            userId: newUser.UserID.toString(),
            email: newUser.Email ?? "",
            role: newUser.Role ?? "user"
        });

        return NextResponse.json({
            success: true,
            message: "User verified successfully",
            data: [newUser],
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