import { LayoutDashboard, Wallet, Coins, FileText, Scale, Receipt, AlertTriangle } from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import DesktopShell from "../components/DesktopShell";
import { Card, Kpi, Pill, SectionTitle, BarChart } from "../components/common";
import { useSubscreen } from "../hooks/useSubscreen";
import { payoutBatches } from "../data/mock";

export default function FinanceConsole() {
  const [sid, setSid] = useSubscreen("overview");
  return (
    <PorterLayout>
      <DesktopShell
        kicker="Finance"
        title="Ledger & payouts"
        subtitle="FY26 · Period: Apr 2026"
        activeId={sid}
        onSelect={setSid}
        nav={[
          { id: "overview", label: "Overview", icon: LayoutDashboard },
          { id: "payouts", label: "Driver payouts", icon: Wallet },
          { id: "fleet-settle", label: "Fleet settlements", icon: Coins },
          { id: "invoices", label: "Invoices", icon: FileText },
          { id: "reco", label: "Reconciliation", icon: Scale },
          { id: "tax", label: "Tax reports", icon: Receipt },
          { id: "disputes", label: "Disputes", icon: AlertTriangle },
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
    case "payouts": return <Payouts />;
    case "fleet-settle": return <Fleet />;
    case "invoices": return <Invoices />;
    case "reco": return <Reco />;
    case "tax": return <Tax />;
    case "disputes": return <Disputes />;
    default: return <Overview />;
  }
}

function Overview() {
  return (
    <div className="space-y-6">
      <SectionTitle kicker="Month-to-date · Apr 2026" title="Finance overview" />
      <div className="grid gap-3 sm:grid-cols-4">
        <Kpi label="GMV" value="₹182.4 Cr" sub="+18% MoM" tone="good" />
        <Kpi label="Revenue" value="₹28.1 Cr" sub="Take rate 15.4%" />
        <Kpi label="Driver payouts" value="₹138.0 Cr" sub="Scheduled Mon 09:00" />
        <Kpi label="Net (pre-tax)" value="₹7.8 Cr" tone="good" />
      </div>
      <Card className="p-5">
        <div className="text-sm font-bold">Cash-flow last 12 months</div>
        <BarChart bars={[60, 62, 68, 72, 75, 78, 82, 85, 88, 90, 92, 95]} labels={["M", "J", "J", "A", "S", "O", "N", "D", "J", "F", "M", "A"]} />
      </Card>
    </div>
  );
}

function Payouts() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Weekly batches" title="Driver payouts" />
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Batch</th><th>Period</th><th>Drivers</th><th>Amount</th><th>Run at</th><th>Status</th><th></th></tr>
          </thead>
          <tbody>
            {payoutBatches.map((p) => (
              <tr key={p.id} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{p.id}</td>
                <td>{p.period}</td>
                <td>{p.drivers.toLocaleString()}</td>
                <td>₹{(p.amount / 100000).toFixed(1)}L</td>
                <td>{p.runAt}</td>
                <td><Pill tone={p.status === "Completed" ? "good" : "warn"}>{p.status}</Pill></td>
                <td className="text-right text-xs"><button className="font-bold text-porter-ink">{p.status === "Scheduled" ? "Approve" : "Export"}</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Fleet() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Partner splits" title="Fleet settlements" />
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Fleet owner</th><th>Vehicles</th><th>Gross</th><th>Commission</th><th>Net</th></tr>
          </thead>
          <tbody>
            {[
              ["Anil Logistics", 24, 1842000, 276300, 1565700],
              ["Fasttrack Fleet", 18, 1322100, 198315, 1123785],
              ["BangaloreMoves", 41, 3104822, 465723, 2639099],
              ["Rapid Wheels", 12, 884100, 132615, 751485],
            ].map((r) => (
              <tr key={String(r[0])} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-bold">{r[0]}</td>
                <td>{r[1]}</td>
                <td>₹{(r[2] as number).toLocaleString()}</td>
                <td>₹{(r[3] as number).toLocaleString()}</td>
                <td className="font-extrabold">₹{(r[4] as number).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Invoices() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Enterprise" title="Invoicing queue" />
      <div className="grid gap-3 md:grid-cols-3">
        <Kpi label="To generate" value="41" tone="warn" />
        <Kpi label="Awaiting payment" value="128" />
        <Kpi label="Overdue" value="7" tone="bad" />
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Client</th><th>Period</th><th>Amount</th><th>Status</th></tr>
          </thead>
          <tbody>
            {[
              ["BigBasket", "Apr 2026", 1843200, "warn"],
              ["Flipkart Logistics", "Apr 2026", 5302100, "neutral"],
              ["Licious", "Mar 2026", 412000, "bad"],
              ["Nykaa", "Mar 2026", 811000, "good"],
            ].map((r) => (
              <tr key={String(r[0])} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-bold">{r[0]}</td>
                <td>{r[1]}</td>
                <td>₹{(r[2] as number).toLocaleString()}</td>
                <td><Pill tone={r[3] as "warn" | "good" | "bad" | "neutral"}>{r[3] === "good" ? "Paid" : r[3] === "bad" ? "Overdue" : r[3] === "warn" ? "Unpaid" : "Draft"}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Reco() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Payment gateway" title="Reconciliation" desc="PG settlement vs internal ledger." />
      <div className="grid gap-3 md:grid-cols-4">
        <Kpi label="Matched" value="99.81%" tone="good" />
        <Kpi label="Unmatched" value="418" tone="warn" />
        <Kpi label="Amount variance" value="₹12,044" tone="warn" />
        <Kpi label="PGs reconciled" value="Razorpay, PayU, UPI" />
      </div>
      <Card>
        <table className="w-full text-sm">
          <thead className="border-b border-porter-line text-left text-[11px] uppercase text-porter-mute">
            <tr><th className="px-4 py-2">Txn ID</th><th>PG</th><th>Ledger</th><th>PG amt</th><th>Delta</th></tr>
          </thead>
          <tbody>
            {[
              ["TXN-8821", "Razorpay", 842, 820, -22],
              ["TXN-8812", "PayU", 148, 148, 0],
              ["TXN-8809", "UPI", 1120, 1100, -20],
            ].map((r) => (
              <tr key={String(r[0])} className="border-b border-porter-line last:border-0">
                <td className="px-4 py-3 font-mono text-xs">{r[0]}</td>
                <td>{r[1]}</td>
                <td>₹{r[2]}</td>
                <td>₹{r[3]}</td>
                <td className={Number(r[4]) < 0 ? "text-porter-bad font-bold" : ""}>{r[4]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function Tax() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="GST & TDS" title="Tax reports" />
      <div className="grid gap-3 md:grid-cols-3">
        <Card className="p-5">
          <div className="text-sm font-bold">GSTR-1 · Apr 2026</div>
          <div className="mt-2 text-xs text-porter-mute">Outward supplies · due 11 May</div>
          <Pill tone="warn">Draft ready</Pill>
          <button className="mt-3 w-full rounded-xl bg-porter-ink py-2 text-xs font-bold text-white">Download JSON</button>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold">GSTR-3B · Apr 2026</div>
          <div className="mt-2 text-xs text-porter-mute">Summary return · due 20 May</div>
          <Pill tone="neutral">Not generated</Pill>
          <button className="mt-3 w-full rounded-xl border border-porter-line py-2 text-xs font-bold">Generate</button>
        </Card>
        <Card className="p-5">
          <div className="text-sm font-bold">TDS 194O · Apr 2026</div>
          <div className="mt-2 text-xs text-porter-mute">Driver deductions</div>
          <Pill tone="good">Filed</Pill>
          <button className="mt-3 w-full rounded-xl border border-porter-line py-2 text-xs font-bold">View challan</button>
        </Card>
      </div>
    </div>
  );
}

function Disputes() {
  return (
    <div className="space-y-4">
      <SectionTitle kicker="Chargebacks" title="Active disputes" />
      <Card>
        <ul className="divide-y divide-porter-line">
          {[
            { id: "CB-9921", amt: 842, reason: "Service not received", ends: "3 days" },
            { id: "CB-9918", amt: 148, reason: "Fraud – unauthorized", ends: "6 days" },
            { id: "CB-9904", amt: 735, reason: "Duplicate charge", ends: "Evidence due today" },
          ].map((d) => (
            <li key={d.id} className="flex items-center gap-3 px-4 py-3 text-sm">
              <span className="font-mono text-xs">{d.id}</span>
              <span className="flex-1">{d.reason}</span>
              <span className="font-bold">₹{d.amt}</span>
              <Pill tone={d.ends.startsWith("Evidence") ? "bad" : "warn"}>{d.ends}</Pill>
              <button className="rounded-lg border border-porter-line px-3 py-1 text-xs font-bold">Upload evidence</button>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
