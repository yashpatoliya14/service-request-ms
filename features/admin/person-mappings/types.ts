export interface IPersonMapping {
  ServiceRequestTypeID: string;
  ServicePersonID: string;
  ServiceRequestType: {
    RequestTypeName: string;
  };
  ServiceDeptPerson: {
    Users: {
      FullName: string;
      Email: string;
      Phone: string;
      Role: string;
    };
    ServiceDepartment: {
      DeptName: string;
    };
  };
}
