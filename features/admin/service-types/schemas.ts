import { z } from "zod";

export const serviceTypeSchema = z.object({
  ServiceTypeID: z.string(),
  ServiceTypeName: z.string().min(2, "Service type name must be at least 2 characters").max(50),
});

export const createServiceTypeSchema = serviceTypeSchema.pick({ ServiceTypeName: true });
export const updateServiceTypeSchema = serviceTypeSchema;

export type ServiceTypeSchema = z.infer<typeof serviceTypeSchema>;
export type CreateServiceTypeInput = z.infer<typeof createServiceTypeSchema>;
export type UpdateServiceTypeInput = z.infer<typeof updateServiceTypeSchema>;
