import {
  REALTIME_EVENTS,
  type AgentRunRealtimeEvent,
  type ProjectRealtimeEvent,
  type WorkflowUpdateReason,
} from "./realtime.types";
import { getProjectSocketRoom, getSocketServer } from "./socket";

const createProjectEvent = (
  projectId: string,
  reason: WorkflowUpdateReason,
): ProjectRealtimeEvent => {
  return {
    projectId,
    reason,
    occurredAt: new Date().toISOString(),
  };
};

export const publishProjectUpdated = (
  projectId: string,
  reason: WorkflowUpdateReason = "PROJECT_UPDATED",
): void => {
  const io = getSocketServer();

  if (!io) {
    return;
  }

  const event = createProjectEvent(projectId, reason);

  io.to(getProjectSocketRoom(projectId)).emit(
    REALTIME_EVENTS.PROJECT_UPDATED,
    event,
  );

  io.to("projects").emit(REALTIME_EVENTS.PROJECT_UPDATED, event);
};

export const publishWorkflowUpdated = (
  projectId: string,
  reason: WorkflowUpdateReason,
): void => {
  const io = getSocketServer();

  if (!io) {
    return;
  }

  const event = createProjectEvent(projectId, reason);

  io.to(getProjectSocketRoom(projectId)).emit(
    REALTIME_EVENTS.WORKFLOW_UPDATED,
    event,
  );

  io.to("projects").emit(REALTIME_EVENTS.WORKFLOW_UPDATED, event);
};

export const publishAgentRunUpdated = (event: AgentRunRealtimeEvent): void => {
  const io = getSocketServer();

  if (!io) {
    return;
  }

  io.to(getProjectSocketRoom(event.projectId)).emit(
    REALTIME_EVENTS.AGENT_RUN_UPDATED,
    event,
  );

  io.to("projects").emit(REALTIME_EVENTS.AGENT_RUN_UPDATED, event);
};

