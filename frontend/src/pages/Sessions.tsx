import { useEffect, useState } from "react";
import { listSessions, createSession, type Session } from "../api/sessions";
import { markAttendance } from "../api/attendance";

export default function SessionsPage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: "", activity: "", location: "", start_time: "", end_time: ""
  });
  const [pointer, setPointer] = useState<{[id:number]: {monitor_id:number; hours:number; status:"present"|"absent"}}>({});

  async function refresh() {
    setLoading(true);
    try { setSessions(await listSessions()); }
    finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, []);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!form.date || !form.activity) return;
    await createSession({
      date: form.date,
      activity: form.activity,
      location: form.location || undefined,
      start_time: form.start_time || undefined,
      end_time: form.end_time || undefined,
    });
    setForm({ date:"", activity:"", location:"", start_time:"", end_time:"" });
    refresh();
  }

  async function onPoint(session_id: number) {
    const p = pointer[session_id];
    if (!p || !p.monitor_id || !p.hours) return;
    await markAttendance({ session_id, monitor_id: p.monitor_id, hours: p.hours, status: p.status || "present" });
    refresh();
  }

  return (
    <div style={{maxWidth: 900, margin: "2rem auto", padding: "1rem"}}>
      <h1>Sessions</h1>

      {/* Création rapide */}
      <form onSubmit={onCreate} style={{display:"grid", gap:8, gridTemplateColumns:"1fr 1fr 1fr 1fr 1fr auto", alignItems:"end", margin:"1rem 0"}}>
        <div>
          <label>Date</label>
          <input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/>
        </div>
        <div>
          <label>Activité</label>
          <input value={form.activity} onChange={e=>setForm({...form, activity:e.target.value})} placeholder="Cours natation"/>
        </div>
        <div>
          <label>Lieu</label>
          <input value={form.location} onChange={e=>setForm({...form, location:e.target.value})}/>
        </div>
        <div>
          <label>Début</label>
          <input type="time" value={form.start_time} onChange={e=>setForm({...form, start_time:e.target.value})}/>
        </div>
        <div>
          <label>Fin</label>
          <input type="time" value={form.end_time} onChange={e=>setForm({...form, end_time:e.target.value})}/>
        </div>
        <button type="submit">Créer</button>
      </form>

      {/* Liste + pointer */}
      {loading ? <p>Chargement…</p> : (
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead>
            <tr>
              <th style={{textAlign:"left"}}>Date</th>
              <th>Activité</th>
              <th>Lieu</th>
              <th>Heures</th>
              <th>Pointer</th>
            </tr>
          </thead>
          <tbody>
            {sessions.map(s => (
              <tr key={s.id} style={{borderTop:"1px solid #ddd"}}>
                <td>{s.date}</td>
                <td>{s.activity}</td>
                <td>{s.location || "-"}</td>
                <td>
                  {/* Inputs monitor + hours + status */}
                  <input
                    type="number" min={1}
                    placeholder="monitor_id"
                    style={{width:110, marginRight:6}}
                    value={pointer[s.id]?.monitor_id ?? ""}
                    onChange={e=>{
                      const v = parseInt(e.target.value||"");
                      setPointer(p=>({...p, [s.id]: {monitor_id:v, hours:p[s.id]?.hours ?? 2, status:p[s.id]?.status ?? "present"}}));
                    }}
                  />
                  <input
                    type="number" min={0} step="0.5"
                    placeholder="heures"
                    style={{width:90, marginRight:6}}
                    value={pointer[s.id]?.hours ?? ""}
                    onChange={e=>{
                      const v = parseFloat(e.target.value||"");
                      setPointer(p=>({...p, [s.id]: {monitor_id:p[s.id]?.monitor_id ?? 1, hours:v, status:p[s.id]?.status ?? "present"}}));
                    }}
                  />
                  <select
                    value={pointer[s.id]?.status ?? "present"}
                    onChange={e=>{
                      const v = (e.target.value as "present"|"absent");
                      setPointer(p=>({...p, [s.id]: {monitor_id:p[s.id]?.monitor_id ?? 1, hours:p[s.id]?.hours ?? 2, status:v}}));
                    }}
                  >
                    <option value="present">present</option>
                    <option value="absent">absent</option>
                  </select>
                </td>
                <td>
                  <button onClick={()=>onPoint(s.id)}>Pointer</button>
                </td>
              </tr>
            ))}
            {sessions.length === 0 && (
              <tr><td colSpan={5} style={{padding:"1rem"}}>Aucune session. Crée la première ci-dessus.</td></tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}
