import { z } from "zod";
import { IdSchema } from "./common.ts";

export const REVIEW_STATUSES = ["pending", "approved", "rejected"] as const;
export const ReviewStatusSchema = z.enum(REVIEW_STATUSES);
export type ReviewStatus = z.infer<typeof ReviewStatusSchema>;

// The single source of truth for status changes: the API enforces it, the UI renders its buttons from it.
export const REVIEW_TRANSITIONS = {
  pending: ["approved", "rejected"],
  approved: [],
  rejected: [],
} as const satisfies Record<ReviewStatus, readonly ReviewStatus[]>;

// The statuses a review can be moved to: "approved" | "rejected".
export type ReviewDecision = (typeof REVIEW_TRANSITIONS)[ReviewStatus][number];

export function canTransition(from: ReviewStatus, to: ReviewStatus) {
  const allowed: readonly ReviewStatus[] = REVIEW_TRANSITIONS[from];
  return allowed.includes(to);
}

export function sourcesFor(to: ReviewStatus) {
  return REVIEW_STATUSES.filter((from) => canTransition(from, to));
}

export type Review = {
  id: string;
  partId: string;
  comment: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
};

export const CreateReviewBodySchema = z.strictObject({
  comment: z.string().trim().min(1, "Comment can't be empty"),
});
export type CreateReviewBody = z.infer<typeof CreateReviewBodySchema>;

export const UpdateReviewBodySchema = z.strictObject({
  status: ReviewStatusSchema,
});
export type UpdateReviewBody = z.infer<typeof UpdateReviewBodySchema>;

export const ReviewIdParamsSchema = z.object({ id: IdSchema });
