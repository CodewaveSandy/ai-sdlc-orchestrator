import { useEffect, useState } from "react";

import CreateProjectForm from "@/components/projects/CreateProjectForm";
import ProjectCard from "@/components/projects/ProjectCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjects } from "@/services/project.service";
import type { Project } from "@/types/project.types";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadProjects = async (): Promise<void> => {
      try {
        setIsLoading(true);
        setError(null);

        const projectList = await getProjects();

        setProjects(projectList);
      } catch (loadError) {
        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load projects",
        );
      } finally {
        setIsLoading(false);
      }
    };

    void loadProjects();
  }, []);

  const handleProjectCreated = (project: Project): void => {
    setProjects((currentProjects) => [project, ...currentProjects]);
  };

  return (
    <div className="space-y-10">
      <section className="relative overflow-hidden rounded-2xl border border-white/5 bg-white/[0.02] px-7 py-8">
        <div className="pointer-events-none absolute -right-24 -top-24 size-64 rounded-full bg-indigo-500/10 blur-3xl" />

        <div className="relative">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-indigo-400/10 bg-indigo-500/5 px-3 py-1 text-xs font-medium text-indigo-300">
            AI Engineering Workspace
          </div>

          <h1 className="text-3xl font-semibold tracking-tight">
            Software projects
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
            Create products, orchestrate AI engineering teams, and track
            software delivery from requirement to deployment.
          </p>
        </div>
      </section>

      <div className="grid gap-8 lg:grid-cols-[340px_1fr]">
        <Card className="h-fit border-white/5 bg-white/[0.025] shadow-none">
          <CardHeader>
            <CardTitle className="text-base font-semibold">
              Create project
            </CardTitle>

            <p className="text-sm leading-6 text-muted-foreground">
              Start a new software delivery workflow.
            </p>
          </CardHeader>

          <CardContent>
            <CreateProjectForm onCreated={handleProjectCreated} />
          </CardContent>
        </Card>

        <section>
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold">Project workspace</h2>

              <p className="mt-1 text-sm text-muted-foreground">
                {projects.length} project
                {projects.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>

          {isLoading ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center text-sm text-muted-foreground">
              Loading projects...
            </div>
          ) : null}

          {!isLoading && error ? (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-6 py-5 text-sm text-destructive">
              {error}
            </div>
          ) : null}

          {!isLoading && !error && projects.length === 0 ? (
            <div className="rounded-xl border border-dashed border-white/10 bg-white/[0.015] px-6 py-16 text-center">
              <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-xl border border-indigo-400/10 bg-indigo-500/5">
                <span className="text-sm font-semibold text-indigo-300">
                  AI
                </span>
              </div>

              <p className="font-medium">No projects yet</p>

              <p className="mt-2 text-sm text-muted-foreground">
                Create your first project to begin an AI orchestrated software
                lifecycle.
              </p>
            </div>
          ) : null}

          {!isLoading && !error && projects.length > 0 ? (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {projects.map((project) => (
                <ProjectCard key={project._id} project={project} />
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
};

export default ProjectsPage;

