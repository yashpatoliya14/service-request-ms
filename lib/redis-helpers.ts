import { redis } from "@/lib/redis";
import { prisma } from "@/lib/prisma";
import { redisKeys } from "@/lib/redis-keys";

export async function invalidateRequestCache(requestId: number | bigint | string) {
    try {
        const req = await prisma.serviceRequest.findUnique({
            where: { ServiceRequestID: BigInt(requestId) },
            include: {
                ServiceDeptPerson: true
            }
        });
        if (req) {
            const keys = [];
            if (req.ServiceDepartmentID) {
                keys.push(`${redisKeys.hodRequests.key}:${req.ServiceDepartmentID}`);
            }
            if (req.RequestorID) {
                keys.push(`${redisKeys.requestorHistory.key}:${req.RequestorID}`);
            }
            if (req.ServiceDeptPerson?.UserID) {
                keys.push(`${redisKeys.technicianRequests.key}:${req.ServiceDeptPerson.UserID}`);
            }
            keys.push(`${redisKeys.requestorHistory.key}:all`);
            if (keys.length > 0) {
                await Promise.all(keys.map(k => redis.del(k)));
            }
        }
    } catch (e) {
        console.error("Failed to invalidate request cache:", e);
    }
}
