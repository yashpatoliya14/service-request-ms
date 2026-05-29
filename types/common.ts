// =============================================================================
// Common Types — Shared domain models used by both backend and frontend
// =============================================================================

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

/** Decoded JWT token payload — used by auth middleware and frontend auth checks */
export interface TokenPayload {
  userId: string;
  role: string;
  iat?: number;
  exp?: number;
}

// ---------------------------------------------------------------------------
// User
// ---------------------------------------------------------------------------

/** User profile — consistent across frontend and backend */
export interface UserProfile {
  UserID: string;
  Email: string;
  Role: string;
  FullName: string;
  Username: string;
  ProfilePhoto?: string;
}

// ---------------------------------------------------------------------------
// Service Request
// ---------------------------------------------------------------------------

/** Full service request entity with nested relations */
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
    ServiceDepartment?: { DeptName: string };
  } | null;
  ServiceRequestStatus?: {
    ServiceRequestStatusName: string;
    ServiceRequestStatusCssClass: string;
    IsTerminal?: boolean | null;
    IsDefault?: boolean | null;
  } | null;
}

// ---------------------------------------------------------------------------
// Service Request Status
// ---------------------------------------------------------------------------

export interface ServiceRequestStatus {
  ServiceRequestStatusID: number;
  ServiceRequestStatusName: string;
  IsAllowedForTechnician: boolean;
  ServiceRequestStatusCssClass: string;
  IsTerminal?: boolean | null;
  IsDefault?: boolean | null;
  IsAssigned?: boolean | null;
}

// ---------------------------------------------------------------------------
// Service Request Type
// ---------------------------------------------------------------------------

export interface ServiceRequestType {
  ServiceRequestTypeID: string;
  RequestTypeName: string;
  ServiceDeptID: string | null;
  DefaultPriority: string | null;
  IsActive: boolean | null;
}

// ---------------------------------------------------------------------------
// Department
// ---------------------------------------------------------------------------

export interface Department {
  ServiceDeptID: string;
  DeptName: string;
}

// ---------------------------------------------------------------------------
// Department Person (HOD / Technician assignments)
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Request Creation DTO
// ---------------------------------------------------------------------------

export interface CreateRequestData {
  ServiceRequestTypeID: string;
  RequestorID: string;
  Title: string;
  Description: string;
  Priority: string;
  ServiceDepartmentID: string;
}

// ---------------------------------------------------------------------------
// Enums / Union Types
// ---------------------------------------------------------------------------

/** Priority levels */
export type Priority = 'Low' | 'Medium' | 'High' | 'Urgent';

/** User roles */
export type UserRole = 'admin' | 'hod' | 'technician' | 'user';

/** Async loading states */
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
