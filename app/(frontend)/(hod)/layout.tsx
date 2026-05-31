"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import AppSidebar from "@/components/AppSidebar";
import { getRole } from "@/lib/cookie";
import { ROLES } from "@/lib/auth";

export default function HODLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [authorized, setAuthorized] = useState(false);

  async function getRoleFromApi(){
    const role = await getRole();
    // HOD can access HOD dashboard
    if (role === ROLES.HOD) {
      setAuthorized(true);
      
    } else {
      const dashboardMap: Record<string, string> = {
        user: "/portal-dashboard",
      };
      router.replace(dashboardMap[role ?? ""] || "/login");
    }
  }
  useEffect(()=>{
    getRoleFromApi();
  },[])

  if (!authorized) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <AppSidebar variant="hod" />
      <main className="ml-64 flex-1">
        <div className="container max-w-7xl p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}