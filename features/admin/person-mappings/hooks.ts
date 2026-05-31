import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
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
            queryClient.invalidateQueries({ queryKey: queryKeys.personMappings });
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
            queryClient.invalidateQueries({ queryKey: queryKeys.personMappings });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.personMappings, context.previous);
            }
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
            queryClient.invalidateQueries({ queryKey: queryKeys.personMappings });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.personMappings, context.previous);
            }
        }
    });
}
