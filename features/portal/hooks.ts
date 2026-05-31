import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { apiClient } from "@/lib/apiClient";
import { ServiceRequest } from "@/types";
import { toast } from "react-hot-toast";

export function usePortalRequests() {
    return useQuery({
        queryKey: queryKeys.portal.requests(),
        queryFn: async (): Promise<ServiceRequest[]> => {
            const res = await apiClient.get<ServiceRequest[][]>("/api/portal/requests");
            if (res.success && res.data?.[0]) {
                return res.data[0];
            }
            return [];
        },
        staleTime: 1 * 60 * 1000, // 1 minute cache
    });
}

export function useCreatePortalRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (payload: {
            ServiceRequestTypeID: string;
            RequestorID: string;
            Title: string;
            Description: string;
            ServiceDepartmentID: string;
        }) => {
            const res = await apiClient.post("/api/portal/requestor", payload);
            if (!res.success) {
                throw new Error(res.message || "Failed to create request");
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("Service request submitted successfully!");
            queryClient.invalidateQueries({ queryKey: queryKeys.portal.requests() });
            queryClient.invalidateQueries({ queryKey: queryKeys.portal.history() });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to submit request");
        }
    });
}

export function useCancelPortalRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async (id: string) => {
            const res = await apiClient.delete(`/api/portal/requestor/${id}`);
            if (!res.success) {
                throw new Error(res.message || "Failed to cancel request");
            }
            return res;
        },
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: queryKeys.portal.requests() });
            await queryClient.cancelQueries({ queryKey: queryKeys.portal.history() });
            
            const prevRequests = queryClient.getQueryData<ServiceRequest[]>(queryKeys.portal.requests());
            const prevHistory = queryClient.getQueryData<ServiceRequest[]>(queryKeys.portal.history());
            
            if (prevRequests) {
                queryClient.setQueryData<ServiceRequest[]>(queryKeys.portal.requests(), old => 
                    old ? old.filter(r => String(r.ServiceRequestID) !== String(id)) : []
                );
            }
            if (prevHistory) {
                queryClient.setQueryData<ServiceRequest[]>(queryKeys.portal.history(), old => 
                    old ? old.filter(r => String(r.ServiceRequestID) !== String(id)) : []
                );
            }
            return { prevRequests, prevHistory };
        },
        onSuccess: () => {
            toast.success("Request cancelled successfully!");
            queryClient.invalidateQueries({ queryKey: queryKeys.portal.requests() });
            queryClient.invalidateQueries({ queryKey: queryKeys.portal.history() });
        },
        onError: (err: any, variables, context) => {
            if (context?.prevRequests) {
                queryClient.setQueryData(queryKeys.portal.requests(), context.prevRequests);
            }
            if (context?.prevHistory) {
                queryClient.setQueryData(queryKeys.portal.history(), context.prevHistory);
            }
            toast.error(err.message || "Failed to cancel request");
        }
    });
}

export function useRequestDetail(requestId: string | undefined) {
    return useQuery({
        queryKey: requestId ? queryKeys.portal.requestDetail(requestId) : ["portal", "requestDetail", "empty"],
        queryFn: async (): Promise<ServiceRequest | null> => {
            if (!requestId) return null;
            const res = await apiClient.get<ServiceRequest[]>(`/api/portal/requestor/${requestId}`);
            if (res.success && res.data?.[0]) {
                return res.data[0];
            }
            return null;
        },
        enabled: !!requestId,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useRequestChat(requestId: string | undefined) {
    return useQuery({
        queryKey: requestId ? queryKeys.portal.requestChat(requestId) : ["portal", "requestChat", "empty"],
        queryFn: async (): Promise<any[]> => {
            if (!requestId) return [];
            const res = await apiClient.get<any[]>(`/api/chat/${requestId}`);
            if (res.success && res.data) {
                return res.data;
            }
            return [];
        },
        enabled: !!requestId,
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

export function usePortalHistory() {
    return useQuery({
        queryKey: queryKeys.portal.history(),
        queryFn: async (): Promise<ServiceRequest[]> => {
            const res = await apiClient.get<ServiceRequest[][]>("/api/portal/history");
            if (res.success && res.data?.[0]) {
                return res.data[0];
            }
            return [];
        },
        staleTime: 1 * 60 * 1000, // 1 minute cache
    });
}
