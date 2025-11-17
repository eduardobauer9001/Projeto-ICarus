
export enum UserRole {
  STUDENT = 'student',
  PROFESSOR = 'professor',
}

export interface User {
  id: number;
  nusp: string;
  name: string;
  email: string;
  role: UserRole;
  password?: string; // Should not be sent to frontend in real app
}

export interface Student extends User {
  role: UserRole.STUDENT;
  course: string;
  idealPeriod: number;
  curriculum?: File;
  curriculumFileName?: string;
}

export interface Professor extends User {
  role: UserRole.PROFESSOR;
  faculty: string;
  department: string;
}

export interface Project {
  id: number;
  title: string;
  professorId: number;
  professorName: string;
  area: string;
  theme: string;
  duration: string;
  hasScholarship: boolean;
  scholarshipDetails?: string;
  faculty: string;
  department: string;
  keywords: string[];
  vacancies: number;
  description: string;
  postedDate: string;
}

export enum ApplicationStatus {
  PENDING = 'Em avaliação',
  SELECTED = 'Selecionado',
  NOT_SELECTED = 'Não selecionado',
  ACCEPTED = 'Aceito',
  DECLINED = 'Recusado'
}

export interface Application {
  id: number;
  studentId: number;
  projectId: number;
  professorId: number;
  applicationDate: string;
  motivation: string;
  status: ApplicationStatus;
}