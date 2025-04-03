// src/core/interfaces/models.ts

// Enums para estados y roles
export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  BLOCKED = 3
}

export enum ProjectStatus {
  PLANNING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  ON_HOLD = 3
}

export enum UserRole {
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  DEVELOPER = "DEVELOPER",
  TESTER = "TESTER"
}

export enum WorkMode {
  OFFICE = "OFFICE",
  REMOTE = "REMOTE",
  HYBRID = "HYBRID"
}

export enum SprintStatus {
  PLANNING = 0,
  ACTIVE = 1,
  COMPLETED = 2
}

// Interfaces de modelos
export interface ITask {
  id?: number;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  due_date: string;
  priority: number;
  status: TaskStatus;
  estimated_hours: number;
  project_id?: number;
  subtasks?: ISubtask[];
  sprint_id?: number;
}

export interface ISubtask {
  id?: number;
  title: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  status: TaskStatus;
  task_id?: number;
}

export interface IProject {
  id?: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: ProjectStatus;
  created_at?: string;
  updated_at?: string;
}

export interface IUser {
  id?: number;
  username: string;
  email: string;
  full_name: string;
  password_hash?: string;
  role: UserRole;
  work_mode: WorkMode;
  created_at?: string;
  updated_at?: string;
}

export interface IProjectMember {
  id?: {
    projectId: number;
    userId: number;
  };
  project_id: number;
  user_id: number;
  project?: IProject;
  user?: IUser;
}

export interface IComment {
  id?: number;
  content: string;
  task_id: number;
  user_id: number;
  created_at?: string;
  updated_at?: string;
  user?: IUser;
}

export interface ISprint {
  id?: number;
  name: string;
  description: string;
  start_date: string;
  end_date: string;
  status: SprintStatus;
  project_id: number;
  created_at?: string;
  updated_at?: string;
}

// Interfaces para respuestas de API
export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

// Interfaces para filtros de búsqueda
export interface TaskFilter {
  project_id?: number;
  status?: TaskStatus;
  priority?: number;
  sprint_id?: number;
}

export interface ProjectFilter {
  status?: ProjectStatus;
}

export interface SprintFilter {
  project_id?: number;
  status?: SprintStatus;
  active?: boolean;
}