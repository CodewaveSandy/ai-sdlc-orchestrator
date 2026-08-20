import { useNavigate } from "react-router-dom";

import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import type { Project } from "@/types/project.types";

interface ProjectCardProps {
  project: Project;
}

const formatStage = (stage: string): string =>
  stage
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  const handleOpenProject = (): void => {
    navigate(`/projects/${project._id}`);
  };

  return (
    <Card className="group relative flex h-full flex-col overflow-hidden border-white/5 bg-white/[0.025] shadow-none transition-all duration-300 hover:-translate-y-0.5 hover:border-indigo-400/15 hover:bg-white/[0.04]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-indigo-400/30 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />

      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <CardTitle className="text-lg font-semibold tracking-tight">
              {project.name}
            </CardTitle>

            <ProjectStatusBadge status={project.status} />
          </div>

          <div className="rounded-lg border border-white/5 bg-white/[0.025] px-2.5 py-1.5">
            <span className="text-xs font-semibold text-muted-foreground">
              {project.progress}%
            </span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1">
        <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
          {project.description || "No description provided."}
        </p>

        <div className="mt-7">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current stage
          </p>

          <p className="mt-2 text-sm font-medium text-foreground">
            {formatStage(project.currentStage)}
          </p>
        </div>

        <div className="mt-6 h-1 overflow-hidden rounded-full bg-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-blue-400 transition-all duration-500"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </CardContent>

      <CardFooter>
        <Button
          variant="outline"
          className="w-full border-white/[0.08] bg-white/[0.02] text-foreground hover:border-indigo-400/20 hover:bg-indigo-500/10 hover:text-indigo-200"
          onClick={handleOpenProject}
        >
          Open project
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;

