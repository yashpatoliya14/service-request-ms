// =============================================================================
// Client Types — Frontend-only UI types
// Used exclusively in components, hooks, and pages
// =============================================================================

// Paginated API response shape (client-side data tables)
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

// Dropdown / Select option
export interface SelectOption {
  value: string;
  label: string;
}

// Data table column configuration
export interface TableColumn<T = any> {
  key: keyof T;
  title: string;
  render?: (value: any, item: T) => React.ReactNode;
  sortable?: boolean;
  filterable?: boolean;
}

// Search & filter state
export interface FilterConfig {
  search?: string;
  status?: string;
  priority?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
}

// Sort state
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

// Sidebar variant
export type SidebarVariant = 'admin' | 'portal' | 'technician' | 'hod';
