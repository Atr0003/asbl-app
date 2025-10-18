import { useState } from "react";
import MonitorsPage from "./pages/Monitors";
import ReportsPage from "./pages/Reports";
import CoursesPage from "./pages/Courses";
import StudentsPage from "./pages/Students";
import AttendanceByDatePage from "./pages/AttendanceByDate";
import WorklogsPage from "./pages/Worklogs";

export default function App() {
  const [tab, setTab] = useState<"sessions"|"monitors"|"reports"|"courses"|"students"|"attendanceByDate"|"worklogs">("courses");
  return (
    <div>
      <nav style={{display:"flex", gap:8, padding:"8px", borderBottom:"1px solid #ddd"}}>
        <button onClick={()=>setTab("courses")}>Courses</button>
        <button onClick={()=>setTab("monitors")}>Monitors</button>
        <button onClick={()=>setTab("reports")}>Reports</button>
        <button onClick={()=>setTab("students")}>Students</button>
        <button onClick={()=>setTab("attendanceByDate")}>Présences (date)</button>
        <button onClick={()=>setTab("worklogs")}>Worklogs</button>
      </nav>
      {tab==="courses" && <CoursesPage/>}
      {tab==="monitors" && <MonitorsPage/>}
      {tab==="reports" && <ReportsPage/>}
      {tab==="students" && <StudentsPage/>}
      {tab==="attendanceByDate" && <AttendanceByDatePage/>}
      {tab==="worklogs" && <WorklogsPage/>}
    </div>
  );
}
