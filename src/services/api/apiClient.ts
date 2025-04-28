// src/services/api/apiClient.ts
// Cliente API base para realizar solicitudes a la API

// const API_BASE_URL = 'http://backend-service:8081';
 const API_BASE_URL = 'http://localhost:8081';
//const API_BASE_URL = 'http://220.158.78.114:8081';

const MAX_RETRIES = 2; // Maximum number of retry attempts
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

// Cliente API genérico
export class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string): void {
    this.headers = {
      ...this.headers,
      'Authorization': `Bearer ${token}`
    };
  }

  // Clear auth token
  clearAuthToken(): void {
    const { Authorization, ...rest } = this.headers as Record<string, string>;
    this.headers = rest;
  }

  // Helper to delay for retry
  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

// Agregar un interceptor para refrescar tokens expirados
private async handleTokenRefresh(url: string, options: RequestInit): Promise<Response> {
  try {
    const response = await fetch(url, options);
    
    // Si hay un error 401 (Unauthorized), intentar refrescar el token
    if (response.status === 401) {
      // Verificar si hay un refreshToken disponible
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        throw new Error('No hay refreshToken disponible');
      }
      
      // Intentar refrescar el token
      try {
        const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(refreshToken),
        });
        
        if (!refreshResponse.ok) {
          throw new Error('Error al refrescar token');
        }
        
        const data = await refreshResponse.json();
        
        // Guardar el nuevo token y actualizar los headers
        localStorage.setItem('accessToken', data.accessToken);
        this.setAuthToken(data.accessToken);
        
        // Reintentar la solicitud original con el nuevo token
        options.headers = {
          ...options.headers,
          'Authorization': `Bearer ${data.accessToken}`
        };
        
        return fetch(url, options);
      } catch (error) {
        // Si falla el refresh, eliminar tokens y devolver el error
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        throw error;
      }
    }
    
    return response;
  } catch (error) {
    throw error;
  }
}

  // Add retry logic to fetch requests
  private async fetchWithRetry(
    url: string, 
    options: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> {
    try {
      const response = await fetch(url, options);
      
      // If the request was successful but server returned an error
      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 500) {
          console.warn(`Server returned 500 Internal Server Error`);
          
          // Log additional information if available
          try {
            const errorText = await response.text();
            console.warn(`Server error details: ${errorText}`);
          } catch (e) {
            // Ignore error reading response text
          }
          
          // For 500 errors, we might not want to retry immediately as it's likely a server issue
          if (retries <= 0) {
            throw new Error(`API error: ${response.status} Internal Server Error`);
          }
          
          // Wait longer for 500 errors before retrying
          await this.delay(RETRY_DELAY * 2);
        } else {
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }
      
      return response;
    } catch (error) {
      // If we have no more retries, throw the error
      if (retries <= 0) {
        throw error;
      }
      
      // Log retry attempt
      console.warn(`Request failed, retrying (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`, error);
      
      // Wait before retrying
      await this.delay(RETRY_DELAY);
      
      // Retry with one less retry attempt
      return this.fetchWithRetry(url, options, retries - 1);
    }
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
    
    const response = await this.fetchWithRetry(url, {
      method: 'GET',
      headers: this.headers,
    });
    
    return await response.json();
  }

  // Método POST
  async post<T>(path: string, data: any): Promise<T | null> {
    try {
      // Check if data has minimal required fields for common entities
      const preparedData = this.prepareDataForPost(path, data);
      
      const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(preparedData),
      });
      
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
      
      // Check if it's a 500 error
      if (error instanceof Error && error.message.includes('500')) {
        console.warn(`Server returned 500 for POST to ${path}. This might be due to validation issues.`);
      }
      
      throw error;
    }
  }
  
  // Helper method to add common required fields based on entity type
  private prepareDataForPost(path: string, data: any): any {
    // Make a copy to avoid modifying the original
    const preparedData = { ...data };
    
    // Add entity-specific default fields
    if (path.includes('/userlist')) {
      // Ensure user data has minimal required fields
      if (!preparedData.username) preparedData.username = `user_${Date.now()}`;
      if (!preparedData.email) preparedData.email = `${preparedData.username}@example.com`;
      if (!preparedData.full_name) preparedData.full_name = preparedData.username;
      if (preparedData.password_hash === undefined) preparedData.password_hash = 'defaultpassword';
    }
    
    // Add timestamps if not present
    if (!preparedData.created_at) {
      preparedData.created_at = new Date().toISOString();
    }
    
    if (!preparedData.updated_at) {
      preparedData.updated_at = new Date().toISOString();
    }
    
    return preparedData;
  }

  // Método PUT
  async put<T>(path: string, data: any): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(data),
    });
    
    return await response.json();
  }

  // Método DELETE
  async delete<T>(path: string): Promise<T> {
    const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
      method: 'DELETE',
      headers: this.headers,
    });
    
    return await response.json();
  }

  // Check if the API is available
  async healthCheck(): Promise<boolean> {
    try {
      // First try a health-check specific endpoint if available
      try {
        const response = await fetch(`${this.baseUrl}/health-check`, {
          method: 'GET',
          headers: this.headers,
          // Short timeout to avoid waiting too long
          signal: AbortSignal.timeout(3000)
        });
        
        if (response.ok) {
          return true;
        }
      } catch (error) {
        // Health-check endpoint might not exist, try something else
        console.log("Health-check endpoint not available, trying alternatives");
      }
      
      // If health-check endpoint is not available, try to get users
      // or any other endpoint that should be accessible
      try {
        const response = await fetch(`${this.baseUrl}/userlist`, {
          method: 'GET',
          headers: this.headers,
          signal: AbortSignal.timeout(3000)
        });
        
        return response.ok;
      } catch (error) {
        console.error("Secondary health check failed:", error);
        return false;
      }
    } catch (error) {
      console.error('Health check failed:', error);
      return false;
    }
  }
}

// Instancia del cliente API para usar en toda la aplicación
export const apiClient = new ApiClient();