import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-jwt-key-change-in-production";

// Pages that don't require authentication
const PUBLIC_PATHS = [
    "/",
    "/login",
    "/signup",
    "/verify-otp",
    "/reset-password",
    "/new-password",
    "/api/auth/login",
    "/api/auth/signup",
    "/api/auth/logout",
    "/api/auth/verify_otp",
    "/api/auth/send_reset_otp",
    "/api/auth/reset_password",
    "/api/auth/resend_otp",
    "/api/auth/is_dept_person",
];
// Routes accessible to ALL authenticated users (no role check needed)
const AUTHENTICATED_PATHS = [
    "/api/auth/me",
    "/api/auth/logout",
];

// Which routes each role can access
const ROLE_ROUTES: Record<string, string[]> = {
    admin: [
        "/admin-dashboard", "/dept-master", "/dept-person",
        "/department-person-master", "/request-type", "/service-type",
        "/status-master", "/type-mapping", "/request-mapping",
        "/api/admin",
        // Admin can also access HOD and portal routes
        "/hod-dashboard", "/api/hod",
        "/portal-dashboard", "/request-details", "/technician", "/api/portal",
    ],
    hod: [
        "/hod-dashboard", "/api/hod",
        // HOD can also access portal routes
        "/portal-dashboard", "/request-details", "/technician", "/api/portal",
        // Allow reading departments, request types & personnel for forms
        "/api/admin/department", "/api/admin/service-request-type", "/api/admin/person-master",
    ],
    user: [
        "/portal-dashboard", "/request-details", "/api/portal",
        // Allow reading departments & request types for forms
        "/api/admin/department", "/api/admin/service-request-type",
    ],
    technician: [
        "/portal-dashboard", "/request-details", "/technician", "/api/portal",
        // Allow reading departments & request types for forms
        "/api/admin/department", "/api/admin/service-request-type",
    ],
};

// Default dashboard for each role
const ROLE_DASHBOARD: Record<string, string> = {
    admin: "/admin-dashboard",
    hod: "/hod-dashboard",
    user: "/portal-dashboard",
    technician: "/portal-dashboard",
};

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip static assets
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/favicon") ||
        pathname.includes(".")
    ) {
        return NextResponse.next();
    }

    // Public paths — allow through (but redirect logged-in users away from /login)
    if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
        const token = request.cookies.get("auth_token")?.value;
        if (token && pathname === "/login") {
            try {
                const secret = new TextEncoder().encode(JWT_SECRET);
                const { payload } = await jwtVerify(token, secret);
                const role = (payload.role as string).toLowerCase();
                const dashboard = ROLE_DASHBOARD[role] || "/portal-dashboard";
                return NextResponse.redirect(new URL(dashboard, request.url));
            } catch {
                // Token invalid, let them stay on login
            }
        }
        return NextResponse.next();
    }

    // Protected paths — require auth token
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
        const userRole = (payload.role as string).toLowerCase();

        // Allow authenticated-only routes (no role check needed)
        if (AUTHENTICATED_PATHS.some((p) => pathname.startsWith(p))) {
            return NextResponse.next();
        }

        // Check role-based access
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
                // Redirect to user's own dashboard
                const dashboard = ROLE_DASHBOARD[userRole] || "/portal-dashboard";
                return NextResponse.redirect(new URL(dashboard, request.url));
            }
        }

        // Attach user info to request headers for downstream use
        const requestHeaders = new Headers(request.headers);
        requestHeaders.set("x-user-id", payload.userId as string);
        requestHeaders.set("x-user-email", payload.email as string);
        requestHeaders.set("x-user-role", userRole);
        if (payload.fullName) requestHeaders.set("x-user-fullname", payload.fullName as string);

        return NextResponse.next({
            request: { headers: requestHeaders },
        });
    } catch {
        // Token invalid or expired — clear cookies and redirect
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

export const config = {
    matcher: [
        "/((?!_next/static|_next/image|favicon.ico).*)",
    ],
};
