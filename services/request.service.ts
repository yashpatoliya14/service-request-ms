import { apiClient } from "@/lib/apiClient";
import { ServiceRequestStatus, Department, ServiceRequestType } from "@/types/common";


export const fetchStatuses = async (): Promise<ServiceRequestStatus[]> => {
    try {
        const res = await apiClient.get<ServiceRequestStatus[]>("/api/admin/status-master");
        if (res.success) return res.data || [];
        return [];
    } catch (err) {
        console.error("Failed to fetch statuses:", err);
        return [];
    }
};

export const fetchDepartments = async (): Promise<Department[]> => {
    try {
        const res = await apiClient.get<Department[]>("/api/admin/department");
        if (res.success) return res.data || [];
        return [];
    } catch (err) {
        console.error("Failed to fetch departments:", err);
        return [];
    }
};

export const fetchRequestTypes = async (): Promise<ServiceRequestType[]> => {
    try {
        const res = await apiClient.get<ServiceRequestType[]>("/api/admin/service-request-type");
        if (res.success) return res.data || [];
        return [];
    } catch (err) {
        console.error("Failed to fetch request types:", err);
        return [];
    }
};