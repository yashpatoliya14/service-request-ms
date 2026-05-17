"use client";

import React, { useState, useEffect, useCallback } from "react";
import {
  Users,
  Building,
  Layers,
  ShieldCheck,
  Wrench,
  Settings2,
  UserCog,
  FileText,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { apiClient } from "@/lib/apiClient";

interface RequestByStatus {
  statusName: string;
  count: number;
  cssClass: string;
}

interface DashboardStats {
  totalUsers: number;
  totalDepartments: number;
  totalServiceTypes: number;
  totalRequestTypes: number;
  totalPersonnel: number;
  totalRequests: number;
  hodCount: number;
  technicianCount: number;
  activeRequestTypes: number;
  requestsByStatus: RequestByStatus[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await apiClient.get<DashboardStats>("/api/admin/dashboard");
      if (res.success) {
        setStats(res.data ?? null);
      }
    } catch (err) {
      console.error(err);
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  const statCards = [
    {
      label: "Total Users",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      iconBg: "bg-violet-100",
      iconColor: "text-violet-600",
    },
    {
      label: "Departments",
      value: stats?.totalDepartments ?? 0,
      icon: Building,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Service Types",
      value: stats?.totalServiceTypes ?? 0,
      icon: Layers,
      iconBg: "bg-emerald-100",
      iconColor: "text-emerald-600",
    },
    {
      label: "Request Types",
      value: stats?.totalRequestTypes ?? 0,
      subtitle: `${stats?.activeRequestTypes ?? 0} active`,
      icon: Settings2,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
  ];

  const personnelCards = [
    {
      label: "Total Personnel",
      value: stats?.totalPersonnel ?? 0,
      icon: UserCog,
      iconBg: "bg-primary/10",
      iconColor: "text-primary",
    },
    {
      label: "HODs",
      value: stats?.hodCount ?? 0,
      icon: ShieldCheck,
      iconBg: "bg-amber-100",
      iconColor: "text-amber-600",
    },
    {
      label: "Technicians",
      value: stats?.technicianCount ?? 0,
      icon: Wrench,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      label: "Total Requests",
      value: stats?.totalRequests ?? 0,
      icon: FileText,
      iconBg: "bg-rose-100",
      iconColor: "text-rose-600",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight">
          System <span className="text-primary">Overview</span>
        </h1>
        <p className="text-muted-foreground">
          Welcome back, Admin. Here&apos;s your system at a glance.
        </p>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {!loading && stats && (
        <>
          {/* Main Stats */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat, i) => (
              <Card key={i} className="group transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="flex items-center gap-4 p-6">
                  <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                    <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                    <div className="text-2xl font-bold">{stat.value}</div>
                    {stat.subtitle && (
                      <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Personnel & Request Stats */}
          <div>
            <h2 className="mb-4 text-lg font-semibold">Personnel & Requests</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {personnelCards.map((stat, i) => (
                <Card key={i} className="group transition-all duration-300 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent className="flex items-center gap-4 p-6">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${stat.iconBg} transition-transform duration-300 group-hover:scale-110`}>
                      <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.label}</p>
                      <div className="text-2xl font-bold">{stat.value}</div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Requests by Status */}
          {stats.requestsByStatus.length > 0 && (
            <div>
              <h2 className="mb-4 text-lg font-semibold">Requests by Status</h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {stats.requestsByStatus.map((item, i) => (
                  <Card key={i} className="transition-all duration-300 hover:shadow-md">
                    <CardContent className="flex items-center justify-between p-6">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <FileText className="h-5 w-5 text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{item.statusName}</p>
                        </div>
                      </div>
                      <div className="text-2xl font-bold">{item.count}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}