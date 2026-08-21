import type { AgentRunStatus } from "./po.types";

export interface ArchitectureTechnologyChoice {
  area: string;
  choice: string;
  rationale: string;
}

export interface ArchitectureComponent {
  componentKey: string;
  name: string;
  responsibility: string;
  interfaces: string[];
  dependencies: string[];
}

export interface ArchitectureDataEntity {
  name: string;
  purpose: string;
  keyFields: string[];
}

export interface ArchitectureApiEndpoint {
  method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

  path: string;
  purpose: string;
}

export interface ArchitectureApiDomain {
  name: string;
  responsibility: string;
  endpoints: ArchitectureApiEndpoint[];
}

export interface ArchitectureNonFunctionalRequirement {
  category:
    | "PERFORMANCE"
    | "SECURITY"
    | "RELIABILITY"
    | "SCALABILITY"
    | "OBSERVABILITY"
    | "MAINTAINABILITY"
    | "ACCESSIBILITY";

  requirement: string;
  target: string;
}

export interface ArchitectureRisk {
  risk: string;
  impact: string;
  mitigation: string;
}

export interface ArchitectureProposal {
  architectureSummary: string;
  systemContext: string;

  technologyChoices: ArchitectureTechnologyChoice[];

  components: ArchitectureComponent[];

  dataEntities: ArchitectureDataEntity[];

  apiDomains: ArchitectureApiDomain[];

  nonFunctionalRequirements: ArchitectureNonFunctionalRequirement[];

  securityConsiderations: string[];

  deploymentStrategy: string;

  architectureDecisions: string[];

  risks: ArchitectureRisk[];
}

export interface ArchitectureRevision {
  feedback: string;
  previousArchitecture: ArchitectureProposal;
  requestedAt: string;
}

export interface ArchitectRunInput {
  approvedScope: unknown;
  revisions: ArchitectureRevision[];
}

export interface ArchitectureRunUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ArchitectureWorkflowState {
  agentRunId: string;
  status: AgentRunStatus;

  architecture?: ArchitectureProposal;

  input?: ArchitectRunInput;

  usage?: ArchitectureRunUsage;

  error?: string;
}

export interface ArchitectureStateResponse {
  success: boolean;

  data: {
    state: ArchitectureWorkflowState | null;
  };
}

export interface ArchitectureMutationResponse {
  success: boolean;
  message: string;

  data: {
    state: ArchitectureWorkflowState;
  };
}

