import { api } from "../api/client";

export async function markAttendance(payload: {
  monitor_id: number; session_id: number;
  status: "present" | "absent"; hours: number;
}) {
  const { data } = await api.post("/attendance", payload);
  return data;
}
