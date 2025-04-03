// src/services/api/projectMemberService.ts
// Servicios para operaciones con miembros de proyectos
import { apiClient } from './apiClient';
import { IProjectMember } from '../../core/interfaces/models';

export class ProjectMemberService {
  private static readonly BASE_PATH = '/projectmember';

  // Obtener todos los miembros de proyectos
  static async getProjectMembers(): Promise<IProjectMember[]> {
    try {
      return await apiClient.get<IProjectMember[]>(this.BASE_PATH);
    } catch (error) {
      console.error('Error fetching project members:', error);
      return [];
    }
  }

  // Obtener miembros por proyecto
  static async getProjectMembersByProject(projectId: number): Promise<IProjectMember[]> {
    try {
      return await apiClient.get<IProjectMember[]>(`${this.BASE_PATH}/project/${projectId}`);
    } catch (error) {
      console.error(`Error fetching members for project ${projectId}:`, error);
      return [];
    }
  }

  // Obtener proyectos por usuario
  static async getProjectMembersByUser(userId: number): Promise<IProjectMember[]> {
    try {
      return await apiClient.get<IProjectMember[]>(`${this.BASE_PATH}/user/${userId}`);
    } catch (error) {
      console.error(`Error fetching projects for user ${userId}:`, error);
      return [];
    }
  }

  // Añadir un miembro a un proyecto
  static async addProjectMember(projectMember: IProjectMember): Promise<IProjectMember | null> {
    try {
      return await apiClient.post<IProjectMember>(this.BASE_PATH, projectMember);
    } catch (error) {
      console.error('Error adding project member:', error);
      return null;
    }
  }

  // Eliminar un miembro de un proyecto
  static async removeProjectMember(projectId: number, userId: number): Promise<boolean> {
    try {
      // La API puede variar, ajusta según sea necesario
      await apiClient.delete(`${this.BASE_PATH}/${projectId}/${userId}`);
      return true;
    } catch (error) {
      console.error(`Error removing user ${userId} from project ${projectId}:`, error);
      return false;
    }
  }
}
