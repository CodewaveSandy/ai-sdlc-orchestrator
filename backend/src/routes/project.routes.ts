import { Router } from "express";

import {
  createProjectController,
  getProjectByIdController,
  getProjectsController,
} from "../controllers/project.controller";
import {
  getPoWorkflowStateController,
  submitPoClarificationsController,
  submitRequirementController,
} from "../controllers/requirement.controller";
import {
  approveScopeController,
  generateScopeController,
  getScopeStateController,
  reviseScopeController,
} from "../controllers/scope.controller";

const projectRouter = Router();

projectRouter.post("/", createProjectController);

projectRouter.get("/", getProjectsController);

projectRouter.get("/:projectId/po-state", getPoWorkflowStateController);

projectRouter.post("/:projectId/requirement", submitRequirementController);

projectRouter.post(
  "/:projectId/po/clarifications",
  submitPoClarificationsController,
);

projectRouter.get("/:projectId/po/scope", getScopeStateController);

projectRouter.post("/:projectId/po/scope", generateScopeController);

projectRouter.post("/:projectId/po/scope/revise", reviseScopeController);

projectRouter.post("/:projectId/po/scope/approve", approveScopeController);

projectRouter.get("/:projectId", getProjectByIdController);

export default projectRouter;

