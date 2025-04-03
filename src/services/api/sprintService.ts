// src/services/api/sprintService.ts
// Servicios para operaciones con sprints
import { apiClient } from './apiClient';
import { ISprint, SprintFilter } from '../../core/interfaces/models';

export class SprintService {
  private static readonly BASE_PATH = '/sprintlist';

  // Obtener todos los sprints
  static async getSprints(filter?: SprintFilter): Promise<ISprint[]> {
    try {
      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.project_id) queryParams['project_id'] = filter.project_id.toString();
      if (filter?.status !== undefined) queryParams['status'] = filter.status.toString();
      
      return await apiClient.get<ISprint[]>(this.BASE_PATH, queryParams);
    } catch (error) {
      console.error('Error fetching sprints:', error);
      return [];
    }
  }

  // Obtener sprint por ID
  static async getSprintById(id: number): Promise<ISprint | null> {
    try {
      return await apiClient.get<ISprint>(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error fetching sprint ${id}:`, error);
      return null;
    }
  }

  // Obtener sprints activos por proyecto
  static async getActiveSprintsByProject(projectId: number): Promise<ISprint[]> {
    try {
      return await apiClient.get<ISprint[]>(`${this.BASE_PATH}/active`, { project_id: projectId.toString() });
    } catch (error) {
      console.error(`Error fetching active sprints for project ${projectId}:`, error);
      return [];
    }
  }

  // Crear un nuevo sprint
  static async createSprint(sprintData: Omit<ISprint, 'id' | 'created_at' | 'updated_at'>): Promise<ISprint | null> {
    try {
      return await apiClient.post<ISprint>(this.BASE_PATH, sprintData);
    } catch (error) {
      console.error('Error creating sprint:', error);
      return null;
    }
  }

  // Actualizar un sprint existente
  static async updateSprint(id: number, sprintData: Partial<ISprint>): Promise<ISprint | null> {
    try {
      return await apiClient.put<ISprint>(`${this.BASE_PATH}/${id}`, sprintData);
    } catch (error) {
      console.error(`Error updating sprint ${id}:`, error);
      return null;
    }
  }

  // Eliminar un sprint
  static async deleteSprint(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting sprint ${id}:`, error);
      return false;
    }
  }
}
