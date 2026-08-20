import { useEffect, useState } from "react";

import CreateProjectForm from "@/components/projects/CreateProjectForm";
import ProjectCard from "@/components/projects/ProjectCard";
import { Card, CardContent } from "@/components/ui/card";
import { getProjects } from "@/services/project.service";
import type { Project } from "@/types/project.types";

const ProjectsPage = () => {
  const [projects, setProjects] = useState<Project[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const fetchProjects = async (): Promise<void> => {
      try {
        const data = await getProjects();

        if (isCancelled) {
          return;
        }

        setProjects(data);
        setError(null);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        setError(
          loadError instanceof Error
            ? loadError.message
            : "Failed to load projects",
        );
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    void fetchProjects();

    return () => {
      isCancelled = true;
    };
  }, []);

  const handleProjectCreated = (project: Project): void => {
    setProjects((currentProjects) => [project, ...currentProjects]);
  };

  const handleProjectDeleted = (projectId: string): void => {
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project._id !== projectId),
    );
  };

  return (
    <div className="space-y-10">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-300">
          AI delivery workspace
        </p>

        <h1 className="mt-3 text-3xl font-semibold tracking-tight">Projects</h1>

        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
          Create software projects and follow their progress across the
          autonomous AI SDLC workflow.
        </p>
      </section>

      <CreateProjectForm onProjectCreated={handleProjectCreated} />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-5 py-4 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      {isLoading ? (
        <div className="rounded-xl border border-dashed border-white/[0.08] px-6 py-16 text-center text-sm text-muted-foreground">
          Loading projects...
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed border-white/[0.08] bg-white/[0.015] shadow-none">
          <CardContent className="py-16 text-center">
            <p className="font-medium">No active projects</p>

            <p className="mt-2 text-sm text-muted-foreground">
              Create a project above to start the AI SDLC workflow.
            </p>
          </CardContent>
        </Card>
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project._id}
              project={project}
              onDeleted={handleProjectDeleted}
            />
          ))}
        </section>
      )}
    </div>
  );
};

export default ProjectsPage;

