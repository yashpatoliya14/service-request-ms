import { useState } from 'react';
import { HODService, AssignTechnicianData, EvaluateRequestData } from '@/services/hod.service';
import { DeptPerson } from '@/types/common';
import { useApi, useMutation, useRealTimeApi } from './useApi';
import { useRequestStatuses } from './useTechnician';

// Hook for HOD dashboard
export function useHODDashboard() {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const {
    data: requestsResponse,
    loadingState: requestsLoading,
    error: requestsError,
    refetch: refetchRequests
  } = useRealTimeApi(() => HODService.getAllRequests(), 30000);

  const requests = (requestsResponse as any)?.data || [];

  const {
    data: techniciansResponse,
    loadingState: techniciansLoading,
    error: techniciansError,
    refetch: refetchTechnicians
  } = useApi(() => HODService.getTechnicians());

  const technicians = (techniciansResponse as any)?.data || [];

  const { statuses } = useRequestStatuses();

  const assignTechnicianMutation = useMutation(HODService.assignTechnician);
  const evaluateRequestMutation = useMutation(HODService.evaluateRequest);

  const statusesArray = statuses as any[];

  // Filter and search logic
  const filteredRequests = requests
    .filter((request: any) => HODService.filterBySearch([request], searchQuery).length > 0)
    .filter((request: any) => HODService.filterByStatus([request], statusFilter, statusesArray).length > 0);

  const stats = HODService.getRequestStats(requests, technicians, statusesArray);

  const assignTechnician = async (data: AssignTechnicianData) => {
    try {
      await assignTechnicianMutation.mutate(data);
      await refetchRequests(); // Refresh requests
      return true;
    } catch (error) {
      return false;
    }
  };

  const evaluateRequest = async (data: EvaluateRequestData) => {
    try {
      await evaluateRequestMutation.mutate(data);
      await refetchRequests(); // Refresh requests
      return true;
    } catch (error) {
      return false;
    }
  };

  const getTechnicianName = (assignedToId: string | null) => {
    return HODService.getTechnicianName(technicians, assignedToId);
  };

  const isUnassigned = (request: any) => {
    return HODService.isUnassigned(request);
  };

  const isTerminal = (request: any) => {
    if (request.ServiceRequestStatus?.IsTerminal === true) return true;
    if (request.StatusID) {
      const status = statusesArray.find((s: any) => String(s.ServiceRequestStatusID) === String(request.StatusID));
      return status?.IsTerminal === true;
    }
    return false;
  };

  return {
    requests: filteredRequests,
    technicians,
    stats,
    searchQuery,
    statusFilter,
    setSearchQuery,
    setStatusFilter,
    loadingState: requestsLoading || techniciansLoading,
    error: requestsError || techniciansError,
    assignTechnician,
    evaluateRequest,
    getTechnicianName,
    isUnassigned,
    isTerminal,
    refetchRequests,
    refetchTechnicians
  };
}

// Hook for technician management
export function useTechnicians() {
  const {
    data: technicians = [],
    loadingState,
    error,
    refetch
  } = useApi(() => HODService.getTechnicians());

  const assignTechnicianMutation = useMutation(HODService.assignTechnician);

  const assignTechnician = async (data: AssignTechnicianData) => {
    try {
      await assignTechnicianMutation.mutate(data);
      await refetch(); // Refresh technicians
      return true;
    } catch (error) {
      return false;
    }
  };

  const getTechnicianById = (id: string) => {
    return technicians?.find(t => String(t.DeptPersonID) === String(id));
  };

  const getTechnicianName = (assignedToId: string | null) => {
    return HODService.getTechnicianName(technicians || [], assignedToId);
  };

  return {
    technicians,
    loadingState,
    error,
    assignTechnician,
    getTechnicianById,
    getTechnicianName,
    refetch
  };
}
