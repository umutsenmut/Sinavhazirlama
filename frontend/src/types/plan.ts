export interface Kazanim {
  id: number;
  plan_id: number;
  week_number: number;
  kazanim_no: string;
  kazanim_text: string;
  unit?: string;
}

export interface Plan {
  id: number;
  title: string;
  subject: string;
  grade: string;
  academic_year: string;
  file_name: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  kazanimlar?: Kazanim[];
  kazanim_count?: number;
  created_at: string;
  updated_at: string;
}

export interface UploadPlanPayload {
  title: string;
  subject: string;
  grade: string;
  academic_year: string;
  file: File;
}
