import {
  type Review,
  type ReviewStatus,
  sourcesFor,
} from "@cadchatscg/shared/reviews";
import type { Tables } from "./database.types.ts";
import {
  InvalidTransitionError,
  NotFoundError,
  PendingReviewExistsError,
} from "./errors.ts";
import { getSupabase, must } from "./supabase.ts";

const FOREIGN_KEY_VIOLATION = "23503";
const UNIQUE_VIOLATION = "23505";

function toReview(row: Tables<"reviews">): Review {
  return {
    id: row.id,
    partId: row.part_id,
    comment: row.comment,
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// One round-trip: the part plus its reviews (newest first) through the part_id foreign key.
async function reviewsOf(partId: string, limit?: number) {
  let query = getSupabase()
    .from("parts")
    .select("id, reviews(*)")
    .eq("id", partId)
    .order("created_at", { referencedTable: "reviews", ascending: false });
  if (limit) {
    query = query.limit(limit, { referencedTable: "reviews" });
  }
  const part = must(await query.maybeSingle());
  if (!part) {
    throw new NotFoundError("Part", partId);
  }
  return part.reviews.map(toReview);
}

async function get(id: string) {
  const row = must(
    await getSupabase().from("reviews").select().eq("id", id).maybeSingle(),
  );
  if (!row) {
    throw new NotFoundError("Review", id);
  }
  return toReview(row);
}

export const reviews = {
  get,

  list: (partId: string) => reviewsOf(partId),

  async getCurrent(partId: string) {
    const [latest] = await reviewsOf(partId, 1);
    return latest ?? null;
  },

  async create(partId: string, comment: string) {
    const result = await getSupabase()
      .from("reviews")
      .insert({ part_id: partId, comment })
      .select()
      .single();
    if (result.error?.code === FOREIGN_KEY_VIOLATION) {
      throw new NotFoundError("Part", partId);
    }
    if (result.error?.code === UNIQUE_VIOLATION) {
      throw new PendingReviewExistsError(partId);
    }
    return toReview(must(result));
  },

  // The transition rule is part of the WHERE clause, so the update is atomic: of two concurrent
  // decisions only the first matches; the second updates nothing and gets InvalidTransitionError.
  async updateStatus(id: string, to: ReviewStatus) {
    const row = must(
      await getSupabase()
        .from("reviews")
        .update({ status: to })
        .eq("id", id)
        .in("status", sourcesFor(to))
        .select()
        .maybeSingle(),
    );
    if (row) {
      return toReview(row);
    }
    const current = await get(id);
    throw new InvalidTransitionError(current.status, to);
  },

  async delete(id: string) {
    const row = must(
      await getSupabase()
        .from("reviews")
        .delete()
        .eq("id", id)
        .select("id")
        .maybeSingle(),
    );
    if (!row) {
      throw new NotFoundError("Review", id);
    }
  },
};
