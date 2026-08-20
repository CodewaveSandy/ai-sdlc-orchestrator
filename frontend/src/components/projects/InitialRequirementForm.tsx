import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitProjectRequirement } from "@/services/po.service";
import type { PoWorkflowState } from "@/types/po.types";

interface InitialRequirementFormProps {
  projectId: string;

  onCompleted: (state: PoWorkflowState) => void;
}

const InitialRequirementForm = ({
  projectId,
  onCompleted,
}: InitialRequirementFormProps) => {
  const [requirement, setRequirement] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const normalizedRequirement = requirement.trim();

    if (normalizedRequirement.length < 20) {
      setError(
        "Please provide a little more detail about the product you want to build.",
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const state = await submitProjectRequirement(projectId, {
        requirement: normalizedRequirement,
      });

      onCompleted(state);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to analyze requirement",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h3 className="text-lg font-semibold tracking-tight">
          What are we building?
        </h3>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Describe the product in your own words. The Product Owner Agent will
          analyze it and ask only the questions required to establish a reliable
          scope.
        </p>
      </div>

      <Textarea
        value={requirement}
        onChange={(event) => setRequirement(event.target.value)}
        disabled={isSubmitting}
        rows={8}
        placeholder="Example: I want to build an expense tracker that lets users upload bank statements, categorizes their expenses automatically, and provides reports showing where their money is being spent."
        className="resize-none border-white/[0.08] bg-white/[0.025]"
      />

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "PO Agent is analyzing..." : "Start product discovery"}
      </Button>
    </form>
  );
};

export default InitialRequirementForm;

