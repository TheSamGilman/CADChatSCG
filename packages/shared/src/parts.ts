import { z } from "zod";
import { IdSchema } from "./common.ts";

export type Part = { id: string; name: string };

export const PartIdParamsSchema = z.object({ partId: IdSchema });
