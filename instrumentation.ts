const cleanupGlobal = globalThis as typeof globalThis & {
    __tempUserCleanupScheduled?: boolean;
};

export async function register() {
    // Only run cleanup on the server (Node.js runtime), not on Edge
    if (process.env.NEXT_RUNTIME === "nodejs") {
        // Dev HMR can call register() repeatedly; one interval + one prisma pool only
        if (cleanupGlobal.__tempUserCleanupScheduled) {
            return;
        }
        cleanupGlobal.__tempUserCleanupScheduled = true;

        const { cleanupExpiredTempUsers } = await import("@/lib/cleanupTempUsers");

        cleanupExpiredTempUsers();

        const CLEANUP_INTERVAL_MS = 10 * 60 * 1000;
        setInterval(() => {
            cleanupExpiredTempUsers();
        }, CLEANUP_INTERVAL_MS);

        console.log("[Instrumentation] Temp user cleanup scheduled every 10 minutes");
    }
}
