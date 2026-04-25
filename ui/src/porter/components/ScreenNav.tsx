import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useFeedback } from "../store/feedback";
import { screensByPersona } from "../data/screens";
import type { PersonaId } from "../store/persona";

/** Side-rail screen selector for phone-framed personas. */
export default function ScreenNav({
  persona,
  currentId,
  onSelect,
  routePrefix,
}: {
  persona: PersonaId;
  currentId: string;
  onSelect: (id: string) => void;
  routePrefix: string;
}) {
  const list = screensByPersona(persona);
  const { comments, markVisited } = useFeedback();

  // Mark currently viewed screen as visited
  useEffect(() => {
    markVisited(`${routePrefix}?s=${currentId}`);
  }, [currentId, routePrefix, markVisited]);

  return (
    <aside className="rounded-2xl border border-porter-line bg-white">
      <div className="border-b border-porter-line px-4 py-3">
        <div className="text-[11px] font-bold uppercase tracking-wider text-porter-yellowDark">
          {persona} screens
        </div>
        <div className="text-sm font-extrabold">{list.length} flows</div>
      </div>
      <ol className="max-h-[600px] overflow-y-auto p-2">
        {list.map((s, i) => {
          const route = `${routePrefix}?s=${s.id}`;
          const active = s.id === currentId;
          const count = comments.filter((c) => c.route === route).length;
          return (
            <li key={s.id}>
              <button
                onClick={() => onSelect(s.id)}
                className={[
                  "mb-0.5 flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition",
                  active ? "bg-porter-ink text-porter-yellow" : "hover:bg-porter-cloud",
                ].join(" ")}
              >
                <span className={`w-5 shrink-0 text-right font-mono ${active ? "text-porter-yellow" : "text-porter-mute"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="flex-1 font-semibold">{s.label}</span>
                {count > 0 && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[9px] font-bold ${active ? "bg-porter-yellow text-porter-ink" : "bg-porter-warn/10 text-porter-warn"}`}>
                    {count}
                  </span>
                )}
              </button>
            </li>
          );
        })}
      </ol>
      <div className="border-t border-porter-line p-3 text-xs">
        <Link to="/porter/review" className="font-bold hover:underline">
          ← All personas (⌘K)
        </Link>
      </div>
    </aside>
  );
}
