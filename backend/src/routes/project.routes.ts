import { Router } from "express";

import {
  approveArchitectureController,
  getArchitectureStateController,
  reviseArchitectureController,
} from "../controllers/architecture.controller";
import {
  getDevelopmentEnvironmentController,
  initializeDevelopmentEnvironmentController,
  runDevelopmentSmokeTestController,
} from "../controllers/development.controller";
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

import { getDevelopmentPlanController } from "../controllers/development-planning.controller";

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

projectRouter.get("/:projectId/architecture", getArchitectureStateController);

projectRouter.post(
  "/:projectId/architecture/revise",
  reviseArchitectureController,
);

projectRouter.post(
  "/:projectId/architecture/approve",
  approveArchitectureController,
);

projectRouter.get(
  "/:projectId/development/environment",
  getDevelopmentEnvironmentController,
);

projectRouter.post(
  "/:projectId/development/environment",
  initializeDevelopmentEnvironmentController,
);

projectRouter.post(
  "/:projectId/development/sandbox/smoke-test",
  runDevelopmentSmokeTestController,
);

projectRouter.get("/:projectId/development/plan", getDevelopmentPlanController);

projectRouter.delete("/:projectId", deleteProjectController);

projectRouter.get("/:projectId", getProjectByIdController);

export default projectRouter;

