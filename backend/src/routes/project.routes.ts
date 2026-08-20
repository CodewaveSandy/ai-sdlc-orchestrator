import { Router } from "express";

import {
  createProjectController,
  getProjectByIdController,
  getProjectsController,
} from "../controllers/project.controller";
import { submitRequirementController } from "../controllers/requirement.controller";

const projectRouter = Router();

projectRouter.post("/", createProjectController);

projectRouter.get("/", getProjectsController);

projectRouter.get("/:projectId", getProjectByIdController);

projectRouter.post("/:projectId/requirement", submitRequirementController);

export default projectRouter;

