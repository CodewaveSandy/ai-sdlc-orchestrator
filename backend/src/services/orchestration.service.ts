import type { PoRequirementAnalysis } from "../agents/po/po.schemas";
import {
  publishAgentRunUpdated,
  publishProjectUpdated,
  publishWorkflowUpdated,
} from "../realtime/realtime.publisher";
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

const runDetached = (operation: () => Promise<void>, context: string): void => {
  void operation().catch((error: unknown) => {
    console.error(`Detached orchestration failed: ${context}`, error);
  });
};

export const startScopeGeneration = async (
  projectId: string,
): Promise<ScopeWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  publishWorkflowUpdated(projectId, "SCOPE_UPDATED");

  try {
    const state = await generateProjectScope(projectId);

    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    publishAgentRunUpdated({
      projectId,
      reason: "SCOPE_UPDATED",
      occurredAt: new Date().toISOString(),
      agentType: "PRODUCT_OWNER",
      taskType: "SCOPE_GENERATION",
      status: state.status,
    });

    publishWorkflowUpdated(projectId, "SCOPE_UPDATED");

    publishProjectUpdated(projectId, "PROJECT_UPDATED");

    return state;
  } catch (error) {
    await setProjectWorkflowStatus(projectId, "FAILED");

    publishWorkflowUpdated(projectId, "WORKFLOW_FAILED");

    publishProjectUpdated(projectId, "WORKFLOW_FAILED");

    throw error;
  }
};

export const startScopeGenerationDetached = (projectId: string): void => {
  runDetached(async () => {
    await startScopeGeneration(projectId);
  }, `scope generation for project ${projectId}`);
};

export const handleRequirementAnalysisOutcome = async (
  projectId: string,
  analysis: PoRequirementAnalysis,
): Promise<void> => {
  if (analysis.decision === "NEEDS_CLARIFICATION") {
    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    publishWorkflowUpdated(projectId, "REQUIREMENT_UPDATED");

    publishProjectUpdated(projectId, "PROJECT_UPDATED");

    return;
  }

  /*
   * Requirement analysis is complete.
   *
   * Scope generation continues asynchronously
   * so the clarification/requirement HTTP
   * request does not wait for another AI run.
   */
  publishWorkflowUpdated(projectId, "REQUIREMENT_UPDATED");

  startScopeGenerationDetached(projectId);
};

export const reviseScopeAndContinue = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ScopeWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  publishWorkflowUpdated(projectId, "SCOPE_UPDATED");

  try {
    const state = await reviseProjectScope(projectId, agentRunId, feedback);

    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    publishAgentRunUpdated({
      projectId,
      reason: "SCOPE_UPDATED",
      occurredAt: new Date().toISOString(),
      agentType: "PRODUCT_OWNER",
      taskType: "SCOPE_GENERATION",
      status: state.status,
    });

    publishWorkflowUpdated(projectId, "SCOPE_UPDATED");

    publishProjectUpdated(projectId);

    return state;
  } catch (error) {
    await setProjectWorkflowStatus(projectId, "FAILED");

    publishWorkflowUpdated(projectId, "WORKFLOW_FAILED");

    publishProjectUpdated(projectId, "WORKFLOW_FAILED");

    throw error;
  }
};

export const startArchitecture = async (
  projectId: string,
): Promise<ArchitectureWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  publishWorkflowUpdated(projectId, "ARCHITECTURE_UPDATED");

  try {
    const state = await generateProjectArchitecture(projectId);

    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    publishAgentRunUpdated({
      projectId,
      reason: "ARCHITECTURE_UPDATED",
      occurredAt: new Date().toISOString(),
      agentType: "ARCHITECT",
      taskType: "ARCHITECTURE_DESIGN",
      status: state.status,
    });

    publishWorkflowUpdated(projectId, "ARCHITECTURE_UPDATED");

    publishProjectUpdated(projectId);

    return state;
  } catch (error) {
    await setProjectWorkflowStatus(projectId, "FAILED");

    publishWorkflowUpdated(projectId, "WORKFLOW_FAILED");

    publishProjectUpdated(projectId, "WORKFLOW_FAILED");

    throw error;
  }
};

export const startArchitectureDetached = (projectId: string): void => {
  runDetached(async () => {
    await startArchitecture(projectId);
  }, `architecture generation for project ${projectId}`);
};

export const approveScopeAndContinue = async (
  projectId: string,
  agentRunId: string,
): Promise<ScopeWorkflowState> => {
  const state = await approveProjectScopeRun(projectId, agentRunId);

  await completeProductDiscovery(projectId);

  publishAgentRunUpdated({
    projectId,
    reason: "SCOPE_UPDATED",
    occurredAt: new Date().toISOString(),
    agentType: "PRODUCT_OWNER",
    taskType: "SCOPE_GENERATION",
    status: "COMPLETED",
  });

  publishWorkflowUpdated(projectId, "ARCHITECTURE_UPDATED");

  publishProjectUpdated(projectId);

  /*
   * Do not block the scope approval
   * HTTP request while GPT generates
   * Architecture.
   */
  startArchitectureDetached(projectId);

  return state;
};

export const reviseArchitectureAndContinue = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ArchitectureWorkflowState> => {
  await setProjectWorkflowStatus(projectId, "RUNNING");

  publishWorkflowUpdated(projectId, "ARCHITECTURE_UPDATED");

  try {
    const state = await reviseProjectArchitecture(
      projectId,
      agentRunId,
      feedback,
    );

    await setProjectWorkflowStatus(projectId, "WAITING_FOR_HUMAN");

    publishAgentRunUpdated({
      projectId,
      reason: "ARCHITECTURE_UPDATED",
      occurredAt: new Date().toISOString(),
      agentType: "ARCHITECT",
      taskType: "ARCHITECTURE_DESIGN",
      status: state.status,
    });

    publishWorkflowUpdated(projectId, "ARCHITECTURE_UPDATED");

    publishProjectUpdated(projectId);

    return state;
  } catch (error) {
    await setProjectWorkflowStatus(projectId, "FAILED");

    publishWorkflowUpdated(projectId, "WORKFLOW_FAILED");

    publishProjectUpdated(projectId, "WORKFLOW_FAILED");

    throw error;
  }
};

export const approveArchitectureAndContinue = async (
  projectId: string,
  agentRunId: string,
): Promise<ArchitectureWorkflowState> => {
  const state = await approveArchitectureRun(projectId, agentRunId);

  await completeArchitecture(projectId);

  publishAgentRunUpdated({
    projectId,
    reason: "ARCHITECTURE_UPDATED",
    occurredAt: new Date().toISOString(),
    agentType: "ARCHITECT",
    taskType: "ARCHITECTURE_DESIGN",
    status: "COMPLETED",
  });

  publishWorkflowUpdated(projectId, "PROJECT_UPDATED");

  publishProjectUpdated(projectId);

  /*
   * Future:
   *
   * startDevelopmentDetached(projectId);
   */

  return state;
};

