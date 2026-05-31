import jwt from "jsonwebtoken";
import { NextRequest, NextResponse } from "next/server";
import { JWT_TOKEN_EXPIRY } from "./constant";
import { TokenPayload } from "@/types";

export enum ROLES {
    ADMIN = "admin",
    USER = "user",
    TECHNICIAN = "technician",
    HOD = "hod",
}

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

/**
 * Generates a JWT token for a user
 */
export function generateToken(payload: { userId: string; role: ROLES; }): string {
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_TOKEN_EXPIRY});
}
export function setOptionsForToken(token:string,response:NextResponse){
    // Set the JWT as an httpOnly cookie
    response.cookies.set("auth_token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: "/"
    });
}
/**
 * Verifies a JWT token and returns whether it's valid
 * Returns the decoded payload if valid, null otherwise
 */
export function verifyToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload;
        return decoded;
    } catch {
        return null;
    }
}

/**
 * Extracts the JWT token from request cookies or Authorization header
 * and returns the decoded user details
 */
export function getDetailsFromToken(request: NextRequest): TokenPayload | null {
    try {
        // Try to get token from cookies first
        const cookieToken = request.cookies.get("auth_token")?.value;

        // Fallback to Authorization header
        const authHeader = request.headers.get("authorization");
        const headerToken = authHeader?.startsWith("Bearer ")
            ? authHeader.substring(7)
            : null;

        const token = cookieToken || headerToken;

        if (!token) {
            return null;
        }

        // it verify and send the data 
        return verifyToken(token);
    } catch {
        return null;
    }
}
