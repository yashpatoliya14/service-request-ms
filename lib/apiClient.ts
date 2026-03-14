// ============================================================
// ApiClient — Production-grade HTTP client (functional)
// ============================================================
//
// Usage:
//   import { apiClient } from "@/lib/apiClient";
//
//   const res = await apiClient.get<IDepartment[]>("/api/admin/department");
//   const res = await apiClient.post<IUser>("/api/auth/signup", { Email, Password });
//   const res = await apiClient.put("/api/admin/department/1", body);
//   const res = await apiClient.patch("/api/admin/department/1", body);
//   const res = await apiClient.delete("/api/admin/department/1");
//
// ============================================================

// --------------- Types ---------------

/** Standard API response shape returned by all backend routes */
export interface ApiResponse<T = unknown> {
    success: boolean;
    message: string;
data: T;
    token?: string;
}

/** Error thrown when an API request fails */
export class ApiError extends Error {
    public readonly status: number;
    public readonly statusText: string;
    public readonly data: ApiResponse | null;

    constructor(status: number, statusText: string, data: ApiResponse | null) {
        super(data?.message || statusText || `Request failed with status ${status}`);
        this.name = "ApiError";
        this.status = status;
        this.statusText = statusText;
        this.data = data;
    }

    get isUnauthorized() { return this.status === 401; }
    get isForbidden() { return this.status === 403; }
    get isNotFound() { return this.status === 404; }
    get isValidationError() { return this.status === 400 || this.status === 422; }
    get isServerError() { return this.status >= 500; }
}

/** Configuration for a single request */
export interface RequestConfig extends Omit<RequestInit, "method" | "body"> {
    params?: Record<string, string | number | boolean | undefined | null>;
    timeout?: number;
    signal?: AbortSignal;
}

// --------------- Internals ---------------

const DEFAULT_TIMEOUT = 30_000;

const DEFAULT_HEADERS: Record<string, string> = {
    "Content-Type": "application/json",
    Accept: "application/json",
};

/** Append query params to a URL string */
function buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined | null>,
): string {
    const base = typeof window !== "undefined" ? window.location.origin : "";
    const url = new URL(endpoint, base);

    if (params) {
        for (const [key, value] of Object.entries(params)) {
            if (value !== undefined && value !== null) {
                url.searchParams.append(key, String(value));
            }
        }
    }

    return url.toString();
}

/** Core request function — every public method delegates here */
async function request<T>(
    method: string,
    endpoint: string,
    body?: unknown,
    config?: RequestConfig,
): Promise<ApiResponse<T>> {
    const {
        params,
        timeout = DEFAULT_TIMEOUT,
        signal: externalSignal,
        headers: extraHeaders,
        ...restInit
    } = config ?? {};

    // Build URL
    const url = buildUrl(endpoint, params);

    // Merge headers (remove Content-Type for FormData)
    const headers: Record<string, string> = {
        ...DEFAULT_HEADERS,
        ...(extraHeaders as Record<string, string>),
    };

    if (body instanceof FormData) {
        delete headers["Content-Type"];
    }

    // Timeout via AbortController
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    if (externalSignal) {
        if (externalSignal.aborted) {
            controller.abort();
        } else {
            externalSignal.addEventListener("abort", () => controller.abort(), { once: true });
        }
    }

    const init: RequestInit = {
        method,
        headers,
        credentials: "include", // sends auth_token cookie automatically
        ...restInit,
        body: body
            ? body instanceof FormData
                ? body
                : JSON.stringify(body)
            : undefined,
        signal: controller.signal,
    };

    try {
        const response = await fetch(url, init);

        // Parse JSON if available
        let data: ApiResponse<T> | null = null;
        const contentType = response.headers.get("content-type");

        if (contentType?.includes("application/json")) {
            data = (await response.json()) as ApiResponse<T>;
        }

        // Non-OK → throw
        if (!response.ok) {
            throw new ApiError(response.status, response.statusText, data);
        }

        return data ?? { success: true, message: "OK", data: undefined as unknown as T };
    } catch (error: unknown) {
        if (error instanceof ApiError) throw error;

        if (error instanceof DOMException && error.name === "AbortError") {
            throw new ApiError(0, "Request aborted or timed out", null);
        }

        throw new ApiError(0, "Network error", null);
    } finally {
        clearTimeout(timeoutId);
    }
}

// --------------- Public API ---------------

export const apiClient = {
    /** GET request */
    get<T = unknown>(endpoint: string, config?: RequestConfig) {
        return request<T>("GET", endpoint, undefined, config);
    },

    /** POST request */
    post<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
        return request<T>("POST", endpoint, body, config);
    },

    /** PUT request */
    put<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
        return request<T>("PUT", endpoint, body, config);
    },

    /** PATCH request */
    patch<T = unknown>(endpoint: string, body?: unknown, config?: RequestConfig) {
        return request<T>("PATCH", endpoint, body, config);
    },

    /** DELETE request */
    delete<T = unknown>(endpoint: string, config?: RequestConfig) {
        return request<T>("DELETE", endpoint, undefined, config);
    },

    /** Upload file(s) via multipart/form-data */
    upload<T = unknown>(
        endpoint: string,
        file: File | File[],
        options?: {
            fieldName?: string;
            extraFields?: Record<string, string>;
            config?: RequestConfig;
        },
    ) {
        const formData = new FormData();
        const fieldName = options?.fieldName ?? "file";

        if (Array.isArray(file)) {
            file.forEach((f) => formData.append(fieldName, f));
        } else {
            formData.append(fieldName, file);
        }

        if (options?.extraFields) {
            for (const [key, value] of Object.entries(options.extraFields)) {
                formData.append(key, value);
            }
        }

        return request<T>("POST", endpoint, formData, options?.config);
    },
} as const;

// --------------- Auto 401 Redirect (client-side only) ---------------
// Opt-in: wrap your calls with handleAuthError() or use the pattern below

/**
 * Helper to catch auth errors and redirect to login.
 * Use in page-level data fetching or form handlers.
 *
 * @example
 * const res = await withAuthRedirect(apiClient.get("/api/admin/department"));
 */
export async function withAuthRedirect<T>(promise: Promise<ApiResponse<T>>): Promise<ApiResponse<T>> {
    try {
        return await promise;
    } catch (error) {
        if (
            typeof window !== "undefined" &&
            error instanceof ApiError &&
            error.isUnauthorized
        ) {
            const path = window.location.pathname;
            if (path !== "/login" && path !== "/signup") {
                window.location.href = "/login";
            }
        }
        throw error;
    }
}
