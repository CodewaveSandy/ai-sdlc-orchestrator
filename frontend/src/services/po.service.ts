import { apiRequest } from "@/lib/api";
import type {
  PoWorkflowState,
  PoWorkflowStateResponse,
  RequirementAnalysisResponse,
  SubmitClarificationsPayload,
  SubmitClarificationsResponse,
  SubmitRequirementPayload,
} from "@/types/po.types";

export const getPoWorkflowState = async (
  projectId: string,
): Promise<PoWorkflowState | null> => {
  const response = await apiRequest<PoWorkflowStateResponse>({
    method: "GET",
    url: `/api/projects/${projectId}/po-state`,
  });

  return response.data.state;
};

export const submitProjectRequirement = async (
  projectId: string,
  payload: SubmitRequirementPayload,
): Promise<PoWorkflowState> => {
  const response = await apiRequest<RequirementAnalysisResponse>({
    method: "POST",
    url: `/api/projects/${projectId}/requirement`,
    data: payload,
  });

  return {
    agentRunId: response.data.agentRunId,
    status: response.data.status,
    analysis: response.data.analysis,
    clarificationRounds: [],
  };
};

export const submitPoClarifications = async (
  projectId: string,
  payload: SubmitClarificationsPayload,
): Promise<PoWorkflowState> => {
  const response = await apiRequest<SubmitClarificationsResponse>({
    method: "POST",
    url: `/api/projects/${projectId}/po/clarifications`,
    data: payload,
  });

  return response.data.state;
};

