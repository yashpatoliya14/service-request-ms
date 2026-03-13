"use client";

import React, { useEffect, useState } from "react";
import {
  Plus,
  Search,
  Send,
  ChevronRight,
  LayoutGrid,
  Filter,
  Loader2,
  Trash2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  ServiceRequestType?: {
    RequestTypeName: string;
    ServiceDepartment?: { DeptName: string };
  } | null;
  ServiceRequestStatus?: {
    ServiceRequestStatusName: string;
    ServiceRequestStatusCssClass: string;
  } | null;
}

interface ServiceRequestStatus {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  ServiceRequestStatusCssClass: string;
  IsAllowedForTechnician: boolean;
}

interface Department {
  ServiceDeptID: string;
  DeptName: string;
}

interface RequestType {
  ServiceRequestTypeID: string;
  RequestTypeName: string;
  ServiceDeptID: string | null;
  DefaultPriority: number | null;
  IsActive: boolean | null;
}

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  username: string;
}

export default function PortalDashboard() {
  // ---- State ----
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [statuses, setStatuses] = useState<ServiceRequestStatus[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    deptId: "",
    typeId: "",
    subject: "",
    description: "",
    priority: "1",
  });

  // ---- Fetch user info ----
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get<UserInfo[]>("/api/auth/me");
        if (res.success && res.data?.[0]) {
          setUser(res.data[0] as unknown as UserInfo);
        }
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // ---- Fetch departments + request types (for the form) ----
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [deptRes, typeRes, statusRes] = await Promise.all([
          apiClient.get<Department[]>("/api/admin/department"),
          apiClient.get<RequestType[]>("/api/admin/service-request-type"),
          apiClient.get<ServiceRequestStatus[]>("/api/admin/status-master"),
        ]);
        if (deptRes.success) setDepartments(deptRes.data || []);
        if (typeRes.success) setRequestTypes(typeRes.data || []);
        if (statusRes.success) setStatuses(statusRes.data || []);
      } catch (err) {
        console.error("Failed to fetch form data:", err);
      }
    };
    fetchFormData();
  }, []);

  // ---- Fetch user's requests ----
  const fetchRequests = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await apiClient.post<ServiceRequest[][]>("/api/portal/history", {
        RequestorID: user.userId,
      });
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

  useEffect(() => {
    if (user) fetchRequests();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  // ---- Create new request ----
  const handleCreateRequest = async () => {
    if (!formData.typeId || !formData.subject || !user) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/portal/requestor", {
        ServiceRequestTypeID: formData.typeId,
        RequestorID: user.userId,
        Title: formData.subject,
        Description: formData.description,
        Priority: formData.priority,
      });
      if (res.success) {
        setIsModalOpen(false);
        setFormData({ deptId: "", typeId: "", subject: "", description: "", priority: "1" });
        await fetchRequests();
      }
    } catch (err) {
      console.error("Failed to create request:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Delete / Cancel a request ----
  const handleDeleteRequest = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    try {
      const res = await apiClient.delete(`/api/portal/requestor/${id}`);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => String(r.ServiceRequestID) !== String(id)));
      }
    } catch (err) {
      console.error("Failed to delete request:", err);
    }
  };

  // ---- Helpers ----
  const filteredTypes = requestTypes.filter(
    (t) => String(t.ServiceDeptID) === formData.deptId && t.IsActive
  );

  const filteredRequests = requests.filter((r) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      r.Title?.toLowerCase().includes(q) ||
      String(r.ServiceRequestID).includes(q)
    );
  });

  const getStatusLabel = (statusId: string | null) => {
    if (!statusId) return "Pending";
    const id = Number(statusId);
    const status = statuses.find(s => s.ServiceRequestStatusID === id);
    if (status) return status.ServiceRequestStatusName;

    return "Pending";
  };

  const getStatusBadge = (req: ServiceRequest) => {
    return (
      <Badge className={req.ServiceRequestStatus?.ServiceRequestStatusCssClass || "bg-slate-100 text-slate-700 hover:bg-slate-100"}>
        {req.ServiceRequestStatus?.ServiceRequestStatusName || getStatusLabel(req.StatusID)}
      </Badge>
    );
  };

  const pendingCount = requests.filter((r) => getStatusLabel(r.StatusID) === "Pending").length;
  const activeCount = requests.filter((r) => getStatusLabel(r.StatusID) === "In Progress").length;
  const closedCount = requests.filter((r) => getStatusLabel(r.StatusID) === "Completed").length;

  const stats = [
    { label: "Total", count: requests.length, variant: "default" as const },
    { label: "Pending", count: pendingCount, variant: "warning" as const },
    { label: "Active", count: activeCount, variant: "info" as const },
    { label: "Closed", count: closedCount, variant: "success" as const },
  ];

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <LayoutGrid className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Portal Dashboard</h1>
          </div>
          <p className="text-muted-foreground">
            Welcome back, {user?.fullName || "User"}! Raise and track your service requests.
          </p>
        </div>

        {/* Create Request Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Raise New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="text-2xl">New Service Request</DialogTitle>
              <DialogDescription>
                Fill in the details below to submit a new service request.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Service Department</Label>
                  <Select
                    value={formData.deptId}
                    onValueChange={(value) => setFormData({ ...formData, deptId: value, typeId: "" })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Dept..." />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((d) => (
                        <SelectItem key={String(d.ServiceDeptID)} value={String(d.ServiceDeptID)}>
                          {d.DeptName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Request Type</Label>
                  <Select
                    value={formData.typeId}
                    onValueChange={(value) => setFormData({ ...formData, typeId: value })}
                    disabled={!formData.deptId}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choose Type..." />
                    </SelectTrigger>
                    <SelectContent>
                      {filteredTypes.map((t) => (
                        <SelectItem key={String(t.ServiceRequestTypeID)} value={String(t.ServiceRequestTypeID)}>
                          {t.RequestTypeName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Brief Subject</Label>
                <Input
                  placeholder="e.g. Printer not responding in Room 101"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Issue Description</Label>
                <Textarea
                  placeholder="Provide details about the problem..."
                  rows={4}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={formData.priority}
                  onValueChange={(value) => setFormData({ ...formData, priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">Low</SelectItem>
                    <SelectItem value="2">Medium</SelectItem>
                    <SelectItem value="3">High</SelectItem>
                    <SelectItem value="4">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleCreateRequest} className="flex-1 gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit Request"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Discard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {stats.map((stat, i) => (
          <Card key={i}
            className={`transition-all duration-300 hover:shadow-md ${
              stat.variant === "warning" ? "border-amber-200 bg-amber-50/50"
              : stat.variant === "info" ? "border-blue-200 bg-blue-50/50"
              : stat.variant === "success" ? "border-emerald-200 bg-emerald-50/50"
              : ""
            }`}
          >
            <CardContent className="p-6">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">{stat.label}</p>
              <p className={`mt-1 text-3xl font-bold ${
                stat.variant === "warning" ? "text-amber-600"
                : stat.variant === "info" ? "text-blue-600"
                : stat.variant === "success" ? "text-emerald-600"
                : ""
              }`}>
                {loading ? "—" : stat.count}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Request Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <CardTitle>Recent Requests</CardTitle>
            <div className="flex gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title or ID..."
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
              <LayoutGrid className="mb-2 h-10 w-10 opacity-30" />
              <p className="font-medium">No requests found</p>
              <p className="text-sm">Click &quot;Raise New Request&quot; to create one.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Request Details</TableHead>
                  <TableHead className="font-semibold">Type</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={String(req.ServiceRequestID)} className="group">
                    <TableCell>
                      <div className="space-y-1">
                        <Badge variant="outline" className="font-mono text-xs">
                          SR-{String(req.ServiceRequestID)}
                        </Badge>
                        <p className="font-medium">{req.Title}</p>
                        <p className="text-xs text-muted-foreground">
                          Raised on {new Date(req.Created).toLocaleDateString()}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">
                        {req.ServiceRequestType?.RequestTypeName || "—"}
                      </span>
                    </TableCell>
                    <TableCell>{getStatusBadge(req)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        {getStatusLabel(req.StatusID) === "Pending" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleDeleteRequest(String(req.ServiceRequestID))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        <Button asChild size="sm" className="gap-1">
                          <Link href={`/request-details/${req.ServiceRequestID}`}>
                            View
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}