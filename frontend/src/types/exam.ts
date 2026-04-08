export type QuestionType = 'test' | 'yazili' | 'dogru_yanlis' | 'bosluk_doldurma';

export interface Question {
  id: number;
  exam_id: number;
  question_type: QuestionType;
  question_text: string;
  options?: string[];
  correct_answer?: string;
  kazanim?: string;
  week_number?: number;
  order: number;
}

export interface Exam {
  id: number;
  title: string;
  subject: string;
  grade?: string;
  week_numbers: number[];
  question_types: QuestionType[];
  question_count: number;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  questions?: Question[];
  created_at: string;
  updated_at: string;
}

export interface CreateExamPayload {
  title: string;
  subject: string;
  grade?: string;
  week_numbers: number[];
  question_types: QuestionType[];
  question_count: number;
  plan_id?: number;
}

export interface ExamGeneratePayload {
  exam_id: number;
}
