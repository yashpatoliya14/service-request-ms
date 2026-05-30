import { apiClient } from "@/lib/apiClient";
import { Department } from "./types";
import { 
    createDepartmentSchema, 
    updateDepartmentSchema, 
    type CreateDepartmentInput, 
    type UpdateDepartmentInput 
} from "./schemas";
import { ZodError } from "zod";

/**
 * Fetches all departments from the API.
 * The apiClient already throws if response.ok is false,
 * and we throw manually if response.success is false.
 */
export async function getDepartments(): Promise<Department[]> {
    const res = await apiClient.get<Department[]>("/api/admin/department");
    if (res.success && res.data) {
        return res.data;
    }
    throw new Error(res.message || "Failed to fetch departments");
}

/**
 * Creates a new department.
 */
export async function createDepartment(payload: CreateDepartmentInput): Promise<Department> {
    try {
        const validatedData = createDepartmentSchema.parse(payload);
        const res = await apiClient.post<Department[]>("/api/admin/department", validatedData);
        // Note: your API route returns an array containing the new department: `data: [department]`
        if (res.success && res.data && res.data.length > 0) {
            return res.data[0];
        }
        throw new Error(res.message || "Failed to create department");
    } catch (error:unknown) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

/**
 * Updates an existing department.
 */
export async function updateDepartment(payload: UpdateDepartmentInput): Promise<Department> {
    try {
        const validatedData = updateDepartmentSchema.parse(payload);
        const res = await apiClient.patch<Department[]>(`/api/admin/department/${validatedData.ServiceDeptID}`, {
            DeptName: validatedData.DeptName
        });
        if (res.success && res.data && res.data.length > 0) {
            return res.data[0];
        }
        throw new Error(res.message || "Failed to update department");
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

/**
 * Deletes a department by ID.
 */
export async function deleteDepartment(departmentId: string): Promise<boolean> {
    const res = await apiClient.delete<Department[]>(`/api/admin/department/${departmentId}`);
    if (res.success) {
        return true;
    }
    throw new Error(res.message || "Failed to delete department");
}