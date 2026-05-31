import { prisma } from "@/lib/prisma";
import { generateToken, ROLES, setOptionsForToken } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";

// User level login only 
export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { Email, Password } = body;

        // Find the user by email
        const user = await prisma.users.findFirst({
            where: { Email }
        });

        // Check if user exists
        if (!user) {
            return NextResponse.json(
                { success: false, message: "User Not Found", data: [] },
                { status: 404 }
            );
        }

        // Compare password with hashed password
        // Support both bcrypt hashed passwords and legacy plain-text passwords
        let isPasswordValid = false;

        if (user.Password) {
            // Check if the stored password is a bcrypt hash (starts with $2)
            if (user.Password.startsWith("$2")) {
                isPasswordValid = await bcrypt.compare(Password, user.Password);
            } else {
                // Legacy plain-text comparison (for existing users)
                isPasswordValid = user.Password === Password;
            }
        }

        if (!isPasswordValid) {
            return NextResponse.json(
                { success: false, message: "Incorrect Password", data: [] },
                { status: 401 }
            );
        }

        // Generate JWT token with role information
        const token = generateToken({
            userId: user.UserID.toString(),
            role: (user.Role as ROLES) || ROLES.USER,
        });

        // Create response with token
        const response = NextResponse.json({
            success: true,
            message: "Login Successful",
            data: [{
                Email: user.Email,
                FullName: user.FullName,
                Username: user.Username,
                IsVerified: user.IsVerified,
                Role: user.Role
            }],
            token
        }, { status: 200 });

        setOptionsForToken(token,response);
        return response;
    } catch (error: any) {
        console.error("Login error:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error", data: [] },
            { status: 500 }
        );
    }
}