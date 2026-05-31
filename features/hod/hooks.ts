import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { apiClient } from "@/lib/apiClient";
import { ServiceRequest, DeptPerson } from "@/types";
import { toast } from "react-hot-toast";

export function useHodRequests() {
    return useQuery({
        queryKey: queryKeys.hod.requests(),
        queryFn: async (): Promise<ServiceRequest[]> => {
            const res = await apiClient.get<ServiceRequest[][]>("/api/hod");
            if (res.success && res.data?.[0]) {
                return res.data[0];
            }
            return [];
        },
        staleTime: 1 * 60 * 1000, // 1 minute cache
    });
}

export function useHodTechnicians() {
    return useQuery({
        queryKey: queryKeys.hod.technicians(),
        queryFn: async (): Promise<DeptPerson[]> => {
            const res = await apiClient.get<DeptPerson[]>("/api/hod/technicians");
            if (res.success && res.data) {
                return res.data;
            }
            return [];
        },
        staleTime: 5 * 60 * 1000, // 5 minutes cache
    });
}

export function useAssignTechnician() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, deptPersonId }: { requestId: string; deptPersonId: string }) => {
            const res = await apiClient.post("/api/hod", {
                ServiceRequestID: requestId,
                AssignedToID: deptPersonId,
            });
            if (!res.success) {
                throw new Error(res.message || "Failed to assign technician");
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("Technician assigned successfully!");
            queryClient.invalidateQueries({ queryKey: queryKeys.hod.requests() });
        },
        onError: (err: any) => {
            toast.error(err.message || "Failed to assign technician");
        }
    });
}

export function useEvaluateRequest() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({ requestId, statusId, evaluationNotes }: { requestId: string; statusId: string; evaluationNotes?: string }) => {
            const res = await apiClient.post("/api/hod/evaluate", {
                ServiceRequestID: requestId,
                StatusID: statusId,
                EvaluationNotes: evaluationNotes
            });
            if (!res.success) {
                throw new Error(res.message || "Failed to evaluate request");
            }
            return res.data;
        },
        onSuccess: () => {
            toast.success("Request evaluated successfully!");
            queryClient.invalidateQueries({ queryKey: queryKeys.hod.requests() });
        },
        onError: (err: any) => {
            toast.error(err.message || "Evaluation failed");
        }
    });
}
