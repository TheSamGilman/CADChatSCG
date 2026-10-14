import {
  REVIEW_TRANSITIONS,
  type Review,
  type ReviewDecision,
  type ReviewStatus,
} from "@cadchatscg/shared/reviews";

const BADGE: Record<ReviewStatus, { label: string; className: string }> = {
  pending: { label: "Pending", className: "bg-amber-100 text-amber-800" },
  approved: { label: "Approved", className: "bg-emerald-100 text-emerald-800" },
  rejected: { label: "Rejected", className: "bg-red-100 text-red-800" },
};

const ACTION: Record<ReviewDecision, { label: string; className: string }> = {
  approved: {
    label: "Approve",
    className: "bg-emerald-100 text-emerald-800 hover:bg-emerald-200",
  },
  rejected: {
    label: "Reject",
    className: "bg-red-100 text-red-800 hover:bg-red-200",
  },
};

const dateTime = new Intl.DateTimeFormat(undefined, {
  dateStyle: "medium",
  timeStyle: "short",
});

type ReviewDetailsProps = {
  review: Review;
  onDecide: (reviewId: string, status: ReviewDecision) => void;
  onStartOver: () => void;
  isSaving: boolean;
};

export function ReviewDetails({
  review,
  onDecide,
  onStartOver,
  isSaving,
}: ReviewDetailsProps) {
  const badge = BADGE[review.status];
  const next: readonly ReviewDecision[] = REVIEW_TRANSITIONS[review.status];

  return (
    <div className="flex flex-col gap-2">
      <p className="flex flex-wrap items-center gap-2">
        <span className="font-semibold text-slate-900">Status:</span>
        <span
          className={`rounded-full px-2.5 py-0.5 text-sm font-semibold ${badge.className}`}
        >
          {badge.label}
        </span>
        {next.length === 0 && (
          <span className="text-sm text-slate-500">
            {dateTime.format(new Date(review.updatedAt))}
          </span>
        )}
      </p>
      <p className="text-slate-700">
        <span className="font-semibold text-slate-900">Comment:</span>{" "}
        {review.comment}
      </p>
      <div className="mt-2 flex gap-2">
        {next.length > 0 ? (
          next.map((status) => (
            <button
              key={status}
              type="button"
              disabled={isSaving}
              onClick={() => onDecide(review.id, status)}
              className={`rounded px-3 py-1.5 font-medium disabled:cursor-not-allowed disabled:opacity-50 ${ACTION[status].className}`}
            >
              {ACTION[status].label}
            </button>
          ))
        ) : (
          <button
            type="button"
            disabled={isSaving}
            onClick={onStartOver}
            className="rounded bg-orange-100 px-3 py-1.5 font-medium text-orange-800 hover:bg-orange-200 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Start over
          </button>
        )}
      </div>
    </div>
  );
}
