import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import {
    getServiceTypes,
    createServiceType,
    updateServiceType,
    deleteServiceType
} from "./api";
import { ServiceType } from "./types";
import { type CreateServiceTypeInput, type UpdateServiceTypeInput } from "./schemas";

export function useServiceTypes() {
    return useQuery({
        queryKey: queryKeys.serviceTypes,
        queryFn: getServiceTypes,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
        retry: 1
    });
}

export function useCreateServiceType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: CreateServiceTypeInput) => createServiceType(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.serviceTypes });
        }
    });
}

export function useUpdateServiceType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (payload: UpdateServiceTypeInput) => updateServiceType(payload),
        onMutate: async (variables) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.serviceTypes });
            const previous = queryClient.getQueryData<ServiceType[]>(queryKeys.serviceTypes);
            
            if (previous) {
                queryClient.setQueryData<ServiceType[]>(queryKeys.serviceTypes, old => 
                    old ? old.map(s => s.ServiceTypeID === variables.ServiceTypeID ? { ...s, ServiceTypeName: variables.ServiceTypeName } : s) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.serviceTypes });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.serviceTypes, context.previous);
            }
        }
    });
}

export function useDeleteServiceType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (serviceTypeId: string) => deleteServiceType(serviceTypeId),
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.serviceTypes });
            const previous = queryClient.getQueryData<ServiceType[]>(queryKeys.serviceTypes);
            
            if (previous) {
                queryClient.setQueryData<ServiceType[]>(queryKeys.serviceTypes, old => 
                    old ? old.filter(s => s.ServiceTypeID !== id) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.serviceTypes });
        },
        onError: (err: any, variables, context) => {
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.serviceTypes, context.previous);
            }
        }
    });
}
