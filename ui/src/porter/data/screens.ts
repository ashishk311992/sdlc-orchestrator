import type { PersonaId } from "../store/persona";

/** A reviewable screen inside a persona — used by /review and feedback widget. */
export type ScreenDef = {
  persona: PersonaId | "landing" | "meta";
  id: string;       // stable key for feedback (persona:id)
  label: string;
  route: string;    // hash route incl. ?screen=... if tabbed
  description: string;
};

export const screens: ScreenDef[] = [
  // Landing
  { persona: "landing", id: "home", label: "Landing page", route: "/porter", description: "Marketing overview & persona picker" },
  { persona: "meta", id: "review", label: "Review checklist", route: "/porter/review", description: "Reviewer checklist for all screens" },

  // Customer
  { persona: "customer", id: "splash", label: "Splash / Onboarding", route: "/porter/customer?s=splash", description: "App splash, language, permissions" },
  { persona: "customer", id: "auth", label: "Phone OTP login", route: "/porter/customer?s=auth", description: "Phone + OTP + profile name" },
  { persona: "customer", id: "home", label: "Home", route: "/porter/customer?s=home", description: "Vehicle carousel, offers, saved addresses" },
  { persona: "customer", id: "book-pickup", label: "Booking · pickup & drops", route: "/porter/customer?s=book-pickup", description: "Map pin, address autocomplete, multi-stop" },
  { persona: "customer", id: "book-vehicle", label: "Booking · vehicle class", route: "/porter/customer?s=book-vehicle", description: "Pick 2W, 3W, mini truck, tempo, pickup" },
  { persona: "customer", id: "book-extras", label: "Booking · labour & loaders", route: "/porter/customer?s=book-extras", description: "Labour add-ons, loading time, insurance" },
  { persona: "customer", id: "book-fare", label: "Booking · fare & payment", route: "/porter/customer?s=book-fare", description: "Fare breakdown, coupon, pay method" },
  { persona: "customer", id: "searching", label: "Searching for driver", route: "/porter/customer?s=searching", description: "Driver allocation animation + cancel" },
  { persona: "customer", id: "tracking", label: "Live tracking", route: "/porter/customer?s=tracking", description: "Map, driver card, OTP, call/chat" },
  { persona: "customer", id: "trip-done", label: "Trip complete + rate", route: "/porter/customer?s=trip-done", description: "Rate, tip, invoice" },
  { persona: "customer", id: "packers", label: "Packers & Movers", route: "/porter/customer?s=packers", description: "Inventory builder, home survey, slot" },
  { persona: "customer", id: "courier", label: "Intercity courier", route: "/porter/customer?s=courier", description: "Parcel size, sender/receiver, insurance" },
  { persona: "customer", id: "scheduled", label: "Scheduled bookings", route: "/porter/customer?s=scheduled", description: "Date/time picker, recurring trips" },
  { persona: "customer", id: "history", label: "Trip history", route: "/porter/customer?s=history", description: "Past trips, invoice PDF, rebook" },
  { persona: "customer", id: "wallet", label: "Wallet & payments", route: "/porter/customer?s=wallet", description: "Credits, UPI/cards, transactions" },
  { persona: "customer", id: "offers", label: "Offers & referral", route: "/porter/customer?s=offers", description: "Coupons, refer-a-friend" },
  { persona: "customer", id: "addresses", label: "Saved addresses", route: "/porter/customer?s=addresses", description: "Home, work, custom labels" },
  { persona: "customer", id: "support", label: "Help & support", route: "/porter/customer?s=support", description: "FAQ, chat, call, raise ticket" },
  { persona: "customer", id: "profile", label: "Profile & settings", route: "/porter/customer?s=profile", description: "Name, language, notifications, delete account" },
  { persona: "customer", id: "business-switch", label: "Switch to business", route: "/porter/customer?s=business-switch", description: "Upgrade to business account" },

  // Driver
  { persona: "driver", id: "onboarding", label: "Driver KYC stepper", route: "/porter/driver?s=onboarding", description: "Aadhaar, PAN, DL, RC, insurance, bank, selfie" },
  { persona: "driver", id: "training", label: "Training & quiz", route: "/porter/driver?s=training", description: "Safety videos + quiz + activation" },
  { persona: "driver", id: "home", label: "Driver home", route: "/porter/driver?s=home", description: "Online toggle + incoming order + trip stages" },
  { persona: "driver", id: "orders", label: "Orders history", route: "/porter/driver?s=orders", description: "Past trips, ratings, invoices" },
  { persona: "driver", id: "earnings", label: "Earnings deep-dive", route: "/porter/driver?s=earnings", description: "Daily, weekly, incentives, TDS" },
  { persona: "driver", id: "incentives", label: "Incentive catalogue", route: "/porter/driver?s=incentives", description: "Goals, streaks, bonus progress" },
  { persona: "driver", id: "store", label: "Partner store", route: "/porter/driver?s=store", description: "Uniforms, tyres, EMI products" },
  { persona: "driver", id: "fuel", label: "Fuel card", route: "/porter/driver?s=fuel", description: "Balance, pumps, statements" },
  { persona: "driver", id: "docs", label: "Document renewals", route: "/porter/driver?s=docs", description: "Upload + expiry tracker" },
  { persona: "driver", id: "insurance", label: "Insurance & benefits", route: "/porter/driver?s=insurance", description: "Health, vehicle insurance" },
  { persona: "driver", id: "support", label: "Partner support", route: "/porter/driver?s=support", description: "Tickets, escalations, helpline" },
  { persona: "driver", id: "referral", label: "Refer a driver", route: "/porter/driver?s=referral", description: "Share link, reward ladder" },
  { persona: "driver", id: "profile", label: "Profile & language", route: "/porter/driver?s=profile", description: "Settings, language, permissions" },

  // Fleet owner
  { persona: "fleet", id: "overview", label: "Fleet overview", route: "/porter/fleet?s=overview", description: "Fleet-wide earnings, utilisation, leaderboard" },
  { persona: "fleet", id: "vehicles", label: "Vehicle management", route: "/porter/fleet?s=vehicles", description: "Add, edit, docs, assign driver" },
  { persona: "fleet", id: "drivers", label: "Driver management", route: "/porter/fleet?s=drivers", description: "Hire, shifts, commissions, terminate" },
  { persona: "fleet", id: "settlements", label: "Daily settlements", route: "/porter/fleet?s=settlements", description: "Per-driver splits, weekly payout" },
  { persona: "fleet", id: "compliance", label: "Compliance alerts", route: "/porter/fleet?s=compliance", description: "Expiring docs across fleet" },
  { persona: "fleet", id: "analytics", label: "Performance analytics", route: "/porter/fleet?s=analytics", description: "Utilisation, cancel rate, revenue" },
  { persona: "fleet", id: "support", label: "Fleet support", route: "/porter/fleet?s=support", description: "Account manager, tickets" },

  // Enterprise
  { persona: "enterprise", id: "dashboard", label: "Enterprise dashboard", route: "/porter/enterprise?s=dashboard", description: "Monthly spend, active shipments" },
  { persona: "enterprise", id: "book", label: "Book a shipment", route: "/porter/enterprise?s=book", description: "Single shipment form" },
  { persona: "enterprise", id: "bulk", label: "Bulk booking (CSV)", route: "/porter/enterprise?s=bulk", description: "CSV upload + preview + schedule" },
  { persona: "enterprise", id: "addresses", label: "Address book", route: "/porter/enterprise?s=addresses", description: "Branches, warehouses, contacts" },
  { persona: "enterprise", id: "approvals", label: "Approvals workflow", route: "/porter/enterprise?s=approvals", description: "Maker / checker, thresholds" },
  { persona: "enterprise", id: "invoices", label: "Invoices & GST", route: "/porter/enterprise?s=invoices", description: "Statements, downloads" },
  { persona: "enterprise", id: "api", label: "API keys & webhooks", route: "/porter/enterprise?s=api", description: "Tokens, endpoints, logs" },
  { persona: "enterprise", id: "users", label: "Users & roles", route: "/porter/enterprise?s=users", description: "Invite, scopes, SSO" },
  { persona: "enterprise", id: "usage", label: "Usage & SLA", route: "/porter/enterprise?s=usage", description: "API calls, credit, SLA reports" },

  // Admin
  { persona: "admin", id: "overview", label: "City overview", route: "/porter/admin?s=overview", description: "KPIs, heatmap, surge suggestions" },
  { persona: "admin", id: "live", label: "Live orders", route: "/porter/admin?s=live", description: "Real-time stream + state" },
  { persona: "admin", id: "drivers", label: "Driver ops", route: "/porter/admin?s=drivers", description: "Approvals, ratings, flags" },
  { persona: "admin", id: "vehicles", label: "Fleet snapshot", route: "/porter/admin?s=vehicles", description: "Network-wide vehicle status" },
  { persona: "admin", id: "surge", label: "Surge & pricing rules", route: "/porter/admin?s=surge", description: "Fare bands, multipliers, campaigns" },
  { persona: "admin", id: "campaigns", label: "Campaigns & promos", route: "/porter/admin?s=campaigns", description: "Coupons, incentive drives" },
  { persona: "admin", id: "fraud", label: "Fraud & risk", route: "/porter/admin?s=fraud", description: "Flagged rides, device heuristics" },
  { persona: "admin", id: "comms", label: "Notifications composer", route: "/porter/admin?s=comms", description: "Push / SMS / email blasts" },
  { persona: "admin", id: "flags", label: "Feature flags", route: "/porter/admin?s=flags", description: "Roll-outs by city / segment" },
  { persona: "admin", id: "rbac", label: "Roles & permissions", route: "/porter/admin?s=rbac", description: "Internal RBAC" },
  { persona: "admin", id: "audit", label: "Audit log", route: "/porter/admin?s=audit", description: "Who did what, when" },
  { persona: "admin", id: "cities", label: "Cities & zones", route: "/porter/admin?s=cities", description: "Expansion config" },

  // Support
  { persona: "support", id: "queue", label: "Ticket queue", route: "/porter/support?s=queue", description: "SLA-prioritised queue" },
  { persona: "support", id: "ticket", label: "Ticket detail", route: "/porter/support?s=ticket", description: "Conversation, order lookup, refund" },
  { persona: "support", id: "chat", label: "Live chat console", route: "/porter/support?s=chat", description: "Agent chat UI" },
  { persona: "support", id: "kb", label: "Knowledge base", route: "/porter/support?s=kb", description: "Canned responses, articles" },
  { persona: "support", id: "quality", label: "QA scores", route: "/porter/support?s=quality", description: "Agent quality monitoring" },

  // Finance
  { persona: "finance", id: "overview", label: "Finance overview", route: "/porter/finance?s=overview", description: "GMV, revenue, take-rate" },
  { persona: "finance", id: "payouts", label: "Driver payouts", route: "/porter/finance?s=payouts", description: "Batches, approve, export" },
  { persona: "finance", id: "fleet-settle", label: "Fleet settlements", route: "/porter/finance?s=fleet-settle", description: "Fleet-owner splits" },
  { persona: "finance", id: "invoices", label: "Enterprise invoicing", route: "/porter/finance?s=invoices", description: "Bulk invoicing" },
  { persona: "finance", id: "reco", label: "Reconciliation", route: "/porter/finance?s=reco", description: "PG vs ledger" },
  { persona: "finance", id: "tax", label: "Tax reports", route: "/porter/finance?s=tax", description: "TDS, GST filings" },
  { persona: "finance", id: "disputes", label: "Disputes & chargebacks", route: "/porter/finance?s=disputes", description: "Evidence upload" },
];

export const screensByPersona = (p: PersonaId | "landing" | "meta") =>
  screens.filter((s) => s.persona === p);

export const findScreen = (route: string): ScreenDef | undefined =>
  screens.find((s) => s.route === route);
