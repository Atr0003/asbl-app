import { useEffect, useMemo, useState } from "react";
import { listCourses, createCourse, type Course } from "../api/courses";
import { listMonitors, type Monitor } from "../api/monitors";

export default function CoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [form, setForm] = useState<{ name: string; description: string; monitor_id?: number }>({
    name: "",
    description: "",
  });
  const [msg, setMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const monitorById = useMemo(() => new Map(monitors.map((m) => [m.id, m.name])), [monitors]);

  async function refresh() {
    const [cs, ms] = await Promise.all([listCourses(), listMonitors()]);
    cs.sort((a, b) => a.name.localeCompare(b.name));
    setCourses(cs);
    setMonitors(ms);
  }
  useEffect(() => { refresh(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    const name = form.name.trim();
    if (!name) { setMsg("Nom requis"); return; }
    if (!form.monitor_id) { setMsg("Moniteur requis"); return; }

    setSubmitting(true);
    try {
      await createCourse({
        name,
        description: form.description || undefined,
        monitor_id: form.monitor_id, // requis
      });
      setForm({ name: "", description: "" });
      await refresh();
      setMsg("Cours créé ✅");
    } catch (err: any) {
      console.error(err);
      setMsg(err?.response?.data?.detail || "Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  }

  const canCreate = !!form.name.trim() && !!form.monitor_id;

  return (
    <div style={{ maxWidth: 900, margin: "2rem auto", padding: "1rem" }}>
      <h1>Courses ({courses.length})</h1>

      <form
        onSubmit={onCreate}
        style={{ display: "grid", gridTemplateColumns: "2fr 3fr 2fr auto", gap: 8, alignItems: "end", margin: "1rem 0" }}
      >
        <div>
          <label>Nom du cours</label>
          <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Natation A" />
        </div>
        <div>
          <label>Description (optionnelle)</label>
          <input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Débutants" />
        </div>
        <div>
          <label>Moniteur (obligatoire)</label>
          <select
            value={form.monitor_id ?? ""}
            onChange={(e) => setForm({ ...form, monitor_id: e.target.value ? Number(e.target.value) : undefined })}
          >
            <option value="">— sélectionner —</option>
            {monitors.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>
        <button type="submit" disabled={submitting || !canCreate}>
          {submitting ? "Création..." : "Créer"}
        </button>
      </form>

      {msg && <p style={{ color: msg.includes("Erreur") ? "red" : "green" }}>{msg}</p>}

      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr><th style={{ textAlign: "left" }}>Nom</th><th>Description</th><th>Moniteur</th></tr>
        </thead>
        <tbody>
          {courses.map((c) => (
            <tr key={c.id} style={{ borderTop: "1px solid #eee" }}>
              <td>{c.name}</td>
              <td>{c.description || "—"}</td>
              <td>{c.monitor_id ? monitorById.get(c.monitor_id) ?? `#${c.monitor_id}` : "—"}</td>
            </tr>
          ))}
          {courses.length === 0 && <tr><td colSpan={3} style={{ padding: "1rem" }}>Aucun cours</td></tr>}
        </tbody>
      </table>
    </div>
  );
}
