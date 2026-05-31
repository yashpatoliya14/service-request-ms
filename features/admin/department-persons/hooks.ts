import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAllDepartmentPersons, updateDepartmentPerson, deleteDepartmentPerson, createDepartmentPersonAPI } from "./api";
import { CreateDepartmentPersonInput, UpdateDepartmentPersonInput } from "./schemas";
import { queryKeys } from "@/lib/query-key";
import { DepartmentPerson } from "./types";

export function useGetAllDepartmentPersons() {
    return useQuery({
        queryKey: queryKeys.deptPerson.list(),
        queryFn: getAllDepartmentPersons,
        retry:2,
        refetchOnWindowFocus:false,
        staleTime: Infinity,
    });
}

export function useCreateDepartmentPerson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createDepartmentPersonAPI,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deptPerson.list() });
        }
    });
}

export function useUpdateDepartmentPerson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateDepartmentPerson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deptPerson.list() });
        },
        onMutate:(data:UpdateDepartmentPersonInput)=>{
            const previousData = queryClient.getQueryData(queryKeys.deptPerson.list());
            queryClient.setQueryData(queryKeys.deptPerson.list(), (oldData: any) => {
                return oldData.map((person: DepartmentPerson) =>
                    person.DeptPersonID === data.DeptPersonID ? { ...person, ...data } : person
                );
            });
            return { previousData };
        },
        onError: (err: any, data: UpdateDepartmentPersonInput, context?: { previousData: any }) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKeys.deptPerson.list(), context.previousData);
            }
        }
    });
}

export function useDeleteDepartmentPerson() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteDepartmentPerson,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.deptPerson.list() });
        },
        onMutate:(data:string)=>{
            const previousData = queryClient.getQueryData(queryKeys.deptPerson.list());
            queryClient.setQueryData(queryKeys.deptPerson.list(), (oldData: any) => {
                return oldData.filter((person: DepartmentPerson) =>
                    person.DeptPersonID !== data
                );
            });
            return { previousData };
        },
        onError: (err: any, data: string, context?: { previousData: any }) => {
            if (context?.previousData) {
                queryClient.setQueryData(queryKeys.deptPerson.list(), context.previousData);
            }
        }
    });
}