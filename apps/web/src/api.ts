import type { ApiError } from "@cadchatscg/shared/common";
import type { Part } from "@cadchatscg/shared/parts";
import type {
  CreateReviewBody,
  Review,
  UpdateReviewBody,
} from "@cadchatscg/shared/reviews";

export class ApiRequestError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`/api${path}`, {
    ...init,
    headers: init?.body
      ? { "Content-Type": "application/json", ...init.headers }
      : init?.headers,
  });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message =
      (body as ApiError | null)?.error.message ??
      `Request failed (${response.status}). Is the API running?`;
    throw new ApiRequestError(response.status, message);
  }
  return body as T;
}

export const api = {
  getParts: () => request<Part[]>("/parts"),
  getCurrentReview: (partId: string) =>
    request<Review | null>(`/parts/${partId}/reviews/current`),
  createReview: (partId: string, body: CreateReviewBody) =>
    request<Review>(`/parts/${partId}/reviews`, {
      method: "POST",
      body: JSON.stringify(body),
    }),
  updateReviewStatus: (reviewId: string, body: UpdateReviewBody) =>
    request<Review>(`/reviews/${reviewId}`, {
      method: "PATCH",
      body: JSON.stringify(body),
    }),
};
