import type { ArchitectureComponent } from "@/types/architecture.types";

interface ArchitectureComponentCardProps {
  component: ArchitectureComponent;
}

const ArchitectureComponentCard = ({
  component,
}: ArchitectureComponentCardProps) => {
  return (
    <div className="rounded-xl border border-white/[0.06] bg-black/10 p-5">
      <div className="flex gap-4">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-indigo-400/15 bg-indigo-500/[0.06] font-mono text-xs font-semibold text-indigo-300">
          {component.componentKey}
        </div>

        <div className="min-w-0 flex-1">
          <h4 className="font-medium">{component.name}</h4>

          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {component.responsibility}
          </p>
        </div>
      </div>

      {component.interfaces.length > 0 ? (
        <div className="mt-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Interfaces
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            {component.interfaces.map((item) => (
              <span
                key={item}
                className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2.5 py-1 text-xs text-muted-foreground"
              >
                {item}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <div className="mt-5">
        <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Dependencies
        </p>

        {component.dependencies.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {component.dependencies.map((dependency) => (
              <span
                key={dependency}
                className="rounded-md border border-white/[0.06] bg-white/[0.025] px-2 py-1 font-mono text-xs text-muted-foreground"
              >
                {dependency}
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">
            No component dependencies
          </p>
        )}
      </div>
    </div>
  );
};

export default ArchitectureComponentCard;

