import type { Review, ReviewStatus } from "@cadchatscg/shared/reviews";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ApiRequestError, api } from "../api.ts";

export function useReview(partId: string) {
  const queryClient = useQueryClient();
  const queryKey = ["review", partId];
  const setReview = (review: Review) =>
    queryClient.setQueryData(queryKey, review);

  const query = useQuery({
    queryKey,
    queryFn: () => api.getCurrentReview(partId),
  });

  const create = useMutation({
    mutationFn: (comment: string) => api.createReview(partId, { comment }),
    onSuccess: setReview,
  });

  const decide = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      api.updateReviewStatus(id, { status }),
    onSuccess: setReview,
    // 409 = someone else decided first: refetch so the panel shows the real state.
    onError: (error) => {
      if (error instanceof ApiRequestError && error.status === 409) {
        void queryClient.invalidateQueries({ queryKey });
      }
    },
  });

  return { query, create, decide };
}
