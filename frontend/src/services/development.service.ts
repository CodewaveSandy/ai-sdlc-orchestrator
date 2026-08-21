import { apiRequest } from "@/lib/api";
import type {
  DevelopmentPlanStateResponse,
  DevelopmentPlanWorkflowState,
} from "@/types/development.types";

export const getDevelopmentPlanState = async (
  projectId: string,
): Promise<DevelopmentPlanWorkflowState | null> => {
  const response = await apiRequest<DevelopmentPlanStateResponse>({
    method: "GET",
    url: `/api/projects/${projectId}/development/plan`,
  });

  return response.data.state;
};

