import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createProject } from "@/services/project.service";
import type { Project } from "@/types/project.types";

interface CreateProjectFormProps {
  onCreated: (project: Project) => void;
}

const CreateProjectForm = ({ onCreated }: CreateProjectFormProps) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();

    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const project = await createProject({
        name: name.trim(),
        description: description.trim() || undefined,
      });

      setName("");
      setDescription("");

      onCreated(project);
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
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-2">
        <label htmlFor="project-name" className="text-sm font-medium">
          Project name
        </label>

        <Input
          id="project-name"
          placeholder="Expense Tracker"
          value={name}
          onChange={(event) => setName(event.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label htmlFor="project-description" className="text-sm font-medium">
          Description
        </label>

        <Textarea
          id="project-description"
          placeholder="A short description of the product we are going to build."
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          disabled={isSubmitting}
          rows={5}
        />
      </div>

      {error ? (
        <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </div>
      ) : null}

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? "Creating project..." : "Create project"}
      </Button>
    </form>
  );
};

export default CreateProjectForm;

