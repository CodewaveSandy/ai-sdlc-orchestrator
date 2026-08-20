import ScopePriorityBadge from "@/components/projects/ScopePriorityBadge";
import type { ProductFeature, ProductUserStory } from "@/types/scope.types";

interface ScopeFeatureCardProps {
  feature: ProductFeature;
  stories: ProductUserStory[];
}

const ScopeFeatureCard = ({ feature, stories }: ScopeFeatureCardProps) => {
  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.07] bg-black/10">
      <div className="border-b border-white/[0.06] p-5">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <div className="flex gap-4">
            <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-indigo-400/15 bg-indigo-500/[0.06] text-xs font-bold text-indigo-300">
              {feature.featureKey}
            </div>

            <div>
              <h4 className="font-semibold tracking-tight">{feature.name}</h4>

              <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
                {feature.description}
              </p>
            </div>
          </div>

          <ScopePriorityBadge priority={feature.priority} />
        </div>
      </div>

      <div className="divide-y divide-white/[0.05]">
        {stories.length === 0 ? (
          <div className="p-5 text-sm text-muted-foreground">
            No user stories are mapped to this feature.
          </div>
        ) : (
          stories.map((story) => (
            <details key={story.storyKey} className="group">
              <summary className="cursor-pointer list-none p-5 transition hover:bg-white/[0.015]">
                <div className="flex items-start justify-between gap-5">
                  <div className="flex gap-3">
                    <span className="mt-0.5 rounded-md bg-white/[0.05] px-2 py-1 font-mono text-[10px] font-semibold text-muted-foreground">
                      {story.storyKey}
                    </span>

                    <div>
                      <p className="text-sm font-medium">{story.title}</p>

                      <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">
                        {story.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-3">
                    <ScopePriorityBadge priority={story.priority} />

                    <span className="text-muted-foreground transition group-open:rotate-180">
                      ↓
                    </span>
                  </div>
                </div>
              </summary>

              <div className="border-t border-white/[0.04] bg-white/[0.012] px-5 pb-6 pt-5">
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    User story
                  </p>

                  <p className="mt-3 text-sm leading-7 text-foreground/90">
                    {story.description}
                  </p>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Acceptance criteria
                  </p>

                  <div className="mt-3 space-y-3">
                    {story.acceptanceCriteria.map((criterion, index) => (
                      <div
                        key={`${story.storyKey}-criterion-${index}`}
                        className="flex gap-3 text-sm leading-6"
                      >
                        <div className="mt-1 flex size-5 shrink-0 items-center justify-center rounded-md border border-emerald-400/20 bg-emerald-400/[0.05] text-[10px] text-emerald-300">
                          ✓
                        </div>

                        <span className="text-muted-foreground">
                          {criterion}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                    Dependencies
                  </p>

                  {story.dependencies.length > 0 ? (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {story.dependencies.map((dependency) => (
                        <span
                          key={dependency}
                          className="rounded-md border border-white/[0.07] bg-white/[0.025] px-2 py-1 font-mono text-xs text-muted-foreground"
                        >
                          {dependency}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-2 text-sm text-muted-foreground">
                      No dependencies
                    </p>
                  )}
                </div>
              </div>
            </details>
          ))
        )}
      </div>
    </div>
  );
};

export default ScopeFeatureCard;

