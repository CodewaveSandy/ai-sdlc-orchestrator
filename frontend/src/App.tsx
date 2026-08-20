import { Button } from "@/components/ui/button";

const App = () => {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col justify-center px-6 py-16">
        <div className="max-w-3xl">
          <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm text-slate-300">
            AI SDLC Orchestrator
          </div>

          <h1 className="text-5xl font-semibold tracking-tight sm:text-6xl">
            Build software with an AI-powered engineering team.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-400">
            A unified orchestration layer for AI Product Owners, Developers, QA
            agents, and future SDLC roles working together toward measurable
            software outcomes.
          </p>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button size="lg">Start Building</Button>

            <Button
              size="lg"
              variant="outline"
              className="border-white/10 bg-transparent text-white hover:bg-white/10 hover:text-white"
            >
              View System Status
            </Button>
          </div>
        </div>

        <div className="mt-16 grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Product Agent</p>
            <h2 className="mt-2 text-xl font-medium">Ready</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Converts product requirements into structured features, stories,
              and acceptance criteria.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">Developer Agent</p>
            <h2 className="mt-2 text-xl font-medium">Coming next</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Implements stories, works with source code, runs tests, and
              repairs failures.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <p className="text-sm text-slate-400">QA Agent</p>
            <h2 className="mt-2 text-xl font-medium">Planned</h2>
            <p className="mt-3 text-sm leading-6 text-slate-400">
              Validates acceptance criteria, tests deployed applications, and
              feeds defects back into the workflow.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
};

export default App;

