import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RunDetail from "./pages/RunDetail";

// Porter walkthrough (no-backend prototype)
import Landing from "./porter/pages/Landing";
import ReviewIndex from "./porter/pages/ReviewIndex";
import CustomerApp from "./porter/pages/CustomerApp";
import DriverApp from "./porter/pages/DriverApp";
import FleetConsole from "./porter/pages/FleetConsole";
import EnterpriseConsole from "./porter/pages/EnterpriseConsole";
import AdminConsole from "./porter/pages/AdminConsole";
import SupportConsole from "./porter/pages/SupportConsole";
import FinanceConsole from "./porter/pages/FinanceConsole";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());

  return (
    <Routes>
      {/* Porter no-backend walkthrough */}
      <Route path="/porter" element={<Landing />} />
      <Route path="/porter/review" element={<ReviewIndex />} />
      <Route path="/porter/customer" element={<CustomerApp />} />
      <Route path="/porter/driver" element={<DriverApp />} />
      <Route path="/porter/fleet" element={<FleetConsole />} />
      <Route path="/porter/enterprise" element={<EnterpriseConsole />} />
      <Route path="/porter/admin" element={<AdminConsole />} />
      <Route path="/porter/support" element={<SupportConsole />} />
      <Route path="/porter/finance" element={<FinanceConsole />} />

      {authed ? (
        <>
          <Route path="/" element={<Dashboard />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/dashboard/runs/:id" element={<RunDetail />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </>
      ) : (
        <>
          <Route path="/" element={<Login onDone={() => setAuthed(true)} />} />
          <Route path="*" element={<Navigate to="/porter" replace />} />
        </>
      )}
    </Routes>
  );
}
