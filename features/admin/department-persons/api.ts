import { apiClient } from "@/lib/apiClient";
import { DepartmentPerson } from "./types";
import { 
    createDepartmentPersonSchema, 
    updateDepartmentPersonSchema, 
    type CreateDepartmentPersonInput, 
    type UpdateDepartmentPersonInput 
} from "./schemas";
import { ZodError } from "zod";

export async function getAllDepartmentPersons(): Promise<DepartmentPerson[]> {
    
    try{

        const res = await apiClient.get<DepartmentPerson[]>("/api/admin/person-master");
        if(res.success){
            return res.data
        }
        throw new Error(res.message || "Failed to fetch department persons")
    }catch(err){
        if(err instanceof ZodError){
            throw new Error(err.message)
        }
        throw err
    }
}

export async function createDepartmentPersonAPI(variables: CreateDepartmentPersonInput){
    try{
        const validatedData = createDepartmentPersonSchema.parse(variables);
        const res = await apiClient.post<DepartmentPerson[]>("/api/admin/person-master", validatedData);
        if(res.success){
            return res.data[0]
        }
        throw new Error(res.message || "Failed to create department person")
    }catch(err){
        if(err instanceof ZodError){
            throw new Error(err.message)
        }
        throw err
    }
}

export async function updateDepartmentPerson(data: UpdateDepartmentPersonInput): Promise<DepartmentPerson> {
    try{
        const validatedData = updateDepartmentPersonSchema.parse(data);
        const res = await apiClient.patch<DepartmentPerson[]>("/api/admin/person-master/" + validatedData.DeptPersonID, validatedData);
        if(res.success){
            return res.data[0]
        }
        throw new Error(res.message || "Failed to update department person")
    }catch(err){
        if(err instanceof ZodError){
            throw new Error(err.message)
        }
        throw err
    }
}

export async function deleteDepartmentPerson(id: string): Promise<void> {
    try{

        const res = await apiClient.delete(`/api/admin/person-master/${id}`);
        if(res.success){
            return
        }
        throw new Error(res.message || "Failed to delete department person")
    }catch(err){
        if(err instanceof ZodError){
            throw new Error(err.message)
        }
        throw err
    }

}