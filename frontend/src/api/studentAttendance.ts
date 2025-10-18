import { api } from "../api/client";

export type AttendanceStatus = "present" | "absent" | "excused";

export type StudentAttendance = {
  id: number;
  student_id: number;
  course_id: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
};

export async function listAttendanceByDay(course_id: number, date: string) {
  const { data } = await api.get("/student-attendance/by-day", { params: { course_id, date } });
  return data as StudentAttendance[];
}

export async function upsertAttendanceDay(payload: {
  student_id: number;
  course_id: number;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
}) {
  const { data } = await api.post("/student-attendance", payload);
  return data as StudentAttendance;
}
