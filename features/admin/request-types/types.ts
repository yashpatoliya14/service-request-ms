export interface RequestType {
  ServiceRequestTypeID: string;
  RequestTypeName: string;
  DefaultPriority: string | null;
  IsActive: boolean | null;
  ServiceTypeID: string;
  ServiceDeptID: string;
  ServiceDepartment?: { DeptName: string };
  ServiceType?: { ServiceTypeName: string };
}
