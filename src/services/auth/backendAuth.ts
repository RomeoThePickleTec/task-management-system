// src/services/auth/backendAuth.ts
import { apiClient } from '@/services/api/apiClient';

export class BackendAuthService {
  static async login(username: string, password: string) {
    try {
      const response = await apiClient.post('/auth/login', { username, password });
      
      if (response && response.accessToken) {
        // Guarda los tokens en localStorage
        localStorage.setItem('accessToken', response.accessToken);
        localStorage.setItem('refreshToken', response.refreshToken);
        apiClient.setAuthToken(response.accessToken);
        return response;
      }
      throw new Error('Error de autenticación: No se recibieron tokens');
    } catch (error) {
      console.error('Error en login:', error);
      throw error;
    }
  }

  static async logout() {
    // Elimina los tokens del localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    apiClient.clearAuthToken();
  }

  static async refreshToken() {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No hay refreshToken disponible');
      }
      
      const response = await apiClient.post('/auth/refresh', refreshToken);
      
      if (response && response.accessToken) {
        localStorage.setItem('accessToken', response.accessToken);
        apiClient.setAuthToken(response.accessToken);
        return response;
      }
      throw new Error('Error al refrescar token');
    } catch (error) {
      console.error('Error al refrescar token:', error);
      // Si falla el refresh, cierra la sesión
      this.logout();
      throw error;
    }
  }

  static async getCurrentUser() {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;
      
      return await apiClient.get('/auth/me');
    } catch (error) {
      console.error('Error al obtener usuario actual:', error);
      return null;
    }
  }

  static getToken() {
    return localStorage.getItem('accessToken');
  }

  static isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default BackendAuthService;