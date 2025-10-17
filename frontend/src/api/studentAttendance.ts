import { api } from "../api/client";

export type AttendanceStatus = "present" | "absent" | "excused";
export type StudentAttendance = { id:number; student_id:number; session_id:number; status:AttendanceStatus };

export async function listAttendanceBySession(session_id: number) {
  const { data } = await api.get("/student-attendance/by-session", { params: { session_id } });
  return data as StudentAttendance[];
}

export async function upsertAttendance(student_id: number, session_id: number, status: AttendanceStatus) {
  const { data } = await api.post("/student-attendance", { student_id, session_id, status });
  return data as StudentAttendance;
}
