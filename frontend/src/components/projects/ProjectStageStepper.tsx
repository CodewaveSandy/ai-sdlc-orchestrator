import type {
  WorkspaceStep,
  WorkspaceStepId,
  WorkspaceStepStatus,
} from "@/types/workflow.types";

interface ProjectStageStepperProps {
  steps: WorkspaceStep[];
  selectedStepId: WorkspaceStepId;

  onStepSelected: (stepId: WorkspaceStepId) => void;
}

interface StepIndicatorProps {
  number: string;
  status: WorkspaceStepStatus;
}

const StepIndicator = ({ number, status }: StepIndicatorProps) => {
  if (status === "COMPLETED") {
    return (
      <div className="flex size-9 items-center justify-center rounded-xl border border-emerald-400/20 bg-emerald-400/[0.07] text-sm font-semibold text-emerald-300">
        ✓
      </div>
    );
  }

  if (status === "RUNNING") {
    return (
      <div className="flex size-9 items-center justify-center rounded-xl border border-sky-400/20 bg-sky-400/[0.07]">
        <span className="size-4 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />
      </div>
    );
  }

  if (status === "WAITING_FOR_HUMAN") {
    return (
      <div className="flex size-9 items-center justify-center rounded-xl border border-amber-400/25 bg-amber-400/[0.07] text-sm font-semibold text-amber-300 shadow-[0_0_22px_rgba(251,191,36,0.08)]">
        !
      </div>
    );
  }

  if (status === "FAILED") {
    return (
      <div className="flex size-9 items-center justify-center rounded-xl border border-rose-400/20 bg-rose-400/[0.07] text-sm font-semibold text-rose-300">
        ×
      </div>
    );
  }

  return (
    <div
      className={
        status === "CURRENT"
          ? "flex size-9 items-center justify-center rounded-xl border border-indigo-400/25 bg-indigo-500/[0.08] text-xs font-semibold text-indigo-300"
          : "flex size-9 items-center justify-center rounded-xl border border-white/[0.07] bg-white/[0.02] text-xs font-semibold text-muted-foreground"
      }
    >
      {number}
    </div>
  );
};

const getStatusLabel = (status: WorkspaceStepStatus): string => {
  switch (status) {
    case "COMPLETED":
      return "Completed";

    case "RUNNING":
      return "Agent working";

    case "WAITING_FOR_HUMAN":
      return "Your input required";

    case "FAILED":
      return "Attention required";

    case "CURRENT":
      return "Current stage";

    default:
      return "Pending";
  }
};

const ProjectStageStepper = ({
  steps,
  selectedStepId,
  onStepSelected,
}: ProjectStageStepperProps) => {
  return (
    <aside className="overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.018]">
      <div className="border-b border-white/[0.06] px-5 py-5">
        <p className="text-xs font-semibold">Delivery workflow</p>

        <p className="mt-1 text-xs text-muted-foreground">
          Select a stage to inspect its output.
        </p>
      </div>

      <div className="p-2">
        {steps.map((step) => {
          const isSelected = selectedStepId === step.id;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onStepSelected(step.id)}
              className={`relative flex w-full gap-3 rounded-xl p-3 text-left transition ${
                isSelected ? "bg-white/[0.055]" : "hover:bg-white/[0.025]"
              }`}
            >
              {isSelected ? (
                <span className="absolute inset-y-3 left-0 w-0.5 rounded-full bg-indigo-400" />
              ) : null}

              <StepIndicator number={step.number} status={step.status} />

              <div className="min-w-0 flex-1 pt-0.5">
                <p
                  className={`truncate text-sm font-medium ${
                    isSelected ? "text-foreground" : "text-foreground/80"
                  }`}
                >
                  {step.title}
                </p>

                <p className="mt-1 truncate text-xs text-muted-foreground">
                  {step.subtitle}
                </p>

                <p
                  className={`mt-2 text-[11px] ${
                    step.status === "WAITING_FOR_HUMAN"
                      ? "text-amber-300"
                      : step.status === "RUNNING"
                        ? "text-sky-300"
                        : step.status === "FAILED"
                          ? "text-rose-300"
                          : step.status === "COMPLETED"
                            ? "text-emerald-300"
                            : "text-muted-foreground"
                  }`}
                >
                  {getStatusLabel(step.status)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
};

export default ProjectStageStepper;

