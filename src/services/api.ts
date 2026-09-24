const API_URL =
  import.meta.env.VITE_API_URL ||
  "http://localhost:3000/api";

type RequestOptions = {
  params?: Record<string, string | number | boolean | undefined>;
};

type ApiResponse<T = any> = {
  data: T;
  status: number;
  ok: boolean;
};

async function request<T = any>(
  method: string,
  endpoint: string,
  body?: unknown,
  options?: RequestOptions
): Promise<ApiResponse<T>> {
  const token = localStorage.getItem("tsc_token");

  let url = `${API_URL}${endpoint}`;

  if (options?.params) {
    const searchParams = new URLSearchParams();

    Object.entries(options.params).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== null
        ) {
          searchParams.append(
            key,
            String(value)
          );
        }
      }
    );

    const query = searchParams.toString();

    if (query) {
      url += `?${query}`;
    }
  }

  const headers: Record<string, string> = {
    Accept:
      "application/json, text/plain, */*",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (
    method === "POST" ||
    method === "PUT" ||
    method === "PATCH"
  ) {
    headers["Content-Type"] =
      "application/json";
  }

  const response = await fetch(url, {
    method,
    headers,
    body:
      body !== undefined
        ? JSON.stringify(body)
        : undefined,
  });

  const contentType =
    response.headers.get("content-type") || "";

  let data: any = null;

  if (contentType.includes("application/json")) {
    data = await response.json();
  } else {
    const text = await response.text();

    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
  }

  if (response.status === 401) {
    localStorage.removeItem("tsc_token");
    localStorage.removeItem("tsc_user");

    if (
      window.location.pathname !== "/login"
    ) {
      window.location.href = "/login";
    }
  }

  if (!response.ok) {
    const error: any = new Error(
      data?.message ||
        `Erreur HTTP ${response.status}`
    );

    error.response = {
      status: response.status,
      data,
    };

    throw error;
  }

  return {
    data,
    status: response.status,
    ok: response.ok,
  };
}

const api = {
  get<T = any>(
    endpoint: string,
    options?: RequestOptions
  ) {
    return request<T>(
      "GET",
      endpoint,
      undefined,
      options
    );
  },

  post<T = any>(
    endpoint: string,
    body?: unknown
  ) {
    return request<T>(
      "POST",
      endpoint,
      body
    );
  },

  put<T = any>(
    endpoint: string,
    body?: unknown
  ) {
    return request<T>(
      "PUT",
      endpoint,
      body
    );
  },

  patch<T = any>(
    endpoint: string,
    body?: unknown
  ) {
    return request<T>(
      "PATCH",
      endpoint,
      body
    );
  },

  delete<T = any>(
    endpoint: string
  ) {
    return request<T>(
      "DELETE",
      endpoint
    );
  },
};

export default api;