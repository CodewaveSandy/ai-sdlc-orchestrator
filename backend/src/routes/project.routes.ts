import { Router } from "express";

import {
  createProjectController,
  getProjectByIdController,
  getProjectsController,
} from "../controllers/project.controller";

const projectRouter = Router();

projectRouter.post("/", createProjectController);

projectRouter.get("/", getProjectsController);

projectRouter.get("/:projectId", getProjectByIdController);

export default projectRouter;

