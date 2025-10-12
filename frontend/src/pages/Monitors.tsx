import { useEffect, useState } from "react";
import { listMonitors, createMonitor, type Monitor } from "../api/monitors";

export default function MonitorsPage() {
  const [monitors, setMonitors] = useState<Monitor[]>([]);
  const [form, setForm] = useState({ name:"", email:"" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string>("");

  async function refresh() {
    setLoading(true);
    try { setMonitors(await listMonitors()); }
    finally { setLoading(false); }
  }
  useEffect(()=>{ refresh(); },[]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    if(!form.name || !form.email) { setMsg("Nom et email requis"); return; }
    try {
      await createMonitor({ name: form.name, email: form.email });
      setForm({ name:"", email:"" }); 
      await refresh();
      setMsg("Moniteur ajouté ✅");
    } catch (e:any) {
      setMsg(e?.response?.status === 409 ? "Email déjà existant" : "Erreur serveur");
    }
  }

  return (
    <div style={{maxWidth:800, margin:"2rem auto", padding:"1rem"}}>
      <h1>Monitors</h1>
      <form onSubmit={onSubmit} style={{display:"flex", gap:8, margin:"1rem 0"}}>
        <input placeholder="Nom" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/>
        <input placeholder="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})}/>
        <button type="submit">Ajouter</button>
      </form>
      {msg && <p>{msg}</p>}
      {loading ? <p>Chargement…</p> : (
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead><tr><th style={{textAlign:"left"}}>Nom</th><th>Email</th><th>Actif</th></tr></thead>
          <tbody>
            {monitors.map(m=>(
              <tr key={m.id} style={{borderTop:"1px solid #ddd"}}>
                <td>{m.name}</td><td>{m.email}</td><td>{m.active ? "Oui":"Non"}</td>
              </tr>
            ))}
            {monitors.length===0 && <tr><td colSpan={3} style={{padding:"1rem"}}>Aucun moniteur</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
