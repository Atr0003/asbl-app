import { api } from "../api/client";

export type Monitor = { id:number; name:string; email:string; active:boolean };

export async function listMonitors(): Promise<Monitor[]> {
  const { data } = await api.get("/monitors");
  return data;
}

export async function createMonitor(payload: {name:string; email:string; active?:boolean}): Promise<Monitor> {
  const { data } = await api.post("/monitors", { ...payload, active: payload.active ?? true });
  return data;
}
