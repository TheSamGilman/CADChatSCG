import type { ApiError } from "@cadchatscg/shared/common";
import type { Part } from "@cadchatscg/shared/parts";
import type { Review } from "@cadchatscg/shared/reviews";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app.ts";

const app = createApp();

// A starting point for API tests, not full coverage: one example that exercises the whole stack.

describe("PATCH /api/reviews/:id", () => {
  it("decides a pending review once; a second decision gets 409", async () => {
    const [part]: Part[] = (await request(app).get("/api/parts").expect(200))
      .body;
    const created: Review = (
      await request(app)
        .post(`/api/parts/${part?.id}/reviews`)
        .send({ comment: "Test: check draft angles" })
        .expect(201)
    ).body;

    try {
      const approved: Review = (
        await request(app)
          .patch(`/api/reviews/${created.id}`)
          .send({ status: "approved" })
          .expect(200)
      ).body;
      expect(approved.status).toBe("approved");

      const conflict: ApiError = (
        await request(app)
          .patch(`/api/reviews/${created.id}`)
          .send({ status: "rejected" })
          .expect(409)
      ).body;
      expect(conflict.error.code).toBe("INVALID_TRANSITION");
    } finally {
      await request(app).delete(`/api/reviews/${created.id}`).expect(204);
    }
  });
});
