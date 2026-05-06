// Simple API Client
export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data: T;
}

async function request<T>(method: string, url: string, body?: unknown): Promise<ApiResponse<T>> {
  try {
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP ${response.status}`);
    }

    return data;
  } catch (error) {
    throw error;
  }
}

export const apiClient = { 
  get<T>(url: string) {
    return request<T>('GET', url);
  },
  post<T>(url: string, body?: unknown) {
    return request<T>('POST', url, body);
  },
  put<T>(url: string, body?: unknown) {
    return request<T>('PUT', url, body);
  },
  delete<T>(url: string) {
    return request<T>('DELETE', url);
  },
};
