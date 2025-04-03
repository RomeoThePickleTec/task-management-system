// src/core/patterns/factory.ts
// Factory Pattern: Para crear tareas, dividiendo las que superan 4 horas
export class TaskFactory {
    static createTask(taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>, nextId: number): ITask[] {
      const now = new Date().toISOString();
      const baseTask: ITask = {
        id: nextId,
        ...taskData,
        created_at: now,
        updated_at: now
      };
  
      // Si la tarea estimada es mayor a 4 horas, se divide en subtareas más pequeñas
      if (taskData.estimated_hours > 4 && (!taskData.subtasks || taskData.subtasks.length === 0)) {
        const numSubtasks = Math.ceil(taskData.estimated_hours / 4);
        const hoursPerSubtask = taskData.estimated_hours / numSubtasks;
        
        const subtasks: ISubtask[] = [];
        for (let i = 0; i < numSubtasks; i++) {
          subtasks.push({
            title: `${baseTask.title} - Part ${i + 1}`,
            description: `Subtask ${i + 1} of ${numSubtasks} for task: ${baseTask.description}`,
            status: TaskStatus.TODO,
            created_at: now,
            updated_at: now
          });
        }
        
        baseTask.subtasks = subtasks;
        return [baseTask];
      }
  
      return [baseTask];
    }
  }
  