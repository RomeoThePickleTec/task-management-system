// src/services/api/userService.ts
// Servicios para operaciones con usuarios
import { apiClient } from './apiClient';
import { IUser } from '../../core/interfaces/models';

export class UserService {
  private static readonly BASE_PATH = '/userlist';

  // Obtener todos los usuarios
  static async getUsers(): Promise<IUser[]> {
    try {
      return await apiClient.get<IUser[]>(this.BASE_PATH);
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Obtener un usuario por ID
  static async getUserById(id: number): Promise<IUser | null> {
    try {
      return await apiClient.get<IUser>(`${this.BASE_PATH}/${id}`);
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  // Crear un nuevo usuario
  static async createUser(userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<IUser | null> {
    try {
      return await apiClient.post<IUser>(this.BASE_PATH, userData);
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Actualizar un usuario existente
  static async updateUser(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      return await apiClient.put<IUser>(`${this.BASE_PATH}/${id}`, userData);
    } catch (error) {
      console.error(`Error updating user ${id}:`, error);
      return null;
    }
  }

  // Eliminar un usuario
  static async deleteUser(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting user ${id}:`, error);
      return false;
    }
  }
}