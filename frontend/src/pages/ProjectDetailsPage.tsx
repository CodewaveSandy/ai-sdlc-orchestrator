import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ArchitectureReviewPanel from "@/components/projects/ArchitectureReviewPanel";
import PendingStage from "@/components/projects/PendingStage";
import PoWorkflowPanel from "@/components/projects/PoWorkflowPanel";
import ProjectStageStepper from "@/components/projects/ProjectStageStepper";
import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import ProjectWorkflowStatus from "@/components/projects/ProjectWorkflowStatus";
import ScopeReviewPanel from "@/components/projects/ScopeReviewPanel";
import { Button } from "@/components/ui/button";
import { getProjectArchitectureState } from "@/services/architecture.service";
import { getPoWorkflowState } from "@/services/po.service";
import { getProjectById } from "@/services/project.service";
import { getProjectScopeState } from "@/services/scope.service";
import type { ArchitectureWorkflowState } from "@/types/architecture.types";
import type { PoWorkflowState } from "@/types/po.types";
import type { Project, ProjectStage } from "@/types/project.types";
import type { ScopeWorkflowState } from "@/types/scope.types";
import type {
  WorkspaceStep,
  WorkspaceStepId,
  WorkspaceStepStatus,
} from "@/types/workflow.types";

const stageOrder: ProjectStage[] = [
  "REQUIREMENT",
  "PRODUCT_DISCOVERY",
  "ARCHITECTURE",
  "DEVELOPMENT",
  "QA",
  "DEPLOYMENT",
  "COMPLETED",
];

const getStageIndex = (stage: ProjectStage): number =>
  stageOrder.indexOf(stage);

const getAgentStatus = (
  status:
    | PoWorkflowState["status"]
    | ScopeWorkflowState["status"]
    | ArchitectureWorkflowState["status"]
    | undefined,
): WorkspaceStepStatus => {
  switch (status) {
    case "COMPLETED":
      return "COMPLETED";

    case "RUNNING":
    case "CREATED":
      return "RUNNING";

    case "WAITING_FOR_HUMAN":
      return "WAITING_FOR_HUMAN";

    case "FAILED":
      return "FAILED";

    default:
      return "PENDING";
  }
};

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);

  const [poState, setPoState] = useState<PoWorkflowState | null>(null);

  const [scopeState, setScopeState] = useState<ScopeWorkflowState | null>(null);

  const [architectureState, setArchitectureState] =
    useState<ArchitectureWorkflowState | null>(null);

  const [selectedStepId, setSelectedStepId] = useState<WorkspaceStepId | null>(
    null,
  );

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const refreshWorkspace = async (): Promise<void> => {
    if (!projectId) {
      return;
    }

    const [
      projectData,
      workflowState,
      productScopeState,
      productArchitectureState,
    ] = await Promise.all([
      getProjectById(projectId),

      getPoWorkflowState(projectId),

      getProjectScopeState(projectId),

      getProjectArchitectureState(projectId),
    ]);

    setProject(projectData);

    setPoState(workflowState);

    setScopeState(productScopeState);

    setArchitectureState(productArchitectureState);
  };

  useEffect(() => {
    const loadWorkspace = async (): Promise<void> => {
      if (!projectId) {
        setError("Project ID is missing");

        setIsLoading(false);

        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        await refreshWorkspace();
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load project",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadWorkspace();
  }, [projectId]);

  const steps = useMemo<WorkspaceStep[]>(() => {
    if (!project) {
      return [];
    }

    const currentStageIndex = getStageIndex(project.currentStage);

    const requirementStatus = getAgentStatus(poState?.status);

    const scopeStatus = getAgentStatus(scopeState?.status);

    const architectureStatus = getAgentStatus(architectureState?.status);

    const getFutureStageStatus = (stage: ProjectStage): WorkspaceStepStatus => {
      const index = getStageIndex(stage);

      if (currentStageIndex > index) {
        return "COMPLETED";
      }

      if (project.currentStage !== stage) {
        return "PENDING";
      }

      switch (project.workflowStatus) {
        case "RUNNING":
          return "RUNNING";

        case "WAITING_FOR_HUMAN":
          return "WAITING_FOR_HUMAN";

        case "FAILED":
          return "FAILED";

        default:
          return "CURRENT";
      }
    };

    const resolvedArchitectureStatus = architectureState
      ? architectureStatus
      : getFutureStageStatus("ARCHITECTURE");

    return [
      {
        id: "REQUIREMENT_DISCOVERY",
        number: "01",
        title: "Requirement Discovery",
        subtitle: "Product Owner Agent",
        status: requirementStatus,
      },

      {
        id: "PRODUCT_SCOPE",
        number: "02",
        title: "Product Scope",
        subtitle: "Product Owner Agent",
        status:
          scopeState === null &&
          poState?.status === "COMPLETED" &&
          project.workflowStatus === "RUNNING"
            ? "RUNNING"
            : scopeStatus,
      },

      {
        id: "ARCHITECTURE",
        number: "03",
        title: "Architecture",
        subtitle: "Architect Agent",
        status: resolvedArchitectureStatus,
      },

      {
        id: "DEVELOPMENT",
        number: "04",
        title: "Development",
        subtitle: "Developer Agent",
        status: getFutureStageStatus("DEVELOPMENT"),
      },

      {
        id: "QA",
        number: "05",
        title: "Quality Assurance",
        subtitle: "QA Agent",
        status: getFutureStageStatus("QA"),
      },

      {
        id: "DEPLOYMENT",
        number: "06",
        title: "Deployment",
        subtitle: "DevOps Agent",
        status: getFutureStageStatus("DEPLOYMENT"),
      },
    ];
  }, [architectureState, poState, project, scopeState]);

  const activeStepId = useMemo<WorkspaceStepId>(() => {
    if (selectedStepId) {
      return selectedStepId;
    }

    const attentionStep = steps.find(
      (step) => step.status === "WAITING_FOR_HUMAN" || step.status === "FAILED",
    );

    if (attentionStep) {
      return attentionStep.id;
    }

    const runningStep = steps.find(
      (step) => step.status === "RUNNING" || step.status === "CURRENT",
    );

    if (runningStep) {
      return runningStep.id;
    }

    return (
      [...steps].reverse().find((step) => step.status === "COMPLETED")?.id ??
      "REQUIREMENT_DISCOVERY"
    );
  }, [selectedStepId, steps]);

  const handlePoStateChanged = async (
    state: PoWorkflowState,
  ): Promise<void> => {
    setPoState(state);

    if (state.status === "COMPLETED") {
      await refreshWorkspace();

      setSelectedStepId("PRODUCT_SCOPE");
    }
  };

  const handleScopeChanged = (state: ScopeWorkflowState): void => {
    setScopeState(state);
  };

  const handleScopeApproved = async (
    state: ScopeWorkflowState,
  ): Promise<void> => {
    setScopeState(state);

    /*
     * Backend orchestration has already
     * generated Architecture before this
     * request returns.
     */
    await refreshWorkspace();

    setSelectedStepId("ARCHITECTURE");
  };

  const handleArchitectureChanged = (
    state: ArchitectureWorkflowState,
  ): void => {
    setArchitectureState(state);
  };

  const handleArchitectureApproved = async (
    state: ArchitectureWorkflowState,
  ): Promise<void> => {
    setArchitectureState(state);

    await refreshWorkspace();

    setSelectedStepId("DEVELOPMENT");
  };

  const renderSelectedStage = () => {
    switch (activeStepId) {
      case "REQUIREMENT_DISCOVERY":
        return (
          <PoWorkflowPanel
            project={project!}
            state={poState}
            onStateChanged={(state) => void handlePoStateChanged(state)}
          />
        );

      case "PRODUCT_SCOPE":
        return (
          <ScopeReviewPanel
            project={project!}
            poState={poState}
            scopeState={scopeState}
            onScopeChanged={handleScopeChanged}
            onScopeApproved={handleScopeApproved}
          />
        );

      case "ARCHITECTURE":
        return (
          <ArchitectureReviewPanel
            project={project!}
            architectureState={architectureState}
            onArchitectureChanged={handleArchitectureChanged}
            onArchitectureApproved={handleArchitectureApproved}
          />
        );

      case "DEVELOPMENT":
        return <PendingStage title="Development" agent="Developer Agent" />;

      case "QA":
        return <PendingStage title="Quality Assurance" agent="QA Agent" />;

      case "DEPLOYMENT":
        return <PendingStage title="Deployment" agent="DevOps Agent" />;

      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center text-sm text-muted-foreground">
        Loading project workspace...
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="space-y-6">
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-5 text-sm text-destructive">
          {error || "Project not found"}
        </div>

        <Button variant="outline" onClick={() => navigate("/projects")}>
          Back to projects
        </Button>
      </div>
    );
  }

  const selectedStep = steps.find((step) => step.id === activeStepId);

  return (
    <div className="space-y-6">
      <Button
        variant="ghost"
        className="-ml-3"
        onClick={() => navigate("/projects")}
      >
        ← Back to projects
      </Button>

      <section className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-6">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {project.name}
              </h1>

              <ProjectStatusBadge status={project.status} />
            </div>

            <p className="mt-3 max-w-3xl text-sm leading-6 text-muted-foreground">
              {project.description || "No project description provided."}
            </p>

            <div className="mt-5">
              <ProjectWorkflowStatus status={project.workflowStatus} />
            </div>
          </div>

          <div className="flex items-center gap-5">
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Current stage</p>

              <p className="mt-1 text-sm font-medium">
                {selectedStep?.title ?? project.currentStage}
              </p>
            </div>

            <div className="flex size-16 flex-col items-center justify-center rounded-2xl border border-white/[0.07] bg-black/10">
              <p className="text-xl font-semibold">{project.progress}%</p>

              <p className="text-[10px] text-muted-foreground">complete</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-[280px_minmax(0,1fr)]">
        <div className="lg:sticky lg:top-6">
          <ProjectStageStepper
            steps={steps}
            selectedStepId={activeStepId}
            onStepSelected={setSelectedStepId}
          />
        </div>

        <section className="min-w-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]">
          <header className="border-b border-white/[0.06] px-6 py-5">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{selectedStep?.title}</p>

                <p className="mt-1 text-xs text-muted-foreground">
                  {selectedStep?.subtitle}
                </p>
              </div>

              {selectedStep ? (
                <span className="text-xs capitalize text-muted-foreground">
                  {selectedStep.status.toLowerCase().replaceAll("_", " ")}
                </span>
              ) : null}
            </div>
          </header>

          <div className="p-6">{renderSelectedStage()}</div>
        </section>
      </div>
    </div>
  );
};

export default ProjectDetailsPage;

