import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { toast } from "react-hot-toast";
import {
    getDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
} from "./api";
import { Department } from "./types";
import { type CreateDepartmentInput, type UpdateDepartmentInput } from "./schemas";

export function useDepartments() {
    return useQuery({
        queryKey: queryKeys.department,
        queryFn: getDepartments,
        staleTime: 5 * 60 * 1000, // 5 minutes
        retry: 1
    });
}

export function useCreateDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateDepartmentInput) => createDepartment(payload),
        onSuccess: () => {
            toast.success("Department created successfully");
            queryClient.invalidateQueries({ queryKey: queryKeys.department });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to create department");
        }
    });
}

export function useUpdateDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateDepartmentInput) => updateDepartment(payload),
        onMutate: async (variables) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: queryKeys.department });
            const previous = queryClient.getQueryData<Department[]>(queryKeys.department);
            
            if (previous) {
                queryClient.setQueryData<Department[]>(queryKeys.department, old => 
                    old ? old.map(d => d.ServiceDeptID === variables.ServiceDeptID ? { ...d, DeptName: variables.DeptName } : d) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            toast.success("Department updated successfully");
            queryClient.invalidateQueries({ queryKey: queryKeys.department });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.department, context.previous);
            }
            toast.error(err.message || "Failed to update department");
        }
    });
}

export function useDeleteDepartment() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (departmentId: string) => deleteDepartment(departmentId),
        onMutate: async (id) => {
            // Optimistic update
            await queryClient.cancelQueries({ queryKey: queryKeys.department });
            const previous = queryClient.getQueryData<Department[]>(queryKeys.department);
            
            if (previous) {
                queryClient.setQueryData<Department[]>(queryKeys.department, old => 
                    old ? old.filter(d => d.ServiceDeptID !== id) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            toast.success("Department deleted successfully");
            queryClient.invalidateQueries({ queryKey: queryKeys.department });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.department, context.previous);
            }
            toast.error(err.message || "Failed to delete department");
        }
    });
}
