import api from './api';
import type { Exam, CreateExamPayload, PaginatedResponse } from '../types';

export async function listExams(page = 1, size = 20): Promise<PaginatedResponse<Exam>> {
  const { data } = await api.get<PaginatedResponse<Exam>>('/exams', {
    params: { page, size },
  });
  return data;
}

export async function getExam(id: number): Promise<Exam> {
  const { data } = await api.get<Exam>(`/exams/${id}`);
  return data;
}

export async function createExam(payload: CreateExamPayload): Promise<Exam> {
  const { data } = await api.post<Exam>('/exams', payload);
  return data;
}

export async function generateExam(id: number): Promise<Exam> {
  const { data } = await api.post<Exam>(`/exams/${id}/generate`);
  return data;
}

export async function deleteExam(id: number): Promise<void> {
  await api.delete(`/exams/${id}`);
}

export async function downloadExam(id: number, format: 'docx' | 'pdf' = 'docx'): Promise<Blob> {
  const { data } = await api.get(`/exams/${id}/download`, {
    params: { format },
    responseType: 'blob',
  });
  return data;
}

export function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
