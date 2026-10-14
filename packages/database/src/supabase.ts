import {
  createClient,
  type PostgrestSingleResponse,
  type SupabaseClient,
} from "@supabase/supabase-js";
import type { Database } from "./database.types.ts";
import { DatabaseUnavailableError } from "./errors.ts";

let client: SupabaseClient<Database> | undefined;

export function getSupabase() {
  if (!client) {
    const url = process.env.SUPABASE_URL;
    const secretKey = process.env.SUPABASE_SECRET_KEY;
    if (!url || !secretKey) {
      throw new DatabaseUnavailableError(
        "Database config missing: set SUPABASE_URL and SUPABASE_SECRET_KEY.",
      );
    }
    client = createClient<Database>(url, secretKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
  }
  return client;
}

export async function checkConnection() {
  const { error } = await getSupabase().from("parts").select("id").limit(1);
  if (error) {
    throw new DatabaseUnavailableError(
      "Database isn't running. Run `npm run db:start`.",
      error,
    );
  }
}

// supabase-js returns errors instead of throwing them; this turns a failed query into an exception.
export function must<T>(result: PostgrestSingleResponse<T>): T {
  if (result.error) {
    throw new Error(`Database query failed: ${result.error.message}`, {
      cause: result.error,
    });
  }
  return result.data;
}
