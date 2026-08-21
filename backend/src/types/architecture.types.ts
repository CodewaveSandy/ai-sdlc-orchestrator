import type {
  ArchitectureProposal,
  ArchitectRunInput,
} from "../agents/architect/architect.schemas";
import type { AgentRunStatus, AgentRunUsage } from "./agent-run.types";

export interface ArchitectureWorkflowState {
  agentRunId: string;
  status: AgentRunStatus;
  architecture?: ArchitectureProposal;
  input?: ArchitectRunInput;
  usage?: AgentRunUsage;
  error?: string;
}

export interface ReviseArchitectureInput {
  agentRunId: string;
  feedback: string;
}

export interface ApproveArchitectureInput {
  agentRunId: string;
}

