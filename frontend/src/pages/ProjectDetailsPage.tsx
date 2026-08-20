import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PoWorkflowPanel from "@/components/projects/PoWorkflowPanel";
import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import ScopeReviewPanel from "@/components/projects/ScopeReviewPanel";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPoWorkflowState } from "@/services/po.service";
import { getProjectById } from "@/services/project.service";
import { getProjectScopeState } from "@/services/scope.service";
import type { PoWorkflowState } from "@/types/po.types";
import type { Project } from "@/types/project.types";
import type { ScopeWorkflowState } from "@/types/scope.types";

const formatStage = (stage: string): string =>
  stage
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

const formatDate = (value: string): string =>
  new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));

const ProjectDetailsPage = () => {
  const { projectId } = useParams<{
    projectId: string;
  }>();

  const navigate = useNavigate();

  const [project, setProject] = useState<Project | null>(null);

  const [poState, setPoState] = useState<PoWorkflowState | null>(null);

  const [scopeState, setScopeState] = useState<ScopeWorkflowState | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

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

        const [projectData, workflowState, productScopeState] =
          await Promise.all([
            getProjectById(projectId),
            getPoWorkflowState(projectId),
            getProjectScopeState(projectId),
          ]);

        setProject(projectData);
        setPoState(workflowState);
        setScopeState(productScopeState);
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

  const handleScopeApproved = async (
    state: ScopeWorkflowState,
  ): Promise<void> => {
    setScopeState(state);

    if (!projectId) {
      return;
    }

    const refreshedProject = await getProjectById(projectId);

    setProject(refreshedProject);
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

  return (
    <div className="space-y-8">
      <section>
        <Button
          variant="ghost"
          className="-ml-3 mb-5"
          onClick={() => navigate("/projects")}
        >
          ← Back to projects
        </Button>

        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold tracking-tight">
                {project.name}
              </h1>

              <ProjectStatusBadge status={project.status} />
            </div>

            <p className="mt-4 max-w-3xl text-sm leading-6 text-muted-foreground">
              {project.description || "No project description provided."}
            </p>
          </div>

          <div className="min-w-28 rounded-xl border border-white/5 bg-white/[0.025] p-4 text-center">
            <p className="text-2xl font-semibold">{project.progress}%</p>

            <p className="mt-1 text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <Card className="border-white/5 bg-white/[0.025] shadow-none">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Current stage
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-lg font-semibold">
              {formatStage(project.currentStage)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.025] shadow-none">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Created
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm font-medium">
              {formatDate(project.createdAt)}
            </p>
          </CardContent>
        </Card>

        <Card className="border-white/5 bg-white/[0.025] shadow-none">
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Last updated
            </CardTitle>
          </CardHeader>

          <CardContent>
            <p className="text-sm font-medium">
              {formatDate(project.updatedAt)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card className="overflow-hidden border-white/5 bg-white/[0.025] shadow-none">
        <CardHeader className="border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/5 text-xs font-semibold text-indigo-300">
              01
            </div>

            <div>
              <CardTitle className="text-base">Requirement Discovery</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Product Owner Agent
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-7">
          <PoWorkflowPanel
            project={project}
            state={poState}
            onStateChanged={setPoState}
          />
        </CardContent>
      </Card>

      <Card className="overflow-hidden border-white/5 bg-white/[0.025] shadow-none">
        <CardHeader className="border-b border-white/5">
          <div className="flex items-center gap-4">
            <div className="flex size-10 items-center justify-center rounded-xl border border-violet-400/15 bg-violet-500/5 text-xs font-semibold text-violet-300">
              02
            </div>

            <div>
              <CardTitle className="text-base">Product Scope</CardTitle>

              <p className="mt-1 text-sm text-muted-foreground">
                Product Owner Agent · Scope Generation
              </p>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-7">
          <ScopeReviewPanel
            project={project}
            poState={poState}
            scopeState={scopeState}
            onScopeChanged={setScopeState}
            onScopeApproved={handleScopeApproved}
          />
        </CardContent>
      </Card>

      {project.currentStage === "ARCHITECTURE" ? (
        <Card className="overflow-hidden border-indigo-400/10 bg-indigo-500/[0.025] shadow-none">
          <CardContent className="p-7">
            <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-indigo-300">
                  Next stage
                </p>

                <h2 className="mt-2 text-xl font-semibold">Architecture</h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                  Product Discovery is complete. The approved scope is ready to
                  be handed to the Architect Agent.
                </p>
              </div>

              <div className="rounded-xl border border-dashed border-indigo-400/15 px-5 py-3 text-sm text-muted-foreground">
                Architect Agent coming next
              </div>
            </div>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
};

export default ProjectDetailsPage;

