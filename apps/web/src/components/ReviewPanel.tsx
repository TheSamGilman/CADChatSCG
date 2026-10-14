import type { Part } from "@cadchatscg/shared/parts";
import { Html } from "@react-three/drei";
import { useState } from "react";
import { useReview } from "../hooks/useReview.ts";
import { CommentForm } from "./CommentForm.tsx";
import { ReviewDetails } from "./ReviewDetails.tsx";

// <Html> renders its children in a separate React root without context, so the
// TanStack Query hooks run here and the content inside <Html> only gets props.
export function ReviewPanel({ part }: { part: Part }) {
  const { query, create, decide } = useReview(part.id);
  const [isStartingOver, setIsStartingOver] = useState(false);

  return (
    <Html position={[0, 0.9, 0]}>
      {/* Stop presses reaching OrbitControls on the canvas container (no camera spin while typing). */}
      <div
        className="w-80 -translate-x-1/2 -translate-y-[calc(100%+1rem)] rounded-lg bg-white p-4 pb-6 shadow-lg ring-1 ring-slate-200"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <h2 className="text-lg font-semibold text-slate-900">
          Part: {part.name}
        </h2>
        <div className="mt-2 text-base">
          {query.isPending ? (
            <p className="text-slate-500">Loading…</p>
          ) : query.error ? (
            <p className="text-red-700">
              Couldn't load the review: {query.error.message}
            </p>
          ) : query.data === null || isStartingOver ? (
            <CommentForm
              onSubmit={(comment) =>
                create.mutate(comment, {
                  onSuccess: () => setIsStartingOver(false),
                })
              }
              isSaving={create.isPending}
              error={create.error?.message}
            />
          ) : (
            <ReviewDetails
              review={query.data}
              onDecide={(id, status) => decide.mutate({ id, status })}
              onStartOver={() => {
                decide.reset();
                setIsStartingOver(true);
              }}
              isSaving={decide.isPending}
            />
          )}
          {decide.error && (
            <p className="mt-2 text-red-700">{decide.error.message}</p>
          )}
        </div>
      </div>
    </Html>
  );
}
