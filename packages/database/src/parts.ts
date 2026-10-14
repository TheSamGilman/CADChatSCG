import type { Part } from "@cadchatscg/shared/parts";
import { getSupabase, must } from "./supabase.ts";

export const parts = {
  async list(): Promise<Part[]> {
    return must(
      await getSupabase()
        .from("parts")
        .select("id, name")
        .order("created_at")
        .order("id"),
    );
  },
};
