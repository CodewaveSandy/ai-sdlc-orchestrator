import { Router } from "express";

import {
  approveArchitectureController,
  getArchitectureStateController,
  reviseArchitectureController,
} from "../controllers/architecture.controller";
import {
  createProjectController,
  deleteProjectController,
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

/*
 * Retained as a debug/fallback endpoint.
 * Normal orchestration does not require it.
 */
projectRouter.post("/:projectId/po/scope", generateScopeController);

projectRouter.post("/:projectId/po/scope/revise", reviseScopeController);

projectRouter.post("/:projectId/po/scope/approve", approveScopeController);

projectRouter.get("/:projectId/architecture", getArchitectureStateController);

projectRouter.post(
  "/:projectId/architecture/revise",
  reviseArchitectureController,
);

projectRouter.post(
  "/:projectId/architecture/approve",
  approveArchitectureController,
);

projectRouter.delete("/:projectId", deleteProjectController);

projectRouter.get("/:projectId", getProjectByIdController);

export default projectRouter;

