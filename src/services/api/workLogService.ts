// src/services/api/workLogService.ts
import { apiClient } from './apiClient';
import { IWorkLog } from '../../core/interfaces/models';

export class WorkLogService {
  private static readonly BASE_PATH = '/workloglist';

  // Obtener todos los logs de trabajo
  static async getWorkLogs(filter?: {
    task_id?: number;
    user_id?: number;
    start_date?: string;
    end_date?: string;
  }): Promise<IWorkLog[]> {
    try {
      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.task_id) queryParams['task_id'] = filter.task_id.toString();
      if (filter?.user_id) queryParams['user_id'] = filter.user_id.toString();
      if (filter?.start_date) queryParams['start_date'] = filter.start_date;
      if (filter?.end_date) queryParams['end_date'] = filter.end_date;

      return await apiClient.get<IWorkLog[]>(this.BASE_PATH, queryParams);
    } catch (error) {
      console.error('Error fetching work logs:', error);
      return [];
    }
  }

  // Obtener logs de trabajo por tarea
  static async getWorkLogsByTask(taskId: number): Promise<IWorkLog[]> {
    try {
      return await apiClient.get<IWorkLog[]>(`${this.BASE_PATH}/task/${taskId}`);
    } catch (error) {
      console.error(`Error fetching work logs for task ${taskId}:`, error);
      return [];
    }
  }

  // Obtener logs de trabajo por usuario
  static async getWorkLogsByUser(userId: number): Promise<IWorkLog[]> {
    try {
      return await apiClient.get<IWorkLog[]>(`${this.BASE_PATH}/user/${userId}`);
    } catch (error) {
      console.error(`Error fetching work logs for user ${userId}:`, error);
      return [];
    }
  }

  // Obtener logs de trabajo por usuario y sprint
  static async getWorkLogsByUserAndSprint(userId: number, sprintId: number): Promise<IWorkLog[]> {
    try {
      // Implementar esta función cuando la API lo soporte
      // Por ahora, obtenemos todos los logs del usuario y filtramos por sprint
      const userLogs = await this.getWorkLogsByUser(userId);
      
      // Necesitaríamos obtener las tareas del sprint para filtrar
      const { TaskService } = await import('./taskService');
      const sprintTasks = await TaskService.getTasks({ sprint_id: sprintId });
      const sprintTaskIds = sprintTasks.map(task => task.id);
      
      // Filtrar logs que corresponden a tareas del sprint
      return userLogs.filter(log => 
        log.task_id && sprintTaskIds.includes(log.task_id)
      );
    } catch (error) {
      console.error(`Error fetching work logs for user ${userId} and sprint ${sprintId}:`, error);
      return [];
    }
  }

  // Crear un nuevo log de trabajo
  static async createWorkLog(workLogData: Omit<IWorkLog, 'id' | 'created_at' | 'updated_at'>): Promise<IWorkLog | null> {
    try {
      return await apiClient.post<IWorkLog>(this.BASE_PATH, workLogData);
    } catch (error) {
      console.error('Error creating work log:', error);
      return null;
    }
  }

  // Actualizar un log de trabajo existente
  static async updateWorkLog(id: number, workLogData: Partial<IWorkLog>): Promise<IWorkLog | null> {
    try {
      return await apiClient.put<IWorkLog>(`${this.BASE_PATH}/${id}`, workLogData);
    } catch (error) {
      console.error(`Error updating work log ${id}:`, error);
      return null;
    }
  }

  // Eliminar un log de trabajo
  static async deleteWorkLog(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting work log ${id}:`, error);
      return false;
    }
  }
}