// src/components/tasks/TaskList.tsx
import React from 'react';
import { ITask, TaskStatus } from '@/core/interfaces/models';
import TaskCard from './TaskCard';
import { useRouter } from 'next/navigation';

interface TaskListProps {
  tasks: ITask[];
  onTaskClick?: (taskId: number | undefined) => void;
  onStatusChange?: (taskId: number | undefined, status: TaskStatus) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const TaskList: React.FC<TaskListProps> = ({
  tasks,
  onTaskClick,
  onStatusChange,
  isLoading = false,
  emptyMessage = 'No hay tareas disponibles',
}) => {
  const router = useRouter();

  const handleTaskClick = (taskId: number | undefined) => {
    if (onTaskClick) {
      onTaskClick(taskId);
    } else {
      // Si no se proporciona una función de click personalizada, navegar a la página de detalles
      if (taskId) {
        router.push(`/tasks/${taskId}`);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="mt-2 text-gray-500">Cargando tareas...</span>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onClick={() => handleTaskClick(task.id)}
          onStatusChange={onStatusChange}
        />
      ))}
    </div>
  );
};

export default TaskList;
