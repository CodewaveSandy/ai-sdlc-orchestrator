import type { PoRequirementAnalysis } from "../agents/po/po.schemas";
import type { ArchitectureWorkflowState } from "../types/architecture.types";
import type { ScopeWorkflowState } from "../types/scope.types";
import {
  approveArchitectureRun,
  generateProjectArchitecture,
  reviseProjectArchitecture,
} from "./architecture.service";
import {
  completeArchitecture,
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

export const startArchitecture = async (
  projectId: string,
): Promise<ArchitectureWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  try {
    const state = await generateProjectArchitecture(projectId);

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

  await startArchitecture(projectId);

  return state;
};

export const reviseArchitectureAndContinue = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ArchitectureWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  try {
    const state = await reviseProjectArchitecture(
      projectId,
      agentRunId,
      feedback,
    );

    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    return state;
  } catch (error) {
    await setProjectWorkflowStatus(projectId, "FAILED");

    throw error;
  }
};

export const approveArchitectureAndContinue = async (
  projectId: string,
  agentRunId: string,
): Promise<ArchitectureWorkflowState> => {
  const state = await approveArchitectureRun(projectId, agentRunId);

  await completeArchitecture(projectId);

  /*
   * When Developer Agent exists:
   *
   * await startDevelopment(projectId);
   */

  return state;
};

