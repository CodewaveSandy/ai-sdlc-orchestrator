import { useMemo, useState } from "react";

import DevelopmentTaskCard from "@/components/projects/DevelopmentTaskCard";
import type { DevelopmentPlanWorkflowState } from "@/types/development.types";
import type { Project } from "@/types/project.types";

interface DevelopmentPlanPanelProps {
  project: Project;

  developmentState: DevelopmentPlanWorkflowState | null;
}

const DevelopmentPlanPanel = ({
  project,
  developmentState,
}: DevelopmentPlanPanelProps) => {
  const [showRunDetails, setShowRunDetails] = useState(false);

  const taskStats = useMemo(() => {
    const tasks = developmentState?.tasks ?? [];

    return {
      total: tasks.length,

      planned: tasks.filter((task) => task.status === "PLANNED").length,

      inProgress: tasks.filter((task) => task.status === "IN_PROGRESS").length,

      completed: tasks.filter((task) => task.status === "COMPLETED").length,

      failed: tasks.filter((task) => task.status === "FAILED").length,

      blocked: tasks.filter((task) => task.status === "BLOCKED").length,
    };
  }, [developmentState]);

  if (!developmentState) {
    if (
      project.currentStage === "DEVELOPMENT" &&
      project.workflowStatus === "RUNNING"
    ) {
      return (
        <div className="py-14 text-center">
          <div className="mx-auto size-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />

          <p className="mt-5 font-medium">
            Developer Planning Agent is working
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            Translating the approved scope and architecture into executable
            development tasks.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
        <p className="font-medium">Development has not started yet</p>

        <p className="mt-2 text-sm text-muted-foreground">
          Development planning starts automatically after Architecture is
          approved.
        </p>
      </div>
    );
  }

  if (
    developmentState.status === "CREATED" ||
    developmentState.status === "RUNNING"
  ) {
    return (
      <div className="py-14 text-center">
        <div className="mx-auto size-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />

        <p className="mt-5 font-medium">Developer Planning Agent is working</p>

        <p className="mt-2 text-sm text-muted-foreground">
          Creating the implementation task graph for the Developer Agent.
        </p>
      </div>
    );
  }

  if (developmentState.status === "FAILED") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5">
        <p className="font-medium text-destructive">
          Development planning failed
        </p>

        <p className="mt-2 text-sm text-destructive/80">
          {developmentState.error ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!developmentState.plan) {
    return (
      <div className="rounded-xl border border-white/[0.06] p-5 text-sm text-muted-foreground">
        Development plan is unavailable.
      </div>
    );
  }

  const plan = developmentState.plan;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div>
          <p className="text-sm font-medium text-emerald-300">
            Development plan ready
          </p>

          <p className="mt-1 text-xs text-muted-foreground">
            {taskStats.total} implementation tasks prepared
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRunDetails((current) => !current)}
          className="text-xs text-muted-foreground transition hover:text-foreground"
        >
          {showRunDetails ? "Hide run details" : "View run details"}
        </button>
      </div>

      {showRunDetails ? (
        <div className="grid gap-3 rounded-xl border border-white/[0.06] bg-black/10 p-4 sm:grid-cols-3">
          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Agent
            </p>

            <p className="mt-2 text-sm">Developer Planner</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Tasks
            </p>

            <p className="mt-2 text-sm">{taskStats.total}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Tokens
            </p>

            <p className="mt-2 text-sm">
              {developmentState.usage
                ? developmentState.usage.totalTokens.toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      ) : null}

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Implementation summary
        </p>

        <p className="mt-3 max-w-4xl text-sm leading-7 text-foreground/90">
          {plan.implementationSummary}
        </p>
      </section>

      <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Execution strategy
        </p>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {plan.executionStrategy}
        </p>
      </section>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Development backlog
            </p>

            <h3 className="mt-2 text-lg font-semibold">Implementation tasks</h3>
          </div>

          <div className="flex flex-wrap gap-2 text-[10px]">
            <span className="rounded-md border border-white/[0.06] bg-white/[0.02] px-2 py-1 text-muted-foreground">
              {taskStats.planned} planned
            </span>

            {taskStats.inProgress > 0 ? (
              <span className="rounded-md border border-sky-400/15 bg-sky-400/[0.04] px-2 py-1 text-sky-300">
                {taskStats.inProgress} running
              </span>
            ) : null}

            {taskStats.completed > 0 ? (
              <span className="rounded-md border border-emerald-400/15 bg-emerald-400/[0.04] px-2 py-1 text-emerald-300">
                {taskStats.completed} complete
              </span>
            ) : null}

            {taskStats.blocked > 0 ? (
              <span className="rounded-md border border-amber-400/15 bg-amber-400/[0.04] px-2 py-1 text-amber-300">
                {taskStats.blocked} blocked
              </span>
            ) : null}

            {taskStats.failed > 0 ? (
              <span className="rounded-md border border-rose-400/15 bg-rose-400/[0.04] px-2 py-1 text-rose-300">
                {taskStats.failed} failed
              </span>
            ) : null}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {developmentState.tasks.map((task) => (
            <DevelopmentTaskCard key={task._id} task={task} />
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-indigo-400/10 bg-indigo-500/[0.025] p-5">
        <p className="font-medium text-indigo-200">Ready for implementation</p>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The task graph is prepared. The next Developer Agent milestone will
          execute these tasks inside the isolated Docker workspace.
        </p>
      </section>
    </div>
  );
};

export default DevelopmentPlanPanel;

