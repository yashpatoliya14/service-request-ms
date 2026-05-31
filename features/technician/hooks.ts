import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { apiClient } from "@/lib/apiClient";
import { ServiceRequest } from "@/types";

export function useTechnicianRequests(userId: string | undefined) {
    return useQuery({
        queryKey: userId ? queryKeys.technician.requests(userId) : ["technician", "requests", "empty"],
        queryFn: async (): Promise<ServiceRequest[]> => {
            if (!userId) return [];
            
            let retryCount = 0;
            const maxRetries = 3;
            
            const attemptFetch = async (): Promise<ServiceRequest[]> => {
                const res = await apiClient.get<ServiceRequest[][]>(
                    `/api/portal/technician/${userId}`
                );
                
                if (res.success && res.data?.[0]) {
                    return res.data[0];
                }
                return [];
            };

            // Retry logic with exponential backoff matching original implementation
            while (retryCount < maxRetries) {
                try {
                    return await attemptFetch();
                } catch (err) {
                    retryCount++;
                    if (retryCount >= maxRetries) {
                        throw err;
                    }
                    await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, retryCount)));
                }
            }
            return [];
        },
        enabled: !!userId,
        staleTime: 1 * 60 * 1000, // 1 minute cache
    });
}

export function useUpdateTechnicianRequestStatus(userId: string | undefined) {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, newStatusId }: { requestId: string; newStatusId: string }) => {
            const res = await apiClient.patch(`/api/portal/technician/${requestId}`, {
                StatusID: newStatusId,
                ServiceRequestTypeID: requestId,
            });
            if (!res.success) {
                throw new Error(res.message || "Failed to update status");
            }
            return res;
        },
        onMutate: async (variables) => {
            if (!userId) return;
            const qKey = queryKeys.technician.requests(userId);
            await queryClient.cancelQueries({ queryKey: qKey });
            
            const previous = queryClient.getQueryData<ServiceRequest[]>(qKey);
            
            if (previous) {
                queryClient.setQueryData<ServiceRequest[]>(qKey, old => 
                    old ? old.map(r => String(r.ServiceRequestID) === String(variables.requestId) ? { ...r, StatusID: variables.newStatusId } : r) : []
                );
            }
            return { previous };
        },
        onSuccess: () => {
            if (userId) {
                queryClient.invalidateQueries({ queryKey: queryKeys.technician.requests(userId) });
            }
        },
        onError: (err: any, variables, context) => {
            if (userId && context?.previous) {
                queryClient.setQueryData(queryKeys.technician.requests(userId), context.previous);
            }
        }
    });
}
