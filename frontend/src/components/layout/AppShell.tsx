import { NavLink, Outlet } from "react-router-dom";

const AppShell = () => {
  return (
    <div className="min-h-screen bg-transparent text-foreground">
      <header className="sticky top-0 z-50 border-b border-white/5 bg-background/75 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-8">
            <NavLink to="/projects" className="group flex items-center gap-3">
              <div className="relative flex size-9 items-center justify-center overflow-hidden rounded-xl border border-indigo-400/20 bg-indigo-500/10">
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-500/5" />

                <span className="relative text-xs font-semibold tracking-wide text-indigo-300">
                  AI
                </span>
              </div>

              <div className="leading-tight">
                <p className="text-sm font-semibold tracking-tight text-foreground">
                  AI SDLC
                </p>

                <p className="text-[11px] text-muted-foreground">
                  Orchestration Platform
                </p>
              </div>
            </NavLink>

            <nav className="hidden items-center gap-1 md:flex">
              <NavLink
                to="/projects"
                className={({ isActive }) =>
                  [
                    "rounded-lg px-3 py-2 text-sm transition-all duration-200",
                    isActive
                      ? "bg-white/5 font-medium text-foreground"
                      : "text-muted-foreground hover:bg-white/[0.03] hover:text-foreground",
                  ].join(" ")
                }
              >
                Projects
              </NavLink>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/5 bg-white/[0.025] px-3 py-1.5 sm:flex">
              <span className="relative flex size-2">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-emerald-400 opacity-40" />

                <span className="relative inline-flex size-2 rounded-full bg-emerald-400" />
              </span>

              <span className="text-xs text-muted-foreground">
                System online
              </span>
            </div>

            <div className="rounded-full border border-indigo-400/15 bg-indigo-500/5 px-3 py-1.5 text-[11px] font-medium text-indigo-300">
              POC
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;

