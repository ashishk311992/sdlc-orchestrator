import {
  User,
  Truck,
  Building2,
  Building,
  LayoutDashboard,
  Headphones,
  Wallet,
  Home,
  ClipboardList,
} from "lucide-react";
import type { ComponentType } from "react";

export type PersonaId =
  | "customer"
  | "driver"
  | "fleet"
  | "enterprise"
  | "admin"
  | "support"
  | "finance";

export type Persona = {
  id: PersonaId;
  label: string;
  tagline: string;
  path: string;
  icon: ComponentType<{ className?: string; size?: number | string }>;
  platform: "Mobile" | "Desktop" | "Hybrid";
  color: string;
};

export const personas: Persona[] = [
  { id: "customer", label: "Customer", tagline: "Book a Porter", path: "/porter/customer", icon: User, platform: "Mobile", color: "bg-porter-yellow text-porter-ink" },
  { id: "driver", label: "Driver Partner", tagline: "Drive & earn", path: "/porter/driver", icon: Truck, platform: "Mobile", color: "bg-porter-yellow text-porter-ink" },
  { id: "fleet", label: "Fleet Owner", tagline: "Run a fleet", path: "/porter/fleet", icon: Building, platform: "Hybrid", color: "bg-porter-ink text-porter-yellow" },
  { id: "enterprise", label: "Enterprise", tagline: "B2B shipping", path: "/porter/enterprise", icon: Building2, platform: "Desktop", color: "bg-porter-ink text-porter-yellow" },
  { id: "admin", label: "Ops Admin", tagline: "City control tower", path: "/porter/admin", icon: LayoutDashboard, platform: "Desktop", color: "bg-porter-ink text-porter-yellow" },
  { id: "support", label: "Support", tagline: "Tickets & refunds", path: "/porter/support", icon: Headphones, platform: "Desktop", color: "bg-porter-ink text-porter-yellow" },
  { id: "finance", label: "Finance", tagline: "Payouts & audits", path: "/porter/finance", icon: Wallet, platform: "Desktop", color: "bg-porter-ink text-porter-yellow" },
];

export const utilityNav = [
  { label: "Overview", path: "/porter", icon: Home },
  { label: "Review", path: "/porter/review", icon: ClipboardList },
];
