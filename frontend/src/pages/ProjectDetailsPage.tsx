import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import PoWorkflowPanel from "@/components/projects/PoWorkflowPanel";
import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getPoWorkflowState } from "@/services/po.service";
import { getProjectById } from "@/services/project.service";
import type { PoWorkflowState } from "@/types/po.types";
import type { Project } from "@/types/project.types";

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

        const [projectData, workflowState] = await Promise.all([
          getProjectById(projectId),
          getPoWorkflowState(projectId),
        ]);

        setProject(projectData);
        setPoState(workflowState);
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
              PO
            </div>

            <div>
              <CardTitle className="text-base">Product Discovery</CardTitle>

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
    </div>
  );
};

export default ProjectDetailsPage;

