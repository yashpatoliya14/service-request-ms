"use client";

import React, { useEffect, useState } from "react";
import { Plus, Trash2, Send, ChevronRight, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
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
import { getStatusLabel, getStatusBadge } from "@/lib/statusServices";

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
    IsTerminal?: boolean | null;
    IsDefault?: boolean | null;
  } | null;
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

interface ServiceRequestStatus {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  ServiceRequestStatusCssClass: string;
  IsDefault?: boolean | null;
  IsTerminal?: boolean | null;
  Sequence: number;
}

interface UserInfo {
  userId: string;
  email: string;
  role: string;
  fullName: string;
  username: string;
}

export default function UserRequestPortal() {
  // ---- State ----
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [user, setUser] = useState<UserInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [statuses, setStatuses] = useState<ServiceRequestStatus[]>([]);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  const [formData, setFormData] = useState({
    deptId: "",
    typeId: "",
    subject: "",
    description: "",
    priority: "1",
  });

  // ---- Fetch user ----
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await apiClient.get<UserInfo[]>("/api/auth/me");
        if (res.success && res.data?.[0]) setUser(res.data[0] as unknown as UserInfo);
      } catch (err) {
        console.error("Failed to fetch user:", err);
      }
    };
    fetchUser();
  }, []);

  // ---- Fetch statuses ----
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await apiClient.get<ServiceRequestStatus[]>("/api/admin/status-master");
        if (res.success) setStatuses(res.data || []);
      } catch (err) {
        console.error("Failed to fetch statuses:", err);
      }
    };
    fetchStatuses();
  }, []);

  // ---- Fetch departments + request types ----
  useEffect(() => {
    const fetchFormData = async () => {
      try {
        const [deptRes, typeRes] = await Promise.all([
          apiClient.get<Department[]>("/api/admin/department"),
          apiClient.get<RequestType[]>("/api/admin/service-request-type"),
        ]);
        if (deptRes.success) setDepartments(deptRes.data || []);
        if (typeRes.success) setRequestTypes(typeRes.data || []);
      } catch (err) {
        console.error("Failed to fetch form data:", err);
      }
    };
    fetchFormData();
  }, []);

  // ---- Fetch user's requests ----
  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<ServiceRequest[][]>("/api/portal/history");
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
    fetchRequests();
  }, []);

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

  // ---- Cancel / Delete a request ----
  const handleCancelRequest = async (id: string) => {
    if (!confirm("Are you sure you want to cancel this request?")) return;
    try {
      const res = await apiClient.delete(`/api/portal/requestor/${id}`);
      if (res.success) {
        setRequests((prev) => prev.filter((r) => String(r.ServiceRequestID) !== String(id)));
      }
    } catch (err) {
      console.error("Failed to cancel request:", err);
    }
  };

  // ---- Helpers ----
  const filteredTypes = requestTypes.filter(
    (t) => String(t.ServiceDeptID) === formData.deptId && t.IsActive
  );



  // ---- Filter Logic ----
  const filteredRequests = requests.filter((req) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      req.Title?.toLowerCase().includes(query) ||
      String(req.ServiceRequestID).includes(query);

    // 2. Status Filter
    const matchesStatus =
      statusFilter === "all" ||
      getStatusLabel(req.StatusID, statuses) === statusFilter;

    // 3. Department Filter
    const matchesDept = 
      deptFilter === "all" ||
      req.ServiceRequestType?.ServiceDepartment?.DeptName === deptFilter;

    return matchesSearch && matchesStatus && matchesDept;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <FileText className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">My Requests</h1>
          </div>
          <p className="text-muted-foreground">Track and manage your support tickets</p>
        </div>

        {/* Create Request Dialog */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              New Request
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
             <DialogHeader>
              <DialogTitle>Submit New Request</DialogTitle>
              <DialogDescription>Fill in the details to create a new support ticket.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Select Department</Label>
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
                  <Label>Service Type</Label>
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
                <Label>Subject / Issue Title</Label>
                <Input
                  placeholder="Briefly describe the problem"
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  placeholder="Provide details..."
                  rows={3}
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
              <div className="flex gap-3 pt-2">
                <Button onClick={handleCreateRequest} className="flex-1 gap-2" disabled={submitting}>
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  {submitting ? "Submitting..." : "Submit Ticket"}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => setIsModalOpen(false)}>
                  Discard
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="text-2xl font-bold text-primary">{loading ? "—" : requests.length}</div>
            <p className="text-sm text-muted-foreground">Total Requests</p>
          </CardContent>
        </Card>
        <Card className="border-amber-200 bg-amber-50/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="text-2xl font-bold text-amber-600">
              {loading ? "—" : requests.filter((r) => r.ServiceRequestStatus?.IsDefault === true || (!r.ServiceRequestStatus && !r.StatusID)).length}
            </div>
            <p className="text-sm text-muted-foreground">Pending</p>
          </CardContent>
        </Card>
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="text-2xl font-bold text-emerald-600">
              {loading ? "—" : requests.filter((r) => r.ServiceRequestStatus?.IsTerminal === true).length}
            </div>
            <p className="text-sm text-muted-foreground">Completed</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters & Table */}
      <Card>
        <CardHeader className="border-b">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>Request History</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-64">
                <Input
                  placeholder="Search title or ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  {statuses.map(s => (
                    <SelectItem key={s.ServiceRequestStatusID} value={s.ServiceRequestStatusName}>
                      {s.ServiceRequestStatusName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={deptFilter} onValueChange={setDeptFilter}>
                <SelectTrigger className="w-full sm:w-36">
                  <SelectValue placeholder="Department" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Depts</SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.ServiceDeptID} value={d.DeptName}>
                      {d.DeptName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              <FileText className="mb-2 h-10 w-10 opacity-30" />
              <p className="font-medium">No requests match your filters</p>
              <p className="text-sm">Try adjusting your search or filter criteria.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Ticket ID</TableHead>
                  <TableHead className="font-semibold">Issue Details</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRequests.map((req) => (
                  <TableRow key={String(req.ServiceRequestID)} className="group">
                    <TableCell>
                      <Badge variant="outline" className="font-mono">
                        #SR-{String(req.ServiceRequestID)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <p className="font-medium">{req.Title}</p>
                        <p className="text-xs text-muted-foreground">
                          {req.ServiceRequestType?.ServiceDepartment?.DeptName || "—"} • {req.ServiceRequestType?.RequestTypeName || "—"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(req, statuses)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        {(req.ServiceRequestStatus?.IsDefault === true || (!req.ServiceRequestStatus && !req.StatusID)) && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                            onClick={() => handleCancelRequest(String(req.ServiceRequestID))}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                        {!req.ServiceRequestStatus?.IsTerminal === true && (
                          <Button asChild size="sm" className="gap-1">
                          <Link href={`/request-details/${req.ServiceRequestID}`}>
                            View Thread
                            <ChevronRight className="h-4 w-4" />
                          </Link>
                        </Button>
                        )}
                        
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