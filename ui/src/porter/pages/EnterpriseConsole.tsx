import { useState } from "react";
import {
  LayoutDashboard, Send, Upload, Building2, CheckSquare, FileText, KeyRound, Users, Activity, Download, Plus,
} from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import DesktopShell from "../components/DesktopShell";
import { Card, Kpi, Pill, SectionTitle, BarChart, Tabs } from "../components/common";
import { useSubscreen } from "../hooks/useSubscreen";
import { bulkShipments } from "../data/mock";

export default function EnterpriseConsole() {
  const [sid, setSid] = useSubscreen("dashboard");
  return (
    <PorterLayout>
      <DesktopShell
        kicker="Enterprise"
        title="BigBasket India"
        subtitle="Enterprise · 5 branches · ₹24L/mo spend"
        activeId={sid}
        onSelect={setSid}
        nav={[
          { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
          { id: "book", label: "New shipment", icon: Send },
          { id: "bulk", label: "Bulk upload", icon: Upload },
          { id: "addresses", label: "Address book", icon: Building2 },
          { id: "approvals", label: "Approvals", icon: CheckSquare },
          { id: "invoices", label: "Invoices & GST", icon: FileText },
          { id: "api", label: "API & webhooks", icon: KeyRound },
          { id: "users", label: "Users & SSO", icon: Users },
          { id: "usage", label: "Usage & SLA", icon: Activity },
        ]}
      >
        {render(sid)}
      </DesktopShell>
    </PorterLayout>
  );
}

function render(id: string) {
  switch (id) {
    case "dashboard": return <Dash />;
    case "book": return <Book />;
    case "bulk": return <Bulk />;
    case "addresses": return <Addr />;
    case "approvals": return <Approvals />;
    case "invoices": return <Invoices />;
    case "api": return <Api />;
    case "users": return <UsersT />;
    case "usage": return <Usage />;
    default: return <Dash />;
  }
}

function Dash() {
  return (
    <div className="space-y-6">
      <SectionTitle kicker="This month" title="Shipping overview" desc="Live shipments and monthly spend across branches." />
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="MTD spend" value="₹18.4L" sub="Budget ₹24L" />
        <Kpi label="Active shipments" value="132" sub="92 in transit" />
        <Kpi label="Avg delivery" value="42 min" sub="SLA 60 min" tone="good" />
        <Kpi label="On-time rate" value="97.8%" sub="Target 95%" tone="good" />
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Card className="p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <div className="text-sm font-bold">Daily shipments</div>
            <Pill tone="yellow">Apr</Pill>
          </div>
          <BarChart bars={[45, 60, 55, 70, 80, 30, 25, 65, 75, 82, 88, 72, 40, 28, 70, 78, 85, 90, 88, 85, 35, 30, 80, 92, 95, 88, 82]} />
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold">Live shipments</div>
          <ul className="mt-2 space-y-2 text-xs">
            {bulkShipments.map((b) => (
              <li key={b.id} className="rounded-xl border border-porter-line p-2">
                <div className="flex items-center justify-between"><span className="font-mono">{b.id}</span><Pill tone={b.status === "Delivered" ? "good" : b.status === "In Transit" ? "yellow" : "neutral"}>{b.status}</Pill></div>
                <div className="mt-1 font-bold">{b.origin} → {b.dest}</div>
                <div className="text-porter-mute">ETA {b.eta} · qty {b.qty}</div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </div>
  );
}

function Book() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="New shipment" title="Book a delivery" />
      <Card className="p-5">
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Pick-up" val="Whitefield DC, Bengaluru" />
          <Field label="Drop" val="HSR store, Bengaluru" />
          <Field label="Vehicle" val="Tata Ace · 750 kg" />
          <Field label="Pickup slot" val="Today 14:00" />
          <Field label="SKU / reference" val="SKU-88-LOT-2204" />
          <Field label="Invoice value" val="₹1,24,000" />
        </div>
        <div className="mt-4 flex items-center justify-between">
          <Pill tone="yellow">Estimated ₹842</Pill>
          <button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">Submit for approval</button>
        </div>
      </Card>
    </div>
  );
}

function Field({ label, val }: { label: string; val: string }) {
  return (
    <label className="block">
      <span className="text-[11px] font-bold uppercase text-porter-mute">{label}</span>
      <input defaultValue={val} className="mt-1 w-full rounded-xl border border-porter-line px-3 py-2 text-sm outline-none focus:border-porter-ink" />
    </label>
  );
}

function Bulk() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="CSV upload" title="Bulk booking" desc="Upload 10s–1000s of shipments at once." />
      <Card className="border-dashed p-10 text-center">
        <Upload className="mx-auto text-porter-mute" />
        <div className="mt-2 font-bold">Drop shipments.csv here</div>
        <div className="text-xs text-porter-mute">Template includes: origin, drop, vehicle, slot, invoice#, qty</div>
        <button className="mt-3 rounded-xl bg-porter-yellow px-4 py-2 text-xs font-bold">Download template</button>
      </Card>
      <Card>
        <div className="border-b border-porter-line px-4 py-2 text-sm font-bold">Preview (3 of 128)</div>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Row</th><th>Origin</th><th>Drop</th><th>Qty</th><th>Valid</th></tr>
          </thead>
          <tbody>
            {bulkShipments.map((b, i) => (
              <tr key={b.id} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3">{i + 1}</td>
                <td>{b.origin}</td><td>{b.dest}</td><td>{b.qty}</td>
                <td><Pill tone="good">OK</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="flex items-center justify-between border-t border-porter-line px-4 py-3 text-xs">
          <span>128 valid · 2 errors</span>
          <button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">Schedule all</button>
        </div>
      </Card>
    </div>
  );
}

function Addr() {
  const rows = [
    { name: "Whitefield DC", type: "Warehouse", contact: "Mr. Ramesh · +91 9845 ••••", city: "Bengaluru" },
    { name: "HSR Retail Store", type: "Store", contact: "Ms. Sneha · +91 9880 ••••", city: "Bengaluru" },
    { name: "Jayanagar Store", type: "Store", contact: "Mr. Imran · +91 9620 ••••", city: "Bengaluru" },
    { name: "Hoskote Hub", type: "Warehouse", contact: "Mr. Krishna · +91 9900 ••••", city: "Bengaluru" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="Locations" title="Address book" />
        <button className="flex items-center gap-1 rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white"><Plus size={12} /> Add location</button>
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Name</th><th>Type</th><th>Contact</th><th>City</th></tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.name} className="border-b border-porter-line last:border-0 hover:bg-porter-cloud">
                <td className="px-4 py-3 font-bold">{r.name}</td>
                <td><Pill tone={r.type === "Warehouse" ? "ink" : "neutral"}>{r.type}</Pill></td>
                <td className="text-xs">{r.contact}</td>
                <td>{r.city}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Approvals() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Maker-checker" title="Pending approvals" desc="Shipments above ₹50,000 need a senior approver." />
      {[1, 2, 3].map((i) => (
        <Card key={i} className="p-5">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-bold">Shipment request BS-440{i}</div>
              <div className="text-xs text-porter-mute">by Rohit K. · {i} hour ago · ₹1,24,{i * 111}</div>
            </div>
            <div className="flex gap-2">
              <button className="rounded-xl border border-porter-line px-4 py-2 text-xs font-bold">Reject</button>
              <button className="rounded-xl bg-porter-good px-4 py-2 text-xs font-bold text-white">Approve</button>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}

function Invoices() {
  const list = [
    { id: "INV-2026-04-241", period: "Apr 2026", amount: 1843200, status: "Unpaid", due: "05 May" },
    { id: "INV-2026-03-203", period: "Mar 2026", amount: 2402000, status: "Paid", due: "05 Apr" },
    { id: "INV-2026-02-188", period: "Feb 2026", amount: 2110000, status: "Paid", due: "05 Mar" },
  ];
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Billing" title="Invoices & GST" />
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Invoice #</th><th>Period</th><th>Amount</th><th>Status</th><th>Due</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{i.id}</td>
                <td>{i.period}</td>
                <td>₹{i.amount.toLocaleString()}</td>
                <td><Pill tone={i.status === "Paid" ? "good" : "warn"}>{i.status}</Pill></td>
                <td>{i.due}</td>
                <td className="text-right"><button className="flex items-center gap-1 rounded-lg border border-porter-line px-2 py-1 text-xs font-bold"><Download size={12} /> PDF</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Api() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Developer" title="API keys & webhooks" />
      <Card className="p-5">
        <div className="text-sm font-bold">Production key</div>
        <div className="mt-2 flex items-center gap-2 rounded-xl border border-porter-line bg-porter-cloud p-3 font-mono text-xs">
          pk_live_8a92c1d4e•••••••••••••••• <span className="ml-auto font-sans font-bold text-porter-ink">Reveal</span>
        </div>
        <div className="mt-4 text-sm font-bold">Webhook URL</div>
        <input defaultValue="https://bigbasket.com/hooks/porter" className="mt-2 w-full rounded-xl border border-porter-line px-3 py-2 text-sm outline-none" />
        <div className="mt-2 text-xs text-porter-mute">Events: shipment.created, shipment.updated, delivery.completed, invoice.generated</div>
      </Card>
      <Card>
        <div className="border-b border-porter-line px-4 py-2 text-sm font-bold">Last 5 webhook deliveries</div>
        <ul className="divide-y divide-porter-line text-xs">
          {[
            ["shipment.updated", "200 OK", "12:04:31"],
            ["delivery.completed", "200 OK", "11:58:02"],
            ["shipment.created", "200 OK", "11:45:10"],
            ["delivery.completed", "500 Err", "11:22:01"],
            ["shipment.created", "200 OK", "11:02:22"],
          ].map((r) => (
            <li key={r[2]} className="flex items-center gap-3 px-4 py-2">
              <span className="flex-1 font-mono">{r[0]}</span>
              <Pill tone={r[1] === "200 OK" ? "good" : "bad"}>{r[1]}</Pill>
              <span className="text-porter-mute">{r[2]}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}

function UsersT() {
  const list = [
    { n: "Rohit K.", e: "rohit@bigbasket.com", role: "Admin" },
    { n: "Priya M.", e: "priya@bigbasket.com", role: "Booker" },
    { n: "Ajay S.", e: "ajay@bigbasket.com", role: "Finance" },
    { n: "Neha B.", e: "neha@bigbasket.com", role: "Viewer" },
  ];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="Access" title="Users & SSO" />
        <button className="rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">+ Invite</button>
      </div>
      <Card className="p-4 text-xs">
        <div className="flex items-center gap-3"><Pill tone="good">SSO active</Pill> Okta · enforced for @bigbasket.com</div>
      </Card>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Name</th><th>Email</th><th>Role</th><th></th></tr>
          </thead>
          <tbody>
            {list.map((u) => (
              <tr key={u.e} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-bold">{u.n}</td>
                <td className="text-xs">{u.e}</td>
                <td><Pill tone="ink">{u.role}</Pill></td>
                <td className="text-right text-xs"><button className="font-bold text-porter-ink">Edit</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Usage() {
  const [t, setT] = useState<"api" | "sla">("api");
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SectionTitle kicker="Telemetry" title="Usage & SLA" />
        <Tabs value={t} onChange={setT} options={[{ value: "api", label: "API calls" }, { value: "sla", label: "SLA" }]} />
      </div>
      <Card className="p-5">
        <BarChart bars={[40, 55, 62, 71, 80, 42, 30, 72, 85, 92, 88, 75, 38, 28]} />
      </Card>
      <div className="grid gap-3 md:grid-cols-3">
        <Kpi label="API calls (MTD)" value="1.24M" sub="Limit 2M" />
        <Kpi label="4xx rate" value="0.42%" tone="good" />
        <Kpi label="Avg p95 latency" value="182 ms" tone="good" />
      </div>
    </div>
  );
}
