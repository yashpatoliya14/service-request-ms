"use client";

import React, { useState } from "react";
import { Building2, Plus, Trash2, MapPin, Phone, Users, Pencil, MoreVertical } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function DepartmentMaster() {
  const [depts, setDepts] = useState([
    { id: 1, name: "IT Support", head: "Vijay Shah", extension: "101", location: "Block A, 2nd Floor", personnel: 12 },
    { id: 2, name: "Maintenance", head: "Amit Patel", extension: "205", location: "Ground Floor", personnel: 8 },
    { id: 3, name: "Housekeeping", head: "Sunita Rao", extension: "009", location: "Basement", personnel: 15 },
    { id: 4, name: "Electrical", head: "Rajesh Kumar", extension: "301", location: "Block B, 1st Floor", personnel: 6 },
    { id: 5, name: "HR Department", head: "Priya Sharma", extension: "102", location: "Block A, 3rd Floor", personnel: 10 },
    { id: 6, name: "Security", head: "Ram Singh", extension: "001", location: "Main Gate", personnel: 20 },
  ]);

  const colors = [
    "from-violet-500 to-purple-600",
    "from-blue-500 to-cyan-500",
    "from-emerald-500 to-teal-500",
    "from-amber-500 to-orange-500",
    "from-rose-500 to-pink-500",
    "from-indigo-500 to-blue-500",
  ];

  

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-3xl font-bold tracking-tight">Department Master</h1>
          </div>
          <p className="text-muted-foreground">
            Manage organizational service departments
          </p>
        </div>
        <Dialog>
          <DialogTrigger asChild>
            <Button className="gap-2 shadow-lg shadow-primary/25">
              <Plus className="h-4 w-4" />
              Add Department
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Department</DialogTitle>
              <DialogDescription>
                Create a new department for your organization.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Department Name</Label>
                <Input id="name" placeholder="e.g., IT Support" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="head">Department Head</Label>
                <Input id="head" placeholder="e.g., John Doe" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="extension">Extension</Label>
                  <Input id="extension" placeholder="e.g., 101" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <Input id="location" placeholder="e.g., Block A" />
                </div>
              </div>
              <Button className="mt-2">Create Department</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Departments</p>
              <p className="text-2xl font-bold">{depts.length}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-4 p-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Personnel</p>
              <p className="text-2xl font-bold">{depts.reduce((acc, d) => acc + d.personnel, 0)}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Department Grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {depts.map((d, i) => (
          <Card
            key={d.id}
            className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/5"
          >
            {/* Gradient accent */}
            <div
              className={`absolute inset-x-0 top-0 h-1 bg-gradient-to-r ${colors[i % colors.length]}`}
            />

            <CardHeader className="pb-4">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12 border-2 border-primary/10">
                    <AvatarFallback
                      className={`bg-gradient-to-br ${colors[i % colors.length]} text-white font-semibold`}
                    >
                      {d.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{d.name}</CardTitle>
                    <CardDescription className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {d.personnel} personnel
                    </CardDescription>
                  </div>
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>
                      <Pencil className="mr-2 h-4 w-4" />
                      Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Users className="mr-2 h-4 w-4" />
                      View Personnel
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div className="text-sm">
                  <span className="text-muted-foreground">Head: </span>
                  <span className="font-medium">{d.head}</span>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">{d.location}</span>
              </div>
              <div className="flex items-center gap-3 rounded-lg bg-muted/50 p-3">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Ext: {d.extension}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}