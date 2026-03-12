"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Plus, UserCog, ShieldCheck, User, Edit, Trash2, Loader2, AlertCircle, Wrench } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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

// Types
// department interface
interface Department {
  ServiceDeptID: string;
  DeptName: string;
}

// person master interface
interface PersonMaster {
  DeptPersonID: string;
  ServiceDeptID: string | null;
  UserID: string;
  IsActive: boolean;
  ServiceDepartment?: { DeptName: string } | null;
  Users?: {
    FullName: string | null;
    Email: string | null;
    Phone: string | null;
    Role: string | null;
  } | null;
}

// form for edit and create interface
interface Form {
  FullName: string;
  Email: string;
  Phone: string;
  Role: string;
  ServiceDeptID: string;
}


// intial states
const emptyForm: Form = {
  FullName: "",
  Email: "",
  Phone: "",
  Role: "hod",
  ServiceDeptID: "",
};



export default function DeptPersonMapping() {
  const [personnel, setPersonnel] = useState<PersonMaster[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [createForm, setCreateForm] = useState<Form>(emptyForm);
  const [creating, setCreating] = useState(false);

  // Edit dialog
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<PersonMaster | null>(null);
  const [editForm, setEditForm] = useState<Form>(emptyForm);
  const [editing, setEditing] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<PersonMaster | null>(null);
  const [deleting, setDeleting] = useState(false);

    // Shared form fields component
    const renderFormFields = (form: Form, setForm: (f: Form) => void) => (
      <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Full Name</Label>
                  <Input
                    placeholder="e.g., Vijay Shah"
                    value={form.FullName}
                    onChange={(e) => setCreateForm({ ...createForm, FullName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    placeholder="e.g., vijay@company.com"
                    value={form.Email}
                    onChange={(e) => setForm({ ...form, Email: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    placeholder="e.g., 9876543210"
                    value={form.Phone}
                    onChange={(e) => setForm({ ...form, Phone: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Role</Label>
                  <Select value={form.Role} onValueChange={(v) => setForm({ ...form, Role: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select role..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hod">HOD</SelectItem>
                      <SelectItem value="technician">Technician</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Department</Label>
                <Select value={form.ServiceDeptID} onValueChange={(v) => setForm({ ...form, ServiceDeptID: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department..." />
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
            </div>
    );
  

  // Fetch data
  const fetchAll = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [persRes, deptsRes] = await Promise.all([
        apiClient.get<PersonMaster[]>("/api/admin/person-master"),
        apiClient.get<Department[]>("/api/admin/department"),
      ]);
      if (persRes.success) setPersonnel(persRes.data ?? []);
      if (deptsRes.success) setDepartments(deptsRes.data ?? []);
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
    if (!createForm.FullName.trim() || !createForm.Email.trim() || !createForm.Role || !createForm.ServiceDeptID) return;
    try {
      setCreating(true);
      const res = await apiClient.post("/api/admin/person-master", {
        FullName: createForm.FullName.trim(),
        Email: createForm.Email.trim(),
        Phone: createForm.Phone.trim(),
        Role: createForm.Role,
        ServiceDeptID: createForm.ServiceDeptID,
      });
      if (res.success) {
        setCreateForm(emptyForm);
        setCreateOpen(false);
        fetchAll();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to add personnel");
    } finally {
      setCreating(false);
      setCreateOpen(false);

    }
  };

  // Update
  const handleUpdate = async () => {
    if (!editItem || !editForm.ServiceDeptID || !editForm.Role) return;
    try {
      setEditing(true);
      const res = await apiClient.patch(`/api/admin/person-master/${editItem.DeptPersonID}`, {
        ServiceDeptID: editForm.ServiceDeptID,
        Role: editForm.Role,
      });
      if (res.success) {
        setEditOpen(false);
        setEditItem(null);
        fetchAll();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to update personnel");
    } finally {
      setEditing(false);
      setEditOpen(false);
    }
  };

  // Delete
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      setDeleting(true);
      const res = await apiClient.delete(`/api/admin/person-master/${deleteItem.DeptPersonID}`);
      if (res.success) {
        setDeleteOpen(false);
        fetchAll();
      }
    } catch (err) {
      console.error(err);
      setError("Failed to remove personnel");
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const openEdit = (item: PersonMaster) => {
    setEditItem(item);
    setEditForm({
      ServiceDeptID: item.ServiceDeptID?.toString() ?? "",
      Role: item.Users?.Role?.toLowerCase() ?? "user",
      FullName: item.Users?.FullName ?? "",
      Email: item.Users?.Email ?? "",
      Phone: item.Users?.Phone ?? "",
    });
    setEditOpen(true);
  };

  const openDelete = (item: PersonMaster) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const getRoleBadge = (role: string | null) => {
    const r = role?.toLowerCase();
    if (r === "hod") {
      return (
        <Badge className="gap-1 bg-amber-100 text-amber-700 hover:bg-amber-100">
          <ShieldCheck className="h-3 w-3" />
          HOD
        </Badge>
      );
    }
    if (r === "technician") {
      return (
        <Badge className="gap-1 bg-blue-100 text-blue-700 hover:bg-blue-100">
          <Wrench className="h-3 w-3" />
          Technician
        </Badge>
      );
    }
    if (r === "user") {
      return (
        <Badge className="gap-1 bg-gray-100 text-gray-600 hover:bg-gray-100">
          <User className="h-3 w-3" />
          User
        </Badge>
      );
    }
    return (
      <Badge className="gap-1 bg-gray-100 text-gray-600 hover:bg-gray-100">
        <User className="h-3 w-3" />
        {role || "User"}
      </Badge>
    );
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const hodCount = personnel.filter((p) => p.Users?.Role?.toLowerCase() === "hod").length;
  const techCount = personnel.filter((p) => p.Users?.Role?.toLowerCase() === "technician").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <UserCog className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Personnel Master</h1>
          </div>
          <p className="text-muted-foreground">
            Assign HODs and Technicians to departments
          </p>
        </div>

        {/* Dialog */}
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Add Personnel
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Add New Personnel</DialogTitle>
              <DialogDescription>
                Add an HOD or Technician and assign them to a department.
              </DialogDescription>
            </DialogHeader>
            {renderFormFields(createForm, setCreateForm)}
            <DialogFooter>
              <Button variant="outline" onClick={() => setCreateOpen(false)}>Cancel</Button>
              <Button
                onClick={handleCreate}
                disabled={creating || !createForm.FullName.trim() || !createForm.Email.trim() || !createForm.ServiceDeptID}
              >
                {creating ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Adding...</>
                ) : (
                  "Add Personnel"
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
              <UserCog className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Personnel</p>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="mt-1 h-7 w-12" /> : personnel.length}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">HODs</p>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="mt-1 h-7 w-12" /> : hodCount}
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Wrench className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Technicians</p>
              <div className="text-2xl font-bold">
                {loading ? <Skeleton className="mt-1 h-7 w-12" /> : techCount}
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
      {!loading && personnel.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <UserCog className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">No personnel assigned yet</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Add HODs and Technicians to manage your departments.
            </p>
            <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4" />
              Add Personnel
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!loading && personnel.length > 0 && (
        <Card>
          <CardHeader className="border-b">
            <CardTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              Assigned Personnel
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">Staff Member</TableHead>
                  <TableHead className="font-semibold">Email</TableHead>
                  <TableHead className="font-semibold">Department</TableHead>
                  <TableHead className="font-semibold">Role</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {personnel.map((item, index) => (
                  <TableRow key={item.DeptPersonID} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-9 w-9">
                          <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                            {getInitials(item.Users?.FullName ?? null)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{item.Users?.FullName || "—"}</p>
                          {item.Users?.Phone && (
                            <p className="text-xs text-muted-foreground">{item.Users.Phone}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {item.Users?.Email || "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">
                        {item.ServiceDepartment?.DeptName ?? "—"}
                      </Badge>
                    </TableCell>
                    <TableCell>{getRoleBadge(item.Users?.Role ?? null)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1 opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => openEdit(item)}
                        >
                          <Edit className="h-4 w-4" />
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

      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <DialogHeader>
            <DialogTitle>Edit Personnel</DialogTitle>
            <DialogDescription>
              Update department and role for <strong>{editItem?.Users?.FullName}</strong>.
            </DialogDescription>
          </DialogHeader>
         {renderFormFields(editForm, setEditForm)}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdate} disabled={editing || !editForm.ServiceDeptID || !editForm.Role}>
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
            <DialogTitle>Remove Personnel</DialogTitle>
            <DialogDescription>
              Are you sure you want to remove <strong>{deleteItem?.Users?.FullName}</strong> from their department? Their role will be reset to &quot;User&quot;.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>Cancel</Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
              {deleting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Removing...</>
              ) : (
                "Remove"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}