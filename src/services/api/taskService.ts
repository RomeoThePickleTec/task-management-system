// src/services/api/taskService.ts
// Servicios para operaciones con tareas
import { apiClient } from './apiClient';
import { ITask, TaskFilter } from '../../core/interfaces/models';
import { TaskFactory } from '../../core/patterns/factory';

export class TaskService {
  private static readonly BASE_PATH = '/tasklist';

  // Obtener todas las tareas
  static async getTasks(filter?: TaskFilter): Promise<ITask[]> {
    try {
      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.project_id) queryParams['project_id'] = filter.project_id.toString();
      if (filter?.status !== undefined) queryParams['status'] = filter.status.toString();
      if (filter?.priority) queryParams['priority'] = filter.priority.toString();
      if (filter?.sprint_id) queryParams['sprint_id'] = filter.sprint_id.toString();
      
      return await apiClient.get<ITask[]>(this.BASE_PATH, queryParams);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Obtener una tarea por ID
  static async getTaskById(id: number): Promise<ITask | null> {
    try {
      return await apiClient.get<ITask>(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva tarea
  static async createTask(taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>): Promise<ITask | null> {
    try {
      // Utilizar la Factory para crear la tarea
      const taskWithSubtasks = TaskFactory.createTask(taskData);
      return await apiClient.post<ITask>(this.BASE_PATH, taskWithSubtasks);
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  // Actualizar una tarea existente
  static async updateTask(id: number, taskData: Partial<ITask>): Promise<ITask | null> {
    try {
      return await apiClient.put<ITask>(`${this.BASE_PATH}/${id}`, taskData);
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      return null;
    }
  }

  // Eliminar una tarea
  static async deleteTask(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      return false;
    }
  }
}