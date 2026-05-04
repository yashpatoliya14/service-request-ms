import { apiClient } from "@/lib/apiClient";
import { ServiceRequest, ServiceRequestStatus } from "@/types/common";

export interface UpdateStatusData {
  ServiceRequestID: string;
  StatusID: string;
}

// Technician Service
export class TechnicianService {
  private static readonly BASE_PATH = "/api/portal/technician";

  // Get technician's assigned requests
  static async getAssignedRequests(userId: string) {
    try {
      const response = await apiClient.get<ServiceRequest[][]>(`${this.BASE_PATH}/${userId}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch assigned requests:", error);
      throw error;
    }
  }

  // Get request by ID
  static async getRequestById(requestId: string) {
    try {
      const response = await apiClient.get<ServiceRequest[]>(`${this.BASE_PATH}/${requestId}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch request:", error);
      throw error;
    }
  }

  // Update request status
  static async updateStatus(data: UpdateStatusData) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}`, data);
      return response;
    } catch (error) {
      console.error("Failed to update request status:", error);
      throw error;
    }
  }

  // Update request status by ID
  static async updateStatusById(requestId: string, statusId: string) {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/${requestId}`, { StatusID: statusId });
      return response;
    } catch (error) {
      console.error("Failed to update request status by ID:", error);
      throw error;
    }
  }

  // Get all available statuses
  static async getStatuses() {
    try {
      const response = await apiClient.get<ServiceRequestStatus[]>("/api/admin/status-master");
      return response;
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
      throw error;
    }
  }

  // Get technician-specific statuses
  static getTechnicianStatuses(statuses: ServiceRequestStatus[]): ServiceRequestStatus[] {
    return statuses.filter(status => status.IsAllowedForTechnician);
  }

  // Check if request is in terminal status
  static isTerminal(request: ServiceRequest, statuses: ServiceRequestStatus[]): boolean {
    if (request.ServiceRequestStatus?.IsTerminal === true) return true;
    if (request.StatusID) {
      const status = statuses.find(s => String(s.ServiceRequestStatusID) === String(request.StatusID));
      return status?.IsTerminal === true;
    }
    return false;
  }
}
