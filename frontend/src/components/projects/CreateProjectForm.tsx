import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/services/project.service";
import type { Project } from "@/types/project.types";

interface CreateProjectFormProps {
  onProjectCreated: (project: Project) => void;
}

const CreateProjectForm = ({ onProjectCreated }: CreateProjectFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    const normalizedName = name.trim();

    const normalizedDescription = description.trim();

    if (!normalizedName) {
      setError("Project name is required.");

      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const project = await createProject({
        name: normalizedName,

        description: normalizedDescription || undefined,
      });

      setName("");
      setDescription("");

      onProjectCreated(project);
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Failed to create project",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-white/[0.07] bg-white/[0.018] p-6"
    >
      <div>
        <h2 className="text-lg font-semibold tracking-tight">Create project</h2>

        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Start a new software delivery workflow. You'll provide the detailed
          product requirement after opening the project workspace.
        </p>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)_auto] lg:items-start">
        <div>
          <Input
            value={name}
            onChange={(event) => setName(event.target.value)}
            disabled={isSubmitting}
            placeholder="Project name"
            maxLength={150}
            className="border-white/[0.08] bg-white/[0.025]"
          />
        </div>

        <div>
          <Textarea
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            disabled={isSubmitting}
            placeholder="Short description (optional)"
            rows={1}
            maxLength={2000}
            className="min-h-9 resize-none border-white/[0.08] bg-white/[0.025]"
          />
        </div>

        <Button type="submit" disabled={isSubmitting} className="lg:min-w-32">
          {isSubmitting ? "Creating..." : "Create project"}
        </Button>
      </div>

      {error ? (
        <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}
    </form>
  );
};

export default CreateProjectForm;

