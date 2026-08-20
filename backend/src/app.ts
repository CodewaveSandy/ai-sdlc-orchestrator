import cors from "cors";
import express from "express";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/health", (_request, response) => {
  response.status(200).json({
    success: true,
    message: "AI SDLC Orchestrator API is healthy",
  });
});

export default app;

