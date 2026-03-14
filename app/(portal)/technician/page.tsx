"use client";

import React, { useEffect, useState } from "react";
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  MessageCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { apiClient } from "@/lib/apiClient";

// ---- Types ----
interface ServiceRequest {
  ServiceRequestID: string;
  Title: string;
  Description: string;
  Priority: string;
  StatusID: string | null;
  Created: string;
  ServiceRequestTypeID: string | null;
  RequestorID: string | null;
  AssignedToID: string | null;
  Users?: { FullName: string } | null;
  ServiceRequestType?: { RequestTypeName: string } | null;
}

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  username: string;
}

interface ServiceRequestStatus {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  IsAllowedForTechnician: boolean;
  ServiceRequestStatusCssClass: string;
}

export default function TechnicianDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [statuses, setStatuses] = useState<ServiceRequestStatus[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  // ---- Fetch user info & statuses ----
  useEffect(() => {
    const fetchUserAndStatuses = async () => {
      try {
        const [userRes, statusRes] = await Promise.all([
          apiClient.get<UserInfo[]>("/api/auth/me"),
          apiClient.get<ServiceRequestStatus[]>("/api/admin/status-master")
        ]);

        if (userRes.success && userRes.data?.[0]) {
          setUser(userRes.data[0] as unknown as UserInfo);
        }

        if (statusRes.success && statusRes.data) {
          setStatuses(statusRes.data);
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      }
    };
    fetchUserAndStatuses();
  }, []);

  // ---- Fetch requests assigned to this technician ----
  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Try fetching by technician's user ID
      const res = await apiClient.get<ServiceRequest[][]>(
        `/api/portal/technician/${user.userId}`
      );
      if (res.success && res.data?.[0]) {
        setRequests(res.data[0]);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch technician requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- Update request status ----
  const handleUpdateStatus = async (requestId: string, newStatusId: string) => {
    setUpdatingId(requestId);
    try {
      const res = await apiClient.patch(`/api/portal/technician/${requestId}`, {
        StatusID: newStatusId,
        ServiceRequestTypeID: requestId,
      });
      if (res.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((r) =>
            String(r.ServiceRequestID) === String(requestId)
              ? { ...r, StatusID: newStatusId }
              : r
          )
        );
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setUpdatingId(null);
    }
  };

  // ---- Helpers ----
  const getStatusLabel = (statusId: string | null) => {
    if (!statusId) return "Pending";
    const id = Number(statusId);
    const status = statuses.find(s => s.ServiceRequestStatusID === id);
    if (status) return status.ServiceRequestStatusName;

    if (id === 1) return "Pending";
    if (id === 2) return "Assigned";
    if (id === 3) return "In Progress";
    if (id === 4) return "Completed";
    return "Pending";
  };

  const getStatusBadge = (statusId: string | null) => {
    const id = Number(statusId);
    const status = statuses.find(s => s.ServiceRequestStatusID === id);

    return (
      <Badge className={status?.ServiceRequestStatusCssClass || "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
        {getStatusLabel(statusId)}
      </Badge>
    );
  };

  const getPriorityLabel = (priority: string | null) => {
    if (!priority) return null;
    const p = Number(priority);
    if (p >= 4) return "Urgent";
    if (p === 3) return "High";
    if (p === 2) return "Medium";
    return "Low";
  };

  // ---- Stats ----
  const stats = [
    {
      label: "Assigned",
      count: requests.length,
      icon: AlertCircle,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "In Progress",
      count: requests.filter((r) => getStatusLabel(r.StatusID) === "In Progress").length,
      icon: Loader2,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-200",
    },
    {
      label: "Completed",
      count: requests.filter((r) => getStatusLabel(r.StatusID) === "Completed").length,
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Wrench className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Technician Workspace</h1>
          </div>
          <p className="text-muted-foreground">
            Manage your assigned service tasks and updates
          </p>
        </div>
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="flex items-center gap-2 px-4 py-2">
            <Clock className="h-4 w-4 text-primary" />
            <span className="text-sm font-semibold">
              {user?.fullName || "Technician"} — Active
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        {stats.map((stat, i) => (
          <Card key={i} className={`${stat.bg} ${stat.border} transition-all duration-300 hover:shadow-md`}>
            <CardContent className="flex items-center gap-4 p-6">
              <div className={`rounded-xl bg-white/80 p-3 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
                <p className={`text-2xl font-bold ${stat.color}`}>
                  {loading ? "—" : `${stat.count} Tasks`}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold">Your Active Tasks</h2>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : requests.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Wrench className="mb-2 h-10 w-10 opacity-30" />
              <p className="font-medium">No tasks assigned</p>
              <p className="text-sm">You have no requests assigned to you at the moment.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {requests.map((task) => {
              const priorityLabel = getPriorityLabel(task.Priority);
              const isUpdating = updatingId === String(task.ServiceRequestID);
              const technicianStatuses = statuses.filter(s => s.IsAllowedForTechnician);

              return (
                <Card key={String(task.ServiceRequestID)} className="group transition-all duration-300 hover:shadow-md">
                  <CardContent className="p-6">
                    <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                      {/* Task Info */}
                      <div className="flex-1 space-y-3">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant="outline" className="font-mono bg-foreground text-background">
                            SR-{String(task.ServiceRequestID)}
                          </Badge>
                          {getStatusBadge(task.StatusID)}
                          {priorityLabel === "Urgent" && (
                            <Badge className="animate-pulse bg-rose-500 text-white hover:bg-rose-500">
                              Urgent
                            </Badge>
                          )}
                          {priorityLabel === "High" && (
                            <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">
                              High Priority
                            </Badge>
                          )}
                        </div>

                        <div>
                          <h3 className="text-xl font-bold">
                            {task.ServiceRequestType?.RequestTypeName || task.Title}
                          </h3>
                          <p className="mt-1 text-muted-foreground">
                            {task.Description || task.Title}
                          </p>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="bg-primary/10 text-xs text-primary">
                                {(task.Users?.FullName || "U")
                                  .split(" ")
                                  .map((n) => n[0])
                                  .join("")}
                              </AvatarFallback>
                            </Avatar>
                            <span>Requested by {task.Users?.FullName || "User"}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            <span>Assigned on {new Date(task.Created).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-3 lg:min-w-[200px] lg:flex-col">
                        <Select
                          disabled={isUpdating}
                          value={String(task.StatusID || "")}
                          onValueChange={(val) => handleUpdateStatus(String(task.ServiceRequestID), val)}
                        >
                          <SelectTrigger className="w-full">
                            {isUpdating ? (
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                <span>Updating...</span>
                              </div>
                            ) : (
                              <SelectValue placeholder="Update Status" />
                            )}
                          </SelectTrigger>
                          <SelectContent>
                            {technicianStatuses.map((s) => (
                              <SelectItem key={s.ServiceRequestStatusID} value={String(s.ServiceRequestStatusID)}>
                                {s.ServiceRequestStatusName}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button asChild variant="outline" className="w-full gap-2 text-primary hover:text-primary">
                          <Link href={`/request-details/${task.ServiceRequestID}`}>
                            <MessageCircle className="h-4 w-4" />
                            Open Chat
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}