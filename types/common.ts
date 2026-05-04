// Common interfaces shared between backend and frontend

// User Profile - consistent across frontend and backend
export interface UserProfile {
  UserID: string;
  Email: string;
  Role: string;
  FullName: string;
  Username: string;
  ProfilePhoto?: string;
}

// Service Request - consistent across frontend and backend
export interface ServiceRequest {
  ServiceRequestID: string;
  Title: string;
  Description: string;
  Priority: string;
  StatusID: string | null;
  Created: string;
  ServiceRequestTypeID: string | null;
  RequestorID: string | null;
  AssignedToID: string | null;
  ServiceDepartmentID: string | null;
  Users?: {
    FullName: string;
    Email: string;
    Role: string;
  } | null;
  ServiceRequestType?: {
    RequestTypeName: string;
  } | null;
  ServiceRequestStatus?: {
    ServiceRequestStatusName: string;
    IsTerminal: boolean;
    ServiceRequestStatusCssClass?: string;
  } | null;
}

// Service Request Status
export interface ServiceRequestStatus {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  IsAllowedForTechnician: boolean;
  ServiceRequestStatusCssClass: string;
  IsTerminal?: boolean | null;
  IsDefault?: boolean | null;
  IsAssigned?: boolean | null;
}

// Service Request Type
export interface ServiceRequestType {
  ServiceRequestTypeID: string;
  RequestTypeName: string;
  ServiceDeptID: string | null;
  DefaultPriority: string | null;
  IsActive: boolean | null;
}

// Department
export interface Department {
  ServiceDeptID: string;
  DeptName: string;
  IsActive: boolean | null;
}

// Department Person (for HOD/Technician assignments)
export interface DeptPerson {
  DeptPersonID: string;
  UserID: string;
  IsActive: boolean | null;
  Users?: {
    FullName: string;
    Email: string;
    Role: string;
  } | null;
  ServiceDepartment?: {
    DeptName: string;
  } | null;
}

// Request Creation Data
export interface CreateRequestData {
  ServiceRequestTypeID: string;
  RequestorID: string;
  Title: string;
  Description: string;
  Priority: string;
  ServiceDepartmentID: string;
}

// API Response wrapper
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// Priority levels
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

// User roles
export type UserRole = 'admin' | 'hod' | 'technician' | 'user';

// Loading states
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
