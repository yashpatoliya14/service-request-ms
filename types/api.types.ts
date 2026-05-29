// =============================================================================
// API Types — Backend request bodies and response contracts
// Used exclusively in API route handlers (app/api/**)
// =============================================================================

// ---------------------------------------------------------------------------
// Generic API Response
// ---------------------------------------------------------------------------

/**
 * Standard API response envelope used by all route handlers.
 * Frontend consumers receive this shape from every endpoint.
 */
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
}

// ---------------------------------------------------------------------------
// Auth
// ---------------------------------------------------------------------------

export interface ISignupBody {
  FullName: string;
  Email: string;
  Phone: number;
  ProfilePhoto: string;
  IsVerified: boolean;
  Password: string;
  Username: string;
  ProfileImageUrl: string;
}

export interface IVerifyOtpBody {
  Email: string;
  Otp: string;
  isForgotPassword?: boolean;
}

export interface IResetPasswordBody {
  Email: string;
  Password: string;
}

// ---------------------------------------------------------------------------
// Admin — Department
// ---------------------------------------------------------------------------

export interface IDepartmentBody {
  DepartmentName: string;
  DepartmentID: string;
}

// ---------------------------------------------------------------------------
// Admin — Service Type
// ---------------------------------------------------------------------------

export interface IServiceTypeBody {
  ServiceTypeName: string;
}

// ---------------------------------------------------------------------------
// Admin — Service Request Type
// ---------------------------------------------------------------------------

export interface IServiceRequestTypeBody {
  ServiceTypeID: string;
  ServiceDept: string;
  ServiceRequestTypeName: string;
  DefaultPriority: string;
  IsActive: boolean;
}

// ---------------------------------------------------------------------------
// Admin — Person Master
// ---------------------------------------------------------------------------

export interface IPersonMasterBody {
  FullName: string;
  Email: string;
  Phone: number;
  Department: string;
  ProfilePhoto: string;
  IsVerified: boolean;
  Username: string;
  Role: string;
  Password: string;
}

// ---------------------------------------------------------------------------
// Admin — Person Mapping
// ---------------------------------------------------------------------------

export interface IPersonMappingBody {
  ServiceRequestTypeID: string;
  ServiceDeptPerson: string;
}

// ---------------------------------------------------------------------------
// HOD
// ---------------------------------------------------------------------------

export interface IHodRequestBody {
  ServiceRequestTypeID: string;
  RequestNo: string;
  RequestorID: string;
  AssignedToID: string;
  StatusID: string;
  Title: string;
  Description: string;
  Priority: string;
}

export interface IEvaluateBody {
  ServiceRequestID: string;
  StatusID: string;
  EvaluationNotes?: string;
}

// ---------------------------------------------------------------------------
// Portal — Requestor
// ---------------------------------------------------------------------------

export interface IRequestorBody {
  ServiceRequestTypeID: string;
  RequestorID: string;
  Title: string;
  Description: string;
  Priority: string;
}

export interface IPortalHistoryBody {
  RequestorID: string;
}

export interface IStatusUpdateBody {
  ServiceRequestTypeID: string;
  StatusID: string;
}
