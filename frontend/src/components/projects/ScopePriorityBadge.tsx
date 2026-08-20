import { Badge } from "@/components/ui/badge";
import type { ProductPriority } from "@/types/scope.types";

interface ScopePriorityBadgeProps {
  priority: ProductPriority;
}

const priorityLabelMap: Record<ProductPriority, string> = {
  MUST_HAVE: "Must have",
  SHOULD_HAVE: "Should have",
  COULD_HAVE: "Could have",
};

const priorityClassMap: Record<ProductPriority, string> = {
  MUST_HAVE: "border-rose-400/15 bg-rose-400/[0.06] text-rose-300",

  SHOULD_HAVE: "border-amber-400/15 bg-amber-400/[0.06] text-amber-300",

  COULD_HAVE: "border-sky-400/15 bg-sky-400/[0.06] text-sky-300",
};

const ScopePriorityBadge = ({ priority }: ScopePriorityBadgeProps) => {
  return (
    <Badge
      variant="secondary"
      className={`border ${priorityClassMap[priority]}`}
    >
      {priorityLabelMap[priority]}
    </Badge>
  );
};

export default ScopePriorityBadge;

