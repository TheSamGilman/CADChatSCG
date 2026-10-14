import { CreateReviewBodySchema } from "@cadchatscg/shared/reviews";
import { type FormEvent, useState } from "react";

type CommentFormProps = {
  onSubmit: (comment: string) => void;
  isSaving: boolean;
  error: string | undefined;
};

export function CommentForm({ onSubmit, isSaving, error }: CommentFormProps) {
  const [comment, setComment] = useState("");
  const isValid = CreateReviewBodySchema.safeParse({ comment }).success;

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (isValid && !isSaving) {
      onSubmit(comment.trim());
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-2">
      <label htmlFor="review-comment" className="text-slate-600">
        Design Review
      </label>
      <textarea
        id="review-comment"
        value={comment}
        onChange={(event) => setComment(event.target.value)}
        rows={2}
        placeholder="Add a comment"
        className="resize-none rounded border border-slate-300 p-2 focus:border-sky-500 focus:outline-none"
      />
      {error && <p className="text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={!isValid || isSaving}
        className="mt-2 self-start rounded bg-sky-100 px-3 py-1.5 font-medium text-sky-800 hover:bg-sky-200 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {isSaving ? "Saving…" : "Save"}
      </button>
    </form>
  );
}
