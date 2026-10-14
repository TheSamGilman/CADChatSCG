import {
  InvalidTransitionError,
  NotFoundError,
  PendingReviewExistsError,
} from "@cadchatscg/database";
import type { ApiError, ApiErrorCode } from "@cadchatscg/shared/common";
import type { ErrorRequestHandler, RequestHandler, Response } from "express";
import { ZodError } from "zod";

const DOMAIN_ERRORS = [
  [NotFoundError, 404, "NOT_FOUND"],
  [InvalidTransitionError, 409, "INVALID_TRANSITION"],
  [PendingReviewExistsError, 409, "PENDING_REVIEW_EXISTS"],
] as const;

function send(
  res: Response,
  status: number,
  code: ApiErrorCode,
  message: string,
) {
  const body: ApiError = { error: { code, message } };
  res.status(status).json(body);
}

export const notFoundHandler: RequestHandler = (req, res) => {
  send(res, 404, "NOT_FOUND", `No route for ${req.method} ${req.path}.`);
};

// Express recognises an error handler by its four parameters, so `_next` must stay.
export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    const message = error.issues
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ");
    return send(res, 400, "VALIDATION_ERROR", message);
  }
  if (error?.type === "entity.parse.failed") {
    return send(
      res,
      400,
      "VALIDATION_ERROR",
      "Request body is not valid JSON.",
    );
  }
  for (const [type, status, code] of DOMAIN_ERRORS) {
    if (error instanceof type) {
      return send(res, status, code, error.message);
    }
  }
  console.error(error);
  send(res, 500, "INTERNAL_ERROR", "Something went wrong.");
};
