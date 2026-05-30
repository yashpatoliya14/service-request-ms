import { z } from "zod"

const requestTypeSchema = z.object({

    ServiceRequestTypeID: z.string(),
    RequestTypeName: z.string(),
    ServiceTypeID: z.string(),
    ServiceDeptID: z.string(),
    DefaultPriority: z.string(),
    IsActive: z.boolean(),
})
export const requestTypeCreateSchema = requestTypeSchema.omit({ ServiceRequestTypeID: true })
export const requestTypeUpdateSchema = requestTypeSchema




// z.infer to get the ::: type :::: of the schema
export type RequestTypeCreateSchema = z.infer<typeof requestTypeCreateSchema> 
export type RequestTypeUpdateSchema = z.infer<typeof requestTypeSchema>