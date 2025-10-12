import { useState } from "react";
import SessionsPage from "./pages/Sessions";
import MonitorsPage from "./pages/Monitors";
import ReportsPage from "./pages/Reports";

export default function App() {
  const [tab, setTab] = useState<"sessions"|"monitors"|"reports">("sessions");
  return (
    <div>
      <nav style={{display:"flex", gap:8, padding:"8px", borderBottom:"1px solid #ddd"}}>
        <button onClick={()=>setTab("sessions")}>Sessions</button>
        <button onClick={()=>setTab("monitors")}>Monitors</button>
        <button onClick={()=>setTab("reports")}>Reports</button>
      </nav>
      {tab==="sessions" && <SessionsPage/>}
      {tab==="monitors" && <MonitorsPage/>}
      {tab==="reports" && <ReportsPage/>}
    </div>
  );
}
