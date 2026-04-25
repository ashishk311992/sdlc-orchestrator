export const vehicleClasses = [
  { id: "2w", name: "2-Wheeler", capacity: "Up to 20 kg · 40L", base: 25, perKm: 6, eta: 5, icon: "🏍️" },
  { id: "3w", name: "3-Wheeler", capacity: "Up to 500 kg", base: 35, perKm: 9, eta: 8, icon: "🛺" },
  { id: "mini", name: "Tata Ace", capacity: "Up to 750 kg · mini truck", base: 80, perKm: 18, eta: 9, icon: "🚚" },
  { id: "tempo", name: "Tempo", capacity: "Up to 1,250 kg", base: 120, perKm: 22, eta: 12, icon: "🚛" },
  { id: "pickup", name: "Pickup 8ft", capacity: "Up to 1,700 kg", base: 150, perKm: 26, eta: 14, icon: "🛻" },
  { id: "packers", name: "Packers & Movers", capacity: "Full house shifting", base: 2999, perKm: 0, eta: 60, icon: "📦" },
  { id: "courier", name: "Intercity Courier", capacity: "Parcel < 50 kg", base: 99, perKm: 0, eta: 1440, icon: "✉️" },
];

export const cities = ["Bengaluru", "Mumbai", "Delhi NCR", "Chennai", "Hyderabad", "Pune", "Kolkata", "Ahmedabad"];

export const fares = {
  baseFare: 80,
  distance: 18.4 * 18,
  time: 45 * 1.5,
  labour: 0,
  tollsEst: 30,
  gst: 0,
  discount: 0,
};

export const offers = [
  { code: "PORTER50", title: "50% off your next booking", cap: "Max ₹100", expires: "5 days" },
  { code: "WEEKEND", title: "₹75 off weekend bookings", cap: "Min order ₹400", expires: "2 days" },
  { code: "REFER100", title: "₹100 off when you refer", cap: "First trip only", expires: "30 days" },
];

export const savedAddresses = [
  { label: "Home", line: "Flat 402, Prestige Shantiniketan, Whitefield, Bengaluru", tag: "home" },
  { label: "Work", line: "3rd floor, Embassy GolfLinks, Domlur, Bengaluru", tag: "work" },
  { label: "Parents", line: "B-12, Residency Road, Bengaluru", tag: "other" },
];

export const drivers = [
  { name: "Ravi Kumar", rating: 4.86, trips: 2184, vehicle: "Tata Ace · KA-01-AB-4823", phone: "+91 98450 ••••" },
  { name: "Mahesh D.", rating: 4.71, trips: 1402, vehicle: "Tempo · KA-05-CJ-7712", phone: "+91 98810 ••••" },
  { name: "Suresh N.", rating: 4.92, trips: 3188, vehicle: "Pickup · MH-02-GK-0918", phone: "+91 99220 ••••" },
  { name: "Deepa S.", rating: 4.95, trips: 812, vehicle: "Tata Ace EV · KA-03-FG-1120", phone: "+91 97400 ••••" },
];

export const trips = [
  { id: "TRP-9921", date: "24 Apr 2026 · 4:12 PM", from: "Koramangala 5th Block", to: "Whitefield, ITPL", vehicle: "Tata Ace", amount: 842, status: "Completed" },
  { id: "TRP-9918", date: "22 Apr 2026 · 9:04 AM", from: "HSR Layout", to: "Electronic City", vehicle: "2-Wheeler", amount: 148, status: "Completed" },
  { id: "TRP-9904", date: "18 Apr 2026 · 7:22 PM", from: "BTM 2nd Stage", to: "Yeshwanthpur", vehicle: "Pickup", amount: 735, status: "Completed" },
  { id: "TRP-9890", date: "12 Apr 2026 · 11:50 AM", from: "Jayanagar", to: "Airport Rd", vehicle: "Mini Truck", amount: 1120, status: "Cancelled" },
  { id: "TRP-9881", date: "08 Apr 2026 · 2:40 PM", from: "Indiranagar", to: "Hebbal", vehicle: "Tempo", amount: 498, status: "Completed" },
];

export const tickets = [
  { id: "T-24010", subject: "Overcharged by ₹120", customer: "Anita R.", status: "Open", sla: "2h 14m", priority: "High", tripId: "TRP-9921" },
  { id: "T-24009", subject: "Driver was late by 30 min", customer: "Rahul M.", status: "In Progress", sla: "4h 02m", priority: "Medium", tripId: "TRP-9918" },
  { id: "T-24008", subject: "Item damaged during shifting", customer: "Kiran V.", status: "Escalated", sla: "Breached", priority: "High", tripId: "TRP-9904" },
  { id: "T-24007", subject: "Refund not received", customer: "Neha B.", status: "Open", sla: "1h 30m", priority: "High", tripId: "TRP-9890" },
  { id: "T-24006", subject: "Wrong address booked", customer: "Arun T.", status: "Resolved", sla: "—", priority: "Low", tripId: "TRP-9881" },
];

export const payoutBatches = [
  { id: "PB-2026-17", period: "Week 17 · 13–19 Apr", drivers: 12804, amount: 42580120, status: "Scheduled", runAt: "Mon 09:00" },
  { id: "PB-2026-16", period: "Week 16 · 06–12 Apr", drivers: 12612, amount: 41203844, status: "Completed", runAt: "Mon 09:00" },
  { id: "PB-2026-15", period: "Week 15 · 30 Mar–05 Apr", drivers: 12411, amount: 39842100, status: "Completed", runAt: "Mon 09:00" },
];

export const bulkShipments = [
  { id: "BS-4401", origin: "Whitefield DC", dest: "HSR store", sku: "SKU-88", qty: 240, eta: "Tomorrow 11:00", status: "Scheduled" },
  { id: "BS-4400", origin: "Whitefield DC", dest: "Jayanagar store", sku: "SKU-41", qty: 120, eta: "Today 18:00", status: "In Transit" },
  { id: "BS-4399", origin: "Hoskote warehouse", dest: "Hebbal store", sku: "SKU-12", qty: 400, eta: "Today 14:00", status: "Delivered" },
];
