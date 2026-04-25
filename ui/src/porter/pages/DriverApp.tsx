import { useState } from "react";
import {
  ChevronLeft, ChevronRight, Play, Power, Truck, Star, DollarSign, TrendingUp, Wallet,
  ShoppingBag, Fuel, FileText, Shield, Headphones, Users, User, Phone, CheckCircle2,
  Upload, AlertTriangle, Calendar as CalIcon,
} from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import PhoneFrame from "../components/PhoneFrame";
import ScreenNav from "../components/ScreenNav";
import { Bar, Pill, FakeMap } from "../components/common";
import { useSubscreen } from "../hooks/useSubscreen";

export default function DriverAppV2() {
  const [sid, setSid] = useSubscreen("home");
  return (
    <PorterLayout>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col items-center">
          <PhoneFrame label={`Driver · ${sid}`}>{render(sid, setSid)}</PhoneFrame>
          <p className="mt-4 max-w-md text-center text-xs text-porter-mute">
            Driver partner app — 13 flows including KYC, incentives, fuel card & renewals.
          </p>
        </div>
        <ScreenNav persona="driver" currentId={sid} onSelect={setSid} routePrefix="/porter/driver" />
      </div>
    </PorterLayout>
  );
}

function render(id: string, go: (id: string) => void) {
  switch (id) {
    case "onboarding": return <Onboarding go={go} />;
    case "training": return <Training go={go} />;
    case "home": return <DHome go={go} />;
    case "orders": return <Orders go={go} />;
    case "earnings": return <Earnings go={go} />;
    case "incentives": return <Incentives go={go} />;
    case "store": return <Store go={go} />;
    case "fuel": return <FuelCard go={go} />;
    case "docs": return <Docs go={go} />;
    case "insurance": return <Insurance go={go} />;
    case "support": return <DSupport go={go} />;
    case "referral": return <Referral go={go} />;
    case "profile": return <DProfile go={go} />;
    default: return <DHome go={go} />;
  }
}

function Bar2({ title, right, back, onBack }: { title: string; right?: React.ReactNode; back?: boolean; onBack?: () => void }) {
  return (
    <div className="flex items-center gap-2 border-b border-porter-line bg-porter-ink px-4 py-3 text-white">
      {back && <button onClick={onBack}><ChevronLeft size={18} /></button>}
      <div className="text-sm font-extrabold">{title}</div>
      <div className="ml-auto">{right}</div>
    </div>
  );
}

/* Onboarding KYC */
function Onboarding({ go }: { go: (id: string) => void }) {
  const steps = [
    { t: "Personal info", s: "done" },
    { t: "Aadhaar card", s: "done" },
    { t: "PAN card", s: "done" },
    { t: "Driving licence", s: "active" },
    { t: "Vehicle RC", s: "idle" },
    { t: "Insurance papers", s: "idle" },
    { t: "Bank details", s: "idle" },
    { t: "Selfie verification", s: "idle" },
  ];
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Become a partner" />
      <div className="px-4 py-3">
        <div className="text-[11px] font-bold text-porter-yellowDark">STEP 4 OF 8</div>
        <div className="text-lg font-extrabold">Driving licence</div>
        <Bar value={(3 / 8) * 100} tone="yellow" />
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        <div className="rounded-2xl border border-dashed border-porter-line p-6 text-center">
          <Upload className="mx-auto text-porter-mute" size={24} />
          <div className="mt-2 text-sm font-bold">Upload front side of DL</div>
          <p className="text-[11px] text-porter-mute">Auto-OCR will read name & DL number</p>
          <button className="mt-3 rounded-xl bg-porter-yellow px-4 py-2 text-xs font-bold">Take photo</button>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          <Row k="Name on DL" v="Ravi Kumar" />
          <Row k="DL number" v="KA0120230001234" />
          <Row k="Valid till" v="12 Aug 2031" />
        </div>
        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">All steps</div>
        <ol className="mt-2 space-y-2 text-xs">
          {steps.map((s) => (
            <li key={s.t} className="flex items-center gap-2">
              {s.s === "done" ? <CheckCircle2 size={14} className="text-porter-good" /> : s.s === "active" ? <div className="h-3 w-3 rounded-full bg-porter-yellow" /> : <div className="h-3 w-3 rounded-full bg-porter-line" />}
              <span className={s.s === "idle" ? "text-porter-mute" : "font-semibold"}>{s.t}</span>
            </li>
          ))}
        </ol>
      </div>
      <div className="border-t border-porter-line bg-white p-3">
        <button onClick={() => go("training")} className="w-full rounded-xl bg-porter-ink py-3 text-sm font-bold text-white">Next: Training →</button>
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <div className="flex justify-between rounded-xl border border-porter-line px-3 py-2">
      <span className="text-porter-mute">{k}</span>
      <span className="font-bold">{v}</span>
    </div>
  );
}

/* Training */
function Training({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Training" back onBack={() => go("onboarding")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-porter-cloud p-4 text-xs">
          <div className="font-bold">Complete 4 modules to activate</div>
          <Bar value={50} tone="yellow" /><div className="mt-1 text-porter-mute">2 / 4 done · takes ~20 min</div>
        </div>
        <div className="mt-3 space-y-2">
          {[
            { t: "Customer etiquette", d: "5 min", done: true },
            { t: "Safety & SOS", d: "6 min", done: true },
            { t: "App walkthrough", d: "4 min", done: false },
            { t: "Quiz (pass ≥ 80%)", d: "5 min", done: false },
          ].map((m) => (
            <div key={m.t} className="flex items-center gap-3 rounded-xl border border-porter-line p-3">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-porter-ink text-porter-yellow">
                {m.done ? <CheckCircle2 size={14} /> : <Play size={14} />}
              </div>
              <div className="flex-1 text-xs">
                <div className="font-bold">{m.t}</div>
                <div className="text-porter-mute">{m.d}</div>
              </div>
              <button className="rounded-lg bg-porter-yellow px-2 py-1 text-[11px] font-bold">{m.done ? "Replay" : "Start"}</button>
            </div>
          ))}
        </div>
      </div>
      <div className="border-t border-porter-line bg-white p-3">
        <button onClick={() => go("home")} className="w-full rounded-xl bg-porter-yellow py-3 text-sm font-extrabold">Finish & go online</button>
      </div>
    </div>
  );
}

/* Home (duty toggle + order) */
function DHome({ go }: { go: (id: string) => void }) {
  const [online, setOnline] = useState(true);
  const [stage, setStage] = useState<"idle" | "offer" | "enroute" | "arrived" | "loaded" | "delivered">("offer");
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <Bar2
        title="Ravi Kumar · Tata Ace"
        right={
          <button
            onClick={() => setOnline((v) => !v)}
            className={`flex items-center gap-1 rounded-full px-3 py-1 text-[11px] font-bold ${online ? "bg-porter-good text-white" : "bg-porter-line text-porter-ink"}`}
          >
            <Power size={12} /> {online ? "ONLINE" : "OFFLINE"}
          </button>
        }
      />
      <div className="grid grid-cols-3 gap-px bg-porter-line">
        {[{ k: "Today", v: "₹2,180" }, { k: "Trips", v: "11" }, { k: "Rating", v: "4.86 ★" }].map((s) => (
          <div key={s.k} className="bg-white px-2 py-2 text-center">
            <div className="text-[10px] font-bold uppercase text-porter-mute">{s.k}</div>
            <div className="text-sm font-extrabold">{s.v}</div>
          </div>
        ))}
      </div>
      <FakeMap height={180} label="Koramangala zone · surge 1.3×" />
      <div className="flex-1 overflow-y-auto p-3">
        {stage === "idle" && (
          <div className="rounded-2xl border border-dashed border-porter-line p-6 text-center text-xs text-porter-mute">
            Waiting for orders… you'll hear a beep when one comes in.
          </div>
        )}
        {stage === "offer" && (
          <div className="rounded-2xl border-2 border-porter-ink bg-white p-4">
            <div className="flex items-center justify-between text-[11px]">
              <Pill tone="ink">New order</Pill>
              <span className="font-extrabold">18.4 km · ₹342</span>
            </div>
            <div className="mt-2 text-xs">
              <div className="flex items-start gap-2"><div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-porter-ink" /><span className="flex-1"><b>HSR Layout, Sector 4</b><div className="text-porter-mute">2.1 km · ETA 6 min</div></span></div>
              <div className="ml-1 my-1 h-3 border-l border-dashed border-porter-line" />
              <div className="flex items-start gap-2"><div className="mt-0.5 h-2.5 w-2.5 rounded-full bg-porter-yellow" /><span className="flex-1"><b>Whitefield, ITPL</b><div className="text-porter-mute">Drop · 18 km onwards</div></span></div>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <button onClick={() => setStage("idle")} className="rounded-xl border border-porter-line py-2 font-bold">Decline</button>
              <button onClick={() => setStage("enroute")} className="rounded-xl bg-porter-yellow py-2 font-extrabold">Accept</button>
            </div>
            <div className="mt-2 text-center text-[10px] text-porter-mute">Auto-decline in 14s</div>
          </div>
        )}
        {stage === "enroute" && <Stage title="En route to pickup" next="Arrived" onNext={() => setStage("arrived")} />}
        {stage === "arrived" && <Stage title="Arrived · collect OTP 4826" next="Mark loaded" onNext={() => setStage("loaded")} />}
        {stage === "loaded" && <Stage title="Loaded · start trip" next="Mark delivered" onNext={() => setStage("delivered")} />}
        {stage === "delivered" && (
          <div className="rounded-2xl bg-porter-good/10 p-4 text-center">
            <CheckCircle2 className="mx-auto text-porter-good" size={28} />
            <div className="mt-2 text-sm font-extrabold">Delivered · +₹342</div>
            <div className="text-[11px] text-porter-mute">Rated 5★ by customer</div>
            <button onClick={() => setStage("idle")} className="mt-3 rounded-xl bg-porter-ink px-4 py-2 text-xs font-bold text-white">Finish</button>
          </div>
        )}
      </div>
      <nav className="flex border-t border-porter-line bg-white text-[10px]">
        {[
          { i: <Truck size={14} />, t: "Duty", to: "" },
          { i: <FileText size={14} />, t: "Orders", to: "orders" },
          { i: <DollarSign size={14} />, t: "Earn", to: "earnings" },
          { i: <TrendingUp size={14} />, t: "Bonus", to: "incentives" },
          { i: <User size={14} />, t: "Me", to: "profile" },
        ].map((t, i) => (
          <button key={t.t} onClick={() => t.to && go(t.to)} className={`flex flex-1 flex-col items-center gap-0.5 py-2 font-bold ${i === 0 ? "text-porter-ink" : "text-porter-mute"}`}>
            {t.i}{t.t}
          </button>
        ))}
      </nav>
    </div>
  );
}

function Stage({ title, next, onNext }: { title: string; next: string; onNext: () => void }) {
  return (
    <div className="rounded-2xl border border-porter-line bg-white p-4">
      <div className="text-sm font-extrabold">{title}</div>
      <div className="mt-1 text-[11px] text-porter-mute">Customer: Anita R. · +91 98450 •••••</div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
        <button className="flex items-center justify-center gap-1 rounded-xl bg-porter-ink py-2 font-bold text-white"><Phone size={12} />Call</button>
        <button className="rounded-xl border border-porter-line py-2 font-bold">Chat</button>
        <button className="rounded-xl border border-porter-line py-2 font-bold text-porter-bad">Cancel</button>
      </div>
      <button onClick={onNext} className="mt-3 w-full rounded-xl bg-porter-yellow py-3 text-sm font-extrabold">{next}</button>
    </div>
  );
}

/* Orders */
function Orders({ go }: { go: (id: string) => void }) {
  const list = [
    { id: "TRP-9921", to: "Whitefield", amt: 342, r: 5 },
    { id: "TRP-9919", to: "Electronic City", amt: 188, r: 4 },
    { id: "TRP-9915", to: "Hebbal", amt: 265, r: 5 },
    { id: "TRP-9911", to: "Yeshwanthpur", amt: 402, r: 5 },
  ];
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Orders" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {list.map((t) => (
          <div key={t.id} className="rounded-xl border border-porter-line p-3 text-xs">
            <div className="flex justify-between">
              <span className="font-mono text-porter-mute">{t.id}</span>
              <span className="font-extrabold">₹{t.amt}</span>
            </div>
            <div className="mt-1 font-bold">→ {t.to}</div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-porter-mute">
              <span>Today, 2:40 PM · 18.4 km</span>
              <span className="flex items-center gap-0.5"><Star size={10} />{t.r}.0</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Earnings */
function Earnings({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <Bar2 title="Earnings" back onBack={() => go("home")} />
      <div className="p-3">
        <div className="rounded-2xl bg-porter-ink p-4 text-white">
          <div className="text-xs uppercase text-porter-yellow">This week</div>
          <div className="text-3xl font-black">₹ 12,480</div>
          <div className="mt-1 text-[11px] opacity-70">Base ₹9,800 · Bonus ₹2,180 · Tips ₹500</div>
          <div className="mt-3 flex h-24 items-end gap-2">
            {[40, 70, 55, 90, 100, 60, 85].map((h, i) => (
              <div key={i} className="flex flex-1 flex-col items-center gap-1">
                <div className="w-full rounded-t bg-porter-yellow" style={{ height: `${h}%` }} />
                <span className="text-[9px] opacity-70">{["M", "T", "W", "T", "F", "S", "S"][i]}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-3 text-xs">
          <div className="font-bold">Instant cashout</div>
          <div className="mt-1 text-porter-mute">Available ₹4,200 · ₹10 fee</div>
          <button className="mt-2 w-full rounded-xl bg-porter-yellow py-2 font-extrabold">Cash out to HDFC •••• 8891</button>
        </div>
        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-3 text-xs">
          <div className="font-bold">Tax & TDS</div>
          <div className="mt-1 text-porter-mute">Form 26AS updated monthly · download Form 16A</div>
        </div>
      </div>
    </div>
  );
}

/* Incentives */
function Incentives({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Incentives" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {[
          { t: "Daily: 12 trips → +₹300", p: 92 },
          { t: "Weekend surge: 20 trips Sat-Sun", p: 45 },
          { t: "Morning streak: 8 days 7–10 AM", p: 75 },
          { t: "Referral drive: refer 3 drivers", p: 33 },
        ].map((x) => (
          <div key={x.t} className="rounded-2xl border border-porter-line p-3 text-xs">
            <div className="flex justify-between font-bold"><span>{x.t}</span><span>{x.p}%</span></div>
            <div className="mt-2"><Bar value={x.p} tone={x.p > 80 ? "good" : "yellow"} /></div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Store */
function Store({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Partner store" back onBack={() => go("profile")} />
      <div className="flex-1 overflow-y-auto p-3 grid grid-cols-2 gap-2">
        {[
          { n: "Porter uniform", p: 499, img: "👕" },
          { n: "Safety vest", p: 249, img: "🦺" },
          { n: "Tarpaulin 6×8", p: 899, img: "🎪" },
          { n: "Tyre set (4)", p: 12999, img: "🛞", emi: true },
          { n: "Mobile mount", p: 299, img: "📱" },
          { n: "Rope bundle", p: 199, img: "🪢" },
        ].map((p) => (
          <div key={p.n} className="rounded-2xl border border-porter-line p-3 text-xs">
            <div className="text-3xl">{p.img}</div>
            <div className="mt-1 font-bold">{p.n}</div>
            <div className="mt-0.5 text-porter-mute">₹{p.p}</div>
            {p.emi && <div className="mt-1 rounded bg-porter-yellow px-1 py-0.5 text-[10px] font-bold">EMI ₹1,099/mo</div>}
            <button className="mt-2 w-full rounded-lg bg-porter-ink py-1 text-[11px] font-bold text-white">Add</button>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Fuel card */
function FuelCard({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Fuel card" back onBack={() => go("profile")} />
      <div className="p-4">
        <div className="rounded-2xl bg-gradient-to-br from-porter-ink to-[#2A2F36] p-4 text-white">
          <div className="flex items-center justify-between">
            <Fuel className="text-porter-yellow" />
            <div className="text-[10px] uppercase text-porter-yellow">HPCL · Porter Card</div>
          </div>
          <div className="mt-3 font-mono tracking-widest">4402 •••• •••• 1234</div>
          <div className="mt-1 text-[11px] opacity-70">RAVI KUMAR · exp 12/27</div>
          <div className="mt-3 flex justify-between text-xs"><span>Balance</span><span className="font-extrabold">₹ 3,450</span></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button className="rounded-xl bg-porter-yellow py-2 text-xs font-extrabold">+ Load ₹500</button>
          <button className="rounded-xl border border-porter-line py-2 text-xs font-bold">Find pumps</button>
        </div>
        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Last refuels</div>
        <div className="mt-2 space-y-1 text-xs">
          {[["HPCL Koramangala", "22 Apr", "₹800"], ["HPCL HSR", "19 Apr", "₹600"], ["IOC Whitefield", "16 Apr", "₹1,000"]].map((r) => (
            <div key={r[0]} className="flex justify-between rounded-lg border border-porter-line px-3 py-2">
              <span>{r[0]} · {r[1]}</span><span className="font-bold">{r[2]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Docs */
function Docs({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Documents" back onBack={() => go("profile")} />
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {[
          { t: "Driving licence", exp: "12 Aug 2031", ok: true },
          { t: "Vehicle RC", exp: "09 Feb 2029", ok: true },
          { t: "Insurance", exp: "30 Apr 2026", warn: true },
          { t: "PUC certificate", exp: "08 May 2026", ok: true },
          { t: "Fitness certificate", exp: "15 Jul 2026", ok: true },
        ].map((d) => (
          <div key={d.t} className="flex items-center gap-3 rounded-xl border border-porter-line p-3 text-xs">
            <FileText size={16} className={d.warn ? "text-porter-warn" : "text-porter-mute"} />
            <div className="flex-1">
              <div className="font-bold">{d.t}</div>
              <div className="text-porter-mute">Expires {d.exp}</div>
            </div>
            {d.warn ? <Pill tone="warn">Renew in 7d</Pill> : <Pill tone="good">OK</Pill>}
          </div>
        ))}
        <button className="w-full rounded-xl border border-dashed border-porter-line py-3 text-xs font-bold">+ Add document</button>
      </div>
    </div>
  );
}

/* Insurance */
function Insurance({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Benefits" back onBack={() => go("profile")} />
      <div className="p-3 space-y-2">
        {[
          { t: "Accident cover", s: "₹5,00,000 · free", on: true },
          { t: "Hospi-cash", s: "₹2,000/day · 30 days", on: true },
          { t: "Term life", s: "₹10 lakh · premium ₹199/mo", on: false },
          { t: "Vehicle insurance top-up", s: "₹3,999/year" },
        ].map((p) => (
          <div key={p.t} className="rounded-xl border border-porter-line p-3 text-xs">
            <div className="flex items-center gap-2"><Shield size={14} /><span className="flex-1 font-bold">{p.t}</span>{p.on && <Pill tone="good">Active</Pill>}</div>
            <div className="mt-1 text-porter-mute">{p.s}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* Support */
function DSupport({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Support" back onBack={() => go("profile")} />
      <div className="p-3">
        <div className="rounded-2xl bg-porter-ink p-4 text-white">
          <Headphones /><div className="mt-1 text-sm font-extrabold">Partner helpline</div>
          <div className="text-[11px] opacity-70">Hindi, English, 10+ regional languages · 24×7</div>
          <button className="mt-3 w-full rounded-xl bg-porter-yellow py-2 text-xs font-extrabold text-porter-ink">Call now · 080-4000-5000</button>
        </div>
        <div className="mt-3 space-y-2 text-xs">
          {["Payment not received", "App not working", "Customer misbehaved", "Accident / emergency", "Document rejected", "Rating dispute"].map((t) => (
            <button key={t} className="flex w-full justify-between rounded-xl border border-porter-line p-3 font-semibold">{t}<ChevronRight size={12} /></button>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Referral */
function Referral({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <Bar2 title="Refer & earn" back onBack={() => go("profile")} />
      <div className="p-3">
        <div className="rounded-2xl bg-porter-yellow p-4">
          <div className="text-xs font-bold uppercase">Earn up to ₹5,000</div>
          <div className="mt-1 text-lg font-extrabold">Per driver you refer</div>
          <p className="mt-1 text-[11px]">Paid in stages: ₹500 signup, ₹1,500 activation, ₹3,000 after 100 trips</p>
        </div>
        <div className="mt-3 rounded-xl border border-dashed border-porter-ink p-3 text-center text-sm font-black tracking-widest">RAVI500</div>
        <button className="mt-2 w-full rounded-xl bg-porter-ink py-2 text-xs font-bold text-white">Share on WhatsApp</button>
        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Your referrals</div>
        <div className="mt-2 space-y-2 text-xs">
          {[{ n: "Mahesh D.", s: "100 trips · earned ₹5,000", p: 100 }, { n: "Suresh N.", s: "42 of 100 trips", p: 42 }, { n: "Kiran T.", s: "Signed up", p: 10 }].map((r) => (
            <div key={r.n} className="rounded-xl border border-porter-line p-3">
              <div className="flex justify-between font-bold"><span>{r.n}</span><span>{r.p === 100 ? <Pill tone="good">Done</Pill> : `${r.p}%`}</span></div>
              <div className="mt-1 text-porter-mute">{r.s}</div>
              <div className="mt-1"><Bar value={r.p} tone={r.p === 100 ? "good" : "yellow"} /></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* Profile */
function DProfile({ go }: { go: (id: string) => void }) {
  const items = [
    { i: <FileText size={14} />, t: "Documents", to: "docs" },
    { i: <Wallet size={14} />, t: "Earnings", to: "earnings" },
    { i: <TrendingUp size={14} />, t: "Incentives", to: "incentives" },
    { i: <ShoppingBag size={14} />, t: "Partner store", to: "store" },
    { i: <Fuel size={14} />, t: "Fuel card", to: "fuel" },
    { i: <Shield size={14} />, t: "Insurance & benefits", to: "insurance" },
    { i: <Users size={14} />, t: "Refer a driver", to: "referral" },
    { i: <Headphones size={14} />, t: "Support", to: "support" },
    { i: <AlertTriangle size={14} />, t: "SOS & safety" },
    { i: <CalIcon size={14} />, t: "Leave / off-day" },
  ];
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <Bar2 title="Me" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-porter-yellow text-xl font-black">R</div>
            <div className="flex-1">
              <div className="flex items-center gap-2"><span className="text-lg font-extrabold">Ravi Kumar</span><Pill tone="good">Active</Pill></div>
              <div className="text-[11px] text-porter-mute">KA-01-AB-4823 · Tata Ace · partner since 2022</div>
            </div>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-px bg-porter-line">
            {[{ k: "Rating", v: "4.86" }, { k: "Trips", v: "2,184" }, { k: "Accept %", v: "94" }].map((s) => (
              <div key={s.k} className="bg-white p-2 text-center">
                <div className="text-[10px] font-bold uppercase text-porter-mute">{s.k}</div>
                <div className="text-sm font-extrabold">{s.v}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-2 bg-white">
          {items.map((r) => (
            <button key={r.t} onClick={() => r.to && go(r.to)} className="flex w-full items-center gap-3 border-b border-porter-line px-4 py-3 text-left text-sm">
              <span className="text-porter-mute">{r.i}</span>
              <span className="flex-1 font-semibold">{r.t}</span>
              <ChevronRight size={14} className="text-porter-mute" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
