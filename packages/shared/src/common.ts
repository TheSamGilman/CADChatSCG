import { z } from "zod";

export const IdSchema = z.uuid("Invalid id");

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INVALID_TRANSITION"
  | "PENDING_REVIEW_EXISTS"
  | "INTERNAL_ERROR";

export type ApiError = { error: { code: ApiErrorCode; message: string } };
