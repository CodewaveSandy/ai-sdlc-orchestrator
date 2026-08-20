import ClarificationForm from "@/components/projects/ClarificationForm";
import InitialRequirementForm from "@/components/projects/InitialRequirementForm";
import { Badge } from "@/components/ui/badge";
import type { PoRequirementAnalysis, PoWorkflowState } from "@/types/po.types";
import type { Project } from "@/types/project.types";

interface PoWorkflowPanelProps {
  project: Project;
  state: PoWorkflowState | null;

  onStateChanged: (state: PoWorkflowState) => void;
}

interface AnalysisSummaryProps {
  analysis: PoRequirementAnalysis;
}

const AnalysisSummary = ({ analysis }: AnalysisSummaryProps) => {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          PO understanding
        </p>

        <p className="mt-2 text-sm leading-7 text-foreground/90">
          {analysis.requirementSummary}
        </p>
      </div>

      {analysis.assumptions.length > 0 ? (
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Assumptions
          </p>

          <div className="mt-3 space-y-2">
            {analysis.assumptions.map((assumption) => (
              <div
                key={assumption}
                className="flex gap-3 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />

                <span>{assumption}</span>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
};

const PoWorkflowPanel = ({
  project,
  state,
  onStateChanged,
}: PoWorkflowPanelProps) => {
  if (!state) {
    return (
      <InitialRequirementForm
        projectId={project._id}
        onCompleted={onStateChanged}
      />
    );
  }

  if (state.status === "CREATED" || state.status === "RUNNING") {
    return (
      <div className="py-14 text-center">
        <div className="mx-auto size-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />

        <p className="mt-5 font-medium">Product Owner Agent is working</p>

        <p className="mt-2 text-sm text-muted-foreground">
          Understanding the product requirement.
        </p>
      </div>
    );
  }

  if (state.status === "FAILED") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5">
        <p className="font-medium text-destructive">
          Requirement analysis failed
        </p>

        <p className="mt-2 text-sm text-destructive/80">
          {state.error || "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (state.status === "WAITING_FOR_HUMAN" && state.analysis) {
    const clarificationKey = [
      state.agentRunId,
      ...state.analysis.clarificationQuestions,
    ].join("::");

    return (
      <div className="space-y-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Badge
            variant="secondary"
            className="border border-amber-400/15 bg-amber-400/5 text-amber-300"
          >
            Your input required
          </Badge>

          <span className="text-xs text-muted-foreground">
            {state.clarificationRounds.length} clarification round
            {state.clarificationRounds.length === 1 ? "" : "s"} completed
          </span>
        </div>

        <AnalysisSummary analysis={state.analysis} />

        <div className="border-t border-white/[0.06] pt-8">
          <ClarificationForm
            key={clarificationKey}
            projectId={project._id}
            agentRunId={state.agentRunId}
            questions={state.analysis.clarificationQuestions}
            onCompleted={onStateChanged}
          />
        </div>
      </div>
    );
  }

  if (state.status === "COMPLETED" && state.analysis) {
    return (
      <div className="space-y-7">
        <div className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5">
          <div className="flex gap-3">
            <span className="mt-1 size-2.5 shrink-0 rounded-full bg-emerald-400" />

            <div>
              <p className="font-medium text-emerald-300">
                Requirement discovery complete
              </p>

              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                The Product Owner Agent has enough information to proceed. The
                orchestrator automatically continues to scope generation.
              </p>
            </div>
          </div>
        </div>

        <AnalysisSummary analysis={state.analysis} />
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/[0.06] bg-white/[0.02] p-5 text-sm text-muted-foreground">
      Product discovery state is unavailable.
    </div>
  );
};

export default PoWorkflowPanel;

