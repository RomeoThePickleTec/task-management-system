// src/services/api/projectService.ts
// Servicios para operaciones con proyectos y actualizado para usar el nuevo formato de API
import { apiClient } from './apiClient';
import { IProject, ProjectFilter, ProjectStatus } from '../../core/interfaces/models';

// Clase auxiliar para hacer cache de los proyectos y reducir llamadas al servidor
class ProjectCache {
  private static instance: ProjectCache;
  private cache: IProject[] = [];
  private lastFetch: number = 0;
  private cacheLifetime: number = 60000; // 1 minuto

  private constructor() {}

  public static getInstance(): ProjectCache {
    if (!ProjectCache.instance) {
      ProjectCache.instance = new ProjectCache();
    }
    return ProjectCache.instance;
  }

  public setProjects(projects: IProject[]): void {
    this.cache = projects;
    this.lastFetch = Date.now();
  }

  public getProjects(): IProject[] | null {
    // Si el cache es válido (no expirado), devolver los proyectos en cache
    if (Date.now() - this.lastFetch < this.cacheLifetime && this.cache.length > 0) {
      return this.cache;
    }
    return null;
  }

  public getProjectById(id: number): IProject | null {
    const projects = this.getProjects();
    if (!projects) return null;
    
    return projects.find(p => p.id === id) || null;
  }

  public clear(): void {
    this.cache = [];
    this.lastFetch = 0;
  }

  // Actualizar un proyecto en el cache
  public updateProject(updatedProject: IProject): void {
    if (this.cache.length === 0) return;
    
    this.cache = this.cache.map(project => 
      project.id === updatedProject.id ? updatedProject : project
    );
  }

  // Eliminar un proyecto del cache
  public deleteProject(id: number): void {
    if (this.cache.length === 0) return;
    
    this.cache = this.cache.filter(project => project.id !== id);
  }
}

export class ProjectService {
  private static readonly BASE_PATH = '/projectlist';
  private static cache = ProjectCache.getInstance();

  // Obtener todos los proyectos
  static async getProjects(filter?: ProjectFilter): Promise<IProject[]> {
    try {
      // Verificar si hay datos en cache primero
      const cachedProjects = this.cache.getProjects();
      if (cachedProjects && !filter) {
        console.log(`Usando ${cachedProjects.length} proyectos desde cache`);
        return cachedProjects;
      }

      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.status !== undefined) queryParams['status'] = filter.status.toString();

      // Obtener la lista completa de proyectos
      console.log('Solicitando proyectos al servidor...');
      const projects = await apiClient.get<IProject[]>(this.BASE_PATH, queryParams);
      
      console.log(`Obtenidos ${projects.length} proyectos del servidor`);
      
      // Guardar en cache si no hay filtros
      if (!filter) {
        this.cache.setProjects(projects);
      }
      
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  // Obtener un proyecto por ID
  static async getProjectById(id: number): Promise<IProject | null> {
    try {
      // Intentar obtener del cache primero
      const cachedProject = this.cache.getProjectById(id);
      if (cachedProject) {
        console.log(`Proyecto ${id} obtenido desde cache`);
        return cachedProject;
      }

      // Ahora obtenemos todos los proyectos y filtramos por ID
      console.log(`Buscando proyecto con ID: ${id} en el servidor`);
      
      const allProjects = await this.getProjects();
      const project = allProjects.find(p => p.id === id);
      
      if (!project) {
        console.warn(`No se encontró el proyecto con ID: ${id}`);
        return null;
      }
      
      console.log(`Proyecto encontrado: ${project.name}`);
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
  }

  // Crear un nuevo proyecto
  static async createProject(
    projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>
  ): Promise<IProject | null> {
    try {
      // Asegurarse de que el estado es un número (enum)
      const payload = {
        ...projectData,
        status: Number(projectData.status),
      };

      console.log('Creando nuevo proyecto:', payload);
      const newProject = await apiClient.post<IProject>(this.BASE_PATH, payload);
      
      // Invalidar el cache después de crear un proyecto
      this.cache.clear();
      
      return newProject;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  // Actualizar un proyecto existente
  static async updateProject(id: number, projectData: Partial<IProject>): Promise<IProject | null> {
    try {
      // Obtener el proyecto actual
      const currentProject = await this.getProjectById(id);

      if (!currentProject) {
        console.error(`Project with ID ${id} not found for update`);
        return null;
      }

      // Preparar datos para la actualización
      const updatePayload = {
        name: projectData.name || currentProject.name,
        description: projectData.description || currentProject.description,
        start_date: projectData.start_date || currentProject.start_date,
        end_date: projectData.end_date || currentProject.end_date,
        status: Number(
          projectData.status !== undefined ? projectData.status : currentProject.status
        ),
      };

      console.log(`Actualizando proyecto ${id}:`, updatePayload);
      const updatedProject = await apiClient.put<IProject>(`${this.BASE_PATH}/${id}`, updatePayload);
      
      // Actualizar el proyecto en el cache
      if (updatedProject) {
        this.cache.updateProject(updatedProject);
      }
      
      return updatedProject;
    } catch (error) {
      console.error(`Error updating project ${id}:`, error);
      return null;
    }
  }

  // Eliminar un proyecto
  static async deleteProject(id: number): Promise<boolean> {
    try {
      console.log(`Eliminando proyecto ${id}`);
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      
      // Eliminar el proyecto del cache
      this.cache.deleteProject(id);
      
      return true;
    } catch (error) {
      console.error(`Error deleting project ${id}:`, error);
      return false;
    }
  }

  // Actualizar el estado de un proyecto
  static async updateProjectStatus(id: number, status: ProjectStatus): Promise<IProject | null> {
    try {
      console.log(`Actualizando estado del proyecto ${id} a ${status}`);
      return await this.updateProject(id, { status });
    } catch (error) {
      console.error(`Error updating status for project ${id}:`, error);
      return null;
    }
  }
  
  // Forzar recarga de datos (útil después de operaciones que modifican proyectos)
  static async refreshProjects(): Promise<IProject[]> {
    this.cache.clear();
    return await this.getProjects();
  }
}
