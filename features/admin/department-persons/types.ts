import { Department } from "@/features/admin/departments/types";

export type { Department };

export interface DepartmentPerson {
  DeptPersonID: string;
  ServiceDeptID: string | null;
  UserID: string;
  IsActive: boolean;
  ServiceDepartment?: { ServiceDeptID: string; DeptName: string } | null;
  Users?: {
    FullName: string | null;
    Email: string | null;
    Phone: string | null;
    Role: string | null;
  } | null;
}

export type createDepartmentPerson =  Pick<DepartmentPerson, "ServiceDeptID"> & {
  FullName: string;
  Email: string;
  Phone: string;
  Password: string;
  Role: string;
};
export type updateDepartmentPerson =Pick<DepartmentPerson, "ServiceDeptID" |"DeptPersonID"> & {
  FullName: string;
  Email: string;
  Phone: string;
  Password: string;
  Role: string;
}; 