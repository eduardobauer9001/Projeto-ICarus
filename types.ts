
export enum UserRole {
  STUDENT = 'student',
  PROFESSOR = 'professor',
}

export interface User {
  id: string; // Firebase IDs are strings
  nusp: string;
  name: string;
  email: string;
  role: UserRole;
  // Password is handled by Firebase Auth
}

export interface Student extends User {
  role: UserRole.STUDENT;
  course: string;
  idealPeriod: number;
  curriculumBase64?: string; // Storing as Base64 string for Firestore simplicity
  curriculumFileName?: string;
}

export interface Professor extends User {
  role: UserRole.PROFESSOR;
  faculty: string;
  department: string;
}

export interface Project {
  id: string;
  title: string;
  professorId: string;
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
  id: string;
  studentId: string;
  projectId: string;
  professorId: string;
  applicationDate: string;
  motivation: string;
  status: ApplicationStatus;
  viewedByStudent: boolean;
  viewedByProfessor: boolean;
}