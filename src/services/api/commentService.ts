// src/services/api/apiClient.ts
// Cliente API para realizar solicitudes a la API real

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
    if (queryParams && Object.keys(queryParams).length > 0) {
      const params = new URLSearchParams();
      Object.entries(queryParams).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value);
        }
      });
      url += `?${params.toString()}`;
    }
    
    try {
      const response = await fetch(url, {
        ...defaultOptions,
        method: 'GET',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in GET request to ${url}:`, error);
      throw error;
    }
  }

  // Método POST
  async post<T>(path: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...defaultOptions,
        method: 'POST',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in POST request to ${path}:`, error);
      throw error;
    }
  }

  // Método PUT
  async put<T>(path: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...defaultOptions,
        method: 'PUT',
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in PUT request to ${path}:`, error);
      throw error;
    }
  }

  // Método DELETE
  async delete<T>(path: string): Promise<T> {
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...defaultOptions,
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      if (response.status === 204) {
        // No content
        return {} as T;
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error in DELETE request to ${path}:`, error);
      throw error;
    }
  }
}

// Instancia del cliente API para usar en toda la aplicación
export const apiClient = new ApiClient();

// src/services/api/taskService.ts
// Servicios para operaciones con tareas
import { apiClient } from './apiClient';
import { ITask, TaskFilter, TaskStatus } from '../../core/interfaces/models';
import { TaskFactory } from '../../core/patterns/factory';

export class TaskService {
  private static readonly BASE_PATH = '/tasklist';

  // Obtener todas las tareas
  static async getTasks(filter?: TaskFilter): Promise<ITask[]> {
    try {
      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.project_id) queryParams['project_id'] = filter.project_id.toString();
      if (filter?.status !== undefined) queryParams['status'] = filter.status.toString();
      if (filter?.priority) queryParams['priority'] = filter.priority.toString();
      if (filter?.sprint_id) queryParams['sprint_id'] = filter.sprint_id.toString();
      
      const tasks = await apiClient.get<ITask[]>(this.BASE_PATH, queryParams);
      return tasks;
    } catch (error) {
      console.error('Error fetching tasks:', error);
      return [];
    }
  }

  // Obtener una tarea por ID
  static async getTaskById(id: number): Promise<ITask | null> {
    try {
      const task = await apiClient.get<ITask>(`${this.BASE_PATH}/${id}`);
      return task;
    } catch (error) {
      console.error(`Error fetching task ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva tarea
  static async createTask(taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>): Promise<ITask | null> {
    try {
      // Utilizar la Factory para crear la tarea
      const taskWithSubtasks = TaskFactory.createTask(taskData);
      const createdTask = await apiClient.post<ITask>(this.BASE_PATH, taskWithSubtasks);
      return createdTask;
    } catch (error) {
      console.error('Error creating task:', error);
      return null;
    }
  }

  // Actualizar una tarea existente
  static async updateTask(id: number, taskData: Partial<ITask>): Promise<ITask | null> {
    try {
      const updatedTask = await apiClient.put<ITask>(`${this.BASE_PATH}/${id}`, taskData);
      return updatedTask;
    } catch (error) {
      console.error(`Error updating task ${id}:`, error);
      return null;
    }
  }

  // Eliminar una tarea
  static async deleteTask(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting task ${id}:`, error);
      return false;
    }
  }
}

// src/services/api/subtaskService.ts
// Servicios para operaciones con subtareas
import { apiClient } from './apiClient';
import { ISubtask } from '../../core/interfaces/models';

export class SubtaskService {
  private static readonly BASE_PATH = '/subtasklist';

  // Obtener una subtarea por ID
  static async getSubtaskById(id: number): Promise<ISubtask | null> {
    try {
      const subtask = await apiClient.get<ISubtask>(`${this.BASE_PATH}/${id}`);
      return subtask;
    } catch (error) {
      console.error(`Error fetching subtask ${id}:`, error);
      return null;
    }
  }

  // Crear una nueva subtarea
  static async createSubtask(subtaskData: Omit<ISubtask, 'id' | 'created_at' | 'updated_at'>): Promise<ISubtask | null> {
    try {
      const createdSubtask = await apiClient.post<ISubtask>(this.BASE_PATH, subtaskData);
      return createdSubtask;
    } catch (error) {
      console.error('Error creating subtask:', error);
      return null;
    }
  }

  // Actualizar una subtarea existente
  static async updateSubtask(id: number, subtaskData: Partial<ISubtask>): Promise<ISubtask | null> {
    try {
      const updatedSubtask = await apiClient.put<ISubtask>(`${this.BASE_PATH}/${id}`, subtaskData);
      return updatedSubtask;
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
      
      const projects = await apiClient.get<IProject[]>(this.BASE_PATH, queryParams);
      return projects;
    } catch (error) {
      console.error('Error fetching projects:', error);
      return [];
    }
  }

  // Obtener un proyecto por ID
  static async getProjectById(id: number): Promise<IProject | null> {
    try {
      const project = await apiClient.get<IProject>(`${this.BASE_PATH}/${id}`);
      return project;
    } catch (error) {
      console.error(`Error fetching project ${id}:`, error);
      return null;
    }
  }

  // Crear un nuevo proyecto
  static async createProject(projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>): Promise<IProject | null> {
    try {
      const createdProject = await apiClient.post<IProject>(this.BASE_PATH, projectData);
      return createdProject;
    } catch (error) {
      console.error('Error creating project:', error);
      return null;
    }
  }

  // Actualizar un proyecto existente
  static async updateProject(id: number, projectData: Partial<IProject>): Promise<IProject | null> {
    try {
      const updatedProject = await apiClient.put<IProject>(`${this.BASE_PATH}/${id}`, projectData);
      return updatedProject;
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

// src/services/api/userService.ts
// Servicios para operaciones con usuarios
import { apiClient } from './apiClient';
import { IUser } from '../../core/interfaces/models';

export class UserService {
  private static readonly BASE_PATH = '/userlist';

  // Obtener todos los usuarios
  static async getUsers(): Promise<IUser[]> {
    try {
      const users = await apiClient.get<IUser[]>(this.BASE_PATH);
      return users;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  // Obtener un usuario por ID
  static async getUserById(id: number): Promise<IUser | null> {
    try {
      const user = await apiClient.get<IUser>(`${this.BASE_PATH}/${id}`);
      return user;
    } catch (error) {
      console.error(`Error fetching user ${id}:`, error);
      return null;
    }
  }

  // Crear un nuevo usuario
  static async createUser(userData: Omit<IUser, 'id' | 'created_at' | 'updated_at'>): Promise<IUser | null> {
    try {
      const createdUser = await apiClient.post<IUser>(this.BASE_PATH, userData);
      return createdUser;
    } catch (error) {
      console.error('Error creating user:', error);
      return null;
    }
  }

  // Actualizar un usuario existente
  static async updateUser(id: number, userData: Partial<IUser>): Promise<IUser | null> {
    try {
      const updatedUser = await apiClient.put<IUser>(`${this.BASE_PATH}/${id}`, userData);
      return updatedUser;
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

// src/services/api/projectMemberService.ts
// Servicios para operaciones con miembros de proyectos
import { apiClient } from './apiClient';
import { IProjectMember } from '../../core/interfaces/models';

export class ProjectMemberService {
  private static readonly BASE_PATH = '/projectmember';

  // Obtener todos los miembros de proyectos
  static async getProjectMembers(): Promise<IProjectMember[]> {
    try {
      const projectMembers = await apiClient.get<IProjectMember[]>(this.BASE_PATH);
      return projectMembers;
    } catch (error) {
      console.error('Error fetching project members:', error);
      return [];
    }
  }

  // Obtener miembros por proyecto
  static async getProjectMembersByProject(projectId: number): Promise<IProjectMember[]> {
    try {
      const projectMembers = await apiClient.get<IProjectMember[]>(`${this.BASE_PATH}/project/${projectId}`);
      return projectMembers;
    } catch (error) {
      console.error(`Error fetching members for project ${projectId}:`, error);
      return [];
    }
  }

  // Obtener proyectos por usuario
  static async getProjectMembersByUser(userId: number): Promise<IProjectMember[]> {
    try {
      const projectMembers = await apiClient.get<IProjectMember[]>(`${this.BASE_PATH}/user/${userId}`);
      return projectMembers;
    } catch (error) {
      console.error(`Error fetching projects for user ${userId}:`, error);
      return [];
    }
  }

  // Añadir un miembro a un proyecto
  static async addProjectMember(projectMember: IProjectMember): Promise<IProjectMember | null> {
    try {
      const newProjectMember = await apiClient.post<IProjectMember>(this.BASE_PATH, projectMember);
      return newProjectMember;
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

// src/services/api/commentService.ts
// Servicios para operaciones con comentarios
import { apiClient } from './apiClient';
import { IComment } from '../../core/interfaces/models';

export class CommentService {
  private static readonly BASE_PATH = '/commentlist';

  // Obtener un comentario por ID
  static async getCommentById(id: number): Promise<IComment | null> {
    try {
      const comment = await apiClient.get<IComment>(`${this.BASE_PATH}/${id}`);
      return comment;
    } catch (error) {
      console.error(`Error fetching comment ${id}:`, error);
      return null;
    }
  }

  // Obtener comentarios por tarea
  static async getCommentsByTaskId(taskId: number): Promise<IComment[]> {
    try {
      // Ajustar según la API real
      const comments = await apiClient.get<IComment[]>(`${this.BASE_PATH}?task_id=${taskId}`);
      return comments;
    } catch (error) {
      console.error(`Error fetching comments for task ${taskId}:`, error);
      return [];
    }
  }

  // Crear un nuevo comentario
  static async createComment(commentData: Omit<IComment, 'id' | 'created_at' | 'updated_at'>): Promise<IComment | null> {
    try {
      const createdComment = await apiClient.post<IComment>(this.BASE_PATH, commentData);
      return createdComment;
    } catch (error) {
      console.error('Error creating comment:', error);
      return null;
    }
  }

  // Actualizar un comentario existente
  static async updateComment(id: number, commentData: Partial<IComment>): Promise<IComment | null> {
    try {
      const updatedComment = await apiClient.put<IComment>(`${this.BASE_PATH}/${id}`, commentData);
      return updatedComment;
    } catch (error) {
      console.error(`Error updating comment ${id}:`, error);
      return null;
    }
  }

  // Eliminar un comentario
  static async deleteComment(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting comment ${id}:`, error);
      return false;
    }
  }
}

// src/services/api/sprintService.ts
// Servicios para operaciones con sprints
import { apiClient } from './apiClient';
import { ISprint, SprintFilter } from '../../core/interfaces/models';

export class SprintService {
  private static readonly BASE_PATH = '/sprintlist';

  // Obtener todos los sprints
  static async getSprints(filter?: SprintFilter): Promise<ISprint[]> {
    try {
      // Convertir filtro a parámetros de consulta si existe
      const queryParams: Record<string, string> = {};
      if (filter?.project_id) queryParams['project_id'] = filter.project_id.toString();
      if (filter?.status !== undefined) queryParams['status'] = filter.status.toString();
      
      const sprints = await apiClient.get<ISprint[]>(this.BASE_PATH, queryParams);
      return sprints;
    } catch (error) {
      console.error('Error fetching sprints:', error);
      return [];
    }
  }

  // Obtener sprint por ID
  static async getSprintById(id: number): Promise<ISprint | null> {
    try {
      const sprint = await apiClient.get<ISprint>(`${this.BASE_PATH}/${id}`);
      return sprint;
    } catch (error) {
      console.error(`Error fetching sprint ${id}:`, error);
      return null;
    }
  }

  // Obtener sprints activos por proyecto
  static async getActiveSprintsByProject(projectId: number): Promise<ISprint[]> {
    try {
      const sprints = await apiClient.get<ISprint[]>(`${this.BASE_PATH}/active`, { project_id: projectId.toString() });
      return sprints;
    } catch (error) {
      console.error(`Error fetching active sprints for project ${projectId}:`, error);
      return [];
    }
  }

  // Crear un nuevo sprint
  static async createSprint(sprintData: Omit<ISprint, 'id' | 'created_at' | 'updated_at'>): Promise<ISprint | null> {
    try {
      const createdSprint = await apiClient.post<ISprint>(this.BASE_PATH, sprintData);
      return createdSprint;
    } catch (error) {
      console.error('Error creating sprint:', error);
      return null;
    }
  }

  // Actualizar un sprint existente
  static async updateSprint(id: number, sprintData: Partial<ISprint>): Promise<ISprint | null> {
    try {
      const updatedSprint = await apiClient.put<ISprint>(`${this.BASE_PATH}/${id}`, sprintData);
      return updatedSprint;
    } catch (error) {
      console.error(`Error updating sprint ${id}:`, error);
      return null;
    }
  }

  // Eliminar un sprint
  static async deleteSprint(id: number): Promise<boolean> {
    try {
      await apiClient.delete(`${this.BASE_PATH}/${id}`);
      return true;
    } catch (error) {
      console.error(`Error deleting sprint ${id}:`, error);
      return false;
    }
  }
}

// src/services/api/index.ts
// Archivo de exportación principal para los servicios API
export * from './apiClient';
export * from './taskService';
export * from './subtaskService';
export * from './projectService';
export * from './userService';
export * from './projectMemberService';
export * from './commentService';
export * from './sprintService';