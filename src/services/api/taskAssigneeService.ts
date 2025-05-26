// src/services/api/taskAssigneeService.ts
// Servicios para operaciones con usuarios asignados a tareas
import { apiClient } from './apiClient';

export interface ITaskAssignee {
  id?: number;
  task_id: number;
  user_id: number;
  assigned_date?: string;
  role?: string;
  task?: any;
  user?: {
    id: number;
    username: string;
    fullName: string;
    email: string;
    phone?: string;
  };
}

export class TaskAssigneeService {
  private static readonly BASE_PATH = '/asignee';

  // Obtener todos los usuarios asignados a tareas
  static async getTaskAssignees(): Promise<ITaskAssignee[]> {
    try {
      return await apiClient.get<ITaskAssignee[]>(this.BASE_PATH);
    } catch (error) {
      console.error('Error fetching task assignees:', error);
      return [];
    }
  }

  // Asignar un usuario a una tarea
  static async addTaskAssignee(taskAssignee: { task_id: number; user_id: number }): Promise<ITaskAssignee | null> {
    try {
      const payload = {
        task_id: taskAssignee.task_id,
        user_id: taskAssignee.user_id
      };
      return await apiClient.post<ITaskAssignee>(this.BASE_PATH, payload);
    } catch (error) {
      console.error('Error adding task assignee:', error);
      return null;
    }
  }

  // Desasignar un usuario de una tarea
  static async removeTaskAssignee(taskId: number, userId: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${taskId}/${userId}`);
      return true;
    } catch (error) {
      console.error(`Error removing user ${userId} from task ${taskId}:`, error);
      return false;
    }
  }
}