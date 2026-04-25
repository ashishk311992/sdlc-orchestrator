import { Link } from "react-router-dom";
import { ArrowRight, Download, MessageSquare, Sparkles } from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import { Card, Kpi } from "../components/common";
import { personas } from "../store/persona";
import { exportFeedback, useFeedback } from "../store/feedback";
import { screens } from "../data/screens";

export default function Landing() {
  const { comments } = useFeedback();
  const unresolved = comments.filter((c) => !c.resolved).length;

  return (
    <PorterLayout>
      {/* Hero */}
      <section className="overflow-hidden rounded-3xl bg-porter-ink p-8 text-white md:p-12">
        <div className="grid gap-8 md:grid-cols-2 md:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-porter-yellow/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-porter-yellow">
              <Sparkles size={12} /> CTO / CPO walkthrough prototype
            </div>
            <h1 className="mt-4 text-4xl font-black leading-[1.05] tracking-tight md:text-5xl">
              Every Porter flow,
              <br />
              <span className="text-porter-yellow">one clickable prototype.</span>
            </h1>
            <p className="mt-4 max-w-xl text-sm text-white/70">
              Seven personas · {screens.length} screens · no backend. Click through any journey,
              leave inline feedback, export comments as JSON.
            </p>
            <div className="mt-6 flex flex-wrap gap-2">
              <Link
                to="/porter/customer"
                className="inline-flex items-center gap-1.5 rounded-full bg-porter-yellow px-5 py-2.5 text-sm font-bold text-porter-ink hover:brightness-95"
              >
                Start as a customer <ArrowRight size={14} />
              </Link>
              <Link
                to="/porter/review"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/20 px-5 py-2.5 text-sm font-bold text-white hover:bg-white/10"
              >
                Review checklist
              </Link>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
            {[
              { k: "Personas", v: "7" },
              { k: "Screens", v: String(screens.length) },
              { k: "Flows wired", v: "40+" },
              { k: "Backend", v: "None" },
              { k: "Hostable", v: "GH Pages" },
              { k: "Feedback", v: unresolved ? `${unresolved} open` : "Built-in" },
            ].map((s) => (
              <div key={s.k} className="rounded-2xl border border-white/10 bg-white/5 p-3">
                <div className="text-[10px] font-bold uppercase tracking-wider text-white/60">{s.k}</div>
                <div className="text-xl font-extrabold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Persona grid */}
      <section className="mt-10">
        <div className="mb-4 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Pick a persona</h2>
            <p className="text-sm text-porter-mute">Jump into any surface. Every screen has a feedback bubble bottom-right.</p>
          </div>
          <span className="hidden rounded-full border border-porter-line bg-white px-3 py-1 text-xs font-semibold text-porter-mute md:inline">
            ⌘K to switch any time
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {personas.map((p) => {
            const count = screens.filter((s) => s.persona === p.id).length;
            const Icon = p.icon;
            return (
              <Link
                key={p.id}
                to={p.path}
                className="group relative overflow-hidden rounded-2xl border border-porter-line bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
              >
                <div className={`mb-4 flex h-11 w-11 items-center justify-center rounded-xl ${p.color}`}>
                  <Icon size={20} />
                </div>
                <div className="text-xs font-bold uppercase tracking-wider text-porter-yellowDark">{p.platform}</div>
                <div className="mt-0.5 text-xl font-extrabold">{p.label}</div>
                <p className="mt-1 text-sm text-porter-mute">{p.tagline}</p>
                <div className="mt-4 flex items-center justify-between text-xs">
                  <span className="rounded-full bg-porter-cloud px-2 py-0.5 font-semibold text-porter-mute">
                    {count} screens
                  </span>
                  <span className="font-bold text-porter-ink group-hover:underline">Enter →</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Feedback meta */}
      <section className="mt-10 grid gap-4 md:grid-cols-3">
        <Kpi label="Comments (all)" value={String(comments.length)} sub={`${unresolved} unresolved`} tone={unresolved ? "warn" : "good"} />
        <Kpi label="Screens visited" value={String(useFeedback.getState().visitedRoutes.length)} sub="Stored locally" />
        <Card className="p-4">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-porter-mute">Send feedback back</div>
          <div className="mt-1 text-sm text-porter-mute">
            Click <span className="font-bold text-porter-ink">Feedback</span> bottom-right on any screen, then export JSON and email it back.
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={exportFeedback}
              className="inline-flex items-center gap-1.5 rounded-full bg-porter-ink px-3 py-1.5 text-xs font-bold text-porter-yellow"
            >
              <Download size={12} /> Export now
            </button>
            <Link
              to="/porter/review"
              className="inline-flex items-center gap-1.5 rounded-full border border-porter-line px-3 py-1.5 text-xs font-bold"
            >
              <MessageSquare size={12} /> Open review
            </Link>
          </div>
        </Card>
      </section>

      {/* Tech disclaimer */}
      <p className="mt-10 text-center text-[11px] text-porter-mute">
        No tracking · no analytics · no backend · all feedback stays in your browser until you export.
      </p>
    </PorterLayout>
  );
}
