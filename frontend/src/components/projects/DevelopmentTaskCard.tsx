import type { DevelopmentTask } from "@/types/development.types";

interface DevelopmentTaskCardProps {
  task: DevelopmentTask;
}

const getStatusClassName = (status: DevelopmentTask["status"]): string => {
  switch (status) {
    case "COMPLETED":
      return "border-emerald-400/15 bg-emerald-400/[0.04] text-emerald-300";

    case "IN_PROGRESS":
      return "border-sky-400/15 bg-sky-400/[0.04] text-sky-300";

    case "FAILED":
      return "border-rose-400/15 bg-rose-400/[0.04] text-rose-300";

    case "BLOCKED":
      return "border-amber-400/15 bg-amber-400/[0.04] text-amber-300";

    default:
      return "border-white/[0.07] bg-white/[0.02] text-muted-foreground";
  }
};

const DevelopmentTaskCard = ({ task }: DevelopmentTaskCardProps) => {
  return (
    <details className="group rounded-xl border border-white/[0.06] bg-white/[0.015]">
      <summary className="cursor-pointer list-none p-4">
        <div className="flex items-start gap-4">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400/15 bg-indigo-500/[0.06] font-mono text-xs font-semibold text-indigo-300">
            {task.order}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="font-mono text-xs text-indigo-300">
                {task.taskKey}
              </p>

              <span className="text-xs text-muted-foreground">
                {task.taskType}
              </span>
            </div>

            <p className="mt-1 font-medium">{task.title}</p>

            <p className="mt-2 text-xs leading-5 text-muted-foreground">
              {task.objective}
            </p>
          </div>

          <div
            className={`shrink-0 rounded-md border px-2.5 py-1 text-[10px] font-semibold ${getStatusClassName(
              task.status,
            )}`}
          >
            {task.status.replaceAll("_", " ")}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2 pl-13">
          {task.dependencies.length > 0 ? (
            <span className="rounded-md border border-white/[0.06] bg-black/10 px-2 py-1 text-[10px] text-muted-foreground">
              Depends on {task.dependencies.join(", ")}
            </span>
          ) : (
            <span className="rounded-md border border-emerald-400/10 bg-emerald-400/[0.025] px-2 py-1 text-[10px] text-emerald-300">
              Ready first
            </span>
          )}

          {task.relatedUserStories.map((storyKey) => (
            <span
              key={storyKey}
              className="rounded-md border border-white/[0.06] bg-black/10 px-2 py-1 font-mono text-[10px] text-muted-foreground"
            >
              {storyKey}
            </span>
          ))}
        </div>
      </summary>

      <div className="border-t border-white/[0.05] p-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Description
          </p>

          <p className="mt-3 text-sm leading-6 text-muted-foreground">
            {task.description}
          </p>
        </div>

        <div className="mt-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Acceptance criteria
          </p>

          <div className="mt-3 space-y-2">
            {task.acceptanceCriteria.map((criterion, index) => (
              <div
                key={`${criterion}-${index}`}
                className="flex gap-3 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />

                <span>{criterion}</span>
              </div>
            ))}
          </div>
        </div>

        {task.targetAreas.length > 0 ? (
          <div className="mt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Target areas
            </p>

            <div className="mt-3 flex flex-wrap gap-2">
              {task.targetAreas.map((area) => (
                <span
                  key={area}
                  className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 text-xs text-muted-foreground"
                >
                  {area}
                </span>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </details>
  );
};

export default DevelopmentTaskCard;

