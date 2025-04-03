// src/services/api/subtaskService.ts
// Servicios para operaciones con subtareas
import { apiClient } from './apiClient';
import { ISubtask } from '../../core/interfaces/models';

export class SubtaskService {
  private static readonly BASE_PATH = '/subtasklist';

  // Obtener una subtarea por ID
  static async getSubtaskById(id: number): Promise<ISubtask | null> {
    try {
      return await apiClient.get<ISubtask>(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error fetching subtask ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva subtarea
  static async createSubtask(subtaskData: Omit<ISubtask, 'id' | 'created_at' | 'updated_at'>): Promise<ISubtask | null> {
    try {
      return await apiClient.post<ISubtask>(this.BASE_PATH, subtaskData);
    } catch (error) {
      console.error('Error creating subtask:', error);
      return null;
    }
  }

  // Actualizar una subtarea existente
  static async updateSubtask(id: number, subtaskData: Partial<ISubtask>): Promise<ISubtask | null> {
    try {
      return await apiClient.put<ISubtask>(`${this.BASE_PATH}/${id}`, subtaskData);
    } catch (error) {
      console.error(`Error updating subtask ${id}:`, error);
      return null;
    }
  }

  // Eliminar una subtarea
  static async deleteSubtask(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting subtask ${id}:`, error);
      return false;
    }
  }
}