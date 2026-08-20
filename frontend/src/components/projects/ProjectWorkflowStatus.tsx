import type { ProjectWorkflowStatus } from "@/types/project.types";

interface ProjectWorkflowStatusProps {
  status?: ProjectWorkflowStatus;
}

const ProjectWorkflowStatus = ({
  status = "IDLE",
}: ProjectWorkflowStatusProps) => {
  if (status === "RUNNING") {
    return (
      <div className="flex items-center gap-2 text-xs text-sky-300">
        <span className="size-3 animate-spin rounded-full border border-sky-400/25 border-t-sky-300" />
        Agent working
      </div>
    );
  }

  if (status === "WAITING_FOR_HUMAN") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-amber-300">
        <span className="size-2 rounded-full bg-amber-300 shadow-[0_0_12px_rgba(252,211,77,0.45)]" />
        Needs your input
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex items-center gap-2 text-xs font-medium text-rose-300">
        <span className="size-2 rounded-full bg-rose-400" />
        Attention required
      </div>
    );
  }

  if (status === "COMPLETED") {
    return (
      <div className="flex items-center gap-2 text-xs text-emerald-300">
        <span className="size-2 rounded-full bg-emerald-400" />
        Completed
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="size-2 rounded-full bg-white/20" />
      Ready
    </div>
  );
};

export default ProjectWorkflowStatus;

