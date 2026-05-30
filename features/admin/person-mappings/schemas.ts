import { z } from "zod";

export const createMappingSchema = z.object({
  ServiceRequestTypeID: z.string().min(1, "Request Type is required"),
  DeptPersonID: z.string().min(1, "Technician is required"),
});

export const updateMappingSchema = z.object({
  ServiceRequestTypeID: z.string().min(1, "Request Type is required"),
  ServicePersonID: z.string().min(1, "Technician is required"),
});

export type CreateMappingInput = z.infer<typeof createMappingSchema>;
export type UpdateMappingInput = z.infer<typeof updateMappingSchema>;
