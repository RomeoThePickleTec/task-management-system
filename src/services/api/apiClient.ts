// src/services/api/apiClient.ts
// Cliente API base para realizar solicitudes a la API

// const API_BASE_URL = 'http://backend-service:8081';
// const API_BASE_URL = 'http://localhost:8081';
const API_BASE_URL = 'http://220.158.78.114:8081';

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
        throw new Error(`API error: ${response.status} ${response.statusText}`);
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
      const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(data),
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
      throw error;
    }
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