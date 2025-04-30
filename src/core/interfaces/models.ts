// src/core/interfaces/models.ts

// Enums para estados y roles
export enum TaskStatus {
  TODO = 0,
  IN_PROGRESS = 1,
  COMPLETED = 2,
  BLOCKED = 3,
}

export enum ProjectStatus {
  PLANNING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
  ON_HOLD = 3,
}

export enum UserRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  DEVELOPER = 'DEVELOPER',
  TESTER = 'TESTER',
}

export enum WorkMode {
  OFFICE = 'OFFICE',
  REMOTE = 'REMOTE',
  HYBRID = 'HYBRID',
}

export enum SprintStatus {
  PLANNING = 0,
  ACTIVE = 1,
  COMPLETED = 2,
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
  sprint_id?: number;
  subtasks?: ISubtask[];
  comments?: IComment[];
  project_id?: number;
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
  sprints?: ISprint[];
  taskCount?: number;
  memberCount?: number;
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
  last_login?: string | null;
  active?: boolean;
  selectedProject?: IProject | null;
  selectedProject_id?: number | null;
}

export interface IProjectMember {
  id?: {
    projectId: number;
    userId: number;
  };
  project_id: number;
  user_id: number;
  joined_date?: string;
  role?: string;
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
  tasks?: ITask[];
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
  assignee_id?: number;
}

export interface ProjectFilter {
  status?: ProjectStatus;
}

export interface SprintFilter {
  project_id?: number;
  status?: SprintStatus;
  active?: boolean;
}

// Interfaces para estadísticas
export interface ProjectStats {
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  todoTasks: number;
  completionPercentage: number;
}

export interface UserStats {
  tasksAssigned: number;
  tasksCompleted: number;
  projectsInvolved: number;
  completionPercentage: number;
}

// Interface para la respuesta de autenticación
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: IUser;
}
