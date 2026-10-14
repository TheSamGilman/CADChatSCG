import type { ReviewStatus } from "@cadchatscg/shared/reviews";

export class DatabaseUnavailableError extends Error {
  constructor(message: string, cause?: unknown) {
    super(message, { cause });
    this.name = "DatabaseUnavailableError";
  }
}

export class NotFoundError extends Error {
  constructor(entity: "Part" | "Review", id: string) {
    super(`${entity} ${id} not found.`);
    this.name = "NotFoundError";
  }
}

export class PendingReviewExistsError extends Error {
  constructor(partId: string) {
    super(`Part ${partId} already has a pending review.`);
    this.name = "PendingReviewExistsError";
  }
}

export class InvalidTransitionError extends Error {
  constructor(from: ReviewStatus, to: ReviewStatus) {
    super(`Can't change a review from "${from}" to "${to}".`);
    this.name = "InvalidTransitionError";
  }
}
