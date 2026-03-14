"use client";

import React, { useEffect, useState } from "react";
import { Plus, GitMerge, Search, User, Settings, Trash2, CheckCircle, ArrowRight, Loader2, Pencil, AlertCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Skeleton } from "@/components/ui/skeleton";

interface IPersonMapping {
  ServiceRequestTypeID: string;
  ServicePersonID: string;
  ServiceRequestType: {
    RequestTypeName: string;
  };
  ServiceDeptPerson: {
    Users: {
      FullName: string;
      Email: string;
      Phone: string;
      Role: string;
    };
    ServiceDepartment: {
      DeptName: string;
    };
  };
}

interface IServiceRequestType {
  ServiceRequestTypeID: string;
  RequestTypeName: string;
}

interface IServicePerson {
  DeptPersonID: string;
  Users: {
    FullName: string;
    Email: string;
    Phone: string;
    Role: string;
  };
  ServiceDepartment: {
    DeptName: string;
  };
}

export default function AutoAssignmentMaster() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  

  const [serviceRequestType,setServiceRequestType] = useState<IServiceRequestType[]>([]);
  const [servicePerson,setServicePerson] = useState<IServicePerson[]>([]);
  const [personMappingList,setPersonMappingList] = useState<IPersonMapping[]>([]);
  const [serviceRequestTypeID,setServiceRequestTypeID] = useState<string>("");
  const [servicePersonID,setServicePersonID] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<IPersonMapping | null>(null);
  const [editServicePersonID, setEditServicePersonID] = useState<string>("");

  const fetchMappingList = async () => {
    const response = await apiClient.get<IPersonMapping[]>("/api/admin/person-mapping");
    setPersonMappingList(response.data || []);
  };

  const fetchServiceRequestType = async () => {
    const response = await apiClient.get<IServiceRequestType[]>("/api/admin/service-request-type");
    setServiceRequestType(response.data || []);
  };

  const fetchServicePerson = async () => {
    const response = await apiClient.get<IServicePerson[]>("/api/admin/person-master");
    setServicePerson(response.data || []);
  };

  useEffect(() => {
    const fetchData = async () => {
      setLoadingInitial(true);
      await Promise.all([
        fetchMappingList(),
        fetchServiceRequestType(),
        fetchServicePerson()
      ]);
      setLoadingInitial(false);
    };
    fetchData();
  }, []);

  const handleCreateMapping = async (serviceRequestTypeID:string,servicePersonID:string) => {
    setIsCreating(true);
    setCreateError("");
    try {
      const response = await apiClient.post("/api/admin/person-mapping", {
        ServiceRequestTypeID:serviceRequestTypeID,
        DeptPersonID:servicePersonID,
      });
      if(response.success){
        fetchMappingList();
        setIsModalOpen(false);
        setServiceRequestTypeID("");
        setServicePersonID("");
        setCreateError("");
      } else {
        setCreateError(response.message || "Failed to create mapping. It may already exist.");
      }
    } catch (e: any) {
      console.log(e);
      setCreateError(e.message || "An error occurred while creating mapping");
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdateMapping = async () => {
    if (!editItem) return;
    setIsUpdating(editItem.ServiceRequestTypeID);
    try {
      const response = await apiClient.put(`/api/admin/person-mapping/${editItem.ServiceRequestTypeID}`, {
        ServiceRequestTypeID: editItem.ServiceRequestTypeID,
        ServicePersonID: editServicePersonID,
      });
      if(response.success){
        fetchMappingList();
        setIsEditModalOpen(false);
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsUpdating(null);
    }
  };

  const openEditModal = (item: IPersonMapping) => {
    setEditItem(item);
    setEditServicePersonID(item.ServicePersonID ? item.ServicePersonID.toString() : "");
    setIsEditModalOpen(true);
  };

  const handleDeleteMapping = async (id:string) => {
    setIsDeleting(id);
    try {
      const response = await apiClient.delete(`/api/admin/person-mapping/${id}`);
      if(response.success){
        fetchMappingList();
      }
    } catch (e) {
      console.log(e);
    } finally {
      setIsDeleting(null);
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <GitMerge className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Auto Assignment Master</h1>
          </div>
          <p className="text-muted-foreground">
            Link specific request types to dedicated technicians
          </p>
        </div>
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Create New Mapping
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>New Auto-Assignment</DialogTitle>
              <DialogDescription>
                Link a request type to a technician for automatic assignment.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {createError && (
                <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm font-medium text-destructive">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  {createError}
                </div>
              )}
              <div className="space-y-2">
                <Label>Select Request Type</Label>
                <Select value={serviceRequestTypeID} onValueChange={(value) => setServiceRequestTypeID(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Request Type" />
                  </SelectTrigger>
                  <SelectContent>
                    {serviceRequestType.map((item) => (
                      <SelectItem key={item.ServiceRequestTypeID} value={item.ServiceRequestTypeID.toString()}>
                        {item.RequestTypeName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Select Technician</Label>
                <Select value={servicePersonID} onValueChange={(value) => setServicePersonID(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Technician" />
                  </SelectTrigger>
                  <SelectContent>
                    {servicePerson.map((item) => (
                      <SelectItem key={item.DeptPersonID} value={item.DeptPersonID.toString()}>
                        {item.Users.FullName} ({item.ServiceDepartment.DeptName})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button className="flex-1" onClick={() => handleCreateMapping(serviceRequestTypeID,servicePersonID)} disabled={isCreating || !serviceRequestTypeID || !servicePersonID}>
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Linking...
                    </>
                  ) : (
                    "Link Technician"
                  )}
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { setIsModalOpen(false); setCreateError(""); }} disabled={isCreating}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filter Bar */}
      <Card>
        <CardContent className="flex items-center gap-4 p-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input placeholder="Search by request type or staff..." className="pl-10" />
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="font-semibold">Service Request Type</TableHead>
                <TableHead className="font-semibold text-center">Auto-Assign To</TableHead>
                <TableHead className="text-right font-semibold">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingInitial ? (
                Array.from({ length: 3 }).map((_, idx) => (
                  <TableRow key={idx}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="h-9 w-9 rounded-lg" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[150px]" />
                          <Skeleton className="h-3 w-[100px]" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                        <Skeleton className="h-8 w-[120px] rounded-lg" />
                      </div>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Skeleton className="h-8 w-8 rounded-md" />
                      <Skeleton className="h-8 w-8 rounded-md" />
                    </TableCell>
                  </TableRow>
                ))
              ) : personMappingList.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                    No mappings found.
                  </TableCell>
                </TableRow>
              ) : (
                personMappingList.map((item) => (
                  <TableRow key={item.ServiceRequestTypeID} className="group">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                          <Settings className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-medium">{item.ServiceRequestType.RequestTypeName}</p>
                          <p className="text-xs text-muted-foreground">{item.ServiceDeptPerson.ServiceDepartment.DeptName}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center justify-center gap-3">
                        <ArrowRight className="h-4 w-4 text-muted-foreground/50" />
                        <div className="flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback className="text-xs bg-primary/10 text-primary">
                              {item.ServiceDeptPerson.Users.FullName.split(" ").map((n) => n[0]).join("")}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium">{item.ServiceDeptPerson.Users.FullName}</span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-primary"
                        onClick={() => openEditModal(item)}
                        disabled={isDeleting === item.ServiceRequestTypeID || isUpdating === item.ServiceRequestTypeID}
                      >
                        {isUpdating === item.ServiceRequestTypeID ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Pencil className="h-4 w-4" />
                        )}
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive"
                        onClick={() => handleDeleteMapping(item.ServiceRequestTypeID)}
                        disabled={isDeleting === item.ServiceRequestTypeID || isUpdating === item.ServiceRequestTypeID}
                      >
                        {isDeleting === item.ServiceRequestTypeID ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Trash2 className="h-4 w-4" />
                        )}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Edit Auto-Assignment</DialogTitle>
            <DialogDescription>
              Update the technician assigned to this request type.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Request Type</Label>
              <Input value={editItem?.ServiceRequestType?.RequestTypeName || ""} disabled />
            </div>
            <div className="space-y-2">
              <Label>Select Technician</Label>
              <Select value={editServicePersonID} onValueChange={(value) => setEditServicePersonID(value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select Technician" />
                </SelectTrigger>
                <SelectContent>
                  {servicePerson.map((item) => (
                    <SelectItem key={item.DeptPersonID} value={item.DeptPersonID.toString()}>
                      {item.Users.FullName} ({item.ServiceDepartment.DeptName})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3 pt-2">
              <Button className="flex-1" onClick={handleUpdateMapping} disabled={isUpdating !== null}>
                {isUpdating !== null ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update Mapping"
                )}
              </Button>
              <Button variant="outline" className="flex-1" onClick={() => setIsEditModalOpen(false)} disabled={isUpdating !== null}>
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}