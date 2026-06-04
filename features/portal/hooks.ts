import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { apiClient } from "@/lib/apiClient";
import { ServiceRequest } from "@/types";

export function usePortalRequests(filters: { search?: string; status?: string; dept?: string } = {}) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.portal.requests(), filters],
        queryFn: async ({ pageParam = null }): Promise<{ requests: ServiceRequest[]; nextCursor: string | null; hasNextPage: boolean; stats: any }> => {
            const params = new URLSearchParams();
            if (pageParam) params.append("cursor", String(pageParam));
            if (filters.search) params.append("search", filters.search);
            if (filters.status) params.append("status", filters.status);
            if (filters.dept) params.append("dept", filters.dept);
            params.append("limit", "5");

            const res = await apiClient.get<{ requests: ServiceRequest[]; nextCursor: string | null; hasNextPage: boolean; stats: any }[]>(
                `/api/portal/requests?${params.toString()}`
            );
            if (res.success && res.data?.[0]) {
                return res.data[0];
            }
            return { requests: [], nextCursor: null, hasNextPage: false, stats: { total: 0, pending: 0, active: 0, closed: 0 } };
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
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
            queryClient.invalidateQueries({ queryKey: queryKeys.portal.requests() });
            queryClient.invalidateQueries({ queryKey: queryKeys.portal.history() });
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

export function usePortalHistory(filters: { search?: string; status?: string; dept?: string } = {}) {
    return useInfiniteQuery({
        queryKey: [...queryKeys.portal.history(), filters],
        queryFn: async ({ pageParam = null }): Promise<{ requests: ServiceRequest[]; nextCursor: string | null; hasNextPage: boolean; stats: any }> => {
            const params = new URLSearchParams();
            if (pageParam) params.append("cursor", String(pageParam));
            if (filters.search) params.append("search", filters.search);
            if (filters.status) params.append("status", filters.status);
            if (filters.dept) params.append("dept", filters.dept);
            params.append("limit", "5");

            const res = await apiClient.get<{ requests: ServiceRequest[]; nextCursor: string | null; hasNextPage: boolean; stats: any }[]>(
                `/api/portal/history?${params.toString()}`
            );
            if (res.success && res.data?.[0]) {
                return res.data[0];
            }
            return { requests: [], nextCursor: null, hasNextPage: false, stats: { total: 0, pending: 0, completed: 0 } };
        },
        initialPageParam: null as string | null,
        getNextPageParam: (lastPage) => lastPage.nextCursor,
        staleTime: 1 * 60 * 1000, // 1 minute cache
    });
}
