import { useState } from "react";
import { Inbox, MessageSquare, MessagesSquare, BookOpen, BarChart3 } from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import DesktopShell from "../components/DesktopShell";
import { Card, Kpi, Pill, SectionTitle, BarChart, Tabs } from "../components/common";
import { useSubscreen } from "../hooks/useSubscreen";
import { tickets } from "../data/mock";

export default function SupportConsole() {
  const [sid, setSid] = useSubscreen("queue");
  return (
    <PorterLayout>
      <DesktopShell
        kicker="Support · L1"
        title="Agent workspace"
        subtitle="You are on duty · 4 open tickets"
        activeId={sid}
        onSelect={setSid}
        nav={[
          { id: "queue", label: "Ticket queue", icon: Inbox },
          { id: "ticket", label: "Ticket detail", icon: MessageSquare },
          { id: "chat", label: "Live chat", icon: MessagesSquare },
          { id: "kb", label: "Knowledge base", icon: BookOpen },
          { id: "quality", label: "QA scores", icon: BarChart3 },
        ]}
      >
        {render(sid)}
      </DesktopShell>
    </PorterLayout>
  );
}

function render(id: string) {
  switch (id) {
    case "queue": return <Queue />;
    case "ticket": return <Detail />;
    case "chat": return <Chat />;
    case "kb": return <Kb />;
    case "quality": return <Qa />;
    default: return <Queue />;
  }
}

function Queue() {
  const [tab, setTab] = useState<"mine" | "all" | "breached">("mine");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="Inbox" title="Ticket queue" />
        <Tabs value={tab} onChange={setTab} options={[{ value: "mine", label: "Mine (4)" }, { value: "all", label: "All (128)" }, { value: "breached", label: "Breached (2)" }]} />
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Ticket</th><th>Subject</th><th>Customer</th><th>Priority</th><th>SLA</th><th>Status</th></tr>
          </thead>
          <tbody>
            {tickets.map((t) => (
              <tr key={t.id} className="border-b border-porter-line last:border-0 hover:bg-porter-cloud">
                <td className="px-4 py-3 font-mono text-xs">{t.id}</td>
                <td>{t.subject}</td>
                <td>{t.customer}</td>
                <td><Pill tone={t.priority === "High" ? "bad" : t.priority === "Medium" ? "warn" : "neutral"}>{t.priority}</Pill></td>
                <td><Pill tone={t.sla === "Breached" ? "bad" : "warn"}>{t.sla}</Pill></td>
                <td><Pill tone={t.status === "Resolved" ? "good" : t.status === "Open" ? "warn" : "neutral"}>{t.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Detail() {
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_340px]">
      <div className="space-y-4">
        <SectionTitle kicker="T-24010" title="Overcharged by ₹120" />
        <Card className="p-4 space-y-3">
          <Bubble who="customer" name="Anita R." time="12:04">Hi, I was charged ₹842 but the estimate was ₹722. Please refund the difference.</Bubble>
          <Bubble who="system" name="System" time="12:04">Trip TRP-9921 attached · Tata Ace · 18.4 km · Driver Ravi K.</Bubble>
          <Bubble who="agent" name="You" time="12:08">Hi Anita, checking the trip now. The difference is due to a 25-minute wait time at pickup. Would you like me to share the breakdown?</Bubble>
          <Bubble who="customer" name="Anita R." time="12:09">Yes please.</Bubble>
        </Card>
        <Card className="p-3">
          <textarea placeholder="Type a reply… (⌘↵ to send)" className="w-full resize-none rounded-xl border border-porter-line px-3 py-2 text-sm outline-none" rows={3} />
          <div className="mt-2 flex items-center justify-between text-xs">
            <button className="rounded-lg border border-porter-line px-3 py-1 font-bold">Insert canned</button>
            <div className="flex gap-2">
              <button className="rounded-xl border border-porter-line px-4 py-2 font-bold">Refund ₹120</button>
              <button className="rounded-xl bg-porter-ink px-4 py-2 font-bold text-white">Send</button>
            </div>
          </div>
        </Card>
      </div>
      <div className="space-y-3">
        <Card className="p-4">
          <div className="text-xs font-bold uppercase text-porter-mute">Customer</div>
          <div className="mt-1 font-bold">Anita R.</div>
          <div className="text-xs text-porter-mute">+91 98450 •••• · Bengaluru</div>
          <div className="mt-2 text-xs">Lifetime trips: <b>42</b> · Rating: <b>4.8★</b></div>
        </Card>
        <Card className="p-4 text-xs">
          <div className="font-bold uppercase text-porter-mute">Trip TRP-9921</div>
          <ul className="mt-2 space-y-1">
            <li>Fare estimate: ₹722</li>
            <li>Actual fare: ₹842</li>
            <li>Wait time charge: ₹120</li>
            <li>Tolls: ₹30</li>
          </ul>
        </Card>
        <Card className="p-4 text-xs">
          <div className="font-bold uppercase text-porter-mute">Actions</div>
          <ul className="mt-2 space-y-1">
            <li><button className="font-bold text-porter-ink">· Full refund</button></li>
            <li><button className="font-bold text-porter-ink">· Goodwill credit ₹100</button></li>
            <li><button className="font-bold text-porter-ink">· Escalate to L2</button></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Bubble({ who, name, time, children }: { who: "customer" | "agent" | "system"; name: string; time: string; children: string }) {
  const mineBg = who === "agent" ? "bg-porter-ink text-white" : who === "system" ? "bg-porter-cloud text-porter-mute italic" : "bg-white border border-porter-line";
  return (
    <div className={`rounded-xl p-3 text-sm ${mineBg}`}>
      <div className="mb-1 flex items-center justify-between text-[10px] uppercase opacity-70"><span>{name}</span><span>{time}</span></div>
      <div>{children}</div>
    </div>
  );
}

function Chat() {
  return (
    <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
      <Card className="p-2">
        {["Anita R.", "Rohit M.", "Neha B.", "Arun T."].map((n, i) => (
          <button key={n} className={`flex w-full items-center gap-2 rounded-lg p-2 text-left text-sm ${i === 0 ? "bg-porter-cloud" : ""}`}>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-porter-yellow font-bold">{n[0]}</span>
            <span className="flex-1"><div className="font-bold">{n}</div><div className="text-[11px] text-porter-mute">Typing…</div></span>
            {i === 0 && <Pill tone="bad">3</Pill>}
          </button>
        ))}
      </Card>
      <Card className="flex h-[560px] flex-col">
        <div className="flex items-center justify-between border-b border-porter-line p-3">
          <div className="font-bold">Anita R.</div>
          <Pill tone="good">Online</Pill>
        </div>
        <div className="flex-1 space-y-2 overflow-y-auto p-3">
          <Bubble who="customer" name="Anita" time="12:04">Hello?</Bubble>
          <Bubble who="agent" name="You" time="12:05">Hi Anita, how can I help?</Bubble>
          <Bubble who="customer" name="Anita" time="12:06">Driver is asking for extra ₹100</Bubble>
        </div>
        <div className="flex gap-2 border-t border-porter-line p-3">
          <input placeholder="Message…" className="flex-1 rounded-xl border border-porter-line px-3 py-2 text-sm" />
          <button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">Send</button>
        </div>
      </Card>
    </div>
  );
}

function Kb() {
  const articles = [
    { t: "How to process a partial refund", views: 12400 },
    { t: "Wait-time charge policy (2026)", views: 8210 },
    { t: "Driver-initiated cancellation", views: 5801 },
    { t: "Damaged item — packers & movers", views: 4402 },
    { t: "Enterprise invoice dispute SOP", views: 2101 },
  ];
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Canned responses · SOPs" title="Knowledge base" />
      <Card>
        <ul className="divide-y divide-porter-line">
          {articles.map((a) => (
            <li key={a.t} className="flex items-center px-4 py-3">
              <span className="flex-1 text-sm font-bold">{a.t}</span>
              <span className="text-xs text-porter-mute">{a.views.toLocaleString()} views</span>
              <button className="ml-3 rounded-lg border border-porter-line px-3 py-1 text-xs font-bold">Open</button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Qa() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Quality" title="Your scorecard" />
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="CSAT" value="4.62" sub="Team 4.41" tone="good" />
        <Kpi label="FRT" value="42s" sub="Target < 60s" tone="good" />
        <Kpi label="Resolved / day" value="38" tone="good" />
        <Kpi label="QA score" value="92" sub="Last audit 2d ago" tone="good" />
      </div>
      <Card className="p-5">
        <div className="text-sm font-bold">Last 14 days · CSAT</div>
        <BarChart bars={[80, 85, 88, 82, 90, 92, 88, 85, 94, 91, 89, 93, 90, 92]} />
      </Card>
    </div>
  );
}
