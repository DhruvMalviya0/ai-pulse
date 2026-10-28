import React, { useState } from "react";
import Login from "./pages/Login.jsx";
import OrgPicker from "./pages/OrgPicker.jsx";
import Diagnostic from "./pages/Diagnostic.jsx";
import Report from "./pages/Report.jsx";
import Dashboard from "./pages/Dashboard.jsx";

export default function App() {
  const [step, setStep] = useState("login");
  const [session, setSession] = useState(null);
  const [org, setOrg] = useState(null);

  return (
    <div className="wrap">
      <h1>AI Pulse</h1>
      {step === "login" && (
        <Login onDone={(s) => { setSession(s); setStep("org"); }} />
      )}
      {step === "org" && (
        <OrgPicker
          orgs={session.organizations}
          // Client request 2: employees land on their report, where "Delete my data" is, without retaking first
          onPick={(o) => { setOrg(o); setStep(o.role === "admin" ? "dashboard" : "report"); }}
        />
      )}
      {step === "diagnostic" && <Diagnostic onDone={() => setStep("report")} />}
      {step === "report" && <Report onTake={() => setStep("diagnostic")} />}
      {/* Fix V1: the dashboard no longer gets an org id; the server uses the token's org */}
      {step === "dashboard" && <Dashboard />}
    </div>
  );
}
