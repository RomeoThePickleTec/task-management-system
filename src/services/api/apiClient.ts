// src/services/api/apiClient.ts
// Cliente API base para realizar solicitudes a la API con logs detallados

// const API_BASE_URL = 'http://backend-service:8081';
// const API_BASE_URL = 'http://localhost:8081';
const API_BASE_URL = 'http://220.158.78.114:8081';

const MAX_RETRIES = 2; // Maximum number of retry attempts
const RETRY_DELAY = 1000; // Delay between retries in milliseconds

// Niveles de log
enum LogLevel {
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
  DEBUG = 'DEBUG'
}

// Cliente API genérico
export class ApiClient {
  private baseUrl: string;
  private headers: HeadersInit;
  private enableDetailedLogs: boolean;

  constructor(baseUrl: string = API_BASE_URL, enableDetailedLogs: boolean = true) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
    };
    this.enableDetailedLogs = enableDetailedLogs;
  }

  // Utilidad para generar logs con formato y timestamp
  private log(level: LogLevel, message: string, data?: any): void {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [API] [${level}]`;
    
    if (data !== undefined) {
      if (level === LogLevel.ERROR) {
        console.error(`${prefix} ${message}`, data);
      } else if (level === LogLevel.WARN) {
        console.warn(`${prefix} ${message}`, data);
      } else if (level === LogLevel.DEBUG && this.enableDetailedLogs) {
        console.debug(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`, data);
      }
    } else {
      if (level === LogLevel.ERROR) {
        console.error(`${prefix} ${message}`);
      } else if (level === LogLevel.WARN) {
        console.warn(`${prefix} ${message}`);
      } else if (level === LogLevel.DEBUG && this.enableDetailedLogs) {
        console.debug(`${prefix} ${message}`);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  // Método para formatear el cuerpo de la solicitud o respuesta para log
  private formatBody(body: any): any {
    try {
      if (!body) return 'No body content';
      if (typeof body === 'string') {
        try {
          // Intentar parsear como JSON para formato
          return JSON.parse(body);
        } catch {
          // Si no es JSON, devolver como string
          return body;
        }
      }
      // Si ya es un objeto, devolver directamente
      return body;
    } catch (error) {
      return `[Unparseable body]: ${String(body)}`;
    }
  }

  // Set auth token for authenticated requests
  setAuthToken(token: string): void {
    this.log(LogLevel.INFO, `Setting auth token: ${token.substring(0, 10)}...`);
    this.headers = {
      ...this.headers,
      Authorization: `Bearer ${token}`,
    };
  }

  // Clear auth token
  clearAuthToken(): void {
    this.log(LogLevel.INFO, 'Clearing auth token');
    const headers = { ...this.headers } as Record<string, string>;
    // Remove Authorization header if it exists
    delete headers.Authorization;
    this.headers = headers;
  }

  // Helper to delay for retry
  private async delay(ms: number): Promise<void> {
    this.log(LogLevel.DEBUG, `Delaying for ${ms}ms`);
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  // Agregar un interceptor para refrescar tokens expirados
  private async handleTokenRefresh(url: string, options: RequestInit): Promise<Response> {
    try {
      this.log(LogLevel.DEBUG, `Making request to ${url} with token refresh handling`);
      
      const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
      console.group(`🔄 INTENTO DE AUTENTICACIÓN [${requestId}]: ${url}`);
      
      const response = await fetch(url, options);
      
      // Log inicial de la respuesta
      console.log(`Status inicial: ${response.status} ${response.statusText}`);
      
      // Si hay un error 401 (Unauthorized), intentar refrescar el token
      if (response.status === 401) {
        console.log(`⚠️ Recibido 401 Unauthorized - Intentando refrescar token`);
        // Verificar si hay un refreshToken disponible
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) {
          console.error(`❌ No hay refreshToken disponible`);
          console.groupEnd();
          throw new Error('No hay refreshToken disponible');
        }

        // Intentar refrescar el token
        try {
          console.log(`🔄 Solicitando nuevo token en ${this.baseUrl}/auth/refresh`);
          const refreshOptions = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(refreshToken),
          };
          
          // Log de la petición de refresh
          console.log(`Petición de refresh:`, {
            url: `${this.baseUrl}/auth/refresh`,
            headers: refreshOptions.headers,
            body: refreshToken
          });
          
          const refreshResponse = await fetch(`${this.baseUrl}/auth/refresh`, refreshOptions);
          
          // Log de la respuesta de refresh
          console.log(`Respuesta de refresh: Status ${refreshResponse.status} ${refreshResponse.statusText}`);
          
          if (!refreshResponse.ok) {
            console.error(`❌ Error al refrescar token: ${refreshResponse.status} ${refreshResponse.statusText}`);
            console.groupEnd();
            throw new Error('Error al refrescar token');
          }

          const data = await refreshResponse.json();
          console.log(`✅ Token refrescado exitosamente`);
          console.log(`Nuevo token: ${data.accessToken.substring(0, 15)}...`);

          // Guardar el nuevo token y actualizar los headers
          localStorage.setItem('accessToken', data.accessToken);
          this.setAuthToken(data.accessToken);

          // Reintentar la solicitud original con el nuevo token
          const newOptions = { ...options };
          newOptions.headers = {
            ...options.headers,
            Authorization: `Bearer ${data.accessToken}`,
          };
          
          console.log(`🔄 Reintentando petición original con nuevo token`);
          console.log(`Nueva petición:`, {
            url: url,
            method: options.method,
            headers: newOptions.headers
          });
          
          console.groupEnd();
          return fetch(url, newOptions);
        } catch (error) {
          // Si falla el refresh, eliminar tokens y devolver el error
          console.error(`❌ Error en proceso de refresh:`, error);
          localStorage.removeItem('accessToken');
          localStorage.removeItem('refreshToken');
          console.groupEnd();
          throw error;
        }
      }

      console.groupEnd();
      return response;
    } catch (error) {
      this.log(LogLevel.ERROR, `Error in token refresh handler for ${url}`, error);
      throw error;
    }
  }

  // Log request details before sending
  private logRequest(method: string, url: string, options: RequestInit): void {
    // Siempre loguear la petición completa, independientemente del nivel de detalle
    const requestId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    
    console.group(`🔼 PETICIÓN [${requestId}]: ${method} ${url}`);
    console.log(`URL: ${url}`);
    console.log(`Método: ${method}`);
    console.log(`Headers:`, options.headers);
    
    if (options.body) {
      console.log(`Body:`, this.formatBody(options.body));
    } else {
      console.log(`Body: No body content`);
    }
    
    // Guardar el ID de petición para asociarlo con la respuesta
    (options as any).__requestId = requestId;
    
    console.groupEnd();
  }

  // Log response details after receiving
  private async logResponse(method: string, url: string, response: Response, options?: RequestInit): Promise<void> {
    // Obtener el ID de la petición si existe
    const requestId = options ? (options as any).__requestId : 'unknown';
    
    // Clonar la respuesta para evitar consumirla
    const clonedResponse = response.clone();
    
    console.group(`🔽 RESPUESTA [${requestId}]: ${method} ${url} - ${response.status} ${response.statusText}`);
    console.log(`URL: ${url}`);
    console.log(`Status: ${response.status} ${response.statusText}`);
    console.log(`Headers:`, Object.fromEntries(response.headers.entries()));
    
    try {
      const contentType = clonedResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const body = await clonedResponse.json();
        console.log(`Body (JSON):`, body);
      } else {
        const text = await clonedResponse.text();
        if (text) {
          console.log(`Body (Text):`, text);
        } else {
          console.log(`Body: Empty response`);
        }
      }
    } catch (error) {
      console.warn(`Error al leer el cuerpo de la respuesta:`, error);
    }
    
    console.groupEnd();
  }

  // Add retry logic to fetch requests
  private async fetchWithRetry(
    url: string,
    options: RequestInit,
    retries = MAX_RETRIES
  ): Promise<Response> {
    const method = options.method || 'GET';

    try {
      this.logRequest(method, url, options);
      
      const response = await fetch(url, options);
      await this.logResponse(method, url, response, options);

      // If the request was successful but server returned an error
      if (!response.ok) {
        // Handle specific error codes
        if (response.status === 500) {
          this.log(LogLevel.WARN, `Server returned 500 Internal Server Error for ${method} ${url}`);

          // Log additional information if available
          try {
            const errorText = await response.text();
            this.log(LogLevel.WARN, `Server error details: ${errorText}`);
          } catch {
            // Ignore error reading response text
            this.log(LogLevel.WARN, 'Could not read error response text');
          }

          // For 500 errors, we might not want to retry immediately as it's likely a server issue
          if (retries <= 0) {
            this.log(LogLevel.ERROR, `Maximum retries reached for ${method} ${url} with 500 error`);
            throw new Error(`API error: ${response.status} Internal Server Error`);
          }

          // Wait longer for 500 errors before retrying
          this.log(LogLevel.INFO, `Waiting longer before retrying ${method} ${url} due to 500 error`);
          await this.delay(RETRY_DELAY * 2);
          
          this.log(LogLevel.INFO, `Retrying ${method} ${url} after 500 error (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})`);
          return this.fetchWithRetry(url, options, retries - 1);
        } else {
          this.log(LogLevel.ERROR, `API error: ${response.status} ${response.statusText} for ${method} ${url}`);
          throw new Error(`API error: ${response.status} ${response.statusText}`);
        }
      }

      return response;
    } catch (error) {
      // If we have no more retries, throw the error
      if (retries <= 0) {
        this.log(LogLevel.ERROR, `Maximum retries reached for ${method} ${url}`, error);
        throw error;
      }

      // Log retry attempt
      this.log(
        LogLevel.WARN,
        `Request failed, retrying ${method} ${url} (${MAX_RETRIES - retries + 1}/${MAX_RETRIES})...`,
        error
      );

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
      this.log(LogLevel.INFO, `GET request to ${path} with params: ${params.toString()}`);
    } else {
      this.log(LogLevel.INFO, `GET request to ${path}`);
    }

    const startTime = Date.now();
    try {
      const response = await this.fetchWithRetry(url, {
        method: 'GET',
        headers: this.headers,
      });

      const data = await response.json();
      const endTime = Date.now();
      this.log(LogLevel.INFO, `GET request to ${path} completed in ${endTime - startTime}ms`);
      
      return data;
    } catch (error) {
      const endTime = Date.now();
      this.log(LogLevel.ERROR, `GET request to ${path} failed after ${endTime - startTime}ms`, error);
      throw error;
    }
  }

  // Método POST
  async post<T>(path: string, data: Record<string, unknown>): Promise<T | null> {
    this.log(LogLevel.INFO, `POST request to ${path}`);
    this.log(LogLevel.DEBUG, 'POST data:', data);
    
    const startTime = Date.now();
    try {
      // Check if data has minimal required fields for common entities
      const preparedData = this.prepareDataForPost(path, data);
      this.log(LogLevel.DEBUG, 'Prepared POST data:', preparedData);

      const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
        method: 'POST',
        headers: this.headers,
        body: JSON.stringify(preparedData),
      });

      // Verificar si hay contenido en la respuesta
      const contentType = response.headers.get('content-type');
      const endTime = Date.now();
      
      if (contentType && contentType.includes('application/json')) {
        try {
          const responseData = await response.json();
          this.log(LogLevel.INFO, `POST request to ${path} completed in ${endTime - startTime}ms with JSON response`);
          return responseData;
        } catch {
          this.log(LogLevel.WARN, `POST request to ${path} completed in ${endTime - startTime}ms with empty JSON response`);
          return null;
        }
      }

      // Para respuestas vacías o non-JSON
      this.log(LogLevel.INFO, `POST request to ${path} completed in ${endTime - startTime}ms with no JSON content`);
      return null;
    } catch (error) {
      const endTime = Date.now();
      this.log(LogLevel.ERROR, `POST request to ${path} failed after ${endTime - startTime}ms`, error);

      // Check if it's a 500 error
      if (error instanceof Error && error.message.includes('500')) {
        this.log(
          LogLevel.WARN,
          `Server returned 500 for POST to ${path}. This might be due to validation issues.`
        );
      }

      throw error;
    }
  }

  // Helper method to add common required fields based on entity type
  private prepareDataForPost(path: string, data: Record<string, unknown>): Record<string, unknown> {
    // Make a copy to avoid modifying the original
    const preparedData = { ...data };

    // Add entity-specific default fields
    if (path.includes('/userlist')) {
      // Ensure user data has minimal required fields
      if (!preparedData.username) {
        preparedData.username = `user_${Date.now()}`;
        this.log(LogLevel.DEBUG, `Added default username: ${preparedData.username}`);
      }
      if (!preparedData.email) {
        preparedData.email = `${preparedData.username}@example.com`;
        this.log(LogLevel.DEBUG, `Added default email: ${preparedData.email}`);
      }
      if (!preparedData.full_name) {
        preparedData.full_name = preparedData.username;
        this.log(LogLevel.DEBUG, `Added default full_name: ${preparedData.full_name}`);
      }
      if (preparedData.password_hash === undefined) {
        preparedData.password_hash = 'defaultpassword';
        this.log(LogLevel.DEBUG, `Added default password_hash`);
      }
    }

    // Add timestamps if not present
    if (!preparedData.created_at) {
      preparedData.created_at = new Date().toISOString();
      this.log(LogLevel.DEBUG, `Added created_at: ${preparedData.created_at}`);
    }

    if (!preparedData.updated_at) {
      preparedData.updated_at = new Date().toISOString();
      this.log(LogLevel.DEBUG, `Added updated_at: ${preparedData.updated_at}`);
    }

    return preparedData;
  }

  // Método PUT
  async put<T>(path: string, data: Record<string, unknown>): Promise<T> {
    this.log(LogLevel.INFO, `PUT request to ${path}`);
    this.log(LogLevel.DEBUG, 'PUT data:', data);
    
    const startTime = Date.now();
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
        method: 'PUT',
        headers: this.headers,
        body: JSON.stringify(data),
      });

      const responseData = await response.json();
      const endTime = Date.now();
      this.log(LogLevel.INFO, `PUT request to ${path} completed in ${endTime - startTime}ms`);
      
      return responseData;
    } catch (error) {
      const endTime = Date.now();
      this.log(LogLevel.ERROR, `PUT request to ${path} failed after ${endTime - startTime}ms`, error);
      throw error;
    }
  }

  // Método DELETE
  async delete<T>(path: string): Promise<T> {
    this.log(LogLevel.INFO, `DELETE request to ${path}`);
    
    const startTime = Date.now();
    try {
      const response = await this.fetchWithRetry(`${this.baseUrl}${path}`, {
        method: 'DELETE',
        headers: this.headers,
      });

      const data = await response.json();
      const endTime = Date.now();
      this.log(LogLevel.INFO, `DELETE request to ${path} completed in ${endTime - startTime}ms`);
      
      return data;
    } catch (error) {
      const endTime = Date.now();
      this.log(LogLevel.ERROR, `DELETE request to ${path} failed after ${endTime - startTime}ms`, error);
      throw error;
    }
  }

  // Check if the API is available
  async healthCheck(): Promise<boolean> {
    this.log(LogLevel.INFO, 'Performing API health check');
    
    const startTime = Date.now();
    try {
      // First try a health-check specific endpoint if available
      try {
        this.log(LogLevel.DEBUG, 'Trying /health-check endpoint');
        const response = await fetch(`${this.baseUrl}/health-check`, {
          method: 'GET',
          headers: this.headers,
          // Short timeout to avoid waiting too long
          signal: AbortSignal.timeout(3000),
        });

        if (response.ok) {
          const endTime = Date.now();
          this.log(LogLevel.INFO, `Health check successful via /health-check in ${endTime - startTime}ms`);
          return true;
        }
        
        this.log(LogLevel.WARN, `Health-check endpoint responded with ${response.status} ${response.statusText}`);
      } catch (error) {
        // Health-check endpoint might not exist, try something else
        this.log(LogLevel.WARN, 'Health-check endpoint not available, trying alternatives', error);
      }

      // If health-check endpoint is not available, try to get users
      // or any other endpoint that should be accessible
      try {
        this.log(LogLevel.DEBUG, 'Trying /userlist endpoint for health check');
        const response = await fetch(`${this.baseUrl}/userlist`, {
          method: 'GET',
          headers: this.headers,
          signal: AbortSignal.timeout(3000),
        });

        const endTime = Date.now();
        const isHealthy = response.ok;
        
        if (isHealthy) {
          this.log(LogLevel.INFO, `Health check successful via /userlist in ${endTime - startTime}ms`);
        } else {
          this.log(LogLevel.WARN, `Health check failed via /userlist: ${response.status} ${response.statusText}`);
        }
        
        return isHealthy;
      } catch (error) {
        const endTime = Date.now();
        this.log(LogLevel.ERROR, `Secondary health check failed after ${endTime - startTime}ms`, error);
        return false;
      }
    } catch (error) {
      const endTime = Date.now();
      this.log(LogLevel.ERROR, `Health check failed after ${endTime - startTime}ms`, error);
      return false;
    }
  }
  
  // Método para habilitar/deshabilitar logs detallados
  setDetailedLogsEnabled(enabled: boolean): void {
    this.log(LogLevel.INFO, `${enabled ? 'Habilitando' : 'Deshabilitando'} logs detallados`);
    this.enableDetailedLogs = enabled;
  }
}

// Instancia del cliente API para usar en toda la aplicación
export const apiClient = new ApiClient();