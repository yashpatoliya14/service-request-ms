export const queryKeys={
    user: ["user"] as const,
    department:["department"] as const,
    statuses:["statuses"] as const,
    serviceTypes:["serviceTypes"] as const,
    personMappings:["personMappings"] as const,
    deptPerson : {
        all:["deptPerson"] as const,
        list : ()=>[...queryKeys.deptPerson.all,"list"] as const,
        details:()=>[...queryKeys.deptPerson.list(),"details"] as const,
        detail:(id:any)=>[...queryKeys.deptPerson.details(),id] as const
    },
    requestTypes:{
        all:["requestTypes"] as const,
        list:()=>[...queryKeys.requestTypes.all,"list"] as const,
        details:()=>[...queryKeys.requestTypes.list(),"details"] as const,
        detail:(id:any)=>[...queryKeys.requestTypes.details(),id] as const
    },
    technician: {
        all: ["technician"] as const,
        requests: (userId: string) => [...queryKeys.technician.all, "requests", userId] as const,
    },
    hod: {
        all: ["hod"] as const,
        requests: () => [...queryKeys.hod.all, "requests"] as const,
        technicians: () => [...queryKeys.hod.all, "technicians"] as const,
    },
    portal: {
        all: ["portal"] as const,
        requests: () => [...queryKeys.portal.all, "requests"] as const,
        history: () => [...queryKeys.portal.all, "history"] as const,
        requestDetail: (id: string) => [...queryKeys.portal.all, "requestDetail", id] as const,
        requestChat: (id: string) => [...queryKeys.portal.all, "requestChat", id] as const,
    }
}