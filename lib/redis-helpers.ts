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
            const keys: string[] = [];
            if (req.ServiceDepartmentID) {
                keys.push(`${redisKeys.hodRequests.key}:${req.ServiceDepartmentID}`);
            }
            if (req.ServiceDeptPerson?.UserID) {
                keys.push(`${redisKeys.technicianRequests.key}:${req.ServiceDeptPerson.UserID}`);
            }
            keys.push(`${redisKeys.requestorHistory.key}:all`);
            
            // Delete static keys
            if (keys.length > 0) {
                await Promise.all(keys.map(k => redis.del(k)));
            }

            // Dynamically scan and delete all parameterized requestor history keys
            if (req.RequestorID) {
                const pattern = `${redisKeys.requestorHistory.key}:${req.RequestorID}*`;
                for await (const key of redis.scanIterator({ MATCH: pattern })) {
                    await redis.del(key);
                }
            }
        }
    } catch (e) {
        console.error("Failed to invalidate request cache:", e);
    }
}
