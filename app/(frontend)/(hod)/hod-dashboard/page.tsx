"use client";

import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { getStatusBadge, getStatusLabel } from "@/lib/statusServices";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { useHodRequests, useHodTechnicians, useAssignTechnician, useEvaluateRequest } from "@/features/hod/hooks";
import { useStatuses } from "@/features/admin/statuses/hooks";

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
  ServiceRequestStatus?: { ServiceRequestStatusName: string; ServiceRequestStatusCssClass: string; IsTerminal?: boolean | null; IsDefault?: boolean | null; IsAssigned?: boolean | null } | null;
}

interface DeptPerson {
  DeptPersonID: string;
  ServiceDeptID: string | null;
  UserID: string | null;
  IsActive: boolean | null;
  Users?: { FullName: string; Email: string; Role: string } | null;
  ServiceDepartment?: { DeptName: string } | null;
}

export default function HODDashboard() {
  const { data: requests = [], isLoading: requestsLoading } = useHodRequests();
  const { data: technicians = [], isLoading: techniciansLoading } = useHodTechnicians();
  const { data: statusesData = [], isLoading: statusesLoading } = useStatuses();
  
  // Convert StatusItem[] to StatusInfo[]
  const statuses = statusesData as any[];

  const loading = requestsLoading || techniciansLoading || statusesLoading;

  const [isEvaluateModalOpen, setIsEvaluateModalOpen] = useState(false);
  const [closedStatus, setClosedStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);

  const assignMutation = useAssignTechnician();
  const evaluateMutation = useEvaluateRequest();

  // ---- Assign technician to request ----
  const handleAssign = (deptPersonId: string) => {
    if (!selectedRequest) return;
    toast.promise(
      assignMutation.mutateAsync({
        requestId: selectedRequest.ServiceRequestID,
        deptPersonId,
      }),
      {
        loading: "Assigning technician...",
        success: "Technician assigned successfully!",
        error: (err) => err.message || "Failed to assign technician"
      }
    );
    setIsAssignModalOpen(false);
    setSelectedRequest(null);
  };

  const handleEvaluate = (requestId: string) => {
    const evaluationNotes = (document.getElementById('evaluationNotes') as HTMLTextAreaElement)?.value;
    toast.promise(
      evaluateMutation.mutateAsync({
        requestId,
        statusId: closedStatus,
        evaluationNotes,
      }),
      {
        loading: "Evaluating request...",
        success: "Request evaluated successfully!",
        error: (err) => err.message || "Evaluation failed"
      }
    );
    setIsEvaluateModalOpen(false);
  };



  

  const isUnassigned = (req: ServiceRequest) => !req.AssignedToID;

  const getTechName = (assignedToId: string | null) => {
    if (!assignedToId) return null;
    const tech = technicians.find((t) => String(t.DeptPersonID) === String(assignedToId));
    return tech?.Users?.FullName || "Assigned";
  };

  // Filter Logic
  const filteredRequests = requests.filter((r) => {
    // Search filter
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      r.Title?.toLowerCase().includes(q) ||
      String(r.ServiceRequestID).includes(q) ||
      r.Users?.FullName?.toLowerCase().includes(q);

    // Status filter — use the embedded status name from the request object
    const requestStatusName = r.ServiceRequestStatus?.ServiceRequestStatusName || getStatusLabel(r.StatusID, statuses);
    const matchesStatus =
        statusFilter === "all" ||
        requestStatusName === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Stats
  const isTerminal = (req: ServiceRequest) => {
    // Check embedded status first
    if (req.ServiceRequestStatus?.IsTerminal === true) return true;
    // Fallback: look up in the separately-fetched statuses array
    if (req.StatusID) {
      const s = statuses.find(st => String(st.ServiceRequestStatusID) === String(req.StatusID));
      if (s?.IsTerminal === true) return true;
    }
    return false;
  };

  const unassignedCount = requests.filter((r) => isUnassigned(r)).length;
  const assignedCount = requests.filter((r) => !isUnassigned(r) && !isTerminal(r)).length;
  const completedCount = requests.filter((r) => isTerminal(r)).length;

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
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle>All Service Requests</CardTitle>
            <div className="flex flex-wrap items-center gap-3">
              <div className="w-full sm:w-64 relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search by title, ID, or requester..."
                  className="pl-9"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="All Statuses" />
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
                  return (
                    <TableRow key={String(req.ServiceRequestID)} className="group">
                      {/* sr number */}
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
                      
                      {/* requester name */}
                      <TableCell className="font-medium text-muted-foreground">
                        {req.Users?.FullName || "—"}
                      </TableCell>

                      {/* priority */}
                      <TableCell>
                        <Badge
                          className={
                            req.Priority === "Urgent"
                              ? "bg-rose-500 text-white hover:bg-rose-500"
                              : req.Priority === "High"
                              ? "bg-rose-100 text-rose-700 hover:bg-rose-100"
                              : req.Priority === "Medium"
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-100"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-100"
                          }
                        >
                          {req.Priority.toLowerCase()}
                        </Badge>
                      </TableCell>
                      
                      {/* status */}
                      <TableCell>
                        {getStatusBadge(req,statuses)}
                      </TableCell>

                      {/* assigned tech */}
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
                        {isTerminal(req) ? (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsEvaluateModalOpen(true);
                            }}
                          >
                            <CheckCircle className="h-3 w-3" />
                            Evaluate
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            onClick={() => {
                              setSelectedRequest(req);
                              setIsAssignModalOpen(true);
                            }}
                          >
                            <UserCheck className="h-3 w-3" />
                            Reassign
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
                  disabled={assignMutation.isPending}
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
                  {assignMutation.isPending && assignMutation.variables?.deptPersonId === String(tech.DeptPersonID) ? (
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

      {/* Evaluation Modal */}
      <Dialog open={isEvaluateModalOpen} onOpenChange={setIsEvaluateModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-xl">Evaluate Request</DialogTitle>
            <DialogDescription>
              Review and finalize this completed service request
            </DialogDescription>
            <div className="flex justify-between items-center">
              <div className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Request Details
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setIsEvaluateModalOpen(false)}
              >
                Cancel
              </Button>
            </div>
          </DialogHeader>
          <div className="space-y-3 py-4">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Request Details
            </p>
            <div className="space-y-2">
              <p className="text-sm">
                <strong>Ticket:</strong> SR-{selectedRequest ? String(selectedRequest.ServiceRequestID) : ""}
              </p>
              <p className="text-sm">
                <strong>Title:</strong> {selectedRequest?.Title}
              </p>
              <p className="text-sm">
                <strong>Requester:</strong> {selectedRequest?.Users?.FullName}
              </p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Evaluation Notes
              </p>
              <textarea
                className="w-full h-20 p-2 border rounded-md text-sm"
                placeholder="Add evaluation notes..."
                id="evaluationNotes"
              />
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Final Status
              </p>
              <Select value={closedStatus} onValueChange={setClosedStatus}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select final status" />
                </SelectTrigger>
                <SelectContent>
                  {statuses.filter(s => s.IsTerminal === true).map((status) => (
                    <SelectItem key={status.ServiceRequestStatusID} value={String(status.ServiceRequestStatusID)}>
                      {status.ServiceRequestStatusName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button 
                disabled={!closedStatus || evaluateMutation.isPending}
                onClick={() => handleEvaluate(String(selectedRequest?.ServiceRequestID))}
                className="bg-primary text-primary-foreground hover:bg-primary/90 gap-2"
              >
                {evaluateMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                {evaluateMutation.isPending ? "Evaluating..." : "Submit Evaluation"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}