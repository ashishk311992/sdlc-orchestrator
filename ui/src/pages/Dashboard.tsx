import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, Run, Summary } from "../lib/api";
import { useEventStream } from "../lib/stream";
import StatusBadge from "../components/StatusBadge";

export default function Dashboard() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [runs, setRuns] = useState<Run[]>([]);
  const [err, setErr] = useState<string>("");

  async function refresh() {
    try {
      const [s, r] = await Promise.all([
        api<Summary>("/api/dashboard/summary"),
        api<{ items: Run[] }>("/api/dashboard/runs?limit=100"),
      ]);
      setSummary(s);
      setRuns(r.items);
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    refresh();
    const t = setInterval(refresh, 10000);
    return () => clearInterval(t);
  }, []);

  const { connected } = useEventStream(() => refresh());

  if (err === "unauthorized") {
    window.location.reload();
    return null;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Autonomous SDLC</h1>
          <p className="text-sm text-muted">
            Dev · QA · Reviewer · Healer — self-running pipeline
          </p>
        </div>
        <div className="flex items-center gap-2 text-sm">
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              connected ? "bg-emerald-400" : "bg-slate-500"
            }`}
          />
          <span className="text-muted">{connected ? "live" : "polling"}</span>
        </div>
      </header>

      <section className="grid grid-cols-2 gap-3 md:grid-cols-5">
        <Stat label="Total runs" value={summary?.total ?? "—"} />
        <Stat label="Last 24h" value={summary?.last_24h ?? "—"} />
        <Stat label="Shipped 24h" value={summary?.done_24h ?? "—"} tone="good" />
        <Stat label="Failed 24h" value={summary?.failed_24h ?? "—"} tone="bad" />
        <Stat
          label="In flight"
          value={
            summary
              ? Object.entries(summary.by_status)
                  .filter(([k]) => !["DONE", "FAILED", "BLOCKED"].includes(k))
                  .reduce((n, [, v]) => n + v, 0)
              : "—"
          }
        />
      </section>

      <section className="rounded-xl border border-border bg-panel">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          Recent runs
        </div>
        <div className="divide-y divide-border">
          {runs.length === 0 && (
            <div className="px-4 py-6 text-center text-sm text-muted">No runs yet.</div>
          )}
          {runs.map((r) => (
            <Link
              key={r.id}
              to={`/dashboard/runs/${r.id}`}
              className="grid grid-cols-12 items-center gap-3 px-4 py-3 hover:bg-bg"
            >
              <div className="col-span-1 font-mono text-xs text-muted">
                {r.issue_identifier}
              </div>
              <div className="col-span-6 truncate">{r.title}</div>
              <div className="col-span-2">
                <StatusBadge status={r.status} />
              </div>
              <div className="col-span-2 text-xs text-muted">
                {r.pr_number ? `PR #${r.pr_number}` : r.branch ?? "—"}
              </div>
              <div className="col-span-1 text-right text-xs text-muted">
                {new Date(r.updated_at).toLocaleTimeString()}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number | string;
  tone?: "good" | "bad";
}) {
  const color =
    tone === "good" ? "text-emerald-400" : tone === "bad" ? "text-rose-400" : "text-slate-100";
  return (
    <div className="rounded-xl border border-border bg-panel p-4">
      <div className="text-xs uppercase tracking-wide text-muted">{label}</div>
      <div className={`mt-1 text-2xl font-semibold ${color}`}>{value}</div>
    </div>
  );
}
