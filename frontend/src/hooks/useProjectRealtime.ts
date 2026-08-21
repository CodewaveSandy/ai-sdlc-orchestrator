import { useEffect } from "react";

import { socket } from "@/lib/socket";
import {
  REALTIME_EVENTS,
  type AgentRunRealtimeEvent,
  type ProjectRealtimeEvent,
} from "@/types/realtime.types";

interface UseProjectRealtimeOptions {
  projectId?: string;

  onRefresh: () => Promise<void>;
}

const REFRESH_DEBOUNCE_MS = 150;

export const useProjectRealtime = ({
  projectId,
  onRefresh,
}: UseProjectRealtimeOptions): void => {
  useEffect(() => {
    if (!projectId) {
      return;
    }

    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = (): void => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        void onRefresh();
      }, REFRESH_DEBOUNCE_MS);
    };

    const handleProjectEvent = (event: ProjectRealtimeEvent): void => {
      if (event.projectId !== projectId) {
        return;
      }

      scheduleRefresh();
    };

    const handleAgentRunEvent = (event: AgentRunRealtimeEvent): void => {
      if (event.projectId !== projectId) {
        return;
      }

      scheduleRefresh();
    };

    const joinProjectRoom = (): void => {
      socket.emit("project:join", projectId);
    };

    socket.on("connect", joinProjectRoom);

    socket.on(REALTIME_EVENTS.PROJECT_UPDATED, handleProjectEvent);

    socket.on(REALTIME_EVENTS.WORKFLOW_UPDATED, handleProjectEvent);

    socket.on(REALTIME_EVENTS.AGENT_RUN_UPDATED, handleAgentRunEvent);

    if (!socket.connected) {
      socket.connect();
    } else {
      joinProjectRoom();
    }

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      socket.emit("project:leave", projectId);

      socket.off("connect", joinProjectRoom);

      socket.off(REALTIME_EVENTS.PROJECT_UPDATED, handleProjectEvent);

      socket.off(REALTIME_EVENTS.WORKFLOW_UPDATED, handleProjectEvent);

      socket.off(REALTIME_EVENTS.AGENT_RUN_UPDATED, handleAgentRunEvent);
    };
  }, [onRefresh, projectId]);
};

