import { PrismaClient } from "@prisma/client";

// Global fix: Make BigInt serializable to JSON (define once, works everywhere)
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

/**
 * Normalize URL for Supabase + Prisma: small pool, SSL, longer connect timeout.
 * If the host is unreachable, check: Supabase project not paused, firewall/VPN,
 * and that NEXT_DATABASE_URL matches Project Settings → Database (pooler).
 */
function normalizeDatabaseUrl(rawUrl: string): string {
    try {
        const u = new URL(rawUrl);
        if (!u.searchParams.has("connection_limit")) {
            u.searchParams.set(
                "connection_limit",
                process.env.PRISMA_CONNECTION_LIMIT ?? "1"
            );
        }
        if (!u.searchParams.has("connect_timeout")) {
            u.searchParams.set("connect_timeout", "60");
        }
        const host = u.hostname.toLowerCase();
        if (
            (host.includes("supabase") || host.includes("pooler")) &&
            !u.searchParams.has("sslmode")
        ) {
            u.searchParams.set("sslmode", "require");
        }
        return u.toString();
    } catch {
        return rawUrl;
    }
}

const prismaClientOptions: ConstructorParameters<typeof PrismaClient>[0] = {
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
};

const dbUrl = process.env.NEXT_DATABASE_URL;
if (dbUrl) {
    prismaClientOptions.datasources = {
        db: { url: normalizeDatabaseUrl(dbUrl) },
    };
}

/**
 * Single shared client for the whole Node process.
 * In dev, Turbopack/HMR can re-evaluate modules; without a global singleton each
 * reload opens a new connection pool and quickly hits Supabase limits.
 */
export const prisma =
    globalForPrisma.prisma ?? new PrismaClient(prismaClientOptions);

globalForPrisma.prisma = prisma;