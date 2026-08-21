import { apiRequest } from "@/lib/api";
import type {
  ArchitectureMutationResponse,
  ArchitectureStateResponse,
  ArchitectureWorkflowState,
} from "@/types/architecture.types";

export const getProjectArchitectureState = async (
  projectId: string,
): Promise<ArchitectureWorkflowState | null> => {
  const response = await apiRequest<ArchitectureStateResponse>({
    method: "GET",
    url: `/api/projects/${projectId}/architecture`,
  });

  return response.data.state;
};

export const reviseProjectArchitecture = async (
  projectId: string,
  agentRunId: string,
  feedback: string,
): Promise<ArchitectureWorkflowState> => {
  const response = await apiRequest<ArchitectureMutationResponse>({
    method: "POST",

    url: `/api/projects/${projectId}/architecture/revise`,

    data: {
      agentRunId,
      feedback,
    },
  });

  return response.data.state;
};

export const approveProjectArchitecture = async (
  projectId: string,
  agentRunId: string,
): Promise<ArchitectureWorkflowState> => {
  const response = await apiRequest<ArchitectureMutationResponse>({
    method: "POST",

    url: `/api/projects/${projectId}/architecture/approve`,

    data: {
      agentRunId,
    },
  });

  return response.data.state;
};

