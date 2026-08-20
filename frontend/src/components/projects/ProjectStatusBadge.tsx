import { Badge } from "@/components/ui/badge";
import type { ProjectStatus } from "@/types/project.types";

interface ProjectStatusBadgeProps {
  status: ProjectStatus;
}

const getStatusLabel = (status: ProjectStatus): string => {
  switch (status) {
    case "DRAFT":
      return "Draft";

    case "DISCOVERY":
      return "Discovery";

    case "IN_PROGRESS":
      return "In progress";

    case "COMPLETED":
      return "Completed";

    case "FAILED":
      return "Failed";
  }
};

const ProjectStatusBadge = ({ status }: ProjectStatusBadgeProps) => {
  return <Badge variant="secondary">{getStatusLabel(status)}</Badge>;
};

export default ProjectStatusBadge;

