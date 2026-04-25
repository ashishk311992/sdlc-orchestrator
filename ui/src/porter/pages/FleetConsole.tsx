import {
  LayoutDashboard, Truck, Users, Wallet, ShieldAlert, TrendingUp, Headphones,
} from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import DesktopShell from "../components/DesktopShell";
import { Card, Kpi, Pill, SectionTitle, Bar, BarChart, Tabs } from "../components/common";
import { useSubscreen } from "../hooks/useSubscreen";
import { drivers } from "../data/mock";
import { useState } from "react";

export default function FleetConsole() {
  const [sid, setSid] = useSubscreen("overview");
  return (
    <PorterLayout>
      <DesktopShell
        kicker="Fleet owner"
        title="Anil Logistics Pvt Ltd"
        subtitle="24 vehicles · 28 drivers · Bengaluru"
        activeId={sid}
        onSelect={setSid}
        nav={[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "vehicles", label: "Vehicles", icon: Truck },
          { id: "drivers", label: "Drivers", icon: Users },
          { id: "settlements", label: "Settlements", icon: Wallet },
          { id: "compliance", label: "Compliance", icon: ShieldAlert },
          { id: "analytics", label: "Analytics", icon: TrendingUp },
          { id: "support", label: "Support", icon: Headphones },
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
    case "vehicles": return <Vehicles />;
    case "drivers": return <DriversP />;
    case "settlements": return <Settlements />;
    case "compliance": return <Compliance />;
    case "analytics": return <Analytics />;
    case "support": return <Support />;
    default: return <Overview />;
  }
}

function Overview() {
  return (
    <div className="space-y-6">
      <SectionTitle kicker="Today · Bengaluru" title="Fleet snapshot" desc="Earnings, utilisation and alerts at a glance." />
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="Today earnings" value="₹82,450" sub="+12% vs yesterday" tone="good" />
        <Kpi label="Active vehicles" value="21 / 24" sub="3 on maintenance" />
        <Kpi label="Avg utilisation" value="74%" sub="11 trips/vehicle" />
        <Kpi label="Cancellations" value="4.1%" sub="Benchmark 5%" tone="good" />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Earnings last 7 days</div>
            <Pill tone="good">+18% WoW</Pill>
          </div>
          <BarChart bars={[55, 70, 62, 80, 88, 95, 74]} labels={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]} />
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold">Top performers</div>
          <ul className="mt-3 space-y-2 text-xs">
            {drivers.map((d, i) => (
              <li key={d.name} className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-porter-yellow font-bold">{i + 1}</span>
                <span className="flex-1"><b>{d.name}</b><div className="text-porter-mute">{d.trips} trips · {d.rating}★</div></span>
                <span className="font-extrabold">₹{(d.trips * 240).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <Card className="p-5">
        <div className="text-sm font-bold">Alerts</div>
        <ul className="mt-3 space-y-2 text-xs">
          <li className="flex items-center gap-2"><Pill tone="warn">Docs</Pill> 3 vehicles have insurance expiring this week</li>
          <li className="flex items-center gap-2"><Pill tone="bad">Idle</Pill> 2 drivers offline &gt; 48h</li>
          <li className="flex items-center gap-2"><Pill tone="good">Bonus</Pill> Fleet hit 200 trips → ₹2,000 bonus unlocked</li>
        </ul>
      </Card>
    </div>
  );
}

function Vehicles() {
  const rows = [
    { rc: "KA-01-AB-4823", type: "Tata Ace", driver: "Ravi Kumar", status: "Active", util: 86 },
    { rc: "KA-05-CJ-7712", type: "Tempo", driver: "Mahesh D.", status: "Active", util: 72 },
    { rc: "MH-02-GK-0918", type: "Pickup 8ft", driver: "Suresh N.", status: "Active", util: 91 },
    { rc: "KA-03-FG-1120", type: "Tata Ace EV", driver: "Deepa S.", status: "Active", util: 68 },
    { rc: "KA-09-HH-3302", type: "Tata Ace", driver: "—", status: "Maintenance", util: 0 },
    { rc: "KA-12-JK-5509", type: "3-Wheeler", driver: "Unassigned", status: "Idle", util: 0 },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="24 vehicles" title="Fleet" />
        <button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">+ Add vehicle</button>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">RC #</th><th>Type</th><th>Driver</th><th>Status</th><th>Utilisation</th><th></th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.rc} className="border-b border-porter-line last:border-0 hover:bg-porter-cloud">
                <td className="px-4 py-3 font-mono text-xs">{r.rc}</td>
                <td>{r.type}</td>
                <td>{r.driver}</td>
                <td><Pill tone={r.status === "Active" ? "good" : r.status === "Maintenance" ? "warn" : "neutral"}>{r.status}</Pill></td>
                <td className="w-40"><Bar value={r.util} /><div className="mt-1 text-[10px] text-porter-mute">{r.util}%</div></td>
                <td className="px-4 text-right text-xs"><button className="font-bold text-porter-ink">Manage</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function DriversP() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="28 drivers" title="Driver roster" />
      <div className="grid gap-3 md:grid-cols-2">
        {drivers.map((d) => (
          <Card key={d.name} className="p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-porter-yellow font-black">{d.name[0]}</div>
              <div className="flex-1">
                <div className="flex items-center gap-2 font-bold">{d.name}<Pill tone="good">Active</Pill></div>
                <div className="text-[11px] text-porter-mute">{d.vehicle}</div>
              </div>
              <div className="text-right text-xs">
                <div className="font-extrabold">{d.rating}★</div>
                <div className="text-porter-mute">{d.trips} trips</div>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-[11px]">
              <div><div className="text-porter-mute">Commission</div><div className="font-bold">15%</div></div>
              <div><div className="text-porter-mute">Shift</div><div className="font-bold">Day 8-8</div></div>
              <div><div className="text-porter-mute">This week</div><div className="font-bold">₹12,480</div></div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Settlements() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Weekly" title="Driver settlements" />
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Driver</th><th>Gross</th><th>Commission</th><th>Fuel</th><th>Net</th><th></th></tr>
          </thead>
          <tbody>
            {drivers.map((d) => (
              <tr key={d.name} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-bold">{d.name}</td>
                <td>₹14,820</td><td>₹2,223</td><td>₹1,200</td>
                <td className="font-extrabold">₹11,397</td>
                <td className="px-4 text-right text-xs"><button className="font-bold text-porter-ink">Payout</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Compliance() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Alerts" title="Compliance tracker" />
      <div className="grid gap-3 md:grid-cols-3">
        <Kpi label="Expiring < 7 days" value="3" tone="warn" />
        <Kpi label="Expired" value="0" tone="good" />
        <Kpi label="Missing docs" value="1" tone="bad" />
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Vehicle</th><th>Document</th><th>Expires</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[
              ["KA-01-AB-4823", "Insurance", "30 Apr 2026", "warn"],
              ["KA-05-CJ-7712", "PUC", "02 May 2026", "warn"],
              ["MH-02-GK-0918", "Fitness", "05 May 2026", "warn"],
              ["KA-12-JK-5509", "RC", "Missing", "bad"],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r[0]}</td>
                <td>{r[1]}</td><td>{r[2]}</td>
                <td><Pill tone={r[3] as "warn" | "bad"}>{r[3] === "bad" ? "Missing" : "Renew soon"}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Analytics() {
  const [t, setT] = useState<"earnings" | "trips" | "cancel">("earnings");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="Last 30 days" title="Performance" />
        <Tabs value={t} onChange={setT} options={[{ value: "earnings", label: "Earnings" }, { value: "trips", label: "Trips" }, { value: "cancel", label: "Cancellations" }]} />
      </div>
      <Card className="p-5">
        <BarChart bars={[40, 55, 62, 58, 71, 80, 70, 85, 92, 88, 95, 82, 78, 85, 90, 94, 88, 80, 76, 82, 88, 92, 95, 82, 78, 75, 88, 92, 90, 86]} />
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Kpi label="Revenue" value="₹18.2L" sub="+22% MoM" tone="good" />
        <Kpi label="Trips" value="4,812" sub="+14% MoM" tone="good" />
        <Kpi label="Cancel rate" value="4.1%" sub="-0.8pp MoM" tone="good" />
      </div>
    </div>
  );
}

function Support() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Dedicated" title="Your account manager" />
      <Card className="p-5">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-porter-yellow font-black">P</div>
          <div className="flex-1">
            <div className="font-bold">Preeti Sharma</div>
            <div className="text-xs text-porter-mute">Fleet success · +91 98100 •••• · preeti@porter.in</div>
          </div>
          <button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">Schedule call</button>
        </div>
      </Card>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Ticket</th><th>Subject</th><th>Status</th><th>Last update</th></tr>
          </thead>
          <tbody>
            {[
              ["FLT-881", "Vehicle KA-09-HH-3302 stuck in onboarding", "Open", "2h ago"],
              ["FLT-879", "Weekly settlement discrepancy", "In progress", "Yesterday"],
              ["FLT-872", "Request to add 5 new vehicles", "Resolved", "3 days ago"],
            ].map((r) => (
              <tr key={r[0]} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r[0]}</td>
                <td>{r[1]}</td>
                <td><Pill tone={r[2] === "Resolved" ? "good" : r[2] === "Open" ? "warn" : "neutral"}>{r[2]}</Pill></td>
                <td className="text-xs text-porter-mute">{r[3]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}
