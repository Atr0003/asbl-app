import { useEffect, useState } from "react";
import { listCourses, type Course } from "../api/courses";
import { courseRoster, type RosterItem } from "../api/enrollments";
import { listAttendanceByDay, upsertAttendanceDay, type AttendanceStatus } from "../api/studentAttendance";

export default function AttendanceByDatePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [dateStr, setDateStr] = useState<string>(""); // YYYY-MM-DD

  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [statusByStudent, setStatusByStudent] = useState<Record<number, AttendanceStatus | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      const cs = await listCourses();
      cs.sort((a,b)=>a.name.localeCompare(b.name));
      setCourses(cs);
    })();
  }, []);

  async function loadData() {
    setMsg("");
    if (!courseId || !dateStr) { setMsg("Choisis un cours et une date"); return; }
    setLoading(true);
    try {
      const [r, att] = await Promise.all([
        courseRoster(Number(courseId)),
        listAttendanceByDay(Number(courseId), dateStr),
      ]);
      setRoster(r);
      const map: Record<number, AttendanceStatus> = {};
      for (const a of att) map[a.student_id] = a.status;
      setStatusByStudent(map);
      setMsg(`Présences du ${dateStr} chargées ✅`);
    } catch (e:any) {
      console.error(e);
      setMsg(e?.response?.data?.detail || "Erreur de chargement");
    } finally {
      setLoading(false);
    }
  }

  async function setStatus(student_id: number, newStatus: AttendanceStatus) {
    if (!courseId || !dateStr) return;
    setStatusByStudent(prev => ({ ...prev, [student_id]: newStatus })); // optimistic
    try {
      await upsertAttendanceDay({ student_id, course_id: Number(courseId), date: dateStr, status: newStatus });
    } catch (e:any) {
      console.error(e);
      setMsg("Erreur lors de l’enregistrement");
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin:"2rem auto", padding:"1rem" }}>
      <h1>Présences (par date)</h1>

      {/* Sélection cours + date */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 1fr auto", gap:8, margin:"1rem 0", alignItems:"end" }}>
        <div>
          <label>Cours</label>
          <select value={courseId} onChange={e=>setCourseId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— sélectionner un cours —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label>Date</label>
          <input type="date" value={dateStr} onChange={e=>setDateStr(e.target.value)} />
        </div>
        <button type="button" onClick={loadData}>Charger</button>
      </div>

      {msg && <p style={{ color: msg.includes("Erreur") ? "red" : "green" }}>{msg}</p>}

      {/* Grille simple (une date) */}
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
                {courseId && dateStr ? "Aucun élève inscrit" : "Choisis un cours et une date"}
              </td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
