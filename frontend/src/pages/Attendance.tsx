import { useEffect, useState } from "react";
import { listCourses, type Course } from "../api/courses";
import { courseRoster, type RosterItem } from "../api/enrollments";
import { listAttendanceByDay, upsertAttendanceDay, type AttendanceStatus } from "../api/studentAttendance";

export default function AttendancePage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [statusByStudent, setStatusByStudent] = useState<Record<number, AttendanceStatus | undefined>>({});
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  // Charger la liste des cours
  useEffect(() => {
    (async () => {
      const cs = await listCourses();
      cs.sort((a, b) => a.name.localeCompare(b.name));
      setCourses(cs);
    })();
  }, []);

  // Quand on choisit un cours → charger les élèves
  useEffect(() => {
    setRoster([]); setStatusByStudent({});
    if (!courseId || !selectedDate) return;
    (async () => {
      setLoading(true); setMsg("");
      try {
        const [r, att] = await Promise.all([
          courseRoster(Number(courseId)),
          listAttendanceByDay(Number(courseId), selectedDate)
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
  }, [courseId, selectedDate]);

  async function setStatus(student_id: number, newStatus: AttendanceStatus) {
    if (!selectedDate || !courseId) return;
    setStatusByStudent(prev => ({ ...prev, [student_id]: newStatus }));
    try {
      await upsertAttendanceDay({
        course_id: Number(courseId),
        student_id,
        date: selectedDate,
        status: newStatus
      });
      setMsg("Présence enregistrée ✅");
    } catch (e:any) {
      console.error(e);
      setMsg("Erreur lors de l’enregistrement");
    }
  }

  return (
    <div style={{ maxWidth: 1000, margin:"2rem auto", padding:"1rem" }}>
      <h1>Présences</h1>

      {/* Sélection du cours et de la date */}
      <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr", gap:8, margin:"1rem 0" }}>
        <div>
          <label>Cours</label>
          <select value={courseId} onChange={e=>setCourseId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— sélectionner un cours —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        <div>
          <label>Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={e => setSelectedDate(e.target.value)}
            disabled={!courseId}
          />
        </div>
      </div>

      {msg && <p style={{ color: msg.includes("Erreur") ? "red" : "green" }}>{msg}</p>}

      {loading ? <p>Chargement…</p> : (
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr>
              <th style={{ textAlign:"left" }}>Élève</th>
              <th>Statut</th>
              <th>Action</th>
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
                      <button onClick={()=>setStatus(r.student_id, "present")}>Présent</button>
                      <button onClick={()=>setStatus(r.student_id, "absent")}>Absent</button>
                      <button onClick={()=>setStatus(r.student_id, "excused")}>Excusé</button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {roster.length === 0 && (
              <tr><td colSpan={3} style={{ padding:"1rem" }}>
                {courseId && selectedDate ? "Aucun élève inscrit" : "Choisis un cours et une date"}
              </td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
