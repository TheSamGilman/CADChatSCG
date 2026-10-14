import express from "express";
import { errorHandler, notFoundHandler } from "./errors.ts";
import { router } from "./routes.ts";

export function createApp() {
  const app = express();
  app.use(express.json());
  app.use("/api", router);
  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
