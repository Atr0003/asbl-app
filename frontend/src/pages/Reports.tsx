import { useState } from "react";
import { monthlyReport, type ReportLine } from "../api/reports";

function toCSV(rows: ReportLine[]) {
  const header = "monitor_id,monitor_name,total_hours";
  const body = rows.map(r => `${r.monitor_id},"${r.monitor_name.replace(/"/g,'""')}",${r.total_hours}`).join("\n");
  return header + "\n" + body;
}
function downloadCSV(filename:string, content:string) {
  const blob = new Blob([content], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [month, setMonth] = useState<string>(()=> {
    const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`;
  });
  const [rows, setRows] = useState<ReportLine[]>([]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function load() {
    setLoading(true); setMsg("");
    try {
      const data = await monthlyReport(month);
      setRows(data);
      if (data.length===0) setMsg("Aucune donnée pour ce mois");
    } catch {
      setMsg("Erreur lors du chargement");
    } finally { setLoading(false); }
  }

  function onExport() {
    if(rows.length===0) { setMsg("Rien à exporter"); return; }
    downloadCSV(`rapport_${month}.csv`, toCSV(rows));
  }

  return (
    <div style={{maxWidth:800, margin:"2rem auto", padding:"1rem"}}>
      <h1>Reports</h1>
      <div style={{display:"flex", gap:8, alignItems:"center", margin:"1rem 0"}}>
        <input type="month" value={month} onChange={e=>setMonth(e.target.value)} />
        <button onClick={load}>Charger</button>
        <button onClick={onExport}>Exporter CSV</button>
      </div>
      {msg && <p>{msg}</p>}
      {loading ? <p>Chargement…</p> : (
        <table style={{width:"100%", borderCollapse:"collapse"}}>
          <thead><tr><th style={{textAlign:"left"}}>Moniteur</th><th>Total heures</th></tr></thead>
          <tbody>
            {rows.map(r=>(
              <tr key={r.monitor_id} style={{borderTop:"1px solid #ddd"}}>
                <td>{r.monitor_name}</td><td style={{textAlign:"right"}}>{r.total_hours}</td>
              </tr>
            ))}
            {rows.length===0 && <tr><td colSpan={2} style={{padding:"1rem"}}>—</td></tr>}
          </tbody>
        </table>
      )}
    </div>
  );
}
