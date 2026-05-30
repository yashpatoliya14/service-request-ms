import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { toast } from "react-hot-toast";
import {
    getPersonMappings,
    createPersonMapping,
    updatePersonMapping,
    deletePersonMapping,
    getTechnicians
} from "./api";
import { IPersonMapping } from "./types";
import { type CreateMappingInput, type UpdateMappingInput } from "./schemas";

export function usePersonMappings() {
    return useQuery({
        queryKey: queryKeys.personMappings,
        queryFn: getPersonMappings,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        retry: 1
    });
}
export function useGetTechnician() {
    return useQuery({
        queryKey: [...queryKeys.personMappings, "technicians"],
        queryFn: getTechnicians,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        retry: 1
    });
}

export function useCreatePersonMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateMappingInput) => createPersonMapping(payload),
        onSuccess: () => {
            toast.success("Auto-assignment linked successfully");
            queryClient.invalidateQueries({ queryKey: queryKeys.personMappings });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to link auto-assignment");
        }
    });
}

export function useUpdatePersonMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateMappingInput) => updatePersonMapping(payload),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.personMappings });
            const previous = queryClient.getQueryData<IPersonMapping[]>(queryKeys.personMappings);
            return { previous };
        },
        onSuccess: () => {
            toast.success("Auto-assignment updated successfully");
            queryClient.invalidateQueries({ queryKey: queryKeys.personMappings });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.personMappings, context.previous);
            }
            toast.error(err.message || "Failed to update auto-assignment");
        }
    });
}

export function useDeletePersonMapping() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => deletePersonMapping(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.personMappings });
            const previous = queryClient.getQueryData<IPersonMapping[]>(queryKeys.personMappings);
            
            if (previous) {
                queryClient.setQueryData<IPersonMapping[]>(queryKeys.personMappings, old => 
                    old ? old.filter(m => m.ServiceRequestTypeID !== id) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            toast.success("Auto-assignment unlinked successfully");
            queryClient.invalidateQueries({ queryKey: queryKeys.personMappings });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.personMappings, context.previous);
            }
            toast.error(err.message || "Failed to unlink auto-assignment");
        }
    });
}
