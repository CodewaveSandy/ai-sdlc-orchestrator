import { useState, type FormEvent } from "react";

import ScopeFeatureCard from "@/components/projects/ScopeFeatureCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveProjectScope,
  reviseProjectScope,
} from "@/services/scope.service";
import type { PoWorkflowState } from "@/types/po.types";
import type { Project } from "@/types/project.types";
import type { ScopeWorkflowState } from "@/types/scope.types";

interface ScopeReviewPanelProps {
  project: Project;
  poState: PoWorkflowState | null;
  scopeState: ScopeWorkflowState | null;

  onScopeChanged: (state: ScopeWorkflowState) => void;

  onScopeApproved: (state: ScopeWorkflowState) => Promise<void>;
}

const ScopeReviewPanel = ({
  project,
  poState,
  scopeState,
  onScopeChanged,
  onScopeApproved,
}: ScopeReviewPanelProps) => {
  const [feedback, setFeedback] = useState("");

  const [isRevising, setIsRevising] = useState(false);

  const [isApproving, setIsApproving] = useState(false);

  const [showRunDetails, setShowRunDetails] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleRevision = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!scopeState) {
      return;
    }

    const normalizedFeedback = feedback.trim();

    if (!normalizedFeedback) {
      setError("Describe what you want the Product Owner Agent to change.");

      return;
    }

    try {
      setIsRevising(true);
      setError(null);

      const state = await reviseProjectScope(
        project._id,
        scopeState.agentRunId,
        normalizedFeedback,
      );

      setFeedback("");
      onScopeChanged(state);
    } catch (revisionError) {
      setError(
        revisionError instanceof Error
          ? revisionError.message
          : "Failed to revise product scope",
      );
    } finally {
      setIsRevising(false);
    }
  };

  const handleApproval = async (): Promise<void> => {
    if (!scopeState) {
      return;
    }

    try {
      setIsApproving(true);
      setError(null);

      const state = await approveProjectScope(
        project._id,
        scopeState.agentRunId,
      );

      await onScopeApproved(state);
    } catch (approvalError) {
      setError(
        approvalError instanceof Error
          ? approvalError.message
          : "Failed to approve product scope",
      );
    } finally {
      setIsApproving(false);
    }
  };

  if (!scopeState) {
    if (poState?.status === "COMPLETED") {
      return (
        <div className="py-14 text-center">
          <div className="mx-auto size-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />

          <p className="mt-5 font-medium">Preparing product scope</p>

          <p className="mt-2 text-sm text-muted-foreground">
            The orchestrator is continuing automatically.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
        <p className="font-medium">Waiting for requirement discovery</p>

        <p className="mt-2 text-sm text-muted-foreground">
          Scope generation starts automatically once the requirement is clear.
        </p>
      </div>
    );
  }

  if (scopeState.status === "CREATED" || scopeState.status === "RUNNING") {
    return (
      <div className="py-14 text-center">
        <div className="mx-auto size-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />

        <p className="mt-5 font-medium">Product Owner Agent is working</p>

        <p className="mt-2 text-sm text-muted-foreground">
          Building the product scope.
        </p>
      </div>
    );
  }

  if (scopeState.status === "FAILED") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5">
        <p className="font-medium text-destructive">Scope generation failed</p>

        <p className="mt-2 text-sm text-destructive/80">
          {scopeState.error ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!scopeState.scope) {
    return (
      <div className="rounded-xl border border-white/[0.06] p-5 text-sm text-muted-foreground">
        Product scope is unavailable.
      </div>
    );
  }

  const revisionCount = scopeState.input?.revisions.length ?? 0;

  const scope = scopeState.scope;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className={
              scopeState.status === "COMPLETED"
                ? "border border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300"
                : "border border-amber-400/15 bg-amber-400/[0.05] text-amber-300"
            }
          >
            {scopeState.status === "COMPLETED"
              ? "Approved"
              : "Your review required"}
          </Badge>

          <span className="text-xs text-muted-foreground">
            {revisionCount} revision
            {revisionCount === 1 ? "" : "s"}
          </span>
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

            <p className="mt-2 text-sm">Product Owner</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Revisions
            </p>

            <p className="mt-2 text-sm">{revisionCount}</p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Tokens
            </p>

            <p className="mt-2 text-sm">
              {scopeState.usage
                ? scopeState.usage.totalTokens.toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      ) : null}

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Product summary
        </p>

        <p className="mt-3 max-w-4xl text-sm leading-7 text-foreground/90">
          {scope.productSummary}
        </p>
      </section>

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Product goals
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {scope.productGoals.map((goal, index) => (
            <div
              key={`${goal}-${index}`}
              className="flex gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-4"
            >
              <span className="flex size-6 shrink-0 items-center justify-center rounded-md bg-indigo-500/[0.08] text-xs font-semibold text-indigo-300">
                {index + 1}
              </span>

              <p className="text-sm leading-6 text-muted-foreground">{goal}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              Product backlog
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              Features & user stories
            </h3>
          </div>

          <div className="text-right text-xs text-muted-foreground">
            <p>{scope.features.length} features</p>

            <p className="mt-1">{scope.userStories.length} stories</p>
          </div>
        </div>

        <div className="mt-5 space-y-4">
          {scope.features.map((feature) => (
            <ScopeFeatureCard
              key={feature.featureKey}
              feature={feature}
              stories={scope.userStories.filter(
                (story) => story.featureKey === feature.featureKey,
              )}
            />
          ))}
        </div>
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Assumptions
          </p>

          <div className="mt-4 space-y-3">
            {scope.assumptions.map((assumption, index) => (
              <div
                key={`${assumption}-${index}`}
                className="flex gap-3 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />
                <span>{assumption}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Out of scope
          </p>

          <div className="mt-4 space-y-3">
            {scope.outOfScope.map((item, index) => (
              <div
                key={`${item}-${index}`}
                className="flex gap-3 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-rose-400" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {scopeState.status === "WAITING_FOR_HUMAN" ? (
        <section className="border-t border-white/[0.06] pt-8">
          <h3 className="text-lg font-semibold">Review product scope</h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Approve the scope or tell the Product Owner Agent what should
            change.
          </p>

          <form onSubmit={handleRevision} className="mt-6 space-y-4">
            <Textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              disabled={isRevising || isApproving}
              rows={4}
              placeholder="Describe the changes you want..."
              className="resize-none border-white/[0.08] bg-white/[0.025]"
            />

            {error ? (
              <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
                {error}
              </div>
            ) : null}

            <div className="flex flex-col gap-3 sm:flex-row">
              <Button
                type="submit"
                variant="outline"
                disabled={isRevising || isApproving}
              >
                {isRevising ? "PO Agent is revising..." : "Request revision"}
              </Button>

              <Button
                type="button"
                disabled={isRevising || isApproving}
                onClick={() => void handleApproval()}
              >
                {isApproving ? "Approving..." : "Approve scope"}
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5">
          <p className="font-medium text-emerald-300">
            Product Owner stage complete
          </p>

          <p className="mt-2 text-sm text-muted-foreground">
            The approved scope is ready for the Architecture stage.
          </p>
        </section>
      )}
    </div>
  );
};

export default ScopeReviewPanel;

