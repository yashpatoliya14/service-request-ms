import { apiClient } from "@/lib/apiClient";
import { IPersonMapping } from "./types";
import { 
    createMappingSchema, 
    updateMappingSchema, 
    type CreateMappingInput, 
    type UpdateMappingInput 
} from "./schemas";
import { ZodError } from "zod";
import { DepartmentPerson } from "../department-persons";

export async function getPersonMappings(): Promise<IPersonMapping[]> {
    const res = await apiClient.get<IPersonMapping[]>("/api/admin/person-mapping");
    if (res.success && res.data) {
        return res.data;
    }
    throw new Error(res.message || "Failed to fetch person mappings");
}

export async function getTechnicians(): Promise<DepartmentPerson[]> {
    const res = await apiClient.get<DepartmentPerson[]>("/api/admin/person-master?role=technician");
    console.log(res,"testing");
    if (res.success && res.data) {
        
        return res.data;
    }
    throw new Error(res.message || "Failed to fetch technicians");
}



export async function createPersonMapping(payload: CreateMappingInput): Promise<any> {
    try {
        const validatedData = createMappingSchema.parse(payload);
        const res = await apiClient.post<any>("/api/admin/person-mapping", validatedData);
        if (res.success) {
            return res.data;
        }
        throw new Error(res.message || "Failed to create person mapping");
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

export async function updatePersonMapping(payload: UpdateMappingInput): Promise<any> {
    try {
        const validatedData = updateMappingSchema.parse(payload);
        const res = await apiClient.put<any>(`/api/admin/person-mapping/${validatedData.ServiceRequestTypeID}`, {
            ServiceRequestTypeID: validatedData.ServiceRequestTypeID,
            ServicePersonID: validatedData.ServicePersonID,
        });
        if (res.success) {
            return res.data;
        }
        throw new Error(res.message || "Failed to update person mapping");
    } catch (error) {
        if (error instanceof ZodError) {
            throw new Error(error.message);
        }
        throw error;
    }
}

export async function deletePersonMapping(id: string): Promise<boolean> {
    const res = await apiClient.delete<any>(`/api/admin/person-mapping/${id}`);
    if (res.success) {
        return true;
    }
    throw new Error(res.message || "Failed to delete person mapping");
}
