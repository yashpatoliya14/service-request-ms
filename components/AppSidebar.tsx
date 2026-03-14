"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    LayoutDashboard,
    Building2,
    UserCog,
    ListTree,
    Settings2,
    Fingerprint,
    Map,
    LogOut,
    Zap,
    Briefcase,
    History,
    Users,
    BarChart3,
    ChevronRight,
    Sparkles,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { apiClient } from "@/lib/apiClient";
import { getCookie } from "@/lib/cookie";

interface NavItem {
    name: string;
    icon: React.ReactNode;
    href: string;
}

interface SidebarProps {
    variant: "admin" | "portal" | "hod";
}

interface UserInfo {
    userId: string;
    email: string;
    role: string;
    fullName: string;
    username: string;
}

const sidebarConfigs = {
    admin: {
        title: "Admin",
        subtitle: "OS",
        icon: <Sparkles className="h-5 w-5" />,
        menuLabel: "Core Masters",
        items: [
            { name: "Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/admin-dashboard" },
            { name: "Departments", icon: <Building2 className="h-4 w-4" />, href: "/dept-master" },
            { name: "Personnel", icon: <UserCog className="h-4 w-4" />, href: "/dept-person" },
            { name: "Request Types", icon: <ListTree className="h-4 w-4" />, href: "/request-type" },
            { name: "Service Types", icon: <Settings2 className="h-4 w-4" />, href: "/service-type" },
            { name: "Status Master", icon: <Fingerprint className="h-4 w-4" />, href: "/status-master" },
            { name: "Type Mapping", icon: <Map className="h-4 w-4" />, href: "/type-mapping" },
        ],
    },
    portal: {
        title: "Service",
        subtitle: "OS",
        icon: <Zap className="h-5 w-5" />,
        menuLabel: "Navigation",
        items: [
            { name: "Operations Hub", icon: <Zap className="h-4 w-4" />, href: "/portal-dashboard" },
            { name: "Technician View", icon: <Briefcase className="h-4 w-4" />, href: "/technician" },
            { name: "Request Details", icon: <History className="h-4 w-4" />, href: "/request-details" },
        ],
    },
    hod: {
        title: "Dept",
        subtitle: "Manager",
        icon: <BarChart3 className="h-5 w-5" />,
        menuLabel: "Management",
        items: [
            { name: "Department Dashboard", icon: <LayoutDashboard className="h-4 w-4" />, href: "/hod-dashboard" },
        ],
    },
};

export default function AppSidebar({ variant }: SidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const config = sidebarConfigs[variant];
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const userRole = getCookie("user_role")?.toLowerCase() || null;
        setRole(userRole);
    }, []);

    // Filter items based on role — only technicians see "Technician View"
    const filteredItems = variant === "portal"
        ? config.items.filter((item) => {
            if (item.href === "/technician") return role === "technician";
            return true;
        })
        : config.items;

    const [user, setUser] = useState<UserInfo | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    // Fetch user info on mount
    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await apiClient.get<UserInfo[]>("/api/auth/me");
                if (res.success && res.data?.[0]) {
                    setUser(res.data[0] as unknown as UserInfo);
                }
            } catch (err) {
                console.error("Failed to fetch user info:", err);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = async () => {
        try {
            setLoggingOut(true);
            await apiClient.post("/api/auth/logout");
        } catch (err) {
            console.error("Logout error:", err);
        } finally {
            // Clear client cookie as fallback and redirect
            document.cookie = "user_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;";
            router.replace("/login");
        }
    };

    // Get user initials from fullName or email
    const getInitials = () => {
        if (user?.fullName) {
            return user.fullName
                .split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase()
                .slice(0, 2);
        }
        if (user?.email) {
            return user.email.charAt(0).toUpperCase();
        }
        return variant === "admin" ? "SA" : variant === "hod" ? "HD" : "US";
    };

    // Get role display label
    const getRoleLabel = () => {
        const role = user?.role?.toLowerCase();
        if (role === "admin") return "Administrator";
        if (role === "hod") return "Department Head";
        return "User";
    };

    return (
        <TooltipProvider delayDuration={0}>
            <aside className="fixed left-0 top-0 z-50 flex h-screen w-64 flex-col overflow-hidden border-r border-sidebar-border bg-sidebar">
                {/* Logo Section */}
                <div className="flex items-center gap-3 px-6 py-6">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/25">
                        {config.icon}
                    </div>
                    <div className="flex flex-col">
                        <span className="text-lg font-bold tracking-tight text-sidebar-foreground">
                            {config.title}
                            <span className="ml-0.5 text-primary">{config.subtitle}</span>
                        </span>
                        <span className="text-[10px] font-medium uppercase tracking-widest text-sidebar-foreground/50">
                            Enterprise Portal
                        </span>
                    </div>
                </div>

                <Separator className="bg-sidebar-border" />

                {/* Navigation */}
                <ScrollArea className="flex-1 min-h-0 px-3 py-4">
                    <div className="mb-4 px-3">
                        <span className="text-[10px] font-semibold uppercase tracking-widest text-sidebar-foreground/40">
                            {config.menuLabel}
                        </span>
                    </div>
                    <nav className="space-y-1">
                        {filteredItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Tooltip key={item.href}>
                                    <TooltipTrigger asChild>
                                        <Link
                                            href={item.href}
                                            className={cn(
                                                "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                                                isActive
                                                    ? "bg-primary text-primary-foreground shadow-md shadow-primary/20"
                                                    : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-foreground"
                                            )}
                                        >
                                            <span
                                                className={cn(
                                                    "flex h-8 w-8 items-center justify-center rounded-lg transition-colors",
                                                    isActive
                                                        ? "bg-primary-foreground/20"
                                                        : "bg-sidebar-accent group-hover:bg-sidebar-foreground/10"
                                                )}
                                            >
                                                {item.icon}
                                            </span>
                                            <span className="flex-1">{item.name}</span>
                                            {isActive && (
                                                <ChevronRight className="h-4 w-4 opacity-60" />
                                            )}
                                        </Link>
                                    </TooltipTrigger>
                                    <TooltipContent side="right" className="font-medium">
                                        {item.name}
                                    </TooltipContent>
                                </Tooltip>
                            );
                        })}
                    </nav>
                </ScrollArea>

                <Separator className="bg-sidebar-border" />

                {/* User Section */}
                <div className="p-3">
                    <div className="mb-2 flex items-center gap-2.5 rounded-xl bg-sidebar-accent/50 px-3 py-2.5">
                        <Avatar className="h-8 w-8 shrink-0 border-2 border-primary/20">
                            <AvatarFallback className="bg-primary/10 text-[10px] font-semibold text-primary">
                                {getInitials()}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <p className="truncate text-sm font-semibold text-sidebar-foreground leading-tight">
                                {user?.fullName || user?.username || "Loading..."}
                            </p>
                            <p className="truncate text-[11px] text-sidebar-foreground/50 leading-tight">
                                {user?.email || "—"} · <span className="font-medium text-primary">{getRoleLabel()}</span>
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleLogout}
                        disabled={loggingOut}
                        className="w-full justify-start gap-2 text-sidebar-foreground/60 hover:bg-destructive/10 hover:text-destructive"
                    >
                        {loggingOut ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                            <LogOut className="h-4 w-4" />
                        )}
                        {loggingOut ? "Signing out..." : "Sign Out"}
                    </Button>
                </div>
            </aside>
        </TooltipProvider>
    );
}
