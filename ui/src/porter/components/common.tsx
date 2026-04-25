import { ReactNode } from "react";

export function Card({ className = "", children }: { className?: string; children: ReactNode }) {
  return <div className={`rounded-2xl border border-porter-line bg-white ${className}`}>{children}</div>;
}

export function SectionTitle({ kicker, title, desc }: { kicker?: string; title: string; desc?: string }) {
  return (
    <div>
      {kicker && <div className="text-[11px] font-bold uppercase tracking-wider text-porter-yellowDark">{kicker}</div>}
      <h2 className="mt-1 text-2xl font-extrabold tracking-tight">{title}</h2>
      {desc && <p className="mt-1 max-w-2xl text-sm text-porter-mute">{desc}</p>}
    </div>
  );
}

export function Pill({
  tone = "neutral",
  children,
}: {
  tone?: "neutral" | "good" | "warn" | "bad" | "yellow" | "ink";
  children: ReactNode;
}) {
  const toneMap: Record<string, string> = {
    neutral: "bg-porter-cloud text-porter-mute",
    good: "bg-porter-good/10 text-porter-good",
    warn: "bg-porter-warn/10 text-porter-warn",
    bad: "bg-porter-bad/10 text-porter-bad",
    yellow: "bg-porter-yellow text-porter-ink",
    ink: "bg-porter-ink text-porter-yellow",
  };
  return (
    <span className={`rounded-full px-2 py-0.5 text-[11px] font-bold ${toneMap[tone]}`}>{children}</span>
  );
}

export function Kpi({ label, value, sub, tone = "ink" }: { label: string; value: string; sub?: string; tone?: "ink" | "good" | "warn" | "bad" }) {
  const subTone = tone === "good" ? "text-porter-good" : tone === "warn" ? "text-porter-warn" : tone === "bad" ? "text-porter-bad" : "text-porter-mute";
  return (
    <Card className="p-4">
      <div className="text-[11px] font-semibold uppercase tracking-wider text-porter-mute">{label}</div>
      <div className="mt-1 text-2xl font-extrabold">{value}</div>
      {sub && <div className={`text-xs ${subTone}`}>{sub}</div>}
    </Card>
  );
}

export function Empty({ title, body, icon }: { title: string; body: string; icon?: ReactNode }) {
  return (
    <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-dashed border-porter-line bg-white p-10 text-center">
      <div className="mb-3 text-3xl">{icon ?? "📭"}</div>
      <div className="text-sm font-bold">{title}</div>
      <p className="mt-1 max-w-md text-sm text-porter-mute">{body}</p>
    </div>
  );
}

export function Bar({ value, tone = "yellow" }: { value: number; tone?: "yellow" | "good" | "warn" | "bad" | "ink" }) {
  const bg: Record<string, string> = {
    yellow: "bg-porter-yellow",
    good: "bg-porter-good",
    warn: "bg-porter-warn",
    bad: "bg-porter-bad",
    ink: "bg-porter-ink",
  };
  return (
    <div className="h-1.5 w-full overflow-hidden rounded-full bg-porter-line">
      <div className={`h-full ${bg[tone]}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
    </div>
  );
}

export function Tabs<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div className="flex flex-wrap gap-1 rounded-full border border-porter-line bg-white p-1">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => onChange(o.value)}
          className={[
            "rounded-full px-3 py-1.5 text-xs font-semibold transition",
            value === o.value ? "bg-porter-ink text-white" : "text-porter-mute hover:bg-porter-cloud",
          ].join(" ")}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[11px] font-semibold uppercase tracking-wider text-porter-mute">{label}</div>
      <div className="mt-0.5 text-sm font-bold">{value}</div>
    </div>
  );
}

export function FakeMap({ height = 160, label }: { height?: number; label?: string }) {
  return (
    <div
      className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#E8F0E6] via-[#F4EFD8] to-[#E6EEF6]"
      style={{ height }}
    >
      <div className="absolute inset-0 opacity-60">
        <div className="absolute left-4 top-6 h-0.5 w-40 rotate-12 bg-white/80" />
        <div className="absolute left-10 top-16 h-0.5 w-48 -rotate-6 bg-white/80" />
        <div className="absolute left-2 top-24 h-0.5 w-36 rotate-3 bg-white/80" />
        <div className="absolute right-4 top-10 h-0.5 w-32 rotate-6 bg-white/80" />
      </div>
      <div className="absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-porter-yellow text-sm shadow-lg">
        🚚
      </div>
      {label && (
        <span className="absolute bottom-2 right-2 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-porter-ink">
          {label}
        </span>
      )}
    </div>
  );
}

export function BarChart({ bars, labels }: { bars: number[]; labels?: string[] }) {
  return (
    <div className="mt-4 flex h-40 items-end gap-2">
      {bars.map((h, i) => (
        <div key={i} className="flex flex-1 flex-col items-center gap-1">
          <div className="w-full rounded-t-md bg-porter-yellow" style={{ height: `${h}%` }} />
          <span className="text-[10px] text-porter-mute">{labels?.[i] ?? i + 1}</span>
        </div>
      ))}
    </div>
  );
}
