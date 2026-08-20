import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById } from "@/services/project.service";
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

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProject = async (): Promise<void> => {
      if (!projectId) {
        setError("Project ID is missing");
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        const projectData = await getProjectById(projectId);

        setProject(projectData);
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

    void loadProject();
  }, [projectId]);

  if (isLoading) {
    return (
      <div className="rounded-xl border border-dashed border-border px-6 py-16 text-center text-sm text-muted-foreground">
        Loading project...
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

          <div className="min-w-28 rounded-xl border border-border p-4 text-center">
            <p className="text-2xl font-semibold">{project.progress}%</p>

            <p className="mt-1 text-xs text-muted-foreground">Complete</p>
          </div>
        </div>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        <Card>
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

        <Card>
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

        <Card>
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

      <Card>
        <CardHeader>
          <CardTitle>Product discovery</CardTitle>
        </CardHeader>

        <CardContent>
          <div className="rounded-xl border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
            <p className="font-medium">PO Agent workflow coming next</p>

            <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
              This workspace will soon accept the raw customer requirement,
              invoke the Product Owner Agent, collect clarification answers, and
              generate the approved product scope.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectDetailsPage;

