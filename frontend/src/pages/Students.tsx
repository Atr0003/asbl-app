import { useEffect, useMemo, useState } from "react";
import { listStudents, createStudent, type Student } from "../api/students";
import { listCourses, type Course } from "../api/courses";
import { enrollStudent, unenrollStudent, courseRoster, type RosterItem } from "../api/enrollments";

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ name: "", first_name: "", class_name: "" });
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Inscription
  const [selectedStudentId, setSelectedStudentId] = useState<number | "">("");
  const [selectedCourseId, setSelectedCourseId] = useState<number | "">("");
  const [enrolling, setEnrolling] = useState(false);

  // Roster
  const [rosterCourseId, setRosterCourseId] = useState<number | "">("");
  const [roster, setRoster] = useState<RosterItem[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  const studentById = useMemo(() => new Map(students.map(s => [s.id, `${s.first_name} ${s.name}`])), [students]);

  async function refresh() {
    const [ss, cs] = await Promise.all([listStudents(), listCourses()]);
    ss.sort((a,b)=> a.name.localeCompare(b.name) || a.first_name.localeCompare(b.first_name));
    cs.sort((a,b)=> a.name.localeCompare(b.name));
    setStudents(ss);
    setCourses(cs);
  }

  useEffect(() => { refresh(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const { name, first_name, class_name } = {
      name: form.name.trim(),
      first_name: form.first_name.trim(),
      class_name: form.class_name.trim(),
    };
    if (!name || !first_name || !class_name) { setMsg("Nom, prénom et classe sont requis"); return; }

    setSubmitting(true);
    try {
      await createStudent({ name, first_name, class_name });
      setForm({ name: "", first_name: "", class_name: "" });
      await refresh();
      setMsg("Élève créé ✅");
    } catch (err: any) {
      console.error(err);
      setMsg(err?.response?.data?.detail || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  }

  async function onEnroll() {
    setMsg("");
    if (!selectedStudentId || !selectedCourseId) { setMsg("Choisis un élève et un cours"); return; }
    setEnrolling(true);
    try {
      await enrollStudent(Number(selectedStudentId), Number(selectedCourseId));
      setMsg(`Inscription effectuée ✅ (${studentById.get(Number(selectedStudentId))} → ${courses.find(c=>c.id===selectedCourseId)?.name || "cours"})`);
      if (rosterCourseId === selectedCourseId) await loadRoster(Number(selectedCourseId));
    } catch (err: any) {
      console.error(err);
      setMsg(err?.response?.data?.detail || "Erreur lors de l’inscription (existe déjà ?)");
    } finally {
      setEnrolling(false);
    }
  }

  async function onUnenroll(student_id: number, course_id: number) {
    setMsg("");
    try {
      await unenrollStudent(student_id, course_id);
      setMsg("Élève retiré du cours ✅");
      if (rosterCourseId === course_id) await loadRoster(course_id);
    } catch (err: any) {
      console.error(err);
      setMsg(err?.response?.data?.detail || "Erreur lors du retrait");
    }
  }

  async function loadRoster(courseId: number) {
    setLoadingRoster(true);
    try {
      setRoster(await courseRoster(courseId));
    } finally {
      setLoadingRoster(false);
    }
  }

  useEffect(() => {
    if (rosterCourseId) loadRoster(Number(rosterCourseId));
    else setRoster([]);
  }, [rosterCourseId]);

  return (
    <div style={{ maxWidth: 1000, margin: "2rem auto", padding: "1rem" }}>
      <h1>Students ({students.length})</h1>

      {/* Ajout d’un élève */}
      <form onSubmit={onCreate}
        style={{ display:"grid", gridTemplateColumns:"2fr 2fr 1fr auto", gap:8, alignItems:"end", margin:"1rem 0" }}>
        <div>
          <label>Nom</label>
          <input value={form.name} onChange={e=>setForm({...form, name:e.target.value})} placeholder="Nom" />
        </div>
        <div>
          <label>Prénom</label>
          <input value={form.first_name} onChange={e=>setForm({...form, first_name:e.target.value})} placeholder="Prénom" />
        </div>
        <div>
          <label>Classe</label>
          <input value={form.class_name} onChange={e=>setForm({...form, class_name:e.target.value})} placeholder="P5A / 3ème / etc." />
        </div>
        <button type="submit" disabled={submitting}>{submitting ? "Création..." : "Ajouter"}</button>
      </form>

      {/* Inscription élève → cours */}
      <section style={{ borderTop:"1px solid #eee", paddingTop:12, marginTop:12 }}>
        <h2>Inscrire un élève à un cours</h2>
        <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr auto", gap:8, alignItems:"center" }}>
          <select value={selectedStudentId} onChange={e=>setSelectedStudentId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— élève —</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.name} ({s.class_name})</option>)}
          </select>
          <select value={selectedCourseId} onChange={e=>setSelectedCourseId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— cours —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button onClick={onEnroll} disabled={enrolling}>{enrolling ? "Inscription..." : "Inscrire"}</button>
        </div>
      </section>

      {/* Roster d’un cours */}
      <section style={{ borderTop:"1px solid #eee", paddingTop:12, marginTop:12 }}>
        <h2>Roster (élèves inscrits)</h2>
        <div style={{ display:"flex", gap:8, alignItems:"center", marginBottom:8 }}>
          <label>Cours</label>
          <select value={rosterCourseId} onChange={e=>setRosterCourseId(e.target.value ? Number(e.target.value) : "")}>
            <option value="">— sélectionner un cours —</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {loadingRoster ? <p>Chargement…</p> : (
          <table style={{ width:"100%", borderCollapse:"collapse" }}>
            <thead>
              <tr><th style={{ textAlign:"left" }}>Nom complet</th><th>Classe</th><th>Action</th></tr>
            </thead>
            <tbody>
              {roster.map(r => (
                <tr key={r.student_id} style={{ borderTop:"1px solid #eee" }}>
                  <td>{r.student_first_name} {r.student_name}</td>
                  <td>{r.student_class}</td>
                  <td>
                    <button onClick={()=>onUnenroll(r.student_id, Number(rosterCourseId))}>Retirer</button>
                  </td>
                </tr>
              ))}
              {roster.length === 0 && <tr><td colSpan={3} style={{ padding:"1rem" }}>Aucun élève inscrit</td></tr>}
            </tbody>
          </table>
        )}
      </section>

      {msg && <p style={{ marginTop:12, color: msg.includes("Erreur") ? "red" : "green" }}>{msg}</p>}

      {/* Liste brute de tous les élèves */}
      <section style={{ borderTop:"1px solid #eee", paddingTop:12, marginTop:12 }}>
        <h2>Tous les élèves</h2>
        <table style={{ width:"100%", borderCollapse:"collapse" }}>
          <thead>
            <tr><th style={{ textAlign:"left" }}>Nom</th><th>Prénom</th><th>Classe</th></tr>
          </thead>
          <tbody>
            {students.map(s => (
              <tr key={s.id} style={{ borderTop:"1px solid #eee" }}>
                <td>{s.name}</td>
                <td>{s.first_name}</td>
                <td>{s.class_name}</td>
              </tr>
            ))}
            {students.length === 0 && <tr><td colSpan={3} style={{ padding:"1rem" }}>Aucun élève</td></tr>}
          </tbody>
        </table>
      </section>
    </div>
  );
}
