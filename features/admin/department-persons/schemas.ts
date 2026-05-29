import { z } from "zod";

export const createDepartmentPersonSchema = z.object({
    ServiceDeptID: z.string(),
    FullName: z.string(),
    Email: z.string().email(),
    Phone: z.string(),
    Password: z.string(),
    Role: z.string(),
});

export const updateDepartmentPersonSchema = z.object({
    DeptPersonID: z.string(),
    ServiceDeptID: z.string(),
    Role: z.string(),
});

export type CreateDepartmentPersonInput = z.infer<typeof createDepartmentPersonSchema>;
export type UpdateDepartmentPersonInput = z.infer<typeof updateDepartmentPersonSchema>;