import { z } from "zod";

export const departmentSchema = z.object({
  ServiceDeptID: z.string(),
  DeptName: z.string().min(2, "Department name must be at least 2 characters").max(50),
});

export const createDepartmentSchema = departmentSchema.pick({ DeptName: true });
export const updateDepartmentSchema = departmentSchema;

export type DepartmentSchema = z.infer<typeof departmentSchema>;
export type CreateDepartmentInput = z.infer<typeof createDepartmentSchema>;
export type UpdateDepartmentInput = z.infer<typeof updateDepartmentSchema>;
