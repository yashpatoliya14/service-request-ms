"use client";

import React, { useEffect, useState } from "react";
import { CheckSquare, Plus, Trash2, Edit3, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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

// ---- Types ----
interface StatusItem {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  Sequence: number | null;
  Description: string | null;
  ServiceRequestStatusCssClass: string | null;
  IsAllowedForTechnician: boolean | null;
  Created: string;
}

const COLOR_OPTIONS = [
  { value: "bg-amber-500", badge: "bg-amber-100 text-amber-700" },
  { value: "bg-blue-500", badge: "bg-blue-100 text-blue-700" },
  { value: "bg-emerald-500", badge: "bg-emerald-100 text-emerald-700" },
  { value: "bg-orange-500", badge: "bg-orange-100 text-orange-700" },
  { value: "bg-rose-500", badge: "bg-rose-100 text-rose-700" },
  { value: "bg-violet-500", badge: "bg-violet-100 text-violet-700" },
  { value: "bg-cyan-500", badge: "bg-cyan-100 text-cyan-700" },
  { value: "bg-slate-500", badge: "bg-slate-100 text-slate-700" },
];

const DEFAULT_FORM = {
  ServiceRequestStatusName: "",
  Sequence: "",
  Description: "",
  ServiceRequestStatusCssClass: "bg-blue-500",
  IsAllowedForTechnician: false,
};

export default function StatusMaster() {
  const [statuses, setStatuses] = useState<StatusItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingStatus, setEditingStatus] = useState<StatusItem | null>(null);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [formData, setFormData] = useState(DEFAULT_FORM);

  // ---- Fetch all statuses ----
  const fetchStatuses = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get<StatusItem[]>("/api/admin/status-master");
      if (res.success) {
        setStatuses(res.data || []);
      }
    } catch (err) {
      console.error("Failed to fetch statuses:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatuses();
  }, []);

  // ---- Create status ----
  const handleCreate = async () => {
    if (!formData.ServiceRequestStatusName.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post("/api/admin/status-master", {
        ServiceRequestStatusName: formData.ServiceRequestStatusName,
        Sequence: formData.Sequence || undefined,
        Description: formData.Description || undefined,
        ServiceRequestStatusCssClass: formData.ServiceRequestStatusCssClass,
        IsAllowedForTechnician: formData.IsAllowedForTechnician,
      });
      if (res.success) {
        setIsCreateOpen(false);
        setFormData(DEFAULT_FORM);
        await fetchStatuses();
      }
    } catch (err) {
      console.error("Failed to create status:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Open edit modal ----
  const openEdit = (status: StatusItem) => {
    setEditingStatus(status);
    setFormData({
      ServiceRequestStatusName: status.ServiceRequestStatusName,
      Sequence: status.Sequence?.toString() || "",
      Description: status.Description || "",
      ServiceRequestStatusCssClass: status.ServiceRequestStatusCssClass || "bg-blue-500",
      IsAllowedForTechnician: status.IsAllowedForTechnician ?? false,
    });
    setIsEditOpen(true);
  };

  // ---- Update status ----
  const handleUpdate = async () => {
    if (!editingStatus || !formData.ServiceRequestStatusName.trim()) return;
    setSubmitting(true);
    try {
      const res = await apiClient.patch(
        `/api/admin/status-master/${editingStatus.ServiceRequestStatusID}`,
        {
          ServiceRequestStatusName: formData.ServiceRequestStatusName,
          Sequence: formData.Sequence || undefined,
          Description: formData.Description || undefined,
          ServiceRequestStatusCssClass: formData.ServiceRequestStatusCssClass,
          IsAllowedForTechnician: formData.IsAllowedForTechnician,
        }
      );
      if (res.success) {
        setIsEditOpen(false);
        setEditingStatus(null);
        setFormData(DEFAULT_FORM);
        await fetchStatuses();
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Delete status ----
  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this status?")) return;
    try {
      const res = await apiClient.delete(`/api/admin/status-master/${id}`);
      if (res.success) {
        setStatuses((prev) => prev.filter((s) => s.ServiceRequestStatusID !== id));
      }
    } catch (err) {
      console.error("Failed to delete status:", err);
    }
  };

  // ---- Helpers ----
  const getBadgeStyle = (cssClass: string | null) => {
    const match = COLOR_OPTIONS.find((c) => c.value === cssClass);
    return match?.badge || "bg-slate-100 text-slate-700";
  };

  // ---- Reusable form for create & edit ----
  const renderForm = (onSubmit: () => void, submitLabel: string) => (
    <div className="grid gap-4 py-4">
      <div className="space-y-2">
        <Label>Status Name *</Label>
        <Input
          placeholder="e.g., Under Review"
          value={formData.ServiceRequestStatusName}
          onChange={(e) =>
            setFormData({ ...formData, ServiceRequestStatusName: e.target.value })
          }
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Sequence Order</Label>
          <Input
            type="number"
            placeholder="e.g., 1"
            value={formData.Sequence}
            onChange={(e) => setFormData({ ...formData, Sequence: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Description</Label>
          <Input
            placeholder="Brief description"
            value={formData.Description}
            onChange={(e) => setFormData({ ...formData, Description: e.target.value })}
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label>Color Indicator</Label>
        <div className="flex gap-2">
          {COLOR_OPTIONS.map((color) => (
            <button
              key={color.value}
              type="button"
              onClick={() =>
                setFormData({ ...formData, ServiceRequestStatusCssClass: color.value })
              }
              className={`h-8 w-8 rounded-full ${color.value} transition-all ${
                formData.ServiceRequestStatusCssClass === color.value
                  ? "ring-2 ring-primary ring-offset-2"
                  : "ring-2 ring-transparent hover:ring-offset-2 hover:ring-primary/50"
              }`}
            />
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between rounded-lg border p-3">
        <div>
          <p className="text-sm font-medium">Allowed for Technician</p>
          <p className="text-xs text-muted-foreground">Technician can set this status</p>
        </div>
        <Switch
          checked={formData.IsAllowedForTechnician}
          onCheckedChange={(val) =>
            setFormData({ ...formData, IsAllowedForTechnician: val })
          }
        />
      </div>
      <Button onClick={onSubmit} className="mt-2 gap-2" disabled={submitting}>
        {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        {submitting ? "Saving..." : submitLabel}
      </Button>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <CheckSquare className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Status Master</h1>
          </div>
          <p className="text-muted-foreground">
            Define workflow stages for service requests
          </p>
        </div>

        {/* Create Dialog */}
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button
              className="gap-2 shadow-lg shadow-primary/25"
              onClick={() => setFormData(DEFAULT_FORM)}
            >
              <Plus className="h-4 w-4" />
              Add Status
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[520px]">
            <DialogHeader>
              <DialogTitle>Add New Status</DialogTitle>
              <DialogDescription>
                Create a new status for the request workflow.
              </DialogDescription>
            </DialogHeader>
            {renderForm(handleCreate, "Create Status")}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Statuses</p>
              <p className="text-2xl font-bold">{loading ? "—" : statuses.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card className="border-violet-200 bg-violet-50/50">
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-violet-100 text-violet-600">
              <CheckSquare className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Technician Allowed</p>
              <p className="text-2xl font-bold text-violet-600">
                {loading ? "—" : statuses.filter((s) => s.IsAllowedForTechnician).length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : statuses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
              <CheckSquare className="mb-2 h-10 w-10 opacity-30" />
              <p className="font-medium">No statuses defined</p>
              <p className="text-sm">Click &quot;Add Status&quot; to create the first workflow stage.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold w-12">#</TableHead>
                  <TableHead className="font-semibold">Status Name</TableHead>
                  <TableHead className="font-semibold">Badge</TableHead>
                  <TableHead className="font-semibold">Description</TableHead>
                  <TableHead className="font-semibold text-center">Technician</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {statuses.map((s) => (
                  <TableRow key={s.ServiceRequestStatusID} className="group">
                    <TableCell className="font-mono text-muted-foreground">
                      {s.Sequence ?? s.ServiceRequestStatusID}
                    </TableCell>
                    <TableCell className="font-medium">
                      {s.ServiceRequestStatusName}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div
                          className={`h-3 w-3 rounded-full ${
                            s.ServiceRequestStatusCssClass || "bg-slate-500"
                          }`}
                        />
                        <Badge className={getBadgeStyle(s.ServiceRequestStatusCssClass)}>
                          {s.ServiceRequestStatusName}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[200px] truncate">
                      {s.Description || "—"}
                    </TableCell>
                    <TableCell className="text-center">
                      {s.IsAllowedForTechnician ? (
                        <Badge className="bg-violet-100 text-violet-700 hover:bg-violet-100">Yes</Badge>
                      ) : (
                        <Badge variant="secondary">No</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary"
                          onClick={() => openEdit(s)}
                        >
                          <Edit3 className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => handleDelete(s.ServiceRequestStatusID)}
                        >
                          <Trash2 className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>Edit Status</DialogTitle>
            <DialogDescription>
              Update status:{" "}
              <span className="font-mono font-semibold">
                {editingStatus?.ServiceRequestStatusName}
              </span>
            </DialogDescription>
          </DialogHeader>
          {renderForm(handleUpdate, "Save Changes")}
        </DialogContent>
      </Dialog>
    </div>
  );
}