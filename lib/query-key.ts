export const queryKeys={
    user: ["user"] as const,
    department:["department"] as const,
    statuses:["statuses"] as const,

    deptPerson : {
        all:["deptPerson"] as const,
        list : ()=>[...queryKeys.deptPerson.all,"list"] as const,
        details:()=>[...queryKeys.deptPerson.list(),"details"] as const,
        detail:(id:any)=>[...queryKeys.deptPerson.details(),id] as const
    }
}