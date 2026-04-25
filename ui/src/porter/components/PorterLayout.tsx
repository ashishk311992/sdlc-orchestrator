import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { personas, utilityNav } from "../store/persona";
import FeedbackWidget from "./FeedbackWidget";
import PersonaSwitcher from "./PersonaSwitcher";

type Props = {
  children: ReactNode;
  /** Go edge-to-edge (no max-width / padding on main). */
  bleed?: boolean;
};

export default function PorterLayout({ children, bleed = false }: Props) {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-porter-cloud text-porter-ink">
      <header className="sticky top-0 z-30 border-b border-porter-line bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-8">
          <Link to="/porter" className="flex shrink-0 items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-porter-yellow font-black text-porter-ink">
              P
            </span>
            <span className="text-lg font-extrabold tracking-tight">
              porter<span className="text-porter-yellow">.</span>
            </span>
            <span className="ml-2 hidden rounded-full bg-porter-ink px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-porter-yellow md:inline">
              Prototype
            </span>
          </Link>

          <nav className="hidden items-center gap-1 overflow-x-auto text-xs lg:flex">
            {utilityNav.map((u) => {
              const active = pathname === u.path;
              return (
                <Link
                  key={u.path}
                  to={u.path}
                  className={[
                    "rounded-full px-3 py-1.5 font-semibold transition",
                    active ? "bg-porter-ink text-white" : "text-porter-mute hover:bg-porter-cloud hover:text-porter-ink",
                  ].join(" ")}
                >
                  {u.label}
                </Link>
              );
            })}
            <span className="mx-2 h-4 w-px bg-porter-line" />
            {personas.map((p) => {
              const active = pathname.startsWith(p.path);
              return (
                <Link
                  key={p.id}
                  to={p.path}
                  className={[
                    "rounded-full px-3 py-1.5 font-semibold transition",
                    active ? "bg-porter-yellow text-porter-ink" : "text-porter-mute hover:bg-porter-cloud hover:text-porter-ink",
                  ].join(" ")}
                >
                  {p.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-2">
            <PersonaSwitcher />
          </div>
        </div>
      </header>

      <main className={bleed ? "" : "mx-auto max-w-7xl px-4 py-6 md:px-8 md:py-10"}>{children}</main>

      <footer className="border-t border-porter-line bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-4 text-xs text-porter-mute md:flex-row md:items-center md:justify-between md:px-8">
          <span>Porter-style logistics prototype · UI mock only · Not affiliated with Porter.</span>
          <span>
            <Link to="/porter/review" className="font-bold text-porter-ink hover:underline">
              Review index
            </Link>{" "}
            · <kbd className="rounded border border-porter-line bg-porter-cloud px-1.5 py-0.5">⌘K</kbd> to switch
          </span>
        </div>
      </footer>

      <FeedbackWidget />
    </div>
  );
}
