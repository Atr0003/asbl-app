import { useEffect, useMemo, useState } from "react";
import { listCourses, type Course, listCourseSessions } from "../api/courses";
import { courseRoster, type RosterItem } from "../api/enrollments";
import { listAttendanceBySession, upsertAttendance, type AttendanceStatus } from "../api/studentAttendance";

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [sessions, setSessions] = useState<{ id:number; index:number; date?:string|null }[]>([]);
  const [sessionId, setSessionId] = useState<number | "">("");
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [statusByStudent, setStatusByStudent] = useState<Record<number, AttendanceStatus | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // charge cours au mount
  useEffect(() => {
    (async () => {
      const cs = await listCourses();
      cs.sort((a,b)=>a.name.localeCompare(b.name));
      setCourses(cs);
    })();
  }, []);

  // quand cours change → sessions + vider roster/attendances
  useEffect(() => {
    setSessions([]); setSessionId(""); setRoster([]); setStatusByStudent({});
    if (!courseId) return;
    (async () => {
      const ss = await listCourseSessions(Number(courseId));
      ss.sort((a,b)=>a.index - b.index);
      setSessions(ss.map(s => ({ id:s.id, index:s.index, date:s.date ?? null })));
    })();
  }, [courseId]);

  // quand session change → charger roster + présences
  useEffect(() => {
    setRoster([]); setStatusByStudent({});
    if (!sessionId || !courseId) return;
    (async () => {
      setLoading(true); setMsg("");
      try {
        const [r, att] = await Promise.all([
          courseRoster(Number(courseId)),
          listAttendanceBySession(Number(sessionId))
        ]);
        setRoster(r);
        const map: Record<number, AttendanceStatus> = {};
        for (const a of att) map[a.student_id] = a.status;
        setStatusByStudent(map);
      } catch (e:any) {
        console.error(e);
        setMsg("Erreur de chargement");
      } finally {
        setLoading(false);
      }
    })();
  }, [sessionId, courseId]);

  async function setStatus(student_id: number, newStatus: AttendanceStatus) {
    if (!sessionId) return;
    // Optimistic update
    setStatusByStudent(prev => ({ ...prev, [student_id]: newStatus }));
    try {
      await upsertAttendance(student_id, Number(sessionId), newStatus);
      setMsg("Présence enregistrée ✅");
    } catch (e:any) {
      console.error(e);
      setMsg("Erreur lors de l’enregistrement");
    }
  }

  const sessionLabel = (s: {index:number; date?:string|null}) =>
    `Cours ${s.index}${s.date ? " — " + s.date : ""}`;

  return (
    <div style={{ maxWidth: 1000, margin:"2rem auto", padding:"1rem" }}>
      <h1>Attendance</h1>

      {/* Sélecteurs */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr", gap:8, margin:"1rem 0" }}>
        <div>
          <label>Cours</label>
          <select value={courseId} onChange={e=>setCourseId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— sélectionner un cours —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label>Séance</label>
          <select value={sessionId} onChange={e=>setSessionId(e.target.value ? Number(e.target.value) : "")} disabled={!courseId}>
            <option value="">— sélectionner une séance —</option>
            {sessions.map(s => <option key={s.id} value={s.id}>{sessionLabel(s)}</option>)}
          </select>
        </div>
      </div>

      {msg && <p style={{ color: msg.includes("Erreur") ? "red" : "green" }}>{msg}</p>}

      {/* Grille simple (1 colonne = séance sélectionnée) */}
      {loading ? <p>Chargement…</p> : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign:"left" }}>Élève</th>
              <th>Statut</th>
              <th>Action rapide</th>
            </tr>
          </thead>
          <tbody>
            {roster.map(r => {
              const current = statusByStudent[r.student_id] ?? undefined;
              return (
                <tr key={r.student_id} style={{ borderTop:"1px solid #eee" }}>
                  <td>{r.student_first_name} {r.student_name}</td>
                  <td style={{ textTransform:"capitalize" }}>{current ?? "—"}</td>
                  <td>
                    <div style={{ display:"flex", gap:6 }}>
                      <button type="button" onClick={()=>setStatus(r.student_id, "present")}>Présent</button>
                      <button type="button" onClick={()=>setStatus(r.student_id, "absent")}>Absent</button>
                      <button type="button" onClick={()=>setStatus(r.student_id, "excused")}>Excusé</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {roster.length === 0 && (
              <tr><td colSpan={3} style={{ padding:"1rem" }}>
                {courseId && sessionId ? "Aucun élève inscrit" : "Choisis un cours et une séance"}
              </td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
