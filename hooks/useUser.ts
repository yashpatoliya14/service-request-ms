import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { apiClient } from "@/lib/apiClient";
import { UserProfile } from "@/types";

export function useUser(){
    const queryClient = useQueryClient();
    return useQuery({
        queryKey: queryKeys.user,
        queryFn: async () => {
            const res = await apiClient.get<UserProfile>("/api/auth/me");
            if (res.success && res.data) {
                return res.data;
            }
            throw new Error(res.message || "Failed to fetch user");
        },
    })
}