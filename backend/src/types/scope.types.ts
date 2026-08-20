import type {
  PoScopeRunInput,
  ProductScope,
} from "../agents/po/po-scope.schemas";
import type { AgentRunStatus, AgentRunUsage } from "./agent-run.types";

export interface ScopeWorkflowState {
  agentRunId: string;
  status: AgentRunStatus;
  scope?: ProductScope;
  input?: PoScopeRunInput;
  usage?: AgentRunUsage;
  error?: string;
}

export interface ReviseScopeInput {
  agentRunId: string;
  feedback: string;
}

export interface ApproveScopeInput {
  agentRunId: string;
}

