import { api } from "../api/client";

export type Student = { id: number; name: string; first_name: string; class_name: string };

export async function listStudents(): Promise<Student[]> {
  const { data } = await api.get("/students");
  return data;
}

export async function createStudent(payload: { name: string; first_name: string; class_name: string }) {
  const { data } = await api.post("/students", payload);
  return data as Student;
}
