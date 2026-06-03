export const redisKeys = {
    requestTypes: {
        key: "requestTypes",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    departments: {
        key: "departments",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    personMappings: {
        key: "personMappings",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    personMaster: {
        key: "personMaster",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    serviceTypes: {
        key: "serviceTypes",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    statusMaster: {
        key: "statusMaster",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    hodRequests: {
        key: "hodRequests",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    hodTechnicians: {
        key: "hodTechnicians",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    requestorHistory: {
        key: "requestorHistory",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    },
    technicianRequests: {
        key: "technicianRequests",
        ttl: 60 * 60 * 1000 // 1 hour in milliseconds
    }
}