import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import {
    getStatuses,
    createStatus,
    updateStatus,
    deleteStatus
} from "./api";
import { StatusItem } from "./types";
import { type CreateStatusInput, type UpdateStatusInput } from "./schemas";

export function useStatuses() {
    return useQuery({
        queryKey: queryKeys.statuses,
        queryFn: getStatuses,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        retry: 1
    });
}

export function useCreateStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateStatusInput) => createStatus(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.statuses });
        }
    });
}

export function useUpdateStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateStatusInput) => updateStatus(payload),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.statuses });
            const previous = queryClient.getQueryData<StatusItem[]>(queryKeys.statuses);
            
            if (previous) {
                queryClient.setQueryData<StatusItem[]>(queryKeys.statuses, old => 
                    old ? old.map(s => s.ServiceRequestStatusID === variables.ServiceRequestStatusID ? { ...s, ...variables } : s) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.statuses });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.statuses, context.previous);
            }
        }
    });
}

export function useDeleteStatus() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: number) => deleteStatus(id),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.statuses });
            const previous = queryClient.getQueryData<StatusItem[]>(queryKeys.statuses);
            
            if (previous) {
                queryClient.setQueryData<StatusItem[]>(queryKeys.statuses, old => 
                    old ? old.filter(s => s.ServiceRequestStatusID !== id) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.statuses });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.statuses, context.previous);
            }
        }
    });
}
