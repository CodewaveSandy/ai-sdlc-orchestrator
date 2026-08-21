/* eslint-disable @typescript-eslint/no-unused-vars */
import { useEffect } from "react";

import { socket } from "@/lib/socket";
import {
  REALTIME_EVENTS,
  type AgentRunRealtimeEvent,
  type ProjectRealtimeEvent,
} from "@/types/realtime.types";

interface UseProjectsRealtimeOptions {
  onRefresh: () => Promise<void>;
}

const REFRESH_DEBOUNCE_MS = 150;

export const useProjectsRealtime = ({
  onRefresh,
}: UseProjectsRealtimeOptions): void => {
  useEffect(() => {
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const scheduleRefresh = (): void => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      refreshTimer = setTimeout(() => {
        void onRefresh();
      }, REFRESH_DEBOUNCE_MS);
    };

    const handleProjectEvent = (_event: ProjectRealtimeEvent): void => {
      scheduleRefresh();
    };

    const handleAgentRunEvent = (_event: AgentRunRealtimeEvent): void => {
      scheduleRefresh();
    };

    const joinProjectsRoom = (): void => {
      socket.emit("projects:join");
    };

    socket.on("connect", joinProjectsRoom);

    socket.on(REALTIME_EVENTS.PROJECT_UPDATED, handleProjectEvent);

    socket.on(REALTIME_EVENTS.WORKFLOW_UPDATED, handleProjectEvent);

    socket.on(REALTIME_EVENTS.AGENT_RUN_UPDATED, handleAgentRunEvent);

    if (!socket.connected) {
      socket.connect();
    } else {
      joinProjectsRoom();
    }

    return () => {
      if (refreshTimer) {
        clearTimeout(refreshTimer);
      }

      socket.emit("projects:leave");

      socket.off("connect", joinProjectsRoom);

      socket.off(REALTIME_EVENTS.PROJECT_UPDATED, handleProjectEvent);

      socket.off(REALTIME_EVENTS.WORKFLOW_UPDATED, handleProjectEvent);

      socket.off(REALTIME_EVENTS.AGENT_RUN_UPDATED, handleAgentRunEvent);
    };
  }, [onRefresh]);
};

