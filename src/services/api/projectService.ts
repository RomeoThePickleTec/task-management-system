// src/services/api/projectService.ts
// Servicios para operaciones con proyectos
import { apiClient } from './apiClient';
import { IProject, ProjectFilter } from '../../core/interfaces/models';

export class ProjectService {
  private static readonly BASE_PATH = '/projectlist';

  // Obtener todos los proyectos
  static async getProjects(filter?: ProjectFilter): Promise<IProject[]> {
    try {
      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.status !== undefined) queryParams['status'] = filter.status.toString();
      
      return await apiClient.get<IProject[]>(this.BASE_PATH, queryParams);
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  // Obtener un proyecto por ID
  static async getProjectById(id: number): Promise<IProject | null> {
    try {
      return await apiClient.get<IProject>(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
  }

  // Crear un nuevo proyecto
  static async createProject(projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>): Promise<IProject | null> {
    try {
      return await apiClient.post<IProject>(this.BASE_PATH, projectData);
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  // Actualizar un proyecto existente
  static async updateProject(id: number, projectData: Partial<IProject>): Promise<IProject | null> {
    try {
      return await apiClient.put<IProject>(`${this.BASE_PATH}/${id}`, projectData);
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      return null;
    }
  }

  // Eliminar un proyecto
  static async deleteProject(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return false;
    }
  }
}
