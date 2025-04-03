// src/core/patterns/composite.ts
// Composite Pattern: Para tareas compuestas de subtareas
export class TaskComponent {
    protected task: ITask;
  
    constructor(task: ITask) {
      this.task = task;
    }
  
    getId(): number {
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
  
    getTask(): ITask {
      return { ...this.task };
    }
  }
  
  export class SimpleTask extends TaskComponent {
    constructor(task: ITask) {
      super(task);
    }
  }
  
  export class CompositeTask extends TaskComponent {
    private subtasks: TaskComponent[] = [];
  
    constructor(task: ITask) {
      super(task);
      
      // Inicializar subtareas si existen
      if (task.subtasks && task.subtasks.length > 0) {
        this.subtasks = task.subtasks.map(subtask => {
          const subtaskAsTask: ITask = {
            id: subtask.id as number,
            title: subtask.title,
            description: subtask.description,
            created_at: subtask.created_at || this.task.created_at,
            updated_at: subtask.updated_at || this.task.updated_at,
            due_date: this.task.due_date,
            priority: this.task.priority,
            status: subtask.status,
            estimated_hours: this.task.estimated_hours / (task.subtasks?.length || 1)
          };
          return new SimpleTask(subtaskAsTask);
        });
      }
    }
  
    addSubtask(subtask: TaskComponent): void {
      this.subtasks.push(subtask);
    }
  
    removeSubtask(subtaskId: number): void {
      this.subtasks = this.subtasks.filter(subtask => subtask.getId() !== subtaskId);
    }
  
    getSubtasks(): TaskComponent[] {
      return [...this.subtasks];
    }
  
    // Sobreescribimos el método de estado para que refleje el estado compuesto
    override getStatus(): TaskStatus {
      if (this.subtasks.length === 0) {
        return this.task.status;
      }
  
      const allCompleted = this.subtasks.every(subtask => subtask.getStatus() === TaskStatus.COMPLETED);
      if (allCompleted) {
        return TaskStatus.COMPLETED;
      }
  
      const anyInProgress = this.subtasks.some(subtask => subtask.getStatus() === TaskStatus.IN_PROGRESS);
      if (anyInProgress) {
        return TaskStatus.IN_PROGRESS;
      }
  
      const anyBlocked = this.subtasks.some(subtask => subtask.getStatus() === TaskStatus.BLOCKED);
      if (anyBlocked) {
        return TaskStatus.BLOCKED;
      }
  
      return TaskStatus.TODO;
    }
  
    // Sobreescribimos el método para establecer el estado en todas las subtareas
    override setStatus(status: TaskStatus): void {
      super.setStatus(status);
      this.subtasks.forEach(subtask => subtask.setStatus(status));
    }
  
    // Sobreescribimos para calcular el tiempo estimado en base a las subtareas
    override getEstimatedHours(): number {
      if (this.subtasks.length === 0) {
        return this.task.estimated_hours;
      }
      
      return this.subtasks.reduce((total, subtask) => total + subtask.getEstimatedHours(), 0);
    }
  
    // Sobreescribimos para obtener la tarea completa con sus subtareas
    override getTask(): ITask {
      const baseTask = super.getTask();
      baseTask.subtasks = this.subtasks.map(subtask => {
        const task = subtask.getTask();
        return {
          id: task.id,
          title: task.title,
          description: task.description,
          created_at: task.created_at,
          updated_at: task.updated_at,
          status: task.status,
          task_id: baseTask.id
        };
      });
      return baseTask;
    }
  }