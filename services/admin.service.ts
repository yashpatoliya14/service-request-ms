import { apiClient } from "@/lib/apiClient";
import { ServiceRequest, ServiceRequestStatus } from "@/types/common";

// Types
export interface DashboardStats {
  totalRequests: number;
  pendingRequests: number;
  completedRequests: number;
  activeUsers: number;
  requestsByStatus: Array<{
    statusName: string;
    count: number;
    cssClass: string;
  }>;
}

export interface ServiceRequestType {
  ServiceRequestTypeID: string;
  RequestTypeName: string;
  DefaultPriority: string | null;
  IsActive: boolean | null;
}

export interface CreateServiceRequestTypeData {
  ServiceTypeID: string;
  ServiceDept: string;
  ServiceRequestTypeName: string;
  DefaultPriority: string;
  IsActive: boolean;
}

export interface UpdateServiceRequestTypeData {
  ServiceRequestTypeName: string;
  DefaultPriority: string;
  IsActive: boolean;
}

// Admin Service
export class AdminService {
  private static readonly BASE_PATH = "/api/admin";

  // Get dashboard statistics
  static async getDashboardStats() {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/dashboard`);
      return response;
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
      throw error;
    }
  }

  // Get all service request types
  static async getServiceRequestTypes() {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/service-request-type`);
      return response;
    } catch (error) {
      console.error("Failed to fetch service request types:", error);
      throw error;
    }
  }

  // Create service request type
  static async createServiceRequestType(data: CreateServiceRequestTypeData) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/service-request-type`, data);
      return response;
    } catch (error) {
      console.error("Failed to create service request type:", error);
      throw error;
    }
  }

  // Update service request type
  static async updateServiceRequestType(id: string, data: UpdateServiceRequestTypeData) {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/service-request-type/${id}`, data);
      return response;
    } catch (error) {
      console.error("Failed to update service request type:", error);
      throw error;
    }
  }

  // Delete service request type
  static async deleteServiceRequestType(id: string) {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/service-request-type/${id}`);
      return response;
    } catch (error) {
      console.error("Failed to delete service request type:", error);
      throw error;
    }
  }

  // Get all statuses
  static async getStatuses() {
    try {
      const response = await apiClient.get(`${this.BASE_PATH}/status-master`);
      return response;
    } catch (error) {
      console.error("Failed to fetch statuses:", error);
      throw error;
    }
  }

  // Create status
  static async createStatus(data: Partial<ServiceRequestStatus>) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/status-master`, data);
      return response;
    } catch (error) {
      console.error("Failed to create status:", error);
      throw error;
    }
  }

  // Update status
  static async updateStatus(id: string, data: Partial<ServiceRequestStatus>) {
    try {
      const response = await apiClient.put(`${this.BASE_PATH}/status-master/${id}`, data);
      return response;
    } catch (error) {
      console.error("Failed to update status:", error);
      throw error;
    }
  }

  // Delete status
  static async deleteStatus(id: string) {
    try {
      const response = await apiClient.delete(`${this.BASE_PATH}/status-master/${id}`);
      return response;
    } catch (error) {
      console.error("Failed to delete status:", error);
      throw error;
    }
  }
}
