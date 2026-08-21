import { useState, type FormEvent } from "react";

import ArchitectureComponentCard from "@/components/projects/ArchitectureComponentCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  approveProjectArchitecture,
  reviseProjectArchitecture,
} from "@/services/architecture.service";
import type { ArchitectureWorkflowState } from "@/types/architecture.types";
import type { Project } from "@/types/project.types";

interface ArchitectureReviewPanelProps {
  project: Project;

  architectureState: ArchitectureWorkflowState | null;

  onArchitectureChanged: (state: ArchitectureWorkflowState) => void;

  onArchitectureApproved: (state: ArchitectureWorkflowState) => Promise<void>;
}

const ArchitectureReviewPanel = ({
  project,
  architectureState,
  onArchitectureChanged,
  onArchitectureApproved,
}: ArchitectureReviewPanelProps) => {
  const [feedback, setFeedback] = useState("");

  const [isRevising, setIsRevising] = useState(false);

  const [isApproving, setIsApproving] = useState(false);

  const [showRunDetails, setShowRunDetails] = useState(false);

  const [showTechnicalDetails, setShowTechnicalDetails] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleRevision = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!architectureState) {
      return;
    }

    const normalizedFeedback = feedback.trim();

    if (!normalizedFeedback) {
      setError("Describe what you want the Architect Agent to change.");

      return;
    }

    try {
      setIsRevising(true);
      setError(null);

      const state = await reviseProjectArchitecture(
        project._id,
        architectureState.agentRunId,
        normalizedFeedback,
      );

      setFeedback("");

      onArchitectureChanged(state);
    } catch (revisionError) {
      setError(
        revisionError instanceof Error
          ? revisionError.message
          : "Failed to revise architecture",
      );
    } finally {
      setIsRevising(false);
    }
  };

  const handleApproval = async (): Promise<void> => {
    if (!architectureState) {
      return;
    }

    try {
      setIsApproving(true);
      setError(null);

      const state = await approveProjectArchitecture(
        project._id,
        architectureState.agentRunId,
      );

      await onArchitectureApproved(state);
    } catch (approvalError) {
      setError(
        approvalError instanceof Error
          ? approvalError.message
          : "Failed to approve architecture",
      );
    } finally {
      setIsApproving(false);
    }
  };

  if (!architectureState) {
    if (
      project.currentStage === "ARCHITECTURE" &&
      project.workflowStatus === "RUNNING"
    ) {
      return (
        <div className="py-14 text-center">
          <div className="mx-auto size-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />

          <p className="mt-5 font-medium">Architect Agent is working</p>

          <p className="mt-2 text-sm text-muted-foreground">
            Designing the system architecture from the approved product scope.
          </p>
        </div>
      );
    }

    return (
      <div className="rounded-xl border border-dashed border-white/[0.08] p-8 text-center">
        <p className="font-medium">Architecture has not started yet</p>

        <p className="mt-2 text-sm text-muted-foreground">
          The Architect Agent starts automatically after Product Scope is
          approved.
        </p>
      </div>
    );
  }

  if (
    architectureState.status === "CREATED" ||
    architectureState.status === "RUNNING"
  ) {
    return (
      <div className="py-14 text-center">
        <div className="mx-auto size-9 animate-spin rounded-full border-2 border-sky-400/20 border-t-sky-300" />

        <p className="mt-5 font-medium">Architect Agent is working</p>

        <p className="mt-2 text-sm text-muted-foreground">
          Designing components, APIs, persistence, security and deployment
          strategy.
        </p>
      </div>
    );
  }

  if (architectureState.status === "FAILED") {
    return (
      <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-5">
        <p className="font-medium text-destructive">
          Architecture generation failed
        </p>

        <p className="mt-2 text-sm text-destructive/80">
          {architectureState.error ?? "An unexpected error occurred."}
        </p>
      </div>
    );
  }

  if (!architectureState.architecture) {
    return (
      <div className="rounded-xl border border-white/[0.06] p-5 text-sm text-muted-foreground">
        Architecture proposal is unavailable.
      </div>
    );
  }

  const architecture = architectureState.architecture;

  const revisionCount = architectureState.input?.revisions.length ?? 0;

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.06] pb-5">
        <div className="flex items-center gap-3">
          <Badge
            variant="secondary"
            className={
              architectureState.status === "COMPLETED"
                ? "border border-emerald-400/15 bg-emerald-400/[0.05] text-emerald-300"
                : "border border-amber-400/15 bg-amber-400/[0.05] text-amber-300"
            }
          >
            {architectureState.status === "COMPLETED"
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

            <p className="mt-2 text-sm">Architect</p>
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
              {architectureState.usage
                ? architectureState.usage.totalTokens.toLocaleString()
                : "—"}
            </p>
          </div>
        </div>
      ) : null}

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Architecture summary
        </p>

        <p className="mt-3 max-w-4xl text-sm leading-7 text-foreground/90">
          {architecture.architectureSummary}
        </p>
      </section>

      <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          System context
        </p>

        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          {architecture.systemContext}
        </p>
      </section>

      <section>
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Technology direction
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {architecture.technologyChoices.map((technology) => (
            <div
              key={`${technology.area}-${technology.choice}`}
              className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-4"
            >
              <p className="text-xs font-medium text-indigo-300">
                {technology.area}
              </p>

              <p className="mt-2 text-sm font-medium">{technology.choice}</p>

              <p className="mt-2 text-xs leading-5 text-muted-foreground">
                {technology.rationale}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
              System design
            </p>

            <h3 className="mt-2 text-lg font-semibold">
              Architecture components
            </h3>
          </div>

          <span className="text-xs text-muted-foreground">
            {architecture.components.length} components
          </span>
        </div>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {architecture.components.map((component) => (
            <ArchitectureComponentCard
              key={component.componentKey}
              component={component}
            />
          ))}
        </div>
      </section>

      <section>
        <button
          type="button"
          onClick={() => setShowTechnicalDetails((current) => !current)}
          className="flex w-full items-center justify-between rounded-xl border border-white/[0.06] bg-white/[0.015] p-5 text-left transition hover:bg-white/[0.025]"
        >
          <div>
            <p className="font-medium">Technical design details</p>

            <p className="mt-1 text-xs text-muted-foreground">
              Data model, APIs, non-functional requirements and security.
            </p>
          </div>

          <span
            className={`text-muted-foreground transition ${
              showTechnicalDetails ? "rotate-180" : ""
            }`}
          >
            ↓
          </span>
        </button>

        {showTechnicalDetails ? (
          <div className="mt-4 space-y-6 rounded-xl border border-white/[0.06] bg-black/10 p-5">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Data entities
              </p>

              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {architecture.dataEntities.map((entity) => (
                  <div
                    key={entity.name}
                    className="rounded-lg border border-white/[0.05] p-4"
                  >
                    <p className="text-sm font-medium">{entity.name}</p>

                    <p className="mt-2 text-xs leading-5 text-muted-foreground">
                      {entity.purpose}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                      {entity.keyFields.map((field) => (
                        <span
                          key={field}
                          className="rounded bg-white/[0.04] px-2 py-1 font-mono text-[10px] text-muted-foreground"
                        >
                          {field}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                API domains
              </p>

              <div className="mt-4 space-y-3">
                {architecture.apiDomains.map((domain) => (
                  <details
                    key={domain.name}
                    className="rounded-lg border border-white/[0.05]"
                  >
                    <summary className="cursor-pointer list-none p-4">
                      <p className="text-sm font-medium">{domain.name}</p>

                      <p className="mt-1 text-xs text-muted-foreground">
                        {domain.responsibility}
                      </p>
                    </summary>

                    <div className="border-t border-white/[0.05] p-4">
                      <div className="space-y-2">
                        {domain.endpoints.map((endpoint) => (
                          <div
                            key={`${endpoint.method}-${endpoint.path}`}
                            className="flex flex-col gap-1 rounded-md bg-white/[0.02] px-3 py-2 sm:flex-row sm:items-center sm:gap-3"
                          >
                            <span className="font-mono text-[10px] font-semibold text-indigo-300">
                              {endpoint.method}
                            </span>

                            <span className="font-mono text-xs">
                              {endpoint.path}
                            </span>

                            <span className="text-xs text-muted-foreground sm:ml-auto">
                              {endpoint.purpose}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </details>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Non-functional requirements
              </p>

              <div className="mt-4 space-y-3">
                {architecture.nonFunctionalRequirements.map(
                  (requirement, index) => (
                    <div
                      key={`${requirement.category}-${index}`}
                      className="rounded-lg border border-white/[0.05] p-4"
                    >
                      <p className="text-xs font-semibold text-indigo-300">
                        {requirement.category}
                      </p>

                      <p className="mt-2 text-sm">{requirement.requirement}</p>

                      <p className="mt-2 text-xs text-muted-foreground">
                        Target: {requirement.target}
                      </p>
                    </div>
                  ),
                )}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                Security considerations
              </p>

              <div className="mt-3 space-y-2">
                {architecture.securityConsiderations.map((item, index) => (
                  <div
                    key={`${item}-${index}`}
                    className="flex gap-3 text-sm leading-6 text-muted-foreground"
                  >
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-amber-400" />

                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </section>

      <div className="grid gap-5 lg:grid-cols-2">
        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Deployment strategy
          </p>

          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            {architecture.deploymentStrategy}
          </p>
        </section>

        <section className="rounded-xl border border-white/[0.06] bg-white/[0.015] p-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Architecture decisions
          </p>

          <div className="mt-3 space-y-2">
            {architecture.architectureDecisions.map((decision, index) => (
              <div
                key={`${decision}-${index}`}
                className="flex gap-3 text-sm leading-6 text-muted-foreground"
              >
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-indigo-400" />

                <span>{decision}</span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {architecture.risks.length > 0 ? (
        <section>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Technical risks
          </p>

          <div className="mt-4 space-y-3">
            {architecture.risks.map((risk, index) => (
              <div
                key={`${risk.risk}-${index}`}
                className="rounded-xl border border-amber-400/10 bg-amber-400/[0.025] p-4"
              >
                <p className="text-sm font-medium">{risk.risk}</p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Impact: {risk.impact}
                </p>

                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                  Mitigation: {risk.mitigation}
                </p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      {architectureState.status === "WAITING_FOR_HUMAN" ? (
        <section className="border-t border-white/[0.06] pt-8">
          <h3 className="text-lg font-semibold">Review architecture</h3>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
            Approve the architecture to continue toward development, or explain
            what the Architect Agent should revise.
          </p>

          <form onSubmit={handleRevision} className="mt-6 space-y-4">
            <Textarea
              value={feedback}
              onChange={(event) => setFeedback(event.target.value)}
              disabled={isRevising || isApproving}
              rows={4}
              placeholder="Example: Keep the MVP as a modular monolith and avoid Kubernetes or microservices."
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
                {isRevising ? "Architect is revising..." : "Request revision"}
              </Button>

              <Button
                type="button"
                disabled={isRevising || isApproving}
                onClick={() => void handleApproval()}
              >
                {isApproving ? "Approving..." : "Approve architecture"}
              </Button>
            </div>
          </form>
        </section>
      ) : (
        <section className="rounded-xl border border-emerald-400/15 bg-emerald-400/[0.035] p-5">
          <p className="font-medium text-emerald-300">Architecture approved</p>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The technical design is frozen and ready for Development.
          </p>
        </section>
      )}
    </div>
  );
};

export default ArchitectureReviewPanel;

