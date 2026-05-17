"use client";

import React, { useEffect, useState } from "react";
import { Trash2, ChevronRight, FileText, Loader2 } from "lucide-react";
import Link from "next/link";
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
import { ServiceRequest, ServiceRequestStatus, Department } from "@/types/common";
import { fetchStatuses, fetchDepartments } from "@/services/request.service";

export default function UserRequestPortal() {
  // ---- State ----
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [statuses, setStatuses] = useState<ServiceRequestStatus[]>([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deptFilter, setDeptFilter] = useState("all");

  // ---- Fetch all initial data ----
  const fetchRequestHistory = async () => {
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
    const loadAll = async () => {
      const [ statusData, deptData] = await Promise.all([
        fetchStatuses(),
        fetchDepartments(),
      ]);

      setStatuses(statusData as unknown as ServiceRequestStatus[]);
      setDepartments(deptData as Department[]);

      await fetchRequestHistory();
    };
    loadAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // ---- Filter Logic ----
  const filteredRequests = requests.filter((req) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      req.Title?.toLowerCase().includes(query) ||
      String(req.ServiceRequestID).includes(query);

    const matchesStatus =
      statusFilter === "all" ||
      getStatusLabel(req.StatusID, statuses) === statusFilter;

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