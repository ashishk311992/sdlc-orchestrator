import { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Command, X } from "lucide-react";
import { personas, utilityNav } from "../store/persona";
import { screens } from "../data/screens";

/** Cmd/Ctrl-K palette for jumping between personas & screens. */
export default function PersonaSwitcher() {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const navigate = useNavigate();
  const { pathname } = useLocation();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  const matches = useMemo(() => {
    const n = q.trim().toLowerCase();
    if (!n) return screens.slice(0, 20);
    return screens
      .filter(
        (s) =>
          s.label.toLowerCase().includes(n) ||
          s.description.toLowerCase().includes(n) ||
          s.persona.toLowerCase().includes(n),
      )
      .slice(0, 40);
  }, [q]);

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="hidden items-center gap-2 rounded-full border border-porter-line bg-white px-3 py-1.5 text-xs font-semibold text-porter-mute hover:bg-porter-cloud md:flex"
        title="Quick switch (⌘K)"
      >
        <Command size={14} />
        Switch persona / screen
        <kbd className="rounded bg-porter-cloud px-1.5 text-[10px] text-porter-ink">⌘K</kbd>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 flex items-start justify-center bg-porter-ink/60 p-4 backdrop-blur-sm md:pt-[12vh]"
          onClick={() => setOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl overflow-hidden rounded-2xl border border-porter-line bg-white shadow-2xl"
          >
            <div className="flex items-center gap-2 border-b border-porter-line px-4 py-3">
              <Command size={16} className="text-porter-mute" />
              <input
                autoFocus
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search persona or screen…"
                className="flex-1 bg-transparent text-sm outline-none placeholder:text-porter-mute"
              />
              <button onClick={() => setOpen(false)} className="text-porter-mute hover:text-porter-ink">
                <X size={16} />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              <div className="px-4 pb-2 pt-3 text-[10px] font-bold uppercase tracking-wider text-porter-mute">
                Personas
              </div>
              <div className="grid grid-cols-2 gap-1 px-2 pb-2 md:grid-cols-3">
                {[...utilityNav.map((u) => ({ id: u.label, label: u.label, path: u.path, icon: u.icon })), ...personas.map((p) => ({ id: p.id, label: p.label, path: p.path, icon: p.icon }))].map(
                  (p) => {
                    const Icon = p.icon;
                    return (
                      <button
                        key={p.id}
                        onClick={() => navigate(p.path)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-left text-sm hover:bg-porter-cloud"
                      >
                        <Icon size={14} className="text-porter-yellowDark" />
                        <span className="font-semibold">{p.label}</span>
                      </button>
                    );
                  },
                )}
              </div>

              <div className="border-t border-porter-line px-4 pb-2 pt-3 text-[10px] font-bold uppercase tracking-wider text-porter-mute">
                Screens {q && `· ${matches.length} match`}
              </div>
              <ul className="pb-3">
                {matches.map((s) => (
                  <li key={s.persona + s.id}>
                    <button
                      onClick={() => navigate(s.route)}
                      className="flex w-full items-start gap-3 px-4 py-2 text-left hover:bg-porter-cloud"
                    >
                      <span className="mt-0.5 rounded bg-porter-ink px-1.5 py-0.5 text-[10px] font-bold uppercase text-porter-yellow">
                        {s.persona}
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-semibold">{s.label}</span>
                        <span className="block text-xs text-porter-mute">{s.description}</span>
                      </span>
                    </button>
                  </li>
                ))}
                {matches.length === 0 && (
                  <li className="px-4 py-6 text-center text-sm text-porter-mute">No matches</li>
                )}
              </ul>
            </div>

            <div className="flex items-center justify-between border-t border-porter-line bg-porter-cloud px-4 py-2 text-[11px] text-porter-mute">
              <span>
                <kbd className="rounded bg-white px-1.5">↵</kbd> open ·{" "}
                <kbd className="rounded bg-white px-1.5">esc</kbd> close
              </span>
              <Link to="/porter/review" className="font-bold text-porter-ink hover:underline">
                Open review index →
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
