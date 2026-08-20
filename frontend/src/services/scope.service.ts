import { apiRequest } from "@/lib/api";
import type {
  ScopeMutationResponse,
  ScopeStateResponse,
  ScopeWorkflowState,
} from "@/types/scope.types";

export const getProjectScopeState = async (
  projectId: string,
): Promise<ScopeWorkflowState | null> => {
  const response = await apiRequest<ScopeStateResponse>({
    method: "GET",
    url: `/api/projects/${projectId}/po/scope`,
  });

  return response.data.state;
};

export const generateProjectScope = async (
  projectId: string,
): Promise<ScopeWorkflowState> => {
  const response = await apiRequest<ScopeMutationResponse>({
    method: "POST",
    url: `/api/projects/${projectId}/po/scope`,
  });

  return response.data.state;
};

export const reviseProjectScope = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ScopeWorkflowState> => {
  const response = await apiRequest<ScopeMutationResponse>({
    method: "POST",
    url: `/api/projects/${projectId}/po/scope/revise`,

    data: {
      agentRunId,
      feedback,
    },
  });

  return response.data.state;
};

export const approveProjectScope = async (
  projectId: string,
  agentRunId: string,
): Promise<ScopeWorkflowState> => {
  const response = await apiRequest<ScopeMutationResponse>({
    method: "POST",
    url: `/api/projects/${projectId}/po/scope/approve`,

    data: {
      agentRunId,
    },
  });

  return response.data.state;
};

