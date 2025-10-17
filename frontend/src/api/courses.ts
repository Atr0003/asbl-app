import { api } from "../api/client";

export type Course = {
  id: number;
  name: string;
  description?: string | null;
  monitor_id?: number | null;
};

export async function listCourses(monitor_id?: number): Promise<Course[]> {
  const { data } = await api.get("/courses", { params: monitor_id ? { monitor_id } : {} });
  return data;
}

export async function createCourse(payload: { name: string; description?: string; monitor_id?: number }) {
  const { data } = await api.post("/courses", payload);
  return data as Course;
}

export async function getOrCreateSessionByDate(courseId: number, date: string) {
  const { data } = await api.post(`/courses/${courseId}/sessions/by-date`, { date });
  return data as { id:number; course_id:number; index:number; date:string|null };
}
