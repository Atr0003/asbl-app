import { useState } from "react";
import SessionsPage from "./pages/Sessions";
import MonitorsPage from "./pages/Monitors";
import ReportsPage from "./pages/Reports";
import CoursesPage from "./pages/Courses";
import StudentsPage from "./pages/Students";

export default function App() {
  const [tab, setTab] = useState<"sessions"|"monitors"|"reports"|"courses"|"students">("courses");
  return (
    <div>
      <nav style={{display:"flex", gap:8, padding:"8px", borderBottom:"1px solid #ddd"}}>
        <button onClick={()=>setTab("courses")}>Courses</button>
        <button onClick={()=>setTab("sessions")}>Sessions</button>
        <button onClick={()=>setTab("monitors")}>Monitors</button>
        <button onClick={()=>setTab("reports")}>Reports</button>
        <button onClick={()=>setTab("students")}>Students</button>
      </nav>
      {tab==="courses" && <CoursesPage/>}
      {tab==="sessions" && <SessionsPage/>}
      {tab==="monitors" && <MonitorsPage/>}
      {tab==="reports" && <ReportsPage/>}
      {tab==="students" && <StudentsPage/>}
    </div>
  );
}
