import { api } from "../api/client";
export type Worklog = { id:number; monitor_id:number; date:string; hours:number; course_id?:number|null };

export async function listWorklogs(monitor_id:number, month?:string): Promise<Worklog[]> {
  const { data } = await api.get("/worklogs", { params: { monitor_id, ...(month?{month}:{}) } });
  return data;
}
export async function createWorklog(payload:{monitor_id:number; date:string; hours:number; session_id?:number}) {
  const { data } = await api.post("/worklogs", payload); return data as Worklog;
}
export async function deleteWorklog(id:number) { await api.delete(`/worklogs1/${id}`); }
