import app from "./app.js";

const PORT = 5001;

const startServer = (): void => {
  app.listen(PORT, () => {
    console.log(`AI SDLC Orchestrator API running on http://localhost:${PORT}`);
  });
};

startServer();

