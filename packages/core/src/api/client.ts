import type { ApiResponse, ApiErrorResponse } from "@saas/types";

export interface RequestOptions extends Omit<RequestInit, "body"> {
  readonly body?: unknown;
  readonly params?: Record<string, string | number | boolean | undefined> | undefined;
  readonly timeoutMs?: number | undefined;
}

export class ApiClientError extends Error {
  readonly statusCode: number;
  readonly code: string;
  readonly details?: readonly unknown[] | undefined;

  constructor(
    message: string,
    statusCode: number,
    code: string,
    details?: readonly unknown[] | undefined,
  ) {
    super(message);
    this.name = "ApiClientError";
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class ApiClient {
  private readonly baseUrl: string;
  private readonly defaultHeaders: Record<string, string>;

  constructor(baseUrl: string = "", defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.defaultHeaders = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...defaultHeaders,
    };
  }

  private buildUrl(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined> | undefined,
  ): string {
    const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
    const url = new URL(`${this.baseUrl}${cleanEndpoint}`, "http://localhost");

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }

    return this.baseUrl ? url.toString() : `${cleanEndpoint}${url.search}`;
  }

  public async request<T>(endpoint: string, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const { body, params, timeoutMs = 15000, headers, ...restOptions } = options;
    const url = this.buildUrl(endpoint, params);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
      const fetchHeaders: HeadersInit = {
        ...this.defaultHeaders,
        ...((headers as Record<string, string>) ?? {}),
      };

      const requestInit: RequestInit = {
        ...restOptions,
        headers: fetchHeaders,
        signal: controller.signal,
      };

      if (body !== undefined) {
        requestInit.body = JSON.stringify(body);
      }

      const response = await fetch(url, requestInit);

      clearTimeout(timeoutId);

      const data = (await response.json()) as ApiResponse<T> | ApiErrorResponse;

      if (!response.ok || !data.success) {
        const errorData = data as ApiErrorResponse;
        throw new ApiClientError(
          errorData.error?.message ?? `Request failed with status ${response.status}`,
          errorData.error?.statusCode ?? response.status,
          errorData.error?.code ?? "UNKNOWN_ERROR",
          errorData.error?.details,
        );
      }

      return data as ApiResponse<T>;
    } catch (error: unknown) {
      clearTimeout(timeoutId);

      if (error instanceof ApiClientError) {
        throw error;
      }

      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiClientError(`Request timed out after ${timeoutMs}ms`, 408, "TIMEOUT_ERROR");
      }

      const errorMessage = error instanceof Error ? error.message : "Network error occurred";
      throw new ApiClientError(errorMessage, 500, "NETWORK_ERROR");
    }
  }

  public get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | undefined> | undefined,
    options?: Omit<RequestOptions, "params">,
  ): Promise<ApiResponse<T>> {
    const opts: RequestOptions = { ...(options ?? {}), method: "GET" };
    if (params !== undefined) {
      (opts as { params?: Record<string, string | number | boolean | undefined> }).params = params;
    }
    return this.request<T>(endpoint, opts);
  }

  public post<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">,
  ): Promise<ApiResponse<T>> {
    const opts: RequestOptions = { ...(options ?? {}), method: "POST" };
    if (body !== undefined) {
      (opts as { body?: unknown }).body = body;
    }
    return this.request<T>(endpoint, opts);
  }

  public put<T>(
    endpoint: string,
    body?: unknown,
    options?: Omit<RequestOptions, "body">,
  ): Promise<ApiResponse<T>> {
    const opts: RequestOptions = { ...(options ?? {}), method: "PUT" };
    if (body !== undefined) {
      (opts as { body?: unknown }).body = body;
    }
    return this.request<T>(endpoint, opts);
  }

  public delete<T>(
    endpoint: string,
    options?: RequestOptions,
  ): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { ...(options ?? {}), method: "DELETE" });
  }
}

export const apiClient = new ApiClient(
  typeof process !== "undefined" ? process.env.NEXT_PUBLIC_API_URL ?? "" : "",
);
