// Export all common types
export * from './common';

// Re-export service-specific types (excluding conflicts)
export * from '../services/auth.service';
export type { UpdateStatusData } from '../services/technician.service';
export type { AssignTechnicianData, EvaluateRequestData } from '../services/hod.service';
export type { DashboardStats, CreateServiceRequestTypeData, UpdateServiceRequestTypeData } from '../services/admin.service';

// Common utility types
export interface PaginatedResponse<T = any> {
  success: boolean;
  message: string;
  data: T[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

export interface FilterConfig {
  search?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}
