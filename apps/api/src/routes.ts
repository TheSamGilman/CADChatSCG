import { parts, reviews } from "@cadchatscg/database";
import { PartIdParamsSchema } from "@cadchatscg/shared/parts";
import {
  CreateReviewBodySchema,
  ReviewIdParamsSchema,
  UpdateReviewBodySchema,
} from "@cadchatscg/shared/reviews";
import { type Request, Router } from "express";

const partIdOf = (req: Request) => PartIdParamsSchema.parse(req.params).partId;
const reviewIdOf = (req: Request) => ReviewIdParamsSchema.parse(req.params).id;

export const router = Router();

router.get("/parts", async (_req, res) => {
  res.json(await parts.list());
});

router.get("/parts/:partId/reviews", async (req, res) => {
  res.json(await reviews.list(partIdOf(req)));
});

router.get("/parts/:partId/reviews/current", async (req, res) => {
  res.json(await reviews.getCurrent(partIdOf(req)));
});

router.post("/parts/:partId/reviews", async (req, res) => {
  const { comment } = CreateReviewBodySchema.parse(req.body);
  res.status(201).json(await reviews.create(partIdOf(req), comment));
});

router.get("/reviews/:id", async (req, res) => {
  res.json(await reviews.get(reviewIdOf(req)));
});

router.patch("/reviews/:id", async (req, res) => {
  const { status } = UpdateReviewBodySchema.parse(req.body);
  res.json(await reviews.updateStatus(reviewIdOf(req), status));
});

router.delete("/reviews/:id", async (req, res) => {
  await reviews.delete(reviewIdOf(req));
  res.status(204).end();
});
