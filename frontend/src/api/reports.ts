import { api } from "../api/client";
export type ReportLine = { monitor_id:number; monitor_name:string; total_hours:number };

export async function monthlyReport(month: string): Promise<ReportLine[]> {
  const { data } = await api.get("/reports/monthly", { params: { month } });
  return data;
}
