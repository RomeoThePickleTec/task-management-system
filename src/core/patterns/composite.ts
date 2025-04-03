// src/core/patterns/composite.ts
// Composite Pattern: Manejar tareas y subtareas de forma uniforme

import { ITask, ISubtask, TaskStatus } from "../interfaces/models";

// Interfaz común para componentes (tareas y subtareas)
export interface TaskComponent {
  getId(): number | undefined;
  getTitle(): string;
  getDescription(): string;
  getStatus(): TaskStatus;
  setStatus(status: TaskStatus): void;
  getEstimatedHours(): number;
  isCompleted(): boolean;
  getProgress(): number;
}

// Implementación para tareas simples
export class SimpleTask implements TaskComponent {
  protected task: ITask;

  constructor(task: ITask) {
    this.task = task;
  }

  getId(): number | undefined {
    return this.task.id;
  }

  getTitle(): string {
    return this.task.title;
  }

  getDescription(): string {
    return this.task.description;
  }

  getStatus(): TaskStatus {
    return this.task.status;
  }

  setStatus(status: TaskStatus): void {
    this.task.status = status;
    this.task.updated_at = new Date().toISOString();
  }

  getEstimatedHours(): number {
    return this.task.estimated_hours;
  }

  isCompleted(): boolean {
    return this.task.status === TaskStatus.COMPLETED;
  }

  getProgress(): number {
    switch (this.task.status) {
      case TaskStatus.TODO:
        return 0;
      case TaskStatus.IN_PROGRESS:
        return 0.5; // 50%
      case TaskStatus.COMPLETED:
        return 1; // 100%
      case TaskStatus.BLOCKED:
        return 0.25; // 25%
      default:
        return 0;
    }
  }

  getTask(): ITask {
    return { ...this.task };
  }
}

// Subtarea como componente simple
export class SubtaskComponent implements TaskComponent {
  protected subtask: ISubtask;
  private parentTaskId?: number;

  constructor(subtask: ISubtask, parentTaskId?: number) {
    this.subtask = subtask;
    this.parentTaskId = parentTaskId;
  }

  getId(): number | undefined {
    return this.subtask.id;
  }

  getTitle(): string {
    return this.subtask.title;
  }

  getDescription(): string {
    return this.subtask.description;
  }

  getStatus(): TaskStatus {
    return this.subtask.status;
  }

  setStatus(status: TaskStatus): void {
    this.subtask.status = status;
    this.subtask.updated_at = new Date().toISOString();
  }

  getEstimatedHours(): number {
    // Las subtareas no tienen horas estimadas directamente, podría ser una fracción de la tarea padre
    return 0;
  }

  isCompleted(): boolean {
    return this.subtask.status === TaskStatus.COMPLETED;
  }

  getProgress(): number {
    switch (this.subtask.status) {
      case TaskStatus.TODO:
        return 0;
      case TaskStatus.IN_PROGRESS:
        return 0.5; // 50%
      case TaskStatus.COMPLETED:
        return 1; // 100%
      case TaskStatus.BLOCKED:
        return 0.25; // 25%
      default:
        return 0;
    }
  }

  getParentTaskId(): number | undefined {
    return this.parentTaskId;
  }

  getSubtask(): ISubtask {
    return { ...this.subtask };
  }
}

// Implementación para tareas compuestas (con subtareas)
export class CompositeTask implements TaskComponent {
  private task: ITask;
  private children: TaskComponent[] = [];

  constructor(task: ITask) {
    this.task = task;
    
    // Inicializar con subtareas si existen
    if (task.subtasks && task.subtasks.length > 0) {
      this.children = task.subtasks.map(subtask => new SubtaskComponent(subtask, task.id));
    }
  }

  getId(): number | undefined {
    return this.task.id;
  }

  getTitle(): string {
    return this.task.title;
  }

  getDescription(): string {
    return this.task.description;
  }

  // El estado de una tarea compuesta se determina por sus subtareas
  getStatus(): TaskStatus {
    if (this.children.length === 0) {
      return this.task.status;
    }

    const allCompleted = this.children.every(child => child.isCompleted());
    if (allCompleted) {
      return TaskStatus.COMPLETED;
    }

    const anyBlocked = this.children.some(child => child.getStatus() === TaskStatus.BLOCKED);
    if (anyBlocked) {
      return TaskStatus.BLOCKED;
    }

    const anyInProgress = this.children.some(child => child.getStatus() === TaskStatus.IN_PROGRESS);
    if (anyInProgress) {
      return TaskStatus.IN_PROGRESS;
    }

    return TaskStatus.TODO;
  }

  // Establecer estado propaga a las subtareas
  setStatus(status: TaskStatus): void {
    this.task.status = status;
    this.task.updated_at = new Date().toISOString();
    
    // Propagar a las subtareas
    this.children.forEach(child => child.setStatus(status));
  }

  getEstimatedHours(): number {
    return this.task.estimated_hours;
  }

  isCompleted(): boolean {
    return this.getStatus() === TaskStatus.COMPLETED;
  }

  // El progreso de una tarea compuesta es el promedio de sus subtareas
  getProgress(): number {
    if (this.children.length === 0) {
      return this.task.status === TaskStatus.COMPLETED ? 1 : 0;
    }
    
    const totalProgress = this.children.reduce((sum, child) => sum + child.getProgress(), 0);
    return totalProgress / this.children.length;
  }

  // Métodos adicionales específicos para tareas compuestas
  addChild(component: TaskComponent): void {
    this.children.push(component);
  }

  removeChild(componentId: number | undefined): void {
    if (!componentId) return;
    this.children = this.children.filter(child => child.getId() !== componentId);
  }

  getChildren(): TaskComponent[] {
    return [...this.children];
  }

  getTask(): ITask {
    // Crear una copia actualizada de la tarea con sus subtareas
    const updatedTask = { ...this.task };
    
    // Actualizar las subtareas
    updatedTask.subtasks = this.children
      .filter(child => child instanceof SubtaskComponent)
      .map(child => (child as SubtaskComponent).getSubtask());
    
    return updatedTask;
  }
}