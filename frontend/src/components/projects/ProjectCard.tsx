import { useNavigate } from "react-router-dom";

import ProjectStatusBadge from "@/components/projects/ProjectStatusBadge";
import ProjectWorkflowStatus from "@/components/projects/ProjectWorkflowStatus";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import type { Project } from "@/types/project.types";

interface ProjectCardProps {
  project: Project;
}

const formatStage = (value: string): string =>
  value
    .toLowerCase()
    .split("_")
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(" ");

const getActivityMessage = (project: Project): string => {
  switch (project.workflowStatus) {
    case "RUNNING":
      return `AI team is working in ${formatStage(project.currentStage)}.`;

    case "WAITING_FOR_HUMAN":
      return "The workflow is paused until you respond.";

    case "FAILED":
      return "The workflow encountered an issue that needs attention.";

    case "COMPLETED":
      return "Software delivery workflow completed.";

    default:
      if (project.currentStage === "ARCHITECTURE") {
        return "Product scope is approved and ready for architecture.";
      }

      return `Current stage: ${formatStage(project.currentStage)}.`;
  }
};

const ProjectCard = ({ project }: ProjectCardProps) => {
  const navigate = useNavigate();

  return (
    <Card className="flex h-full flex-col overflow-hidden border-white/[0.07] bg-white/[0.02] shadow-none transition hover:border-indigo-400/15 hover:bg-white/[0.028]">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold tracking-tight">
              {project.name}
            </h3>

            <div className="mt-2">
              <ProjectStatusBadge status={project.status} />
            </div>
          </div>

          <div className="rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-sm font-medium">
            {project.progress}%
          </div>
        </div>
      </CardHeader>

      <CardContent className="flex-1 space-y-6">
        <p className="line-clamp-2 min-h-10 text-sm leading-5 text-muted-foreground">
          {project.description || "No description provided."}
        </p>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Current stage
          </p>

          <p className="mt-2 text-sm font-medium">
            {formatStage(project.currentStage)}
          </p>
        </div>

        <div className="rounded-xl border border-white/[0.06] bg-black/10 p-4">
          <ProjectWorkflowStatus status={project.workflowStatus} />

          <p className="mt-2 text-xs leading-5 text-muted-foreground">
            {getActivityMessage(project)}
          </p>
        </div>

        <div className="h-1 overflow-hidden rounded-full bg-white/[0.05]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-400 to-sky-400 transition-all"
            style={{
              width: `${project.progress}%`,
            }}
          />
        </div>
      </CardContent>

      <CardFooter className="border-t border-white/[0.05] p-4">
        <Button
          variant="outline"
          className="w-full"
          onClick={() => navigate(`/projects/${project._id}`)}
        >
          {project.workflowStatus === "WAITING_FOR_HUMAN"
            ? "Review required"
            : "Open workspace"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;

