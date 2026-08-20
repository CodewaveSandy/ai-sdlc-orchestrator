import cors from "cors";
import express from "express";

import { env } from "./config/env";
import healthRouter from "./routes/health.routes";
import projectRouter from "./routes/project.routes";

const app = express();

app.disable("x-powered-by");

app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true,
  }),
);

app.use(express.json());

app.use("/health", healthRouter);

app.use("/api/projects", projectRouter);

export default app;

