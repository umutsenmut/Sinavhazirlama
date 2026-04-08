import api from './api';
import type { Plan, PaginatedResponse } from '../types';

export interface UploadPlanFormData {
  title: string;
  subject: string;
  grade: string;
  academic_year: string;
  file: File;
}

export async function uploadPlan(
  payload: UploadPlanFormData,
  onProgress?: (pct: number) => void
): Promise<Plan> {
  const form = new FormData();
  form.append('title', payload.title);
  form.append('subject', payload.subject);
  form.append('grade', payload.grade);
  form.append('academic_year', payload.academic_year);
  form.append('file', payload.file);

  const { data } = await api.post<Plan>('/plans', form, {
    headers: { 'Content-Type': 'multipart/form-data' },
    onUploadProgress: e => {
      if (onProgress && e.total) {
        onProgress(Math.round((e.loaded * 100) / e.total));
      }
    },
  });
  return data;
}

export async function listPlans(page = 1, size = 20): Promise<PaginatedResponse<Plan>> {
  const { data } = await api.get<PaginatedResponse<Plan>>('/plans', {
    params: { page, size },
  });
  return data;
}

export async function getPlan(id: number): Promise<Plan> {
  const { data } = await api.get<Plan>(`/plans/${id}`);
  return data;
}

export async function deletePlan(id: number): Promise<void> {
  await api.delete(`/plans/${id}`);
}
