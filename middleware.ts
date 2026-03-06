import { NextRequest, NextResponse } from "next/server";
// import { jwtVerify } from "jose";

// ============================================================
// ⚠️  AUTH TEMPORARILY DISABLED — remove this block and
//     uncomment the original middleware to re-enable auth.
// ============================================================

export async function middleware(request: NextRequest) {
    // All requests pass through without any auth checks
    return NextResponse.next();
}

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};

// ============================================================
// ORIGINAL MIDDLEWARE (preserved for easy restoration)
// ============================================================
/*
const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

const PUBLIC_PATHS = ["/", "/login", "/api/auth/login", "/api/auth/signup", "/api/auth/logout"];

const ROLE_ROUTES: Record<string, string[]> = {
    ADMIN: ["/admin-dashboard", "/dept-master", "/dept-person", "/department-person-master", "/request-type", "/service-type", "/status-master", "/type-mapping", "/request-mapping", "/api/admin"],
    HOD: ["/hod-dashboard", "/api/hod"],
    User: ["/portal-dashboard", "/request-details", "/technician", "/api/portal"],
    Normal: ["/portal-dashboard", "/request-details", "/technician", "/api/portal"],
};

const ROLE_DASHBOARD: Record<string, string> = {
    ADMIN: "/admin-dashboard",
    HOD: "/hod-dashboard",
    User: "/portal-dashboard",
    Normal: "/portal-dashboard",
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
        const token = request.cookies.get("auth_token")?.value;
        if (token && pathname === "/login") {
            try {
                const secret = new TextEncoder().encode(JWT_SECRET);
                const { payload } = await jwtVerify(token, secret);
                const role = payload.role as string;
                const dashboard = ROLE_DASHBOARD[role] || "/portal-dashboard";
                return NextResponse.redirect(new URL(dashboard, request.url));
            } catch {
            }
        }
        return NextResponse.next();
    }

    const token = request.cookies.get("auth_token")?.value;

    if (!token) {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { success: false, message: "Authentication required" },
                { status: 401 }
            );
        }
        return NextResponse.redirect(new URL("/login", request.url));
    }

    try {
        const secret = new TextEncoder().encode(JWT_SECRET);
        const { payload } = await jwtVerify(token, secret);
        const userRole = payload.role as string;

        const allowedRoutes = ROLE_ROUTES[userRole];

        if (allowedRoutes) {
            const hasAccess = allowedRoutes.some((route) => pathname.startsWith(route));

            if (!hasAccess) {
                if (pathname.startsWith("/api/")) {
                    return NextResponse.json(
                        { success: false, message: "Forbidden: Insufficient permissions" },
                        { status: 403 }
                    );
                }
                const dashboard = ROLE_DASHBOARD[userRole] || "/portal-dashboard";
                return NextResponse.redirect(new URL(dashboard, request.url));
            }
        }

        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", payload.userId as string);
        requestHeaders.set("x-user-email", payload.email as string);
        requestHeaders.set("x-user-role", payload.role as string);
        requestHeaders.set("x-user-fullname", payload.fullName as string);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    } catch {
        if (pathname.startsWith("/api/")) {
            return NextResponse.json(
                { success: false, message: "Invalid or expired token" },
                { status: 401 }
            );
        }

        const response = NextResponse.redirect(new URL("/login", request.url));
        response.cookies.set("auth_token", "", { maxAge: 0, path: "/" });
        response.cookies.set("user_role", "", { maxAge: 0, path: "/" });
        return response;
    }
}
*/

