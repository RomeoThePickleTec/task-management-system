// src/services/api/apiClient.ts
// Cliente API base para realizar solicitudes a la API

const API_BASE_URL = 'http://backend-service:8081';
// const API_BASE_URL = 'http://localhost:8081';

// Opciones por defecto para fetch
const defaultOptions: RequestInit = {
  headers: {
    'Content-Type': 'application/json',
  },
};

// Cliente API genérico
export class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  // Método GET
  async get<T>(path: string, queryParams?: Record<string, string>): Promise<T> {
    let url = `${this.baseUrl}${path}`;
    
    // Agregar parámetros de consulta si existen
    if (queryParams) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        params.append(key, value);
      });
      url += `?${params.toString()}`;
    }
    
    const response = await fetch(url, {
      ...defaultOptions,
      method: 'GET',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Método POST
  async post<T>(path: string, data: any): Promise<T | null> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      // Verificar si hay contenido en la respuesta
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        try {
          return await response.json();
        } catch (e) {
          console.warn("Empty JSON response body", e);
          return null;
        }
      }
      
      // Para respuestas vacías o non-JSON, simplemente devolver null
      console.log("No JSON content in response or empty response");
      return null;
    } catch (error) {
      console.error(`Error in POST request to ${path}:`, error);
      throw error;
    }
  }

  // Método PUT
  async put<T>(path: string, data: any): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...defaultOptions,
      method: 'PUT',
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }

  // Método DELETE
  async delete<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      ...defaultOptions,
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status} ${response.statusText}`);
    }
    
    return await response.json();
  }
}

// Instancia del cliente API para usar en toda la aplicación
export const apiClient = new ApiClient();