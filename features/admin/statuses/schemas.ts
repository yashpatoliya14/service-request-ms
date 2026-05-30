import { z } from "zod";

export const statusItemSchema = z.object({
  ServiceRequestStatusID: z.number(),
  ServiceRequestStatusName: z.string().min(1, "Status name is required"),
  Sequence: z.preprocess((val) => val === "" || val === null || val === undefined ? null : Number(val), z.number().nullable()),
  Description: z.string().nullable().optional(),
  ServiceRequestStatusCssClass: z.string().nullable().optional(),
  IsAllowedForTechnician: z.boolean().nullable().optional(),
  IsDefault: z.boolean().nullable().optional(),
  IsAssigned: z.boolean().nullable().optional(),
  IsTerminal: z.boolean().nullable().optional(),
});

export const createStatusSchema = statusItemSchema.omit({ ServiceRequestStatusID: true });
export const updateStatusSchema = statusItemSchema;

export type CreateStatusInput = z.infer<typeof createStatusSchema>;
export type UpdateStatusInput = z.infer<typeof updateStatusSchema>;
