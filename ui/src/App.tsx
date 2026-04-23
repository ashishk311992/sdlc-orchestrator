import { useState } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { getToken } from "./lib/api";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import RunDetail from "./pages/RunDetail";

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());

  if (!authed) {
    return <Login onDone={() => setAuthed(true)} />;
  }

  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/dashboard/runs/:id" element={<RunDetail />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
