const COLORS: Record<string, string> = {
  INTAKE: "bg-slate-600",
  DEV: "bg-blue-600",
  QA: "bg-amber-600",
  REVIEW: "bg-violet-600",
  CI: "bg-cyan-600",
  HEAL: "bg-orange-600",
  DONE: "bg-emerald-600",
  BLOCKED: "bg-rose-700",
  FAILED: "bg-rose-600",
};

export default function StatusBadge({ status }: { status: string }) {
  const cls = COLORS[status] ?? "bg-slate-700";
  return (
    <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium text-white ${cls}`}>
      {status}
    </span>
  );
}
