import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { submitPoClarifications } from "@/services/po.service";
import type { PoWorkflowState } from "@/types/po.types";

interface ClarificationFormProps {
  projectId: string;
  agentRunId: string;
  questions: string[];

  onCompleted: (state: PoWorkflowState) => void;
}

const ClarificationForm = ({
  projectId,
  agentRunId,
  questions,
  onCompleted,
}: ClarificationFormProps) => {
  const [answers, setAnswers] = useState<string[]>(() =>
    questions.map(() => ""),
  );

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleAnswerChange = (index: number, value: string): void => {
    setAnswers((currentAnswers) =>
      currentAnswers.map((answer, answerIndex) =>
        answerIndex === index ? value : answer,
      ),
    );
  };

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const normalizedAnswers = answers.map((answer) => answer.trim());

    if (normalizedAnswers.some((answer) => !answer)) {
      setError("Please answer every clarification question.");

      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const state = await submitPoClarifications(projectId, {
        agentRunId,
        answers: normalizedAnswers,
      });

      onCompleted(state);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to submit clarification answers",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <h3 className="text-base font-semibold">Clarification required</h3>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          The Product Owner Agent needs a little more context before it can
          confidently define the product scope.
        </p>
      </div>

      <div className="space-y-6">
        {questions.map((question, index) => (
          <div key={`${question}-${index}`} className="space-y-3">
            <div className="flex gap-3">
              <div className="flex size-7 shrink-0 items-center justify-center rounded-full border border-indigo-400/15 bg-indigo-500/5 text-xs font-semibold text-indigo-300">
                {index + 1}
              </div>

              <label
                htmlFor={`clarification-${index}`}
                className="pt-1 text-sm font-medium leading-6"
              >
                {question}
              </label>
            </div>

            <Textarea
              id={`clarification-${index}`}
              value={answers[index] ?? ""}
              onChange={(event) =>
                handleAnswerChange(index, event.target.value)
              }
              disabled={isSubmitting}
              rows={3}
              placeholder="Your answer..."
              className="resize-none border-white/[0.08] bg-white/[0.025]"
            />
          </div>
        ))}
      </div>

      {error ? (
        <div className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "PO Agent is reviewing..." : "Submit answers"}
      </Button>
    </form>
  );
};

export default ClarificationForm;

