import { apiClient } from "@/lib/apiClient";
import { RequestType } from "./types";
import { RequestTypeCreateSchema, requestTypeCreateSchema, RequestTypeUpdateSchema, requestTypeUpdateSchema } from "./schemas";

export async function getRequestTypes() {
    const res = await apiClient.get<RequestType[]>("/api/admin/service-request-type")
    if (!res.success) {
        throw new Error(res.message)
    }
    return res.data as RequestType[]
}

export async function createRequestType(requestType: RequestTypeCreateSchema) {
    const validateRequestType=requestTypeCreateSchema.safeParse(requestType);
    if(!validateRequestType.success){
        throw new Error(JSON.stringify(validateRequestType.error.message))
    }
    const res = await apiClient.post("/api/admin/service-request-type", validateRequestType.data)
    if (!res.success) {
        throw new Error(res.message)
    }
    return res.data as RequestType[]
}


export async function updateRequestType(requestType: RequestTypeUpdateSchema) {
    const validateRequestType=requestTypeUpdateSchema.safeParse(requestType);
    if(!validateRequestType.success){
        throw new Error(JSON.stringify(validateRequestType.error.message))
    }
    const res = await apiClient.patch(`/api/admin/service-request-type/${requestType.ServiceRequestTypeID}`, validateRequestType.data)
    if (!res.success) {
        throw new Error(res.message)
    }
    return res.data as RequestType[]
}

export async function deleteRequestType(requestType:RequestType) {
    const res = await apiClient.delete(`/api/admin/service-request-type/${requestType.ServiceRequestTypeID}`)
    if (!res.success) {
        throw new Error(res.message)
    }
    return res.data as RequestType[]
}
