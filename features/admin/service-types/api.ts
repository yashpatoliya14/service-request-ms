import { apiClient } from "@/lib/apiClient";
import { ServiceType } from "./types";
import { 
    createServiceTypeSchema, 
    updateServiceTypeSchema, 
    type CreateServiceTypeInput, 
    type UpdateServiceTypeInput 
} from "./schemas";
import { ZodError } from "zod";

export async function getServiceTypes(): Promise<ServiceType[]> {
    const res = await apiClient.get<ServiceType[]>("/api/admin/service-type");
    if (res.success && res.data) {
        return res.data;
    }
    throw new Error(res.message || "Failed to fetch service types");
}

export async function createServiceType(payload: CreateServiceTypeInput): Promise<ServiceType> {
    try {
        const validatedData = createServiceTypeSchema.parse(payload);
        const res = await apiClient.post<any>("/api/admin/service-type", validatedData);
        if (res.success && res.data) {
            if (Array.isArray(res.data)) {
                return res.data[0];
            }
            return res.data;
        }
        throw new Error(res.message || "Failed to create service type");
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

export async function updateServiceType(payload: UpdateServiceTypeInput): Promise<ServiceType> {
    try {
        const validatedData = updateServiceTypeSchema.parse(payload);
        const res = await apiClient.patch<any>(`/api/admin/service-type/${validatedData.ServiceTypeID}`, {
            ServiceTypeName: validatedData.ServiceTypeName
        });
        if (res.success && res.data) {
            if (Array.isArray(res.data)) {
                return res.data[0];
            }
            return res.data;
        }
        throw new Error(res.message || "Failed to update service type");
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

export async function deleteServiceType(serviceTypeId: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/api/admin/service-type/${serviceTypeId}`);
    if (res.success) {
        return true;
    }
    throw new Error(res.message || "Failed to delete service type");
}
