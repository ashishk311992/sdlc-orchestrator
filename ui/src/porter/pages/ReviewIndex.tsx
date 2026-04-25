import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CheckCircle2, Circle, Download, MessageSquare, Upload } from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import { Card, Pill, Tabs } from "../components/common";
import { screens } from "../data/screens";
import { personas } from "../store/persona";
import { exportFeedback, importFeedbackFile, useFeedback } from "../store/feedback";

export default function ReviewIndex() {
  const { comments, visitedRoutes } = useFeedback();
  const [filter, setFilter] = useState<"all" | "with-comments" | "unvisited">("all");
  const [sel, setSel] = useState<string>("all");

  const rows = useMemo(() => {
    let r = screens;
    if (sel !== "all") r = r.filter((s) => s.persona === sel);
    if (filter === "with-comments")
      r = r.filter((s) => comments.some((c) => c.route.startsWith(s.route.split("?")[0]) && (c.route === s.route || !s.route.includes("?"))));
    if (filter === "unvisited") r = r.filter((s) => !visitedRoutes.includes(s.route));
    return r;
  }, [filter, sel, comments, visitedRoutes]);

  const personaTabs = [
    { value: "all", label: "All" },
    { value: "landing", label: "Landing" },
    ...personas.map((p) => ({ value: p.id, label: p.label })),
    { value: "meta", label: "Meta" },
  ];

  const unresolved = comments.filter((c) => !c.resolved).length;

  return (
    <PorterLayout>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-wider text-porter-yellowDark">
            Reviewer checklist
          </div>
          <h1 className="mt-1 text-3xl font-extrabold tracking-tight">Walk every screen</h1>
          <p className="mt-1 max-w-xl text-sm text-porter-mute">
            {screens.length} screens · {comments.length} comments ({unresolved} open) · {visitedRoutes.length} screens visited
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={exportFeedback}
            className="inline-flex items-center gap-1.5 rounded-full bg-porter-ink px-3 py-1.5 text-xs font-bold text-porter-yellow"
          >
            <Download size={12} /> Export feedback
          </button>
          <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-full border border-porter-line bg-white px-3 py-1.5 text-xs font-bold">
            <Upload size={12} /> Import
            <input
              type="file"
              accept="application/json"
              className="hidden"
              onChange={async (e) => {
                const f = e.target.files?.[0];
                if (!f) return;
                const replace = confirm("Replace existing? Cancel = merge.");
                await importFeedbackFile(f, replace);
                e.target.value = "";
              }}
            />
          </label>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-3">
        <Tabs value={sel} onChange={setSel} options={personaTabs} />
        <Tabs
          value={filter}
          onChange={(v) => setFilter(v as typeof filter)}
          options={[
            { value: "all", label: "All" },
            { value: "with-comments", label: "With comments" },
            { value: "unvisited", label: "Not yet visited" },
          ]}
        />
      </div>

      <Card>
        <ul className="divide-y divide-porter-line">
          {rows.map((s) => {
            const sc = comments.filter((c) => c.route === s.route);
            const openCount = sc.filter((c) => !c.resolved).length;
            const visited = visitedRoutes.includes(s.route);
            return (
              <li key={s.persona + s.id} className="flex items-center gap-4 px-4 py-3 hover:bg-porter-cloud">
                <span className="shrink-0">
                  {visited ? (
                    <CheckCircle2 className="text-porter-good" size={18} />
                  ) : (
                    <Circle className="text-porter-line" size={18} />
                  )}
                </span>
                <span className="shrink-0 rounded bg-porter-ink px-1.5 py-0.5 font-mono text-[10px] font-bold uppercase text-porter-yellow">
                  {s.persona}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-sm font-semibold">{s.label}</div>
                  <div className="truncate text-xs text-porter-mute">{s.description}</div>
                </div>
                {openCount > 0 && (
                  <Pill tone="warn">
                    <MessageSquare size={10} className="inline" /> {openCount}
                  </Pill>
                )}
                {sc.length > 0 && openCount === 0 && <Pill tone="good">resolved</Pill>}
                <Link
                  to={s.route}
                  className="shrink-0 rounded-full bg-porter-yellow px-3 py-1 text-xs font-bold text-porter-ink hover:brightness-95"
                >
                  Open →
                </Link>
              </li>
            );
          })}
        </ul>
      </Card>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {(["blocker", "issue", "nit", "idea"] as const).map((sev) => {
          const list = comments.filter((c) => c.severity === sev);
          return (
            <Card key={sev} className="p-4">
              <div className="flex items-center justify-between">
                <div className="text-[11px] font-bold uppercase tracking-wider text-porter-mute">{sev}s</div>
                <Pill tone={sev === "blocker" ? "bad" : sev === "issue" ? "warn" : sev === "idea" ? "yellow" : "neutral"}>
                  {list.length}
                </Pill>
              </div>
              <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-xs">
                {list.slice(0, 6).map((c) => (
                  <li key={c.id} className="truncate text-porter-mute">
                    · {c.body}
                  </li>
                ))}
                {list.length === 0 && <li className="text-porter-mute">No {sev}s logged.</li>}
              </ul>
            </Card>
          );
        })}
      </div>
    </PorterLayout>
  );
}
