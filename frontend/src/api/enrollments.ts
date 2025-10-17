import { api } from "../api/client";

export type RosterItem = {
  student_id: number;
  student_name: string;
  student_first_name: string;
  student_class: string;
};

export async function enrollStudent(student_id: number, course_id: number) {
  const { data } = await api.post("/enrollments", { student_id, course_id });
  return data;
}

export async function unenrollStudent(student_id: number, course_id: number) {
  await api.delete("/enrollments", { params: { student_id, course_id } });
}

export async function courseRoster(course_id: number): Promise<RosterItem[]> {
  const { data } = await api.get(`/enrollments/course/${course_id}/roster`);
  return data;
}
