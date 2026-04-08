import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Use Sets for faster `has` lookups
const PUBLIC_PATHS = new Set([
    "/", "/login", "/signup", "/verify-otp", "/reset-password", "/new-password",
    "/api/auth/login", "/api/auth/signup", "/api/auth/logout", "/api/auth/verify_otp",
    "/api/auth/send_reset_otp", "/api/auth/reset_password", "/api/auth/resend_otp",
    "/api/auth/is_dept_person",
    "/profile"
]);

const AUTHENTICATED_PATHS = new Set(["/api/auth/me", "/api/auth/logout"]);

// Shared route groups to avoid repetition
const PORTAL_ROUTES = ["/portal-dashboard", "/request-details", "/technician", "/api/portal","/api/chat/:id","/api/chat"];
const ADMIN_READ_ROUTES = ["/api/admin/department", "/api/admin/service-request-type"];

const ROLE_ROUTES: Record<string, string[]> = {
    admin: [
        "/admin-dashboard", "/dept-master", "/dept-person",
        "/department-person-master", "/request-type", "/service-type",
        "/status-master", "/type-mapping", "/request-mapping",
        "/api/admin",
        "/hod-dashboard", "/api/hod",
        "/api/chat",
        ...PORTAL_ROUTES,
    ],
    hod: [
        "/hod-dashboard", "/api/hod",
        "/api/admin/person-master",
        "/api/admin/status-master",
        "/api/chat",
        ...PORTAL_ROUTES,
        ...ADMIN_READ_ROUTES,
    ],
    user: [
        "/api/portal/requestor",
        "/api/admin/status-master",
        "/api/admin/department",
        "/api/admin/service-request-type",
        "/api/chat",
        "/api/chat/:id",
        ...PORTAL_ROUTES,
        ...ADMIN_READ_ROUTES,
    ],
    technician: [
        "/api/admin/status-master", "/api/portal/technician",
        "/api/admin/person-mapping",
        "/api/chat",
        "/api/chat/:id",
        ...PORTAL_ROUTES,
        ...ADMIN_READ_ROUTES,
    ],
};

const ROLE_DASHBOARD: Record<string, string> = {
    admin: "/admin-dashboard",
    hod: "/hod-dashboard",
    user: "/portal-dashboard",
    technician: "/portal-dashboard",
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;
    const isApiRequest = pathname.startsWith("/api/");
    const token = request.cookies.get("auth_token")?.value;

    // Helper to return consistent error responses
    const rejectRequest = (message: string, status: number, redirectUrl: string) => 
        isApiRequest 
            ? NextResponse.json({ success: false, message }, { status }) 
            : NextResponse.redirect(new URL(redirectUrl, request.url));

    // Public paths
    if (PUBLIC_PATHS.has(pathname) || [...PUBLIC_PATHS].some(p => pathname.startsWith(`${p}/`))) {
        if (token && pathname === "/login") {
            try {
                const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
                const dashboard = ROLE_DASHBOARD[(payload.role as string).toLowerCase()] || "/portal-dashboard";
                return NextResponse.redirect(new URL(dashboard, request.url));
            } catch {
                // Invalid token; proceed to login page
            }
        }
        return NextResponse.next();
    }

    if (!token) {
        return rejectRequest("Authentication required", 401, "/login");
    }

    try {
        const { payload } = await jwtVerify(token, new TextEncoder().encode(JWT_SECRET));
        const userRole = (payload.role as string).toLowerCase();

        if (AUTHENTICATED_PATHS.has(pathname) || [...AUTHENTICATED_PATHS].some(p => pathname.startsWith(`${p}/`))) {
            return NextResponse.next();
        }

        const allowedRoutes = ROLE_ROUTES[userRole] || [];
        const hasAccess = allowedRoutes.some(route => pathname.startsWith(route));

        if (!hasAccess) {
            return rejectRequest("Forbidden: Insufficient permissions", 403, ROLE_DASHBOARD[userRole] || "/portal-dashboard");
        }

        const headers = new Headers(request.headers);
        headers.set("x-user-id", payload.userId as string);
        headers.set("x-user-email", payload.email as string);
        headers.set("x-user-role", userRole);
        if (payload.fullName) headers.set("x-user-fullname", payload.fullName as string);

        return NextResponse.next({ request: { headers } });

    } catch {
        const response = isApiRequest 
            ? NextResponse.json({ success: false, message: "Invalid or expired token" }, { status: 401 })
            : NextResponse.redirect(new URL("/login", request.url));
            
        response.cookies.delete("auth_token");
        response.cookies.delete("user_role");
        return response;
    }
}

export const config = {
    matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

