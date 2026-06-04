import { redis } from "@/lib/redis";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
    try {
        const ip = req.headers.get("x-client-ip") || "127.0.0.1";
        const path = req.headers.get("x-request-path") || "";

        // Define rate limits based on path type
        let limit = 60; // 60 requests per minute by default
        let windowSeconds = 60;

        if (path.startsWith("/api/auth/")) {
            // Stricter limit for authentication to prevent brute forcing
            limit = 15;
        } else if (path.startsWith("/api/chat/")) {
            // Moderate limit for chat messages
            limit = 30;
        }

        const key = `ratelimit:${ip}:${path.startsWith("/api/auth/") ? "auth" : "api"}`;
        const now = Date.now();
        const windowStart = now - (windowSeconds * 1000);

        // Redis Sorted Set sliding window transaction
        const multi = redis.multi();
        multi.zRemRangeByScore(key, 0, windowStart);
        multi.zCard(key);
        multi.zAdd(key, { score: now, value: `${now}-${Math.random()}` });
        multi.expire(key, windowSeconds);

        const results = await multi.exec();
        
        // ZCard returns the number of elements in the set prior to addition
        const requestCount = results && results[1] ? Number(results[1]) : 0;
        const allowed = requestCount < limit;

        return NextResponse.json({
            success: true,
            allowed,
            limit,
            remaining: Math.max(0, limit - requestCount),
            reset: Math.ceil((windowStart + (windowSeconds * 1000) - now) / 1000)
        });
    } catch (error) {
        console.error("Rate limiter database error:", error);
        // Fail-open: if Redis encounters an error or is unreachable, allow traffic
        return NextResponse.json({
            success: false,
            allowed: true,
            limit: 60,
            remaining: 60,
            reset: 60
        });
    }
}
