// ============================================
// Query Key Factory — Single source of truth
// for all React Query cache keys
// ============================================

export const queryKeys = {
  // --- User / Auth ---
  user: {
    all: ["user"] as const,
    profile: () => [...queryKeys.user.all, "profile"] as const,
  },

  // --- Service Requests ---
  requests: {
    all: ["requests"] as const,
    lists: () => [...queryKeys.requests.all, "list"] as const,
    list: (filters?: Record<string, string>) =>
      [...queryKeys.requests.lists(), filters] as const,
    details: () => [...queryKeys.requests.all, "detail"] as const,
    detail: (id: string) => [...queryKeys.requests.details(), id] as const,
  },

  // --- Statuses ---
  statuses: {
    all: ["statuses"] as const
  },

  // --- Departments ---
  departments: {
    all: ["departments"] as const
  },

  // --- Request Types ---
  requestTypes: {
    all: ["requestTypes"] as const
  },

  // --- Technicians ---
  technicians: {
    all: ["technicians"] as const,
    list: () => [...queryKeys.technicians.all, "list"] as const,
  },

  // --- Admin Dashboard ---
  admin: {
    all: ["admin"] as const,
    dashboard: () => [...queryKeys.admin.all, "dashboard"] as const,
  },

  // --- Chat / Messages ---
  messages: {
    all: ["messages"] as const,
    byRequest: (requestId: string) =>
      [...queryKeys.messages.all, requestId] as const,
  },

  // --- Person Mappings (HOD) ---
  mappings: {
    all: ["mappings"] as const,
    list: () => [...queryKeys.mappings.all, "list"] as const,
  },
} as const;
