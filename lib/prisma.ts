import { PrismaClient } from "@prisma/client";

// Global fix: Make BigInt serializable to JSON (define once, works everywhere)
(BigInt.prototype as any).toJSON = function () {
    return this.toString();
};

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;