"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Settings2, Plus, Edit2, Trash2, Loader2, AlertCircle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  useServiceTypes, 
  useCreateServiceType, 
  useUpdateServiceType, 
  useDeleteServiceType,
  ServiceType 
} from "@/features/admin/service-types";

export default function ServiceTypeMaster() {
  const { data: serviceTypes = [], isLoading: loading, error: queryError } = useServiceTypes();
  const createServiceTypeMutation = useCreateServiceType();
  const updateServiceTypeMutation = useUpdateServiceType();
  const deleteServiceTypeMutation = useDeleteServiceType();

  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Create dialog state
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");

  // Edit dialog state
  const [editOpen, setEditOpen] = useState(false);
  const [editItem, setEditItem] = useState<ServiceType | null>(null);
  const [editName, setEditName] = useState("");

  // Delete dialog state
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteItem, setDeleteItem] = useState<ServiceType | null>(null);

  // Sync react-query load errors to local state if any
  useEffect(() => {
    if (queryError) {
      setError(queryError instanceof Error ? queryError.message : "Failed to load service types");
    }
  }, [queryError]);

  // Create service type
  const handleCreate = async () => {
    if (!createName.trim()) return;
    try {
      await createServiceTypeMutation.mutateAsync({ ServiceTypeName: createName.trim() });
      setCreateName("");
      setCreateOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Update service type
  const handleUpdate = async () => {
    if (!editItem || !editName.trim()) return;
    try {
      await updateServiceTypeMutation.mutateAsync({
        ServiceTypeID: editItem.ServiceTypeID,
        ServiceTypeName: editName.trim(),
      });
      setEditOpen(false);
      setEditItem(null);
      setEditName("");
    } catch (err) {
      console.error(err);
    }
  };

  // Delete service type
  const handleDelete = async () => {
    if (!deleteItem) return;
    try {
      await deleteServiceTypeMutation.mutateAsync(deleteItem.ServiceTypeID);
      setDeleteOpen(false);
    } catch (err) {
      console.error(err);
    }
  };

  // Open edit dialog
  const openEdit = (item: ServiceType) => {
    setEditItem(item);
    setEditName(item.ServiceTypeName ?? "");
    setEditOpen(true);
  };

  // Open delete dialog
  const openDelete = (item: ServiceType) => {
    setDeleteItem(item);
    setDeleteOpen(true);
  };

  const filteredServiceTypes = serviceTypes.filter(st => 
    !searchQuery || st.ServiceTypeName.toLowerCase().includes(searchQuery.toLowerCase())
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
            <h1 className="text-3xl font-bold tracking-tight">Service Type Master</h1>
          </div>
          <p className="text-muted-foreground">
            Manage service type categories
          </p>
        </div>

        {/* Create Dialog */}
        <div className="flex flex-wrap items-center gap-3">
          <Input 
            placeholder="Search service types..." 
            className="w-full sm:w-64"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Dialog open={createOpen} onOpenChange={setCreateOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2 shadow-lg shadow-primary/25">
                <Plus className="h-4 w-4" />
                Add Service Type
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle>Add New Service Type</DialogTitle>
                <DialogDescription>
                  Create a new service type for your organization.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="create-name">Service Type Name</Label>
                  <Input
                    id="create-name"
                    placeholder="e.g., Hardware Repair"
                    value={createName}
                    onChange={(e) => setCreateName(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCreateOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={createServiceTypeMutation.isPending || !createName.trim()}>
                  {createServiceTypeMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    "Create Service Type"
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {error}
          <button onClick={() => setError("")} className="ml-auto text-xs underline">
            Dismiss
          </button>
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
              <p className="text-sm font-medium text-muted-foreground">Total Types</p>
              <p className="text-2xl font-bold">{loading ? "—" : serviceTypes.length}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredServiceTypes.length === 0 && (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <Settings2 className="mb-4 h-12 w-12 text-muted-foreground/50" />
            <h3 className="text-lg font-semibold">{searchQuery ? "No matching service types" : "No service types yet"}</h3>
            <p className="text-sm text-muted-foreground mt-1">
              {searchQuery ? "Try refining your search query." : "Get started by adding your first service type."}
            </p>
            {!searchQuery && (
              <Button className="mt-4 gap-2" onClick={() => setCreateOpen(true)}>
                <Plus className="h-4 w-4" />
                Add Service Type
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Table */}
      {!loading && filteredServiceTypes.length > 0 && (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/50">
                  <TableHead className="font-semibold">#</TableHead>
                  <TableHead className="font-semibold">Service Type Name</TableHead>
                  <TableHead className="text-right font-semibold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServiceTypes.map((item, index) => (
                  <TableRow key={item.ServiceTypeID} className="group">
                    <TableCell className="text-muted-foreground">{index + 1}</TableCell>
                    <TableCell className="font-medium">{item.ServiceTypeName}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-primary hover:bg-primary/10"
                          onClick={() => openEdit(item)}
                        >
                          <Edit2 className="h-4 w-4" />
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
            <DialogTitle>Edit Service Type</DialogTitle>
            <DialogDescription>
              Update the service type name.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Service Type Name</Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={updateServiceTypeMutation.isPending || !editName.trim()}>
              {updateServiceTypeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Service Type</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{deleteItem?.ServiceTypeName}</strong>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={deleteServiceTypeMutation.isPending}>
              {deleteServiceTypeMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
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