"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { getCookie } from "@/lib/cookie";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarVariant, setSidebarVariant] = useState<"admin" | "portal" | "hod">("portal");

  useEffect(() => {
    const role = getCookie("user_role")?.toLowerCase();
    
    if (!role) {
      router.replace("/login");
      return;
    }

    // Set authorized and determine sidebar variant based on role
    setAuthorized(true);
    
    if (role === "admin") {
      setSidebarVariant("admin");
    } else if (role === "hod") {
      setSidebarVariant("hod");
    } else {
      setSidebarVariant("portal");
    }
  }, [router]);

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar variant={sidebarVariant} />
      <main className="ml-64 flex-1">
        <div className="container max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
