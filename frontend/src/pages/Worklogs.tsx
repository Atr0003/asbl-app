import { useEffect, useState } from "react";
import { listWorklogs, createWorklog, deleteWorklog, type Worklog } from "../api/worklogs";
import { listCourses, type Course } from "../api/courses";

const MONITOR_ID = 1; // provisoire (avant Auth)

export default function WorklogsPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [courseId, setCourseId] = useState<number | "">("");
  const [month, setMonth] = useState(() => {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  const [form, setForm] = useState({ date: "", hours: "", course_id: "" as number | "" });
  const [rows, setRows] = useState<Worklog[]>([]);
  const [msg, setMsg] = useState("");

  useEffect(() => { (async () => {
    const cs = await listCourses(MONITOR_ID); cs.sort((a,b)=>a.name.localeCompare(b.name));
    setCourses(cs);
  })(); }, []);

  useEffect(() => { load(); }, [month]);

  async function load() {
    const data = await listWorklogs(MONITOR_ID, month);
    data.sort((a,b)=> (a.date < b.date ? 1 : -1));
    setRows(data);
    if (data.length === 0) setMsg("Aucune prestation pour ce mois");
  }

  async function onAdd(e: React.FormEvent) {
    e.preventDefault(); setMsg("");
    const date = form.date;
    const hours = Number(form.hours);
    if (!date || !hours || hours <= 0) { setMsg("Date et heures > 0 requises"); return; }
    await createWorklog({
      monitor_id: MONITOR_ID,
      date,
      hours,
      ...(form.course_id ? { course_id: Number(form.course_id) } : {}),
    });
    setForm({ date: "", hours: "", course_id: "" }); await load(); setMsg("Ajouté ✅");
  }

  async function onDelete(id: number) {
    await deleteWorklog(id);
    setRows(prev => prev.filter(r => r.id !== id));
  }

  return (
    <div style={{ maxWidth: 1000, margin:"2rem auto", padding:"1rem" }}>
      <h1>Présences Moniteurs</h1>

      <div style={{ display:"flex", gap:8, alignItems:"center", margin:"8px 0" }}>
        <label>Mois</label><input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
      </div>

      <form onSubmit={onAdd} style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr auto", gap:8, alignItems:"end", margin:"12px 0" }}>
        <div>
          <label>Date</label>
          <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
        </div>
        <div>
          <label>Heures</label>
          <input type="number" min={0.5} step={0.5} value={form.hours} onChange={e=>setForm({...form, hours:e.target.value})}/>
        </div>
        <div>
          <label>Cours (optionnel)</label>
          <select value={form.course_id} onChange={e=>setForm({...form, course_id: e.target.value ? Number(e.target.value) : ""})}>
            <option value="">—</option>
            {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <button type="submit">Ajouter</button>
      </form>

      {msg && <p>{msg}</p>}

      <table style={{ width:"100%", borderCollapse:"collapse" }}>
        <thead><tr><th style={{ textAlign:"left" }}>Date</th><th>Heures</th><th>Cours</th><th></th></tr></thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.id} style={{ borderTop:"1px solid #eee" }}>
              <td>{r.date}</td>
              <td style={{ textAlign:"right" }}>{r.hours}</td>
              <td>{r.course_id ?? "—"}</td>
              <td><button type="button" onClick={()=>onDelete(r.id)}>Supprimer</button></td>
            </tr>
          ))}
          {rows.length === 0 && <tr><td colSpan={4} style={{ padding:"1rem" }}>—</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
