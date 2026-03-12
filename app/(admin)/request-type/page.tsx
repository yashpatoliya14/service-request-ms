"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, Plus, Layers, Trash2, Edit3, Box, Loader2, AlertCircle, ChevronRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { Switch } from "@/components/ui/switch";

// Types
interface Department {
  ServiceDeptID: string;
  DeptName: string;
}

interface ServiceType {
  ServiceTypeID: string;
  ServiceTypeName: string;
}

interface RequestType {
  ServiceRequestTypeID: string;
  RequestTypeName: string;
  DefaultPriority: number | null;
  IsActive: boolean | null;
  ServiceTypeID: string;
  ServiceDeptID: string;
  ServiceDepartment?: { DeptName: string };
  ServiceType?: { ServiceTypeName: string };
}

interface FormData {
  RequestTypeName: string;
  ServiceTypeID: string;
  ServiceDeptID: string;
  DefaultPriority: string;
  IsActive: boolean;
}

const emptyForm: FormData = {
  RequestTypeName: "",
  ServiceTypeID: "",
  ServiceDeptID: "",
  DefaultPriority: "3",
  IsActive: true,
};

const priorityLabels: Record<string, string> = {
  "1": "Critical",
  "2": "High",
  "3": "Medium",
  "4": "Low",
  "5": "Very Low",
};

export default function RequestTypeMaster() {
  const [requestTypes, setRequestTypes] = useState<RequestType[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [serviceTypes, setServiceTypes] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<FormData>(emptyForm);
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<RequestType | null>(null);
  const [editForm, setEditForm] = useState<FormData>(emptyForm);
  const [editing, setEditing] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<RequestType | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Fetch data
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [reqTypesRes, deptsRes, svcTypesRes] = await Promise.all([
        apiClient.get<RequestType[]>("/api/admin/service-request-type"),
        apiClient.get<Department[]>("/api/admin/department"),
        apiClient.get<ServiceType[]>("/api/admin/service-type"),
      ]);
      if (reqTypesRes.success) setRequestTypes(reqTypesRes.data ?? []);
      if (deptsRes.success) setDepartments(deptsRes.data ?? []);
      if (svcTypesRes.success) setServiceTypes(svcTypesRes.data ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load data");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  // Create
  const handleCreate = async () => {
    if (!createForm.RequestTypeName.trim() || !createForm.ServiceDeptID || !createForm.ServiceTypeID) return;
    try {
      setCreating(true);
      const res = await apiClient.post("/api/admin/service-request-type", {
        ServiceRequestTypeName: createForm.RequestTypeName.trim(),
        ServiceTypeID: createForm.ServiceTypeID,
        ServiceDeptID: createForm.ServiceDeptID,
        DefaultPriority: parseInt(createForm.DefaultPriority),
        IsActive: createForm.IsActive,
      });
      if (res.success) {
        setCreateForm(emptyForm);
        setCreateOpen(false);
        fetchAll();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to create request type");
    } finally {
      setCreating(false);
    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editItem || !editForm.RequestTypeName.trim() || !editForm.ServiceDeptID || !editForm.ServiceTypeID) return;
    try {
      setEditing(true);
      const res = await apiClient.patch(`/api/admin/service-request-type/${editItem.ServiceRequestTypeID}`, {
        RequestTypeName: editForm.RequestTypeName.trim(),
        ServiceTypeID: editForm.ServiceTypeID,
        ServiceDeptID: editForm.ServiceDeptID,
        DefaultPriority: parseInt(editForm.DefaultPriority),
        IsActive: editForm.IsActive,
      });
      if (res.success) {
        setEditOpen(false);
        setEditItem(null);
        fetchAll();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update request type");
    } finally {
      setEditing(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleting(true);
      const res = await apiClient.delete(`/api/admin/service-request-type/${deleteItem.ServiceRequestTypeID}`);
      if (res.success) {
        setDeleteOpen(false);
        fetchAll();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to delete request type");
    } finally {
      setDeleting(false);
    }
  };

  const openEdit = (item: RequestType) => {
    setEditItem(item);
    setEditForm({
      RequestTypeName: item.RequestTypeName ?? "",
      ServiceTypeID: item.ServiceTypeID?.toString() ?? "",
      ServiceDeptID: item.ServiceDeptID?.toString() ?? "",
      DefaultPriority: (item.DefaultPriority ?? 3).toString(),
      IsActive: item.IsActive ?? true,
    });
    setEditOpen(true);
  };

  const openDelete = (item: RequestType) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const getPriorityBadge = (priority: number | null) => {
    const p = priority ?? 3;
    if (p <= 1) return <Badge className="bg-rose-100 text-rose-700 hover:bg-rose-100">Critical</Badge>;
    if (p === 2) return <Badge className="bg-orange-100 text-orange-700 hover:bg-orange-100">High</Badge>;
    if (p === 3) return <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100">Medium</Badge>;
    if (p === 4) return <Badge className="bg-sky-100 text-sky-700 hover:bg-sky-100">Low</Badge>;
    return <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Very Low</Badge>;
  };

  // Shared form fields component
  const renderFormFields = (form: FormData, setForm: (f: FormData) => void) => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Request Type Name</Label>
        <Input
          placeholder="e.g., Printer Issue"
          value={form.RequestTypeName}
          onChange={(e) => setForm({ ...form, RequestTypeName: e.target.value })}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Department</Label>
          <Select value={form.ServiceDeptID} onValueChange={(v) => setForm({ ...form, ServiceDeptID: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {departments.map((d) => (
                <SelectItem key={d.ServiceDeptID} value={d.ServiceDeptID.toString()}>
                  {d.DeptName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Service Type</Label>
          <Select value={form.ServiceTypeID} onValueChange={(v) => setForm({ ...form, ServiceTypeID: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {serviceTypes.map((s) => (
                <SelectItem key={s.ServiceTypeID} value={s.ServiceTypeID.toString()}>
                  {s.ServiceTypeName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Default Priority</Label>
          <Select value={form.DefaultPriority} onValueChange={(v) => setForm({ ...form, DefaultPriority: v })}>
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(priorityLabels).map(([val, label]) => (
                <SelectItem key={val} value={val}>
                  {label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-end space-x-2 pb-1">
          <Switch
            id="is-active"
            checked={form.IsActive}
            onCheckedChange={(checked) => setForm({ ...form, IsActive: checked })}
          />
          <Label htmlFor="is-active">Active</Label>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Settings2 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Request Type Master</h1>
          </div>
          <p className="text-muted-foreground">
            Define specific request categories and link them to departments
          </p>
        </div>

        {/* Create Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Add Request Type
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Request Type</DialogTitle>
              <DialogDescription>
                Create a new request type and link it to a department and service type.
              </DialogDescription>
            </DialogHeader>
            {renderFormFields(createForm, setCreateForm)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !createForm.RequestTypeName.trim() || !createForm.ServiceDeptID || !createForm.ServiceTypeID}
              >
                {creating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Creating...</>
                ) : (
                  "Create Request Type"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-xs underline">Dismiss</button>
        </div>
      )}

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Settings2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Request Types</p>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="mt-1 h-7 w-12" /> : requestTypes.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Active Types</p>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="mt-1 h-7 w-12" /> : requestTypes.filter((r) => r.IsActive).length}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && requestTypes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Settings2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No request types yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Get started by adding your first request type.
            </p>
            <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Request Type
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!loading && requestTypes.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-primary" />
              <CardTitle>Defined Request Types</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Request Type</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Service Type</TableHead>
                  <TableHead className="font-semibold">Priority</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {requestTypes.map((item, index) => (
                  <TableRow key={item.ServiceRequestTypeID} className="group">
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg border bg-muted/50 text-muted-foreground group-hover:border-primary/30 group-hover:text-primary transition-colors">
                          <Box className="h-4 w-4" />
                        </div>
                        <span className="font-medium">{item.RequestTypeName}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {item.ServiceDepartment?.DeptName ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className="bg-primary/10 text-primary hover:bg-primary/10">
                        {item.ServiceType?.ServiceTypeName ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getPriorityBadge(item.DefaultPriority)}</TableCell>
                    <TableCell>
                      {item.IsActive ? (
                        <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">Active</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">Inactive</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => openEdit(item)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                          onClick={() => openDelete(item)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Info Banner */}
      <Card className="overflow-hidden border-0 bg-gradient-to-r from-primary to-violet-600 text-primary-foreground">
        <CardContent className="flex items-center justify-between p-6">
          <div>
            <h4 className="text-lg font-bold">Need more categories?</h4>
            <p className="text-primary-foreground/80 text-sm">
              You can map these types to specific personnel in the &apos;Request Mapping&apos; section.
            </p>
          </div>
          <ChevronRight className="h-8 w-8 opacity-30" />
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Request Type</DialogTitle>
            <DialogDescription>Update the request type details.</DialogDescription>
          </DialogHeader>
          {renderFormFields(editForm, setEditForm)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button
              onClick={handleUpdate}
              disabled={editing || !editForm.RequestTypeName.trim() || !editForm.ServiceDeptID || !editForm.ServiceTypeID}
            >
              {editing ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Request Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteItem?.RequestTypeName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Deleting...</>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}