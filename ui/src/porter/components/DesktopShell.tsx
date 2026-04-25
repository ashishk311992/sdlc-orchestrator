import { ReactNode, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { ComponentType } from "react";
import { Menu, X } from "lucide-react";

export type DesktopNavItem = {
  id: string;
  label: string;
  icon?: ComponentType<{ className?: string; size?: number | string }>;
  children?: { id: string; label: string }[];
};

/** Shared chrome for desktop personas (admin, enterprise, support, finance, fleet). */
export default function DesktopShell({
  kicker,
  title,
  subtitle,
  activeId,
  onSelect,
  nav,
  children,
  toolbar,
}: {
  kicker: string;
  title: string;
  subtitle?: string;
  activeId: string;
  onSelect: (id: string) => void;
  nav: DesktopNavItem[];
  children: ReactNode;
  toolbar?: ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const { pathname, search } = useLocation();

  return (
    <div className="flex min-h-[calc(100vh-8rem)]">
      {/* Mobile toggle */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-24 right-5 z-40 flex h-12 w-12 items-center justify-center rounded-full bg-porter-ink text-porter-yellow shadow-xl md:hidden"
        aria-label="Menu"
      >
        {open ? <X size={18} /> : <Menu size={18} />}
      </button>

      {/* Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-30 w-64 border-r border-porter-line bg-white transition-transform",
          "md:static md:flex md:translate-x-0 md:flex-col",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        ].join(" ")}
      >
        <div className="border-b border-porter-line px-5 py-4">
          <div className="text-[11px] font-bold uppercase tracking-wider text-porter-yellowDark">{kicker}</div>
          <div className="text-sm font-extrabold">{title}</div>
          {subtitle && <div className="text-xs text-porter-mute">{subtitle}</div>}
        </div>
        <nav className="flex-1 overflow-y-auto p-3">
          {nav.map((item) => {
            const active = item.id === activeId;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  onSelect(item.id);
                  setOpen(false);
                }}
                className={[
                  "mb-1 flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm font-semibold transition",
                  active
                    ? "bg-porter-ink text-porter-yellow"
                    : "text-porter-ink hover:bg-porter-cloud",
                ].join(" ")}
              >
                {Icon && <Icon size={16} />}
                <span className="flex-1">{item.label}</span>
                {active && <span className="text-porter-yellow">●</span>}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-porter-line p-4 text-xs text-porter-mute">
          <Link to="/porter/review" className="block font-bold text-porter-ink hover:underline">
            ← Back to review index
          </Link>
          <div className="mt-2 font-mono text-[10px] opacity-60">{pathname}{search}</div>
        </div>
      </aside>

      <div className="min-w-0 flex-1 overflow-hidden px-4 py-6 md:px-8">
        {toolbar && <div className="mb-4">{toolbar}</div>}
        {children}
      </div>
    </div>
  );
}
