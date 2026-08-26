export interface ApiResponse<T> {
  readonly success: boolean;
  readonly data: T;
  readonly timestamp: string;
  readonly requestId: string;
}

export interface ApiErrorDetail {
  readonly field?: string;
  readonly message: string;
  readonly code: string;
}

export interface ApiErrorResponse {
  readonly success: false;
  readonly error: {
    readonly code: string;
    readonly message: string;
    readonly details?: readonly ApiErrorDetail[];
    readonly statusCode: number;
  };
  readonly timestamp: string;
  readonly requestId: string;
}

export interface PaginationMeta {
  readonly page: number;
  readonly limit: number;
  readonly totalItems: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPrevPage: boolean;
}

export interface PaginatedResult<T> {
  readonly items: readonly T[];
  readonly meta: PaginationMeta;
}
