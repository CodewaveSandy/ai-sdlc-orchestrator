import type { PoRequirementAnalysis } from "../agents/po/po.schemas";
import type { ScopeWorkflowState } from "../types/scope.types";
import {
  completeProductDiscovery,
  setProjectWorkflowStatus,
} from "./project.service";
import {
  approveProjectScopeRun,
  generateProjectScope,
  reviseProjectScope,
} from "./scope.service";

export const startScopeGeneration = async (
  projectId: string,
): Promise<ScopeWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  try {
    const state = await generateProjectScope(projectId);

    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    return state;
  } catch (error) {
    await setProjectWorkflowStatus(projectId, "FAILED");

    throw error;
  }
};

export const handleRequirementAnalysisOutcome = async (
  projectId: string,
  analysis: PoRequirementAnalysis,
): Promise<void> => {
  if (analysis.decision === "NEEDS_CLARIFICATION") {
    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    return;
  }

  await startScopeGeneration(projectId);
};

export const reviseScopeAndContinue = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ScopeWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  try {
    const state = await reviseProjectScope(projectId, agentRunId, feedback);

    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    return state;
  } catch (error) {
    await setProjectWorkflowStatus(projectId, "FAILED");

    throw error;
  }
};

export const approveScopeAndContinue = async (
  projectId: string,
  agentRunId: string,
): Promise<ScopeWorkflowState> => {
  const state = await approveProjectScopeRun(projectId, agentRunId);

  await completeProductDiscovery(projectId);

  /*
   * This is intentionally the orchestration
   * boundary for the next stage.
   *
   * Once the Architect Agent exists, this
   * function will continue with:
   *
   * await startArchitecture(projectId);
   *
   * No new human click will be required.
   */

  return state;
};

