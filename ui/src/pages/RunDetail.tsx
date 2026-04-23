import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api, Run, RunEvent } from "../lib/api";
import { useEventStream } from "../lib/stream";
import StatusBadge from "../components/StatusBadge";

type Detail = Run & { events: RunEvent[] };

const LEVEL_COLOR: Record<string, string> = {
  info: "text-slate-300",
  warn: "text-amber-400",
  warning: "text-amber-400",
  error: "text-rose-400",
  debug: "text-slate-500",
};

export default function RunDetail() {
  const { id = "" } = useParams();
  const [run, setRun] = useState<Detail | null>(null);
  const [err, setErr] = useState("");

  async function refresh() {
    try {
      setRun(await api<Detail>(`/api/dashboard/runs/${id}`));
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  }

  useEffect(() => {
    refresh();
  }, [id]);

  useEventStream((ev) => {
    if (ev.run_id === id) refresh();
  });

  if (err === "unauthorized") {
    window.location.reload();
    return null;
  }
  if (!run) {
    return <div className="p-6 text-muted">Loading…</div>;
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-6">
      <div>
        <Link to="/" className="text-sm text-accent hover:underline">
          ← back
        </Link>
      </div>
      <header className="rounded-xl border border-border bg-panel p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-mono text-xs text-muted">{run.issue_identifier}</div>
            <h1 className="mt-1 text-xl font-semibold">{run.title}</h1>
          </div>
          <StatusBadge status={run.status} />
        </div>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
          <Meta label="Branch" value={run.branch ?? "—"} />
          <Meta
            label="Pull request"
            value={run.pr_number ? `#${run.pr_number}` : "—"}
          />
          <Meta label="Heal attempts" value={String(run.heal_attempts)} />
          <Meta label="Updated" value={new Date(run.updated_at).toLocaleString()} />
        </dl>
        {run.description && (
          <pre className="mt-4 max-h-60 overflow-auto whitespace-pre-wrap rounded-md border border-border bg-bg p-3 text-xs text-slate-300">
            {run.description}
          </pre>
        )}
      </header>

      <section className="rounded-xl border border-border bg-panel">
        <div className="border-b border-border px-4 py-3 text-sm font-medium">
          Timeline ({run.events.length})
        </div>
        <ol className="max-h-[60vh] divide-y divide-border overflow-auto">
          {run.events.length === 0 && (
            <li className="px-4 py-6 text-center text-sm text-muted">No events yet.</li>
          )}
          {run.events.map((e) => (
            <li key={e.id} className="px-4 py-3 text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="rounded bg-bg px-1.5 py-0.5 font-mono text-[10px] uppercase text-muted">
                    {e.stage}
                  </span>
                  <span className={`text-xs ${LEVEL_COLOR[e.level] ?? "text-slate-300"}`}>
                    {e.level}
                  </span>
                </div>
                <span className="text-xs text-muted">
                  {new Date(e.created_at).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-1 whitespace-pre-wrap text-slate-200">{e.message}</div>
              {e.payload && Object.keys(e.payload).length > 0 && (
                <pre className="mt-2 overflow-auto rounded-md border border-border bg-bg p-2 text-[11px] text-slate-400">
                  {JSON.stringify(e.payload, null, 2)}
                </pre>
              )}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted">{label}</dt>
      <dd className="mt-0.5 text-slate-100">{value}</dd>
    </div>
  );
}
