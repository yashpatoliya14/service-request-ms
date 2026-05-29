import { apiClient } from "@/lib/apiClient";
import { UserProfile } from "@/types";


export const fetchUser = async (): Promise<UserProfile | null> => {
    try {
        const res = await apiClient.get<UserProfile[]>("/api/auth/me");
        if (res.success && res.data?.[0]) {
            return res.data[0];
        }
        return null;
    } catch (err) {
        console.error("Failed to fetch user:", err);
        return null;
    }
};