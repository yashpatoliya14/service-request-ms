import { useState, useEffect } from 'react';
import { TechnicianService, UpdateStatusData } from '@/services/technician.service';
import { ServiceRequest, ServiceRequestStatus } from '@/types/common';
import { useApi, useMutation, useRealTimeApi } from './useApi';
import { useAuth } from './useAuth';

// Hook for technician requests
export function useTechnicianRequests() {
  const { user } = useAuth();
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const { statuses } = useRequestStatuses();

  const {
    data: requestsResponse,
    loadingState,
    error,
    refetch
  } = useRealTimeApi(
    () => user ? TechnicianService.getAssignedRequests(user.UserID) : Promise.resolve({ success: true, data: [[]], message: "Success" }),
    30000 // Refresh every 30 seconds
  );

  const requests = (requestsResponse as any)?.data?.[0] || [];

  const updateStatusMutation = useMutation(TechnicianService.updateStatus);
  const updateStatusByIdMutation = useMutation(async (params: { requestId: string; statusId: string }) => {
    return TechnicianService.updateStatusById(params.requestId, params.statusId);
  });

  const updateStatus = async (data: UpdateStatusData) => {
    try {
      await updateStatusMutation.mutate(data);
      await refetch(); // Refresh requests
      return true;
    } catch (error) {
      return false;
    }
  };

  const updateStatusById = async (requestId: string, statusId: string) => {
    try {
      await updateStatusByIdMutation.mutate({ requestId, statusId });
      await refetch(); // Refresh requests
      return true;
    } catch (error) {
      return false;
    }
  };

  const markAsClosed = async (requestId: string) => {
    return updateStatusById(requestId, "closed");
  };

  const isTerminal = (request: ServiceRequest) => {
    return TechnicianService.isTerminal(request, statuses as ServiceRequestStatus[]);
  };

  return {
    requests,
    selectedRequest,
    setSelectedRequest,
    loadingState,
    error,
    updateStatus,
    updateStatusById,
    markAsClosed,
    isTerminal,
    refetch
  };
}

// Hook for request statuses
export function useRequestStatuses() {
  const {
    data: statusesResponse,
    loadingState,
    error,
    refetch
  } = useApi(() => TechnicianService.getStatuses());

  const statuses = (statusesResponse as any)?.data || [];

  const getTechnicianStatuses = () => {
    return TechnicianService.getTechnicianStatuses(statuses);
  };

  const getStatusById = (id: string) => {
    return statuses.find((s: any) => String(s.ServiceRequestStatusID) === String(id));
  };

  const getStatusName = (id: string) => {
    const status = getStatusById(id);
    return status?.ServiceRequestStatusName || 'Unknown';
  };

  return {
    statuses,
    technicianStatuses: getTechnicianStatuses(),
    loadingState,
    error,
    getStatusById,
    getStatusName,
    refetch
  };
}

// Hook for single request
export function useRequest(requestId: string) {
  const {
    data: requestResponse,
    loadingState,
    error,
    refetch
  } = useApi(() => TechnicianService.getRequestById(requestId));

  const request = (requestResponse as any)?.data?.[0] || null;

  const updateStatusMutation = useMutation(async (params: { requestId: string; statusId: string }) => {
    return TechnicianService.updateStatusById(params.requestId, params.statusId);
  });

  const updateStatus = async (statusId: string) => {
    try {
      await updateStatusMutation.mutate({ requestId, statusId });
      await refetch(); // Refresh request
      return true;
    } catch (error) {
      return false;
    }
  };

  return {
    request,
    loadingState,
    error,
    updateStatus,
    refetch
  };
}
