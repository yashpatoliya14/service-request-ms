"use client";

import React, { useEffect, useState } from "react";
import {
  Users,
  UserCheck,
  Clock,
  UserPlus,
  Search,
  Filter,
  AlertCircle,
  CheckCircle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { apiClient } from "@/lib/apiClient";
import Link from "next/link";

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
  ServiceRequestStatus?: { ServiceRequestStatusName: string; ServiceRequestStatusCssClass: string } | null;
}

interface DeptPerson {
  DeptPersonID: string;
  ServiceDeptID: string | null;
  UserID: string | null;
  IsActive: boolean | null;
  Users?: { FullName: string; Email: string; Role: string } | null;
  ServiceDepartment?: { DeptName: string } | null;
}

interface Status {
  StatusID: string;
  StatusName: string;
  ServiceRequestStatusCssClass: string;
}

export default function HODDashboard() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [technicians, setTechnicians] = useState<DeptPerson[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const [status, setStatus] = useState<Status[]>([]);

  // ---- Fetch all requests ----
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ServiceRequest[][]>("/api/hod");
      if (res.success && res.data?.[0]) {
        setRequests(res.data[0]);
      } else {
        setRequests([]);
      }
    } catch (err) {
      console.error("Failed to fetch requests:", err);
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatus = async () => {
    try {
      const res = await apiClient.get<Status[]>("/api/admin/service-status");
      if (res.success && res.data) {
        setStatus(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
    }
  };

  // ---- Fetch all personnel (technicians) ----
  const fetchTechnicians = async () => {
    try {
      const res = await apiClient.get<DeptPerson[]>("/api/admin/person-master");
      if (res.success && res.data) {
        setTechnicians(res.data);
      }
    } catch (err) {
      console.error("Failed to fetch technicians:", err);
    }
  };

  useEffect(() => {
    fetchRequests();
    fetchTechnicians();
    fetchStatus();
  }, []);

  // ---- Assign technician to request ----
  const handleAssign = async (deptPersonId: string) => {
    if (!selectedRequest) return;
    setAssigning(true);
    try {
      const res = await apiClient.post("/api/hod", {
        ServiceRequestID: selectedRequest.ServiceRequestID,
        AssignedToID: deptPersonId,
      });
      if (res.success) {
        // Update local state
        setRequests((prev) =>
          prev.map((req) =>
            String(req.ServiceRequestID) === String(selectedRequest.ServiceRequestID)
              ? { ...req, AssignedToID: deptPersonId }
              : req
          )
        );

        
        setIsAssignModalOpen(false);
        setSelectedRequest(null);
      }
    } catch (err) {
      console.error("Failed to assign technician:", err);
    } finally {
      setAssigning(false);
    }
  };

  // ---- Helpers ----
  const getStatusLabel = (statusId: string | null) => {
    if (!statusId) return "Pending";
    const id = Number(statusId);
    if (status.find((s) => String(s.StatusID) === String(id))) {
      return status.find((s) => String(s.StatusID) === String(id))?.StatusName;
    }
    return "Pending";
  };

  const getPriorityLabel = (priority: string | null) => {
    if (!priority) return "Low";
    const p = Number(priority);
    if (p >= 4) return "Urgent";
    if (p === 3) return "High";
    if (p === 2) return "Medium";
    return "Low";
  };

  const isUnassigned = (req: ServiceRequest) => !req.AssignedToID;

  const getTechName = (assignedToId: string | null) => {
    if (!assignedToId) return null;
    const tech = technicians.find((t) => String(t.DeptPersonID) === String(assignedToId));
    return tech?.Users?.FullName || "Assigned";
  };

  // Filter by search
  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.Title?.toLowerCase().includes(q) ||
      String(r.ServiceRequestID).includes(q) ||
      r.Users?.FullName?.toLowerCase().includes(q)
    );
  });

  // Stats
  const unassignedCount = requests.filter((r) => isUnassigned(r)).length;
  const assignedCount = requests.filter((r) => !isUnassigned(r) && getStatusLabel(r.StatusID) !== "Completed").length;
  const completedCount = requests.filter((r) => getStatusLabel(r.StatusID) === "Completed").length;

  const stats = [
    {
      label: "Unassigned",
      count: unassignedCount,
      icon: AlertCircle,
      color: "text-rose-600",
      bg: "bg-rose-50",
      border: "border-rose-200",
    },
    {
      label: "In Progress",
      count: assignedCount,
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    {
      label: "Completed",
      count: completedCount,
      icon: CheckCircle,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
    {
      label: "Technicians",
      count: technicians.length,
      icon: UserCheck,
      color: "text-violet-600",
      bg: "bg-violet-50",
      border: "border-violet-200",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Users className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">HOD Control Center</h1>
          </div>
          <p className="text-muted-foreground">
            Manage department requests and assign technicians
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i} className={`${stat.bg} ${stat.border} transition-all duration-300 hover:shadow-md`}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  {stat.label}
                </p>
                <p className={`text-3xl font-bold ${stat.color}`}>
                  {loading ? "—" : stat.count}
                </p>
              </div>
              <div className={`rounded-2xl bg-white/80 p-4 ${stat.color}`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>All Service Requests</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, ID, or requester..."
                  className="w-64 pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : filteredRequests.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <Users className="mb-2 h-10 w-10 opacity-30" />
              <p className="font-medium">No requests found</p>
              <p className="text-sm">No service requests to display.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Issue Details</TableHead>
                  <TableHead className="font-semibold">Requester</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold">Assigned Tech</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => {
                  const techName = getTechName(req.AssignedToID);
                  const priority = getPriorityLabel(req.Priority);
                  const status = getStatusLabel(req.StatusID);
                  return (
                    <TableRow key={String(req.ServiceRequestID)} className="group">
                      <TableCell>
                        <div className="space-y-1">
                          <Badge variant="outline" className="font-mono text-xs">
                            SR-{String(req.ServiceRequestID)}
                          </Badge>
                          <p className="font-medium">{req.Title}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(req.Created).toLocaleDateString()}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-muted-foreground">
                        {req.Users?.FullName || "—"}
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={
                            priority === "Urgent"
                              ? "bg-rose-500 text-white hover:bg-rose-500"
                              : priority === "High"
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                              : priority === "Medium"
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                          }
                        >
                          {priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge
                          className={req.ServiceRequestStatus?.ServiceRequestStatusCssClass || "bg-slate-100 text-slate-700 hover:bg-slate-100"}
                        >
                          {req.ServiceRequestStatus?.ServiceRequestStatusName}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {techName ? (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <CheckCircle className="h-4 w-4" />
                            <span className="font-medium">{techName}</span>
                          </div>
                        ) : (
                          <span className="italic text-muted-foreground">Not Assigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {isUnassigned(req) ? (
                          <Button
                            size="sm"
                            className="gap-1"
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsAssignModalOpen(true);
                            }}
                          >
                            <UserPlus className="h-3 w-3" />
                            Assign
                          </Button>
                        ) : (
                          <Button asChild variant="ghost" size="icon" className="opacity-50 group-hover:opacity-100">
                            <Link href={`/request-details/${req.ServiceRequestID}`}>
                              <ArrowUpRight className="h-4 w-4" />
                            </Link>
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Assignment Modal */}
      <Dialog open={isAssignModalOpen} onOpenChange={setIsAssignModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Assign Technician</DialogTitle>
            <DialogDescription>
              Ticket:{" "}
              <span className="font-mono font-semibold">
                SR-{selectedRequest ? String(selectedRequest.ServiceRequestID) : ""}
              </span>
              {" — "}
              {selectedRequest?.Title}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Select Expert
            </p>
            {technicians.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center">
                No technicians available.
              </p>
            ) : (
              technicians.map((tech) => (
                <button
                  key={String(tech.DeptPersonID)}
                  onClick={() => handleAssign(String(tech.DeptPersonID))}
                  disabled={assigning}
                  className="group flex w-full items-center justify-between rounded-xl border bg-muted/30 p-4 transition-all hover:border-primary hover:bg-primary/5 hover:shadow-md disabled:opacity-50"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-12 w-12 border-2 border-primary/10 transition-colors group-hover:border-primary/30">
                      <AvatarFallback className="bg-primary/10 font-semibold text-primary group-hover:bg-primary group-hover:text-primary-foreground">
                        {(tech.Users?.FullName || "T").charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="text-left">
                      <p className="font-semibold">{tech.Users?.FullName || "Unknown"}</p>
                      <p className="text-xs text-muted-foreground">
                        {tech.ServiceDepartment?.DeptName || "No Department"} • {tech.Users?.Role || "Technician"}
                      </p>
                    </div>
                  </div>
                  {assigning ? (
                    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                  ) : (
                    <UserPlus className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-primary" />
                  )}
                </button>
              ))
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}