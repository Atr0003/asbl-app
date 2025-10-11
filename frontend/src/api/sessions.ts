import { api } from "../api/client";

export type Session = {
  id: number; date: string; activity: string;
  location?: string; start_time?: string; end_time?: string;
};

export async function listSessions(): Promise<Session[]> {
  const { data } = await api.get("/sessions");
  return data;
}

export async function createSession(payload: {
  date: string; activity: string; location?: string;
  start_time?: string; end_time?: string;
}) {
  const { data } = await api.post("/sessions", payload);
  return data as Session;
}
