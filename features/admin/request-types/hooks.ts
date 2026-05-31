import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-key";
import { apiClient } from "@/lib/apiClient";
import { RequestType } from "./types";
import { createRequestType, deleteRequestType, getRequestTypes, updateRequestType } from "./api";
import { ZodError } from "zod";
import toast from "react-hot-toast";
import { RequestTypeCreateSchema, RequestTypeUpdateSchema } from "./schemas";




export function useRequestTypes() {
    return useQuery({
        queryKey: queryKeys.requestTypes.list(),
        queryFn: () => getRequestTypes(),
        staleTime: Infinity
    })
}


export function useRequestTypesCreate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (requestType: RequestTypeCreateSchema) => createRequestType(requestType),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:queryKeys.requestTypes.list()})
        }
    })
}


export function useRequestTypesUpdate() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (requestType: RequestTypeUpdateSchema) => updateRequestType(requestType),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:queryKeys.requestTypes.list()})
        },
        onError:(err:any,request,context:any)=>{
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.requestTypes.list(), context.previous)
            }
        },
        onMutate:(requestType)=>{
            const previous = queryClient.getQueryData(queryKeys.requestTypes.list());
            queryClient.setQueryData(queryKeys.requestTypes.list(),(oldData:[RequestType])=>{
                return oldData.map((type)=>type.ServiceRequestTypeID === requestType.ServiceRequestTypeID ? requestType : type)
            })
            return { previous };
        }
    })
}

export function useRequestTypesDelete() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (requestType: RequestType) => deleteRequestType(requestType),
        onSuccess: () => {
            queryClient.invalidateQueries({queryKey:queryKeys.requestTypes.list()})
        },
        onError:(err:any,request,context:any)=>{
            if (context?.previous) {
                queryClient.setQueryData(queryKeys.requestTypes.list(), context.previous)
            }
        },
        onMutate:(requestType)=>{
            const previous = queryClient.getQueryData(queryKeys.requestTypes.list());
            queryClient.setQueryData(queryKeys.requestTypes.list(),(oldData:[RequestType])=>{
                return oldData.filter((type)=>type.ServiceRequestTypeID !== requestType.ServiceRequestTypeID) as any
            })
            return { previous };
        }
    })
}