export enum UserRole {
  EMPLOYEE = 'EMPLOYEE',
  ADMIN = 'ADMIN'
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  avatar: string;
}

export interface Question {
  id: number;
  text: string;
  category: string;
  isHidden?: boolean;
}

export interface AnalysisResult {
  stressLevel: number; // 0-100
  focusLevel: number; // 0-100
  motivationLevel: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  summary: string;
  recommendations: string[];
}

export interface SurveyResponse {
  questionId: number;
  questionText: string;
  answer: string;
}

export interface UserProfile {
  name: string;
  role: string;
  age: string;
  image: string | null;
}

export interface EmployeeWithAuth extends UserProfile {
  id: string; // Unique ID (e.g., email or random ID)
  password?: string; // Optional for now, or just simulate auth
  lastAssessment?: {
    score: number | string;
    risk: 'High' | 'Medium' | 'Low';
    date: string;
    metrics?: {
      stress: number;
      satisfaction: number;
      focus: number;
    };
  };
  surveyConfig?: {
    frequency: 'daily' | 'weekly' | 'monthly';
    questionCount: number;
    questionTypes: string[]; // e.g., ['psychological', 'environmental', 'time']
    isSurveyVisible?: boolean;
    scheduledDate?: string;
  };
}