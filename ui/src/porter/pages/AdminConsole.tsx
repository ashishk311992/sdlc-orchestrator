import { useState } from "react";
import {
  LayoutDashboard, Radar, Users, Truck, TrendingUp, Megaphone, ShieldAlert, Send, ToggleLeft, Lock, ScrollText, Map,
} from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import DesktopShell from "../components/DesktopShell";
import { Card, Kpi, Pill, SectionTitle, BarChart, Tabs, FakeMap, Bar } from "../components/common";
import { useSubscreen } from "../hooks/useSubscreen";
import { drivers, cities } from "../data/mock";

export default function AdminConsole() {
  const [sid, setSid] = useSubscreen("overview");
  return (
    <PorterLayout>
      <DesktopShell
        kicker="Porter internal"
        title="Ops console · Bengaluru"
        subtitle="City lead: Shruti N. · Ops online"
        activeId={sid}
        onSelect={setSid}
        nav={[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "live", label: "Live orders", icon: Radar },
          { id: "drivers", label: "Driver ops", icon: Users },
          { id: "vehicles", label: "Fleet", icon: Truck },
          { id: "surge", label: "Surge & pricing", icon: TrendingUp },
          { id: "campaigns", label: "Campaigns", icon: Megaphone },
          { id: "fraud", label: "Fraud & risk", icon: ShieldAlert },
          { id: "comms", label: "Comms composer", icon: Send },
          { id: "flags", label: "Feature flags", icon: ToggleLeft },
          { id: "rbac", label: "RBAC", icon: Lock },
          { id: "audit", label: "Audit log", icon: ScrollText },
          { id: "cities", label: "Cities & zones", icon: Map },
        ]}
      >
        {render(sid)}
      </DesktopShell>
    </PorterLayout>
  );
}

function render(id: string) {
  switch (id) {
    case "overview": return <Overview />;
    case "live": return <Live />;
    case "drivers": return <DriverOps />;
    case "vehicles": return <FleetSnap />;
    case "surge": return <Surge />;
    case "campaigns": return <Campaigns />;
    case "fraud": return <Fraud />;
    case "comms": return <Comms />;
    case "flags": return <Flags />;
    case "rbac": return <Rbac />;
    case "audit": return <Audit />;
    case "cities": return <Cities />;
    default: return <Overview />;
  }
}

function Overview() {
  return (
    <div className="space-y-6">
      <SectionTitle kicker="Today · realtime" title="City overview" desc="KPIs and supply heatmap for Bengaluru." />
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Active trips" value="1,284" sub="Peak hour" />
        <Kpi label="Drivers online" value="3,482" sub="81% duty-rate" tone="good" />
        <Kpi label="ETA compliance" value="93.1%" sub="SLA 95%" tone="warn" />
        <Kpi label="Cancel rate" value="6.2%" sub="+1.1pp vs avg" tone="bad" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="mb-2 flex items-center justify-between text-sm"><b>Demand heatmap</b><Pill tone="warn">Surge suggested in HSR, Whitefield</Pill></div>
          <FakeMap height={280} label="3,482 drivers online" />
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold">Top bottlenecks</div>
          <ul className="mt-3 space-y-3 text-xs">
            <li><div className="flex justify-between font-bold">Whitefield <span className="text-porter-bad">22% surge ready</span></div><Bar value={82} tone="bad" /></li>
            <li><div className="flex justify-between font-bold">HSR Layout <span className="text-porter-warn">+15% ETA</span></div><Bar value={65} tone="warn" /></li>
            <li><div className="flex justify-between font-bold">Koramangala <span className="text-porter-good">Healthy</span></div><Bar value={32} tone="good" /></li>
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Live() {
  const rows = [
    { id: "ORD-22041", c: "Anita R.", d: "Ravi K.", v: "Tata Ace", stage: "En-route to pickup", tone: "warn" },
    { id: "ORD-22040", c: "Rohit M.", d: "Suresh N.", v: "Pickup 8ft", stage: "Loading", tone: "yellow" },
    { id: "ORD-22039", c: "Neha B.", d: "Mahesh D.", v: "Tempo", stage: "In transit", tone: "good" },
    { id: "ORD-22038", c: "Arun T.", d: "Deepa S.", v: "Tata Ace EV", stage: "Delivered", tone: "good" },
    { id: "ORD-22037", c: "Priya V.", d: "Unassigned", v: "2-Wheeler", stage: "Searching 2m 11s", tone: "bad" },
  ];
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Realtime" title="Live orders" />
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Order</th><th>Customer</th><th>Driver</th><th>Vehicle</th><th>Stage</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-b border-porter-line last:border-0 hover:bg-porter-cloud">
                <td className="px-4 py-3 font-mono text-xs">{r.id}</td>
                <td>{r.c}</td><td>{r.d}</td><td>{r.v}</td>
                <td><Pill tone={r.tone as "warn" | "yellow" | "good" | "bad"}>{r.stage}</Pill></td>
                <td className="text-right text-xs"><button className="font-bold text-porter-ink">Intervene</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DriverOps() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Partner care" title="Driver operations" />
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Pending KYC" value="82" tone="warn" />
        <Kpi label="Flagged ratings" value="14" tone="bad" />
        <Kpi label="Active partners" value="34,120" tone="good" />
        <Kpi label="Churn (30d)" value="2.8%" />
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Driver</th><th>Rating</th><th>Trips</th><th>Status</th><th>Flags</th><th></th></tr>
          </thead>
          <tbody>
            {drivers.map((d, i) => (
              <tr key={d.name} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-bold">{d.name}</td>
                <td>{d.rating}★</td><td>{d.trips}</td>
                <td><Pill tone={i === 1 ? "warn" : "good"}>{i === 1 ? "Under review" : "Active"}</Pill></td>
                <td className="text-xs">{i === 1 ? "Customer complaint · 2" : "—"}</td>
                <td className="text-right text-xs"><button className="font-bold text-porter-ink">Open</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function FleetSnap() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Network" title="Fleet snapshot" />
      <div className="grid gap-3 md:grid-cols-5">
        <Kpi label="2-Wheeler" value="8,214" sub="92% active" />
        <Kpi label="3-Wheeler" value="2,104" sub="88% active" />
        <Kpi label="Mini truck" value="12,822" sub="84% active" />
        <Kpi label="Tempo" value="4,921" sub="90% active" />
        <Kpi label="Pickup 8ft" value="3,205" sub="86% active" />
      </div>
      <Card className="p-5">
        <div className="text-sm font-bold">Utilisation by vehicle class (today)</div>
        <BarChart bars={[72, 68, 84, 90, 86]} labels={["2W", "3W", "Mini", "Tempo", "Pickup"]} />
      </Card>
    </div>
  );
}

function Surge() {
  const [v, setV] = useState(1.4);
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Pricing" title="Surge & multiplier" desc="Apply city-wide or zone multipliers and monitor elasticity." />
      <Card className="p-5">
        <div className="text-sm font-bold">City multiplier</div>
        <div className="mt-3 flex items-center gap-4">
          <input type="range" min={1} max={2.5} step={0.1} value={v} onChange={(e) => setV(+e.target.value)} className="flex-1 accent-porter-yellow" />
          <Pill tone="yellow">{v.toFixed(1)}×</Pill>
        </div>
        <div className="mt-4 grid grid-cols-4 gap-2 text-xs">
          {["HSR", "Whitefield", "Koramangala", "Indiranagar"].map((z, i) => (
            <div key={z} className="rounded-xl border border-porter-line p-3">
              <div className="font-bold">{z}</div>
              <div className="text-porter-mute">{[1.6, 1.8, 1.2, 1.3][i]}×</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function Campaigns() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="Growth" title="Campaigns & promos" />
        <button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">+ New campaign</button>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Code</th><th>Title</th><th>Audience</th><th>Status</th><th>Redeems</th><th>Spend</th></tr>
          </thead>
          <tbody>
            {[
              ["PORTER50", "50% off new users", "New · Bengaluru", "good", 12041, 604050],
              ["WEEKEND", "Weekend ₹75 off", "All · Bengaluru", "good", 8420, 210500],
              ["ENT20", "Enterprise onboarding", "B2B", "warn", 42, 88000],
            ].map((r) => (
              <tr key={String(r[0])} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r[0]}</td>
                <td>{r[1]}</td><td className="text-xs">{r[2]}</td>
                <td><Pill tone={r[3] as "good" | "warn"}>{r[3] === "good" ? "Live" : "Paused"}</Pill></td>
                <td>{(r[4] as number).toLocaleString()}</td>
                <td>₹{(r[5] as number).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Fraud() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Risk" title="Fraud & anomaly review" />
      <div className="grid gap-3 md:grid-cols-3">
        <Kpi label="Flagged trips 24h" value="48" tone="warn" />
        <Kpi label="Auto-blocked" value="12" tone="bad" />
        <Kpi label="False positives" value="3.1%" tone="good" />
      </div>
      <Card>
        <ul className="divide-y divide-porter-line text-sm">
          {[
            { id: "ORD-21990", sig: "Driver + customer same device", score: 92 },
            { id: "ORD-21988", sig: "Unusual route backtrack", score: 78 },
            { id: "ORD-21979", sig: "Referral loop detected", score: 84 },
          ].map((f) => (
            <li key={f.id} className="flex items-center gap-3 px-4 py-3">
              <span className="font-mono text-xs">{f.id}</span>
              <span className="flex-1 text-xs">{f.sig}</span>
              <Pill tone={f.score > 85 ? "bad" : "warn"}>Risk {f.score}</Pill>
              <button className="rounded-lg border border-porter-line px-3 py-1 text-xs font-bold">Review</button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Comms() {
  const [ch, setCh] = useState<"push" | "sms" | "email">("push");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="Broadcast" title="Comms composer" />
        <Tabs value={ch} onChange={setCh} options={[{ value: "push", label: "Push" }, { value: "sms", label: "SMS" }, { value: "email", label: "Email" }]} />
      </div>
      <Card className="p-5 space-y-3">
        <label className="block"><span className="text-[11px] font-bold uppercase text-porter-mute">Audience</span>
          <select className="mt-1 w-full rounded-xl border border-porter-line px-3 py-2 text-sm"><option>All Bengaluru customers</option><option>Inactive 30d</option><option>Enterprise</option></select>
        </label>
        <label className="block"><span className="text-[11px] font-bold uppercase text-porter-mute">Title</span>
          <input defaultValue="Monsoon surcharge update" className="mt-1 w-full rounded-xl border border-porter-line px-3 py-2 text-sm" />
        </label>
        <label className="block"><span className="text-[11px] font-bold uppercase text-porter-mute">Body</span>
          <textarea rows={4} defaultValue="From May 1, a ₹20 monsoon surcharge applies during heavy-rain alerts." className="mt-1 w-full rounded-xl border border-porter-line px-3 py-2 text-sm" />
        </label>
        <div className="flex items-center justify-between">
          <Pill tone="neutral">Est. reach 2.4M</Pill>
          <div className="flex gap-2"><button className="rounded-xl border border-porter-line px-4 py-2 text-xs font-bold">Schedule</button><button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">Send now</button></div>
        </div>
      </Card>
    </div>
  );
}

function Flags() {
  const flags = [
    { k: "checkout_new_fare_ui", desc: "New fare breakdown layout", on: true, roll: 42 },
    { k: "driver_ev_incentive", desc: "EV partner incentive ladder", on: true, roll: 100 },
    { k: "packers_survey_v2", desc: "Rebuilt packers survey flow", on: false, roll: 0 },
    { k: "comms_whatsapp", desc: "WhatsApp delivery updates", on: true, roll: 18 },
  ];
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Rollouts" title="Feature flags" />
      <Card>
        <ul className="divide-y divide-porter-line">
          {flags.map((f) => (
            <li key={f.k} className="flex items-center gap-4 px-4 py-3">
              <div className="flex-1"><div className="font-mono text-xs">{f.k}</div><div className="text-[11px] text-porter-mute">{f.desc}</div></div>
              <div className="w-40"><Bar value={f.roll} tone={f.on ? "good" : "bad"} /><div className="text-[10px] text-porter-mute">{f.roll}% rollout</div></div>
              <Pill tone={f.on ? "good" : "neutral"}>{f.on ? "On" : "Off"}</Pill>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function Rbac() {
  const roles = [
    { r: "Super Admin", n: 4, scopes: "Full access" },
    { r: "City Lead", n: 28, scopes: "City-scoped ops" },
    { r: "Support Agent", n: 412, scopes: "Tickets, refunds < ₹2k" },
    { r: "Finance", n: 18, scopes: "Payouts, invoices" },
    { r: "Viewer", n: 120, scopes: "Read-only" },
  ];
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Access" title="Roles & permissions" />
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Role</th><th>People</th><th>Scopes</th></tr>
          </thead>
          <tbody>
            {roles.map((r) => (
              <tr key={r.r} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-bold">{r.r}</td>
                <td>{r.n}</td><td className="text-xs text-porter-mute">{r.scopes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Audit() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Trail" title="Audit log" />
      <Card>
        <ul className="divide-y divide-porter-line text-xs font-mono">
          {[
            "12:04:02  shruti.n@porter  →  updated surge HSR 1.4 → 1.8",
            "11:58:21  rohit.k@porter   →  approved shipment BS-4401 (₹1,24,100)",
            "11:42:10  ops-bot          →  auto-blocked driver DR-8821 (fraud)",
            "11:30:44  preeti.s@porter  →  added vehicle KA-14-LM-7721",
            "11:02:05  shruti.n@porter  →  toggled flag checkout_new_fare_ui 20 → 42%",
          ].map((l) => <li key={l} className="px-4 py-2">{l}</li>)}
        </ul>
      </Card>
    </div>
  );
}

function Cities() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Expansion" title="Cities & zones" />
      <div className="grid gap-3 md:grid-cols-4">
        {cities.map((c) => (
          <Card key={c} className="p-4">
            <div className="font-bold">{c}</div>
            <div className="text-[11px] text-porter-mute">{Math.floor(2 + Math.random() * 20)} zones</div>
            <div className="mt-2 flex gap-2"><Pill tone="good">Live</Pill><Pill tone="neutral">T1</Pill></div>
          </Card>
        ))}
      </div>
    </div>
  );
}
