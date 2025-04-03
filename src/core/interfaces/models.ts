// src/core/interfaces/models.ts
export interface ITask {
    id: number;
    title: string;
    description: string;
    created_at: string;
    updated_at: string;
    due_date: string;
    priority: number;
    status: TaskStatus;
    estimated_hours: number;
    project_id?: number;
    subtasks?: ISubtask[];
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
    tasks?: ITask[];
    members?: IProjectMember[];
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
  