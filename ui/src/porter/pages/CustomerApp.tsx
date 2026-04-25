import { useState } from "react";
import {
  ChevronLeft,
  Phone,
  MessageCircle,
  MapPin,
  Search,
  Plus,
  Minus,
  Star,
  Tag,
  CreditCard,
  CheckCircle2,
  Package,
  Send,
  Calendar,
  Home,
  Briefcase,
  HeartHandshake,
  Gift,
  Headphones,
  User,
  ChevronRight,
  Settings,
  Bell,
  Shield,
  Info,
} from "lucide-react";
import PorterLayout from "../components/PorterLayout";
import PhoneFrame from "../components/PhoneFrame";
import ScreenNav from "../components/ScreenNav";
import { FakeMap, Pill, Bar } from "../components/common";
import { useSubscreen } from "../hooks/useSubscreen";
import {
  vehicleClasses,
  savedAddresses,
  offers,
  drivers,
  trips,
} from "../data/mock";

export default function CustomerApp() {
  const [sid, setSid] = useSubscreen("splash");

  return (
    <PorterLayout>
      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        <div className="flex flex-col items-center">
          <PhoneFrame label={`Customer · ${sid}`}>{render(sid, setSid)}</PhoneFrame>
          <p className="mt-4 max-w-md text-center text-xs text-porter-mute">
            Click any screen in the list on the right. Use the feedback bubble to annotate anything you'd change.
          </p>
        </div>
        <ScreenNav persona="customer" currentId={sid} onSelect={setSid} routePrefix="/porter/customer" />
      </div>
    </PorterLayout>
  );
}

/* ============================== SCREENS ============================== */

function render(id: string, go: (id: string) => void) {
  switch (id) {
    case "splash": return <Splash go={go} />;
    case "auth": return <Auth go={go} />;
    case "home": return <CHome go={go} />;
    case "book-pickup": return <BookPickup go={go} />;
    case "book-vehicle": return <BookVehicle go={go} />;
    case "book-extras": return <BookExtras go={go} />;
    case "book-fare": return <BookFare go={go} />;
    case "searching": return <Searching go={go} />;
    case "tracking": return <Tracking go={go} />;
    case "trip-done": return <TripDone go={go} />;
    case "packers": return <Packers go={go} />;
    case "courier": return <Courier go={go} />;
    case "scheduled": return <Scheduled go={go} />;
    case "history": return <History go={go} />;
    case "wallet": return <WalletScreen go={go} />;
    case "offers": return <OffersScreen go={go} />;
    case "addresses": return <Addresses go={go} />;
    case "support": return <SupportScreen go={go} />;
    case "profile": return <Profile go={go} />;
    case "business-switch": return <BusinessSwitch go={go} />;
    default: return <Splash go={go} />;
  }
}

/* --- shared UI primitives within phone --- */
function TopBar({ title, back, onBack, right }: { title: string; back?: boolean; onBack?: () => void; right?: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 border-b border-porter-line bg-white px-4 py-3">
      {back && (
        <button onClick={onBack} className="-ml-1 p-1 text-porter-ink"><ChevronLeft size={20} /></button>
      )}
      <div className="text-sm font-extrabold">{title}</div>
      <div className="ml-auto">{right}</div>
    </div>
  );
}

function CTAFull({ onClick, children, tone = "yellow" }: { onClick: () => void; children: React.ReactNode; tone?: "yellow" | "ink" }) {
  return (
    <button
      onClick={onClick}
      className={`mt-3 w-full rounded-xl py-3 text-sm font-extrabold ${tone === "yellow" ? "bg-porter-yellow text-porter-ink" : "bg-porter-ink text-white"}`}
    >
      {children}
    </button>
  );
}

/* ---------------- Splash ---------------- */
function Splash({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col bg-porter-yellow">
      <div className="flex flex-1 flex-col items-center justify-center">
        <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-porter-ink text-3xl font-black text-porter-yellow">P</div>
        <div className="mt-4 text-3xl font-black tracking-tight">porter.</div>
        <div className="mt-1 text-xs font-semibold">Bharat's trusted logistics partner</div>
      </div>
      <div className="rounded-t-3xl bg-white p-5">
        <h2 className="text-lg font-extrabold">Choose your language</h2>
        <div className="mt-3 grid grid-cols-2 gap-2 text-sm font-semibold">
          {["English", "हिंदी", "ಕನ್ನಡ", "தமிழ்", "తెలుగు", "മലയാളം"].map((l, i) => (
            <button
              key={l}
              className={`rounded-xl border px-3 py-2 ${i === 0 ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}
            >
              {l}
            </button>
          ))}
        </div>
        <CTAFull onClick={() => go("auth")}>Continue</CTAFull>
        <p className="mt-3 text-center text-[10px] text-porter-mute">By continuing you agree to our Terms & Privacy Policy</p>
      </div>
    </div>
  );
}

/* ---------------- Auth ---------------- */
function Auth({ go }: { go: (id: string) => void }) {
  const [step, setStep] = useState<"phone" | "otp" | "name">("phone");
  const [phone, setPhone] = useState("9845012345");
  const [otp, setOtp] = useState("");
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Sign in" back onBack={() => go("splash")} />
      <div className="flex-1 px-5 py-6">
        {step === "phone" && (
          <>
            <h2 className="text-xl font-extrabold">Enter your mobile</h2>
            <p className="mt-1 text-xs text-porter-mute">We'll send a 6-digit OTP to verify</p>
            <div className="mt-5 flex overflow-hidden rounded-xl border border-porter-line">
              <span className="flex items-center bg-porter-cloud px-3 text-sm font-bold">🇮🇳 +91</span>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="flex-1 px-3 py-3 text-sm outline-none" />
            </div>
            <CTAFull onClick={() => setStep("otp")}>Send OTP</CTAFull>
            <div className="mt-6 flex items-center gap-3">
              <div className="h-px flex-1 bg-porter-line" /><span className="text-[10px] text-porter-mute">OR</span><div className="h-px flex-1 bg-porter-line" />
            </div>
            <div className="mt-3 flex gap-2">
              <button className="flex-1 rounded-xl border border-porter-line py-2 text-xs font-bold">Continue with Google</button>
              <button className="flex-1 rounded-xl border border-porter-line py-2 text-xs font-bold">Truecaller</button>
            </div>
          </>
        )}
        {step === "otp" && (
          <>
            <h2 className="text-xl font-extrabold">Enter OTP</h2>
            <p className="mt-1 text-xs text-porter-mute">Sent to +91 {phone} · <button className="font-bold text-porter-ink underline">Change</button></p>
            <div className="mt-5 flex justify-between gap-2">
              {[...Array(6)].map((_, i) => (
                <input
                  key={i}
                  maxLength={1}
                  value={otp[i] ?? ""}
                  onChange={(e) => {
                    const next = otp.split("");
                    next[i] = e.target.value;
                    setOtp(next.join(""));
                  }}
                  className="h-12 w-10 rounded-lg border border-porter-line text-center text-lg font-extrabold outline-none focus:border-porter-ink"
                />
              ))}
            </div>
            <div className="mt-3 text-xs text-porter-mute">Resend OTP in 0:24</div>
            <CTAFull onClick={() => setStep("name")}>Verify</CTAFull>
          </>
        )}
        {step === "name" && (
          <>
            <h2 className="text-xl font-extrabold">What should we call you?</h2>
            <p className="mt-1 text-xs text-porter-mute">Helps drivers & support address you correctly</p>
            <input placeholder="Full name" className="mt-5 w-full rounded-xl border border-porter-line px-3 py-3 text-sm outline-none" />
            <input placeholder="Email (optional)" className="mt-3 w-full rounded-xl border border-porter-line px-3 py-3 text-sm outline-none" />
            <div className="mt-3 flex items-start gap-2 text-xs text-porter-mute">
              <input type="checkbox" defaultChecked className="mt-0.5" /> Send me offers & trip updates on WhatsApp
            </div>
            <CTAFull onClick={() => go("home")}>Let's go</CTAFull>
          </>
        )}
      </div>
    </div>
  );
}

/* ---------------- Home ---------------- */
function CHome({ go }: { go: (id: string) => void }) {
  return (
    <div className="bg-porter-cloud pb-6">
      <div className="bg-porter-yellow px-5 pb-5 pt-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-porter-ink/70">Good afternoon</div>
            <div className="text-lg font-extrabold">Anita</div>
          </div>
          <button onClick={() => go("profile")} className="flex h-10 w-10 items-center justify-center rounded-full bg-porter-ink text-porter-yellow"><User size={16} /></button>
        </div>
        <button onClick={() => go("book-pickup")} className="mt-4 flex w-full items-center gap-2 rounded-xl bg-white px-3 py-3 text-left shadow-sm">
          <Search size={16} className="text-porter-mute" />
          <span className="text-sm text-porter-mute">Where to send your goods?</span>
        </button>
      </div>

      <div className="px-5 pt-5">
        <div className="text-xs font-bold uppercase tracking-wider text-porter-mute">Pick a vehicle</div>
        <div className="mt-2 grid grid-cols-3 gap-2">
          {vehicleClasses.slice(0, 6).map((v) => (
            <button key={v.id} onClick={() => go("book-pickup")} className="rounded-2xl border border-porter-line bg-white p-3 text-left">
              <div className="text-2xl">{v.icon}</div>
              <div className="mt-1 text-[11px] font-bold">{v.name}</div>
              <div className="text-[10px] text-porter-mute">{v.eta} min</div>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 px-5">
        <div className="flex items-center justify-between">
          <div className="text-xs font-bold uppercase tracking-wider text-porter-mute">Other services</div>
        </div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          <button onClick={() => go("packers")} className="rounded-2xl bg-porter-ink p-3 text-left text-white">
            <Package size={16} className="text-porter-yellow" />
            <div className="mt-1 font-bold">Packers & Movers</div>
            <div className="text-[10px] opacity-70">Home / office shifting</div>
          </button>
          <button onClick={() => go("courier")} className="rounded-2xl bg-porter-yellow p-3 text-left">
            <Send size={16} />
            <div className="mt-1 font-bold">Intercity Courier</div>
            <div className="text-[10px] text-porter-ink/70">Starting ₹99</div>
          </button>
        </div>
      </div>

      <div className="mt-5 px-5">
        <div className="text-xs font-bold uppercase tracking-wider text-porter-mute">Saved addresses</div>
        <div className="mt-2 space-y-2">
          {savedAddresses.slice(0, 2).map((a) => (
            <button key={a.label} onClick={() => go("book-pickup")} className="flex w-full items-center gap-3 rounded-2xl border border-porter-line bg-white px-3 py-2 text-left">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-porter-cloud">
                {a.tag === "home" ? <Home size={14} /> : a.tag === "work" ? <Briefcase size={14} /> : <MapPin size={14} />}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-bold">{a.label}</span>
                <span className="block truncate text-[11px] text-porter-mute">{a.line}</span>
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="mt-5 px-5">
        <div className="text-xs font-bold uppercase tracking-wider text-porter-mute">Offers for you</div>
        <div className="mt-2 overflow-x-auto">
          <div className="flex gap-2">
            {offers.map((o) => (
              <div key={o.code} className="w-60 shrink-0 rounded-2xl border border-dashed border-porter-ink bg-white p-3">
                <div className="flex items-center gap-1 text-[10px] font-bold text-porter-yellowDark"><Tag size={10} /> {o.code}</div>
                <div className="mt-1 text-sm font-extrabold">{o.title}</div>
                <div className="text-[10px] text-porter-mute">{o.cap}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <nav className="sticky bottom-0 mt-6 flex border-t border-porter-line bg-white">
        {[
          { i: <Home size={16} />, l: "Home", a: true },
          { i: <Calendar size={16} />, l: "History", to: "history" },
          { i: <Gift size={16} />, l: "Offers", to: "offers" },
          { i: <Headphones size={16} />, l: "Help", to: "support" },
          { i: <User size={16} />, l: "Me", to: "profile" },
        ].map((t) => (
          <button
            key={t.l}
            onClick={() => t.to && go(t.to)}
            className={`flex flex-1 flex-col items-center gap-0.5 py-2 text-[10px] font-bold ${t.a ? "text-porter-ink" : "text-porter-mute"}`}
          >
            {t.i}
            {t.l}
          </button>
        ))}
      </nav>
    </div>
  );
}

/* ---------------- Booking: pickup & drops ---------------- */
function BookPickup({ go }: { go: (id: string) => void }) {
  const [drops, setDrops] = useState(["Whitefield, ITPL"]);
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Where to?" back onBack={() => go("home")} />
      <div className="p-4">
        <FakeMap height={150} label="Drag pin to adjust" />
        <div className="mt-3 space-y-2">
          <div className="flex items-center gap-3 rounded-xl border border-porter-line bg-white px-3 py-2.5">
            <span className="h-3 w-3 rounded-full bg-porter-ink" />
            <input defaultValue="HSR Layout, Sector 4" className="flex-1 text-sm outline-none" />
          </div>
          {drops.map((d, i) => (
            <div key={i} className="flex items-center gap-3 rounded-xl border border-porter-line bg-white px-3 py-2.5">
              <span className="h-3 w-3 rounded-full bg-porter-yellow" />
              <input defaultValue={d} className="flex-1 text-sm outline-none" />
              <button onClick={() => setDrops(drops.filter((_, j) => j !== i))}><Minus size={14} className="text-porter-mute" /></button>
            </div>
          ))}
          <button onClick={() => setDrops([...drops, ""])} className="flex items-center gap-1 rounded-xl border border-dashed border-porter-line px-3 py-2.5 text-xs font-bold text-porter-mute">
            <Plus size={12} /> Add another stop
          </button>
        </div>
        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Suggestions</div>
        <div className="mt-2 space-y-1">
          {savedAddresses.map((a) => (
            <div key={a.label} className="flex items-center gap-3 py-2">
              <MapPin size={14} className="text-porter-mute" />
              <div className="min-w-0 flex-1 text-xs">
                <div className="font-bold">{a.label}</div>
                <div className="truncate text-porter-mute">{a.line}</div>
              </div>
            </div>
          ))}
        </div>
        <CTAFull onClick={() => go("book-vehicle")}>Confirm locations</CTAFull>
      </div>
    </div>
  );
}

/* ---------------- Booking: vehicle ---------------- */
function BookVehicle({ go }: { go: (id: string) => void }) {
  const [pick, setPick] = useState("mini");
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <TopBar title="Choose vehicle" back onBack={() => go("book-pickup")} />
      <FakeMap height={110} label="18.4 km · 45 min" />
      <div className="flex-1 overflow-y-auto p-4 pb-24">
        <div className="space-y-2">
          {vehicleClasses.slice(0, 5).map((v) => {
            const active = pick === v.id;
            const est = Math.round(v.base + v.perKm * 18.4);
            return (
              <button
                key={v.id}
                onClick={() => setPick(v.id)}
                className={`flex w-full items-center gap-3 rounded-2xl border bg-white px-3 py-3 text-left ${active ? "border-porter-ink" : "border-porter-line"}`}
              >
                <div className="text-3xl">{v.icon}</div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold">{v.name}</span>
                    <Pill tone="good">{v.eta} min</Pill>
                  </div>
                  <div className="text-[11px] text-porter-mute">{v.capacity}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-extrabold">₹{est}</div>
                  <div className="text-[10px] text-porter-mute">estimated</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
      <div className="sticky bottom-0 border-t border-porter-line bg-white px-4 py-3">
        <CTAFull onClick={() => go("book-extras")}>Continue</CTAFull>
      </div>
    </div>
  );
}

/* ---------------- Booking: extras ---------------- */
function BookExtras({ go }: { go: (id: string) => void }) {
  const [labour, setLabour] = useState(1);
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Add-ons" back onBack={() => go("book-vehicle")} />
      <div className="flex-1 p-4">
        <div className="rounded-2xl border border-porter-line bg-white p-4">
          <div className="text-sm font-extrabold">Loaders / Labour</div>
          <p className="mt-1 text-[11px] text-porter-mute">₹150 per loader · 30 mins free</p>
          <div className="mt-3 flex items-center justify-between">
            <button onClick={() => setLabour(Math.max(0, labour - 1))} className="flex h-8 w-8 items-center justify-center rounded-full border border-porter-line"><Minus size={14} /></button>
            <span className="text-xl font-extrabold">{labour}</span>
            <button onClick={() => setLabour(labour + 1)} className="flex h-8 w-8 items-center justify-center rounded-full border border-porter-line"><Plus size={14} /></button>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-4">
          <div className="text-sm font-extrabold">Goods insurance</div>
          <p className="mt-1 text-[11px] text-porter-mute">Covers up to ₹10,000 for ₹15 only</p>
          <label className="mt-3 flex items-center gap-2 text-xs"><input type="checkbox" defaultChecked /> Add ShieldGo insurance</label>
        </div>

        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-4">
          <div className="text-sm font-extrabold">Instructions for driver</div>
          <textarea placeholder="Fragile items, gate code, floor number…" rows={3} className="mt-2 w-full rounded-xl border border-porter-line p-2 text-xs outline-none" />
        </div>
      </div>
      <div className="border-t border-porter-line bg-white p-4">
        <CTAFull onClick={() => go("book-fare")}>Review fare →</CTAFull>
      </div>
    </div>
  );
}

/* ---------------- Booking: fare ---------------- */
function BookFare({ go }: { go: (id: string) => void }) {
  const [pay, setPay] = useState("upi");
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <TopBar title="Review & pay" back onBack={() => go("book-extras")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl border border-porter-line bg-white p-4">
          <div className="flex items-center gap-2"><Package size={14} /> <div className="text-sm font-extrabold">Tata Ace · 18.4 km</div></div>
          <div className="mt-1 text-[11px] text-porter-mute">ETA 9 min · 1 loader · Insurance added</div>
          <div className="my-3 h-px bg-porter-line" />
          <Line k="Base fare" v="₹80" />
          <Line k="Distance (18.4 km × ₹18)" v="₹331" />
          <Line k="Time (45 min × ₹1.5)" v="₹68" />
          <Line k="Labour (1 × ₹150)" v="₹150" />
          <Line k="Insurance" v="₹15" />
          <Line k="Toll (est.)" v="₹30" />
          <Line k="Discount (PORTER50)" v="−₹100" tone="good" />
          <Line k="GST (5%)" v="₹29" />
          <div className="my-2 h-px bg-porter-line" />
          <Line k="Total payable" v="₹603" bold />
        </div>

        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-4">
          <div className="flex items-center gap-2 text-xs font-bold text-porter-yellowDark"><Tag size={12} /> Apply coupon</div>
          <div className="mt-2 flex gap-2">
            <input defaultValue="PORTER50" className="flex-1 rounded-xl border border-porter-line px-3 py-2 text-sm outline-none" />
            <button className="rounded-xl bg-porter-ink px-3 text-xs font-extrabold text-white">Apply</button>
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-4">
          <div className="text-xs font-bold uppercase text-porter-mute">Payment method</div>
          {[
            { id: "upi", label: "UPI (any app)", icon: "📱" },
            { id: "wallet", label: "Porter wallet · ₹248", icon: "💳" },
            { id: "card", label: "Visa •••• 4402", icon: "💳" },
            { id: "cash", label: "Pay cash to driver", icon: "💵" },
          ].map((m) => (
            <label key={m.id} className={`mt-2 flex items-center gap-3 rounded-xl border p-3 ${pay === m.id ? "border-porter-ink" : "border-porter-line"}`}>
              <input type="radio" checked={pay === m.id} onChange={() => setPay(m.id)} />
              <span className="text-base">{m.icon}</span>
              <span className="flex-1 text-sm font-semibold">{m.label}</span>
            </label>
          ))}
        </div>
      </div>
      <div className="border-t border-porter-line bg-white p-4">
        <CTAFull onClick={() => go("searching")}>Confirm booking · ₹603</CTAFull>
      </div>
    </div>
  );
}

function Line({ k, v, bold, tone }: { k: string; v: string; bold?: boolean; tone?: "good" }) {
  return (
    <div className={`flex items-center justify-between py-0.5 text-xs ${bold ? "text-sm font-extrabold" : "text-porter-mute"}`}>
      <span>{k}</span>
      <span className={`${tone === "good" ? "text-porter-good" : ""} font-semibold`}>{v}</span>
    </div>
  );
}

/* ---------------- Searching ---------------- */
function Searching({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <FakeMap height={280} label="Searching nearby Tata Ace" />
      <div className="flex-1 rounded-t-3xl bg-white p-5 shadow-inner -mt-6 relative">
        <div className="flex flex-col items-center">
          <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-porter-yellow">
            <div className="absolute inset-0 animate-ping rounded-full bg-porter-yellow/60" />
            <Package size={28} />
          </div>
          <div className="mt-4 text-base font-extrabold">Finding you a driver…</div>
          <p className="mt-1 text-center text-xs text-porter-mute">Usually under 2 min. We'll notify you when allocated.</p>
        </div>
        <div className="mt-5 rounded-xl bg-porter-cloud p-3 text-xs">
          <div className="font-bold">Booking ID</div>
          <div className="text-porter-mute">TRP-{Math.floor(Math.random() * 9000 + 1000)}</div>
        </div>
        <button onClick={() => go("tracking")} className="mt-3 w-full rounded-xl bg-porter-ink py-3 text-sm font-extrabold text-white">
          Simulate driver allocated →
        </button>
        <button onClick={() => go("home")} className="mt-2 w-full rounded-xl border border-porter-line py-3 text-xs font-bold text-porter-bad">
          Cancel booking
        </button>
      </div>
    </div>
  );
}

/* ---------------- Tracking ---------------- */
function Tracking({ go }: { go: (id: string) => void }) {
  const d = drivers[0];
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <FakeMap height={320} label="Driver 1.8 km away · ETA 4 min" />
      <div className="-mt-6 rounded-t-3xl bg-white p-4 shadow">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-porter-cloud text-xl">🧑‍✈️</div>
          <div className="flex-1">
            <div className="text-sm font-extrabold">{d.name}</div>
            <div className="text-[11px] text-porter-mute">{d.vehicle}</div>
          </div>
          <div className="flex items-center gap-1 rounded-full bg-porter-cloud px-2 py-1 text-xs font-bold"><Star size={12} /> {d.rating}</div>
        </div>
        <div className="mt-3 grid grid-cols-3 gap-2">
          <button className="flex items-center justify-center gap-1 rounded-xl bg-porter-ink py-2 text-xs font-bold text-white"><Phone size={12} /> Call</button>
          <button className="flex items-center justify-center gap-1 rounded-xl border border-porter-line py-2 text-xs font-bold"><MessageCircle size={12} /> Chat</button>
          <button className="flex items-center justify-center gap-1 rounded-xl border border-porter-line py-2 text-xs font-bold"><Shield size={12} /> SOS</button>
        </div>
        <div className="mt-3 rounded-xl border border-porter-line bg-porter-cloud p-3">
          <div className="text-[10px] font-bold uppercase text-porter-mute">Share trip OTP with driver</div>
          <div className="mt-1 text-2xl font-black tracking-widest">4 8 2 6</div>
        </div>
        <ol className="mt-3 space-y-2 text-xs">
          {[
            { t: "Driver allocated", s: "good" },
            { t: "En route to pickup · 4 min", s: "active" },
            { t: "Loading goods", s: "idle" },
            { t: "In transit", s: "idle" },
            { t: "Delivered", s: "idle" },
          ].map((e, i) => (
            <li key={i} className="flex items-center gap-2">
              <span className={`h-2.5 w-2.5 rounded-full ${e.s === "good" ? "bg-porter-good" : e.s === "active" ? "bg-porter-yellow" : "bg-porter-line"}`} />
              <span className={e.s === "idle" ? "text-porter-mute" : "font-semibold"}>{e.t}</span>
            </li>
          ))}
        </ol>
        <button onClick={() => go("trip-done")} className="mt-3 w-full rounded-xl bg-porter-yellow py-3 text-sm font-extrabold">
          Simulate trip complete →
        </button>
      </div>
    </div>
  );
}

/* ---------------- Trip done ---------------- */
function TripDone({ go }: { go: (id: string) => void }) {
  const [rating, setRating] = useState(5);
  const [tip, setTip] = useState(0);
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <div className="bg-porter-yellow px-5 py-6 text-center">
        <CheckCircle2 size={40} className="mx-auto" />
        <div className="mt-2 text-lg font-extrabold">Delivered!</div>
        <div className="text-xs">You've been billed ₹603 · paid via UPI</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl border border-porter-line bg-white p-4 text-center">
          <div className="text-sm font-extrabold">How was {drivers[0].name}?</div>
          <div className="mt-2 flex justify-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} onClick={() => setRating(n)}>
                <Star size={26} className={n <= rating ? "fill-porter-yellow text-porter-yellow" : "text-porter-line"} />
              </button>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap justify-center gap-1 text-[11px]">
            {["On time", "Polite", "Handled with care", "Clean vehicle"].map((t) => (
              <span key={t} className="rounded-full bg-porter-cloud px-2 py-0.5 font-semibold">{t}</span>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-4">
          <div className="text-sm font-extrabold">Add a tip</div>
          <div className="mt-2 flex gap-2">
            {[0, 20, 50, 100].map((t) => (
              <button key={t} onClick={() => setTip(t)} className={`flex-1 rounded-xl border py-2 text-sm font-bold ${tip === t ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}>
                {t === 0 ? "No tip" : `₹${t}`}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-3 rounded-2xl border border-porter-line bg-white p-4">
          <div className="flex items-center justify-between text-xs"><span>Trip receipt</span><button className="font-bold text-porter-ink">Download PDF</button></div>
          <div className="mt-2 text-[11px] text-porter-mute">TRP-9932 · 24 Apr 2026 · Tata Ace</div>
        </div>
      </div>
      <div className="border-t border-porter-line bg-white p-4">
        <CTAFull onClick={() => go("home")}>Done</CTAFull>
      </div>
    </div>
  );
}

/* ---------------- Packers ---------------- */
function Packers({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Packers & Movers" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-porter-ink p-4 text-white">
          <div className="text-xs font-bold uppercase text-porter-yellow">Full house shifting</div>
          <div className="mt-1 text-lg font-extrabold">From ₹2,999</div>
          <div className="mt-1 text-[11px] opacity-70">Packing · loading · transport · unloading · unpacking</div>
        </div>

        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Tell us what you're moving</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
          {["1 RK", "1 BHK", "2 BHK", "3 BHK+", "Office", "Just a few items"].map((s, i) => (
            <button key={s} className={`rounded-xl border px-3 py-3 font-semibold ${i === 2 ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}>{s}</button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-porter-line p-4">
          <div className="text-sm font-extrabold">Inventory builder</div>
          <p className="text-[11px] text-porter-mute">Add items you need moved</p>
          <div className="mt-2 space-y-2 text-xs">
            {["Double bed", "Fridge (double door)", "Washing machine", "Sofa (3-seater)", "Dining table"].map((it, i) => (
              <div key={it} className="flex items-center gap-2">
                <span className="flex-1">{it}</span>
                <button className="flex h-6 w-6 items-center justify-center rounded-full border border-porter-line"><Minus size={10} /></button>
                <span className="w-4 text-center font-bold">{i === 0 ? 2 : 1}</span>
                <button className="flex h-6 w-6 items-center justify-center rounded-full border border-porter-line"><Plus size={10} /></button>
              </div>
            ))}
          </div>
          <button className="mt-3 w-full rounded-xl border border-dashed border-porter-line py-2 text-xs font-bold">+ Add more items</button>
        </div>

        <div className="mt-4 rounded-2xl border border-porter-line p-4 text-xs">
          <div className="flex items-center gap-2 font-bold"><Calendar size={12} /> Schedule a free home survey</div>
          <p className="mt-1 text-porter-mute">Our supervisor will visit & quote exact price</p>
          <div className="mt-2 grid grid-cols-3 gap-2">
            {["Today 4pm", "Tomorrow 10am", "Tomorrow 5pm"].map((t, i) => (
              <button key={t} className={`rounded-lg border py-2 font-semibold ${i === 0 ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}>{t}</button>
            ))}
          </div>
        </div>
      </div>
      <div className="border-t border-porter-line bg-white p-4">
        <CTAFull onClick={() => go("home")}>Get quote · from ₹4,499</CTAFull>
      </div>
    </div>
  );
}

/* ---------------- Courier ---------------- */
function Courier({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Intercity Courier" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-porter-yellow p-4">
          <div className="text-xs font-bold uppercase">Send parcels across India</div>
          <div className="text-lg font-extrabold">Starting ₹99 · insured</div>
        </div>

        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Parcel details</div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
          {[{ t: "Document", w: "< 500g", p: "₹99" }, { t: "Small box", w: "< 3kg", p: "₹199" }, { t: "Medium box", w: "< 10kg", p: "₹399" }].map((p, i) => (
            <div key={p.t} className={`rounded-xl border p-3 ${i === 1 ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}>
              <div className="font-bold">{p.t}</div>
              <div className="opacity-70">{p.w}</div>
              <div className="mt-1 font-extrabold">{p.p}</div>
            </div>
          ))}
        </div>

        <div className="mt-4 space-y-2">
          <div className="rounded-xl border border-porter-line p-3">
            <div className="text-[10px] font-bold uppercase text-porter-mute">Sender</div>
            <div className="text-xs font-semibold">Anita R. · +91 9845 012 345</div>
            <div className="text-[11px] text-porter-mute">HSR Layout, Sector 4, Bengaluru – 560102</div>
          </div>
          <div className="rounded-xl border border-porter-line p-3">
            <div className="text-[10px] font-bold uppercase text-porter-mute">Receiver</div>
            <div className="text-xs font-semibold">Rohan Shah · +91 9820 123 456</div>
            <div className="text-[11px] text-porter-mute">Bandra West, Mumbai – 400050</div>
          </div>
        </div>

        <div className="mt-4 rounded-xl border border-porter-line p-3 text-xs">
          <div className="flex items-center gap-2 font-bold"><Shield size={12} /> Insure contents (₹10,000)</div>
          <p className="mt-1 text-porter-mute">+₹25 · reimbursement if lost or damaged</p>
        </div>

        <div className="mt-4 rounded-xl bg-porter-cloud p-3 text-xs">
          <div className="flex justify-between"><span>Estimated ETA</span><span className="font-bold">2 business days</span></div>
          <div className="flex justify-between"><span>Total</span><span className="font-extrabold">₹224</span></div>
        </div>
      </div>
      <div className="border-t border-porter-line bg-white p-4">
        <CTAFull onClick={() => go("tracking")}>Book courier</CTAFull>
      </div>
    </div>
  );
}

/* ---------------- Scheduled ---------------- */
function Scheduled({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Schedule trip" back onBack={() => go("book-vehicle")} />
      <div className="p-4">
        <div className="text-xs font-bold uppercase text-porter-mute">Pick date</div>
        <div className="mt-2 grid grid-cols-4 gap-2 text-center text-xs">
          {["Today", "Tomorrow", "Thu 25", "Fri 26"].map((d, i) => (
            <button key={d} className={`rounded-xl border py-3 font-bold ${i === 1 ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}>{d}</button>
          ))}
        </div>
        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Pick slot</div>
        <div className="mt-2 grid grid-cols-3 gap-2 text-center text-xs">
          {["8-10 AM", "10-12", "12-2 PM", "2-4", "4-6", "6-8 PM"].map((t, i) => (
            <button key={t} className={`rounded-xl border py-2 font-bold ${i === 3 ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}>{t}</button>
          ))}
        </div>
        <div className="mt-4 rounded-2xl border border-porter-line p-4 text-xs">
          <label className="flex items-center gap-2 font-bold"><input type="checkbox" /> Make this a recurring trip</label>
          <p className="mt-1 text-porter-mute">Daily / weekly / custom</p>
        </div>
        <div className="mt-3 rounded-2xl border border-porter-line p-4 text-xs">
          <div className="font-bold">Why scheduled?</div>
          <ul className="mt-1 list-disc space-y-0.5 pl-4 text-porter-mute">
            <li>No surge pricing</li>
            <li>Lock in a driver ahead</li>
            <li>Guaranteed pickup</li>
          </ul>
        </div>
      </div>
      <div className="mt-auto border-t border-porter-line p-4">
        <CTAFull onClick={() => go("book-fare")}>Review fare</CTAFull>
      </div>
    </div>
  );
}

/* ---------------- History ---------------- */
function History({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Your trips" back onBack={() => go("home")} />
      <div className="flex gap-1 px-4 py-2 text-xs">
        {["All", "Completed", "Cancelled", "Scheduled"].map((t, i) => (
          <button key={t} className={`rounded-full border px-3 py-1 font-semibold ${i === 0 ? "border-porter-ink bg-porter-ink text-white" : "border-porter-line"}`}>{t}</button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {trips.map((t) => (
          <div key={t.id} className="mb-2 rounded-2xl border border-porter-line bg-white p-3">
            <div className="flex items-center justify-between text-[10px] text-porter-mute">
              <span>{t.id} · {t.vehicle}</span>
              <Pill tone={t.status === "Completed" ? "good" : "bad"}>{t.status}</Pill>
            </div>
            <div className="mt-2 text-xs">
              <div className="flex items-start gap-2"><MapPin size={12} className="mt-0.5 text-porter-ink" /><span className="flex-1 font-semibold">{t.from}</span></div>
              <div className="ml-4 my-1 h-3 w-px border-l border-dashed border-porter-line" />
              <div className="flex items-start gap-2"><MapPin size={12} className="mt-0.5 text-porter-yellowDark" /><span className="flex-1 font-semibold">{t.to}</span></div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-porter-line pt-2 text-[11px]">
              <span className="text-porter-mute">{t.date}</span>
              <span className="font-extrabold">₹{t.amount}</span>
            </div>
            <div className="mt-2 flex gap-2 text-[11px]">
              <button className="flex-1 rounded-lg border border-porter-line py-1.5 font-bold">Rebook</button>
              <button className="flex-1 rounded-lg border border-porter-line py-1.5 font-bold">Invoice</button>
              <button className="flex-1 rounded-lg border border-porter-line py-1.5 font-bold">Help</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---------------- Wallet ---------------- */
function WalletScreen({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <TopBar title="Wallet" back onBack={() => go("home")} />
      <div className="p-4">
        <div className="rounded-2xl bg-porter-ink p-4 text-white">
          <div className="text-xs uppercase text-porter-yellow">Porter credits</div>
          <div className="mt-1 text-3xl font-black">₹ 248.50</div>
          <div className="mt-2 flex gap-2">
            <button className="flex-1 rounded-xl bg-porter-yellow py-2 text-xs font-extrabold text-porter-ink">+ Add money</button>
            <button className="flex-1 rounded-xl border border-white/30 py-2 text-xs font-bold">Redeem voucher</button>
          </div>
        </div>
        <div className="mt-4 rounded-2xl border border-porter-line bg-white">
          <div className="border-b border-porter-line px-4 py-3 text-sm font-bold">Payment methods</div>
          {[
            { icon: "📱", t: "UPI · @okhdfc", s: "Default" },
            { icon: "💳", t: "HDFC Visa •••• 4402", s: "Expires 08/27" },
            { icon: "💳", t: "Amex •••• 1006", s: "Corporate" },
          ].map((m) => (
            <div key={m.t} className="flex items-center gap-3 px-4 py-3 text-xs">
              <span className="text-lg">{m.icon}</span>
              <span className="flex-1"><span className="block font-bold">{m.t}</span><span className="text-porter-mute">{m.s}</span></span>
              <ChevronRight size={14} className="text-porter-mute" />
            </div>
          ))}
          <button className="w-full border-t border-porter-line py-2.5 text-xs font-bold text-porter-ink">+ Add payment method</button>
        </div>

        <div className="mt-4 rounded-2xl border border-porter-line bg-white">
          <div className="border-b border-porter-line px-4 py-3 text-sm font-bold">Recent transactions</div>
          {[
            { d: "24 Apr · Trip TRP-9921", a: "−₹603", t: "debit" },
            { d: "22 Apr · Coupon PORTER50", a: "+₹100", t: "credit" },
            { d: "22 Apr · Trip TRP-9918", a: "−₹148", t: "debit" },
            { d: "20 Apr · Cashback", a: "+₹20", t: "credit" },
          ].map((x) => (
            <div key={x.d} className="flex items-center justify-between px-4 py-2 text-xs">
              <span className="text-porter-mute">{x.d}</span>
              <span className={`font-extrabold ${x.t === "credit" ? "text-porter-good" : ""}`}>{x.a}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Offers ---------------- */
function OffersScreen({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Offers & referral" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-porter-yellow p-4">
          <div className="text-xs font-bold uppercase">Refer & earn</div>
          <div className="mt-1 text-lg font-extrabold">Give ₹100, get ₹100</div>
          <p className="mt-1 text-[11px]">When your friend takes their first trip</p>
          <div className="mt-3 rounded-xl bg-white px-3 py-2 text-sm font-black tracking-widest">ANITA100</div>
          <button className="mt-2 w-full rounded-xl bg-porter-ink py-2 text-xs font-bold text-white">Share code</button>
        </div>

        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Active coupons</div>
        <div className="mt-2 space-y-2">
          {offers.map((o) => (
            <div key={o.code} className="flex items-center gap-3 rounded-2xl border border-dashed border-porter-ink bg-white p-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-porter-yellow"><Tag size={16} /></div>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-extrabold">{o.title}</div>
                <div className="text-[11px] text-porter-mute">{o.cap} · expires in {o.expires}</div>
              </div>
              <button className="rounded-full bg-porter-ink px-3 py-1 text-[11px] font-bold text-white">Apply</button>
            </div>
          ))}
        </div>

        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Partner perks</div>
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          {["Swiggy One 30% off", "Zomato Gold free month", "Decathlon ₹200 off", "Apollo Pharmacy 15%"].map((p) => (
            <div key={p} className="rounded-xl border border-porter-line bg-white p-3 font-semibold">{p}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ---------------- Addresses ---------------- */
function Addresses({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Saved addresses" back onBack={() => go("profile")} />
      <div className="flex-1 overflow-y-auto p-4">
        {savedAddresses.map((a) => (
          <div key={a.label} className="mb-2 rounded-2xl border border-porter-line bg-white p-3">
            <div className="flex items-center gap-2 text-sm font-extrabold">
              {a.tag === "home" ? <Home size={14} /> : a.tag === "work" ? <Briefcase size={14} /> : <HeartHandshake size={14} />}
              {a.label}
            </div>
            <div className="mt-1 text-xs text-porter-mute">{a.line}</div>
            <div className="mt-2 flex gap-2 text-[11px] font-bold">
              <button className="rounded-lg border border-porter-line px-2 py-1">Edit</button>
              <button className="rounded-lg border border-porter-line px-2 py-1 text-porter-bad">Delete</button>
            </div>
          </div>
        ))}
        <button className="w-full rounded-2xl border border-dashed border-porter-line py-3 text-sm font-bold text-porter-ink">+ Add new address</button>
      </div>
    </div>
  );
}

/* ---------------- Support ---------------- */
function SupportScreen({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Help & support" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-porter-ink p-4 text-white">
          <div className="text-xs font-bold uppercase text-porter-yellow">24×7 support</div>
          <div className="mt-1 text-sm">We typically reply within 5 min</div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
            <button className="rounded-xl bg-white py-2 font-bold text-porter-ink">Chat</button>
            <button className="rounded-xl border border-white/30 py-2 font-bold">Call</button>
            <button className="rounded-xl border border-white/30 py-2 font-bold">Email</button>
          </div>
        </div>

        <div className="mt-4 text-xs font-bold uppercase text-porter-mute">Popular topics</div>
        <div className="mt-2 space-y-1">
          {[
            "Overcharged / wrong fare",
            "Item damaged or lost",
            "Driver didn't show up",
            "Refund & cancellation",
            "Payment issues",
            "Account & data",
          ].map((t) => (
            <button key={t} className="flex w-full items-center justify-between rounded-xl border border-porter-line bg-white px-3 py-2.5 text-left text-xs font-semibold">
              <span>{t}</span><ChevronRight size={14} className="text-porter-mute" />
            </button>
          ))}
        </div>

        <div className="mt-4 rounded-2xl border border-porter-line bg-white p-3 text-xs">
          <div className="font-bold">Recent trip needing help?</div>
          <div className="mt-1 text-porter-mute">Tap a past trip from history to raise a targeted ticket.</div>
          <button onClick={() => go("history")} className="mt-2 w-full rounded-xl bg-porter-yellow py-2 font-extrabold">View trips</button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- Profile ---------------- */
function Profile({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col bg-porter-cloud">
      <TopBar title="Profile" back onBack={() => go("home")} />
      <div className="flex-1 overflow-y-auto">
        <div className="bg-white p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-porter-yellow text-xl font-black">A</div>
            <div>
              <div className="text-lg font-extrabold">Anita Rao</div>
              <div className="text-xs text-porter-mute">+91 98450 12345 · anita@example.com</div>
            </div>
          </div>
        </div>
        <div className="mt-3 bg-white">
          {[
            { i: <MapPin size={14} />, t: "Saved addresses", to: "addresses" },
            { i: <CreditCard size={14} />, t: "Payments", to: "wallet" },
            { i: <Gift size={14} />, t: "Offers & referrals", to: "offers" },
            { i: <Briefcase size={14} />, t: "Switch to business", to: "business-switch" },
            { i: <Bell size={14} />, t: "Notifications" },
            { i: <Settings size={14} />, t: "App settings" },
            { i: <Info size={14} />, t: "About & legal" },
            { i: <Shield size={14} />, t: "Delete my account", danger: true },
          ].map((r) => (
            <button
              key={r.t}
              onClick={() => r.to && go(r.to)}
              className={`flex w-full items-center gap-3 border-b border-porter-line px-4 py-3 text-left text-sm ${r.danger ? "text-porter-bad" : ""}`}
            >
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

/* ---------------- Business switch ---------------- */
function BusinessSwitch({ go }: { go: (id: string) => void }) {
  return (
    <div className="flex h-full flex-col">
      <TopBar title="Porter for Business" back onBack={() => go("profile")} />
      <div className="flex-1 overflow-y-auto p-4">
        <div className="rounded-2xl bg-porter-ink p-4 text-white">
          <div className="text-xs uppercase text-porter-yellow">Upgrade</div>
          <div className="mt-1 text-lg font-extrabold">For shops, restaurants & factories</div>
          <div className="mt-1 text-[11px] opacity-70">Credit terms · bulk bookings · GST invoices · dedicated manager</div>
        </div>
        <div className="mt-4 space-y-2 text-xs">
          {[
            { i: <Tag size={14} />, t: "GST invoices & ITC", s: "Claim input tax credit" },
            { i: <Briefcase size={14} />, t: "Credit line", s: "Up to ₹5L, pay-later" },
            { i: <Package size={14} />, t: "Bulk bookings", s: "CSV upload, 100s of drops" },
            { i: <HeartHandshake size={14} />, t: "Dedicated manager", s: "Hindi / English, 24×7" },
          ].map((p) => (
            <div key={p.t} className="flex items-center gap-3 rounded-xl border border-porter-line p-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-porter-yellow">{p.i}</span>
              <div className="flex-1">
                <div className="font-bold">{p.t}</div>
                <div className="text-[11px] text-porter-mute">{p.s}</div>
              </div>
            </div>
          ))}
        </div>
        <Bar value={40} tone="yellow" />
        <div className="mt-2 text-[11px] text-porter-mute">40% KYC complete · GST, PAN, signatory pending</div>
      </div>
      <div className="border-t border-porter-line bg-white p-4">
        <CTAFull onClick={() => go("home")}>Continue onboarding</CTAFull>
      </div>
    </div>
  );
}
