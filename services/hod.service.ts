import { apiClient } from "@/lib/apiClient";
import { ServiceRequest, ServiceRequestStatus, DeptPerson } from "@/types/common";

export interface AssignTechnicianData {
  ServiceRequestID: string;
  AssignedToID: string;
}

export interface EvaluateRequestData {
  ServiceRequestID: string;
  StatusID: string;
  EvaluationNotes?: string;
}

// HOD Service
export class HODService {
  private static readonly BASE_PATH = "/api/hod";

  // Get all department requests
  static async getAllRequests() {
    try {
      const response = await apiClient.get<ServiceRequest[]>(`${this.BASE_PATH}`);
      return response;
    } catch (error) {
      console.error("Failed to fetch all requests:", error);
      throw error;
    }
  }

  // Get department technicians
  static async getTechnicians() {
    try {
      const response = await apiClient.get<DeptPerson[]>(`${this.BASE_PATH}/technicians`);
      return response;
    } catch (error) {
      console.error("Failed to fetch technicians:", error);
      throw error;
    }
  }

  // Assign technician to request
  static async assignTechnician(data: AssignTechnicianData) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}`, data);
      return response;
    } catch (error) {
      console.error("Failed to assign technician:", error);
      throw error;
    }
  }

  // Evaluate completed request
  static async evaluateRequest(data: EvaluateRequestData) {
    try {
      const response = await apiClient.post(`${this.BASE_PATH}/evaluate`, data);
      return response;
    } catch (error) {
      console.error("Failed to evaluate request:", error);
      throw error;
    }
  }

  // Get technician name by ID
  static getTechnicianName(technicians: DeptPerson[], assignedToId: string | null): string | null {
    if (!assignedToId) return null;
    const tech = technicians.find(t => String(t.DeptPersonID) === String(assignedToId));
    return tech?.Users?.FullName || "Assigned";
  }

  // Check if request is unassigned
  static isUnassigned(request: ServiceRequest): boolean {
    return !request.AssignedToID;
  }

  // Filter requests by search query
  static filterBySearch(requests: ServiceRequest[], query: string): ServiceRequest[] {
    if (!query) return requests;
    const lowerQuery = query.toLowerCase();
    return requests.filter(req => 
      req.Title.toLowerCase().includes(lowerQuery) ||
      String(req.ServiceRequestID).includes(lowerQuery) ||
      req.Users?.FullName?.toLowerCase().includes(lowerQuery)
    );
  }

  // Filter requests by status
  static filterByStatus(requests: ServiceRequest[], statusFilter: string, statuses: ServiceRequestStatus[]): ServiceRequest[] {
    if (statusFilter === "all") return requests;
    return requests.filter(req => {
      const status = statuses.find(s => String(s.ServiceRequestStatusID) === String(req.StatusID));
      return status?.ServiceRequestStatusName === statusFilter;
    });
  }

  // Get request statistics
  static getRequestStats(requests: ServiceRequest[], technicians: DeptPerson[], statuses: ServiceRequestStatus[]) {
    const unassignedCount = requests.filter(req => this.isUnassigned(req)).length;
    const assignedCount = requests.filter(req => !this.isUnassigned(req) && !this.isTerminal(req, statuses)).length;
    const completedCount = requests.filter(req => this.isTerminal(req, statuses)).length;

    return {
      unassigned: unassignedCount,
      assigned: assignedCount,
      completed: completedCount,
      technicians: technicians.length
    };
  }

  // Check if request is terminal
  private static isTerminal(request: ServiceRequest, statuses: ServiceRequestStatus[]): boolean {
    if (request.ServiceRequestStatus?.IsTerminal === true) return true;
    if (request.StatusID) {
      const status = statuses.find(s => String(s.ServiceRequestStatusID) === String(request.StatusID));
      return status?.IsTerminal === true;
    }
    return false;
  }
}
