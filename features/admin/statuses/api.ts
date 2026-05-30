import { apiClient } from "@/lib/apiClient";
import { StatusItem } from "./types";
import { 
    createStatusSchema, 
    updateStatusSchema, 
    type CreateStatusInput, 
    type UpdateStatusInput 
} from "./schemas";
import { ZodError } from "zod";

export async function getStatuses(): Promise<StatusItem[]> {
    const res = await apiClient.get<StatusItem[]>("/api/admin/status-master");
    if (res.success && res.data) {
        return res.data;
    }
    throw new Error(res.message || "Failed to fetch statuses");
}

export async function createStatus(payload: CreateStatusInput): Promise<StatusItem> {
    try {
        const validatedData = createStatusSchema.parse(payload);
        const res = await apiClient.post<any>("/api/admin/status-master", validatedData);
        if (res.success && res.data) {
            if (Array.isArray(res.data)) {
                return res.data[0];
            }
            return res.data;
        }
        throw new Error(res.message || "Failed to create status");
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

export async function updateStatus(payload: UpdateStatusInput): Promise<StatusItem> {
    try {
        const validatedData = updateStatusSchema.parse(payload);
        const res = await apiClient.patch<any>(`/api/admin/status-master/${validatedData.ServiceRequestStatusID}`, {
            ServiceRequestStatusName: validatedData.ServiceRequestStatusName,
            Sequence: validatedData.Sequence,
            Description: validatedData.Description,
            ServiceRequestStatusCssClass: validatedData.ServiceRequestStatusCssClass,
            IsAllowedForTechnician: validatedData.IsAllowedForTechnician,
        });
        if (res.success && res.data) {
            if (Array.isArray(res.data)) {
                return res.data[0];
            }
            return res.data;
        }
        throw new Error(res.message || "Failed to update status");
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

export async function deleteStatus(id: number): Promise<boolean> {
    const res = await apiClient.delete<any>(`/api/admin/status-master/${id}`);
    if (res.success) {
        return true;
    }
    throw new Error(res.message || "Failed to delete status");
}
