// src/components/tasks/TaskCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ITask, TaskStatus } from '@/core/interfaces/models';
import { CalendarIcon, Clock, CheckCircle2, BarChart2, Timer } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface TaskCardProps {
  task: ITask;
  onClick?: () => void;
  onStatusChange?: (taskId: number | undefined, status: TaskStatus) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, onClick, onStatusChange }) => {
  const router = useRouter();

  // Helper para obtener badge según el estado
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return (
          <Badge variant="outline" className="bg-muted transition-all duration-300 group-hover:scale-105">
            Por hacer
          </Badge>
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <Badge variant="default" className="bg-blue-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            En progreso
          </Badge>
        );
      case TaskStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-green-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Completado
          </Badge>
        );
      case TaskStatus.BLOCKED:
        return <Badge variant="destructive" className="transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">Bloqueado</Badge>;
      default:
        return <Badge variant="outline" className="transition-all duration-300 group-hover:scale-105">Desconocido</Badge>;
    }
  };

  // Helper para obtener badge según la prioridad
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return (
          <Badge variant="outline" className="bg-muted transition-all duration-300 group-hover:scale-105">
            Baja
          </Badge>
        );
      case 2:
        return (
          <Badge variant="default" className="bg-yellow-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Media
          </Badge>
        );
      case 3:
        return <Badge variant="destructive" className="transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">Alta</Badge>;
      default:
        return <Badge variant="outline" className="transition-all duration-300 group-hover:scale-105">Desconocida</Badge>;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calcular si la fecha de vencimiento está próxima o ya pasó
  const getDueDateClass = () => {
    if (!task.due_date) return 'text-muted-foreground';

    const dueDate = new Date(task.due_date);
    const today = new Date();
    const threeDaysLater = new Date();
    threeDaysLater.setDate(today.getDate() + 3);

    if (dueDate < today) {
      return 'text-red-600 dark:text-red-400';
    } else if (dueDate < threeDaysLater) {
      return 'text-amber-600 dark:text-amber-400';
    }
    return 'text-muted-foreground';
  };

  // Calcular eficiencia de tiempo (horas reales vs estimadas)
  const getTimeEfficiencyColor = () => {
    if (!task.real_hours || !task.estimated_hours) return 'text-muted-foreground';
    
    const efficiency = task.real_hours / task.estimated_hours;
    if (efficiency <= 1) return 'text-green-600 dark:text-green-400'; // Eficiente
    if (efficiency <= 1.5) return 'text-yellow-600 dark:text-yellow-400'; // Aceptable
    return 'text-red-600 dark:text-red-400'; // Ineficiente
  };

  // Manejar click en completar tarea
  const handleCompleteTask = (e: React.MouseEvent) => {
    e.stopPropagation(); // Evitar que el click se propague a la tarjeta
    if (onStatusChange) {
      onStatusChange(task.id, TaskStatus.COMPLETED);
    }
  };

  // Manejar click en ver detalles
  const handleViewDetails = () => {
    // Si hay un manejador onClick personalizado, usarlo
    if (onClick) {
      onClick();
    } else {
      // De lo contrario, navegar a la página de detalles de la tarea
      router.push(`/tasks/${task.id}`);
    }
  };

  return (
    <Card className="w-full h-full group cursor-pointer relative overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-2 hover:scale-[1.02] border-2 hover:border-blue-300/50 dark:hover:border-blue-600/50">
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/0 via-purple-50/0 to-pink-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-pink-50/30 dark:group-hover:from-blue-950/20 dark:group-hover:via-purple-950/10 dark:group-hover:to-pink-950/20 transition-all duration-700 ease-out"></div>
      
      {/* Subtle animated border shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-200/0 to-transparent group-hover:via-blue-200/50 dark:group-hover:via-blue-700/30 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium line-clamp-2 text-foreground transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:scale-105 transform-gpu">
            {task.title}
          </CardTitle>
          {getPriorityBadge(task.priority)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 relative z-10">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3 transition-all duration-300 group-hover:text-foreground/80 transform-gpu group-hover:translate-x-1">
          {task.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu">
            <CalendarIcon className={`h-4 w-4 ${getDueDateClass()} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`} />
            <span className={`${getDueDateClass()} transition-all duration-300`}>Vence: {formatDate(task.due_date)}</span>
          </div>
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-75">
            <Clock className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-muted-foreground transition-all duration-300 group-hover:text-foreground/70">{task.estimated_hours} horas estimadas</span>
          </div>
          {task.real_hours && (
            <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-100">
              <Timer className={`h-4 w-4 ${getTimeEfficiencyColor()} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`} />
              <span className={`${getTimeEfficiencyColor()} transition-all duration-300`}>
                {task.real_hours} horas trabajadas
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-150">
            <BarChart2 className="h-4 w-4 text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
            <span className="text-muted-foreground transition-all duration-300 group-hover:text-foreground/70">
              {task.subtasks?.length ? `${task.subtasks.length} subtareas` : 'Sin subtareas'}
            </span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between items-center relative z-10">
        <div className="transition-all duration-300 group-hover:scale-105 transform-gpu">
          {getStatusBadge(task.status)}
        </div>
        <div className="flex gap-2">
          {task.status !== TaskStatus.COMPLETED && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCompleteTask}
              className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:bg-green-50 hover:border-green-300 hover:text-green-700 dark:hover:bg-green-950 dark:hover:border-green-700 dark:hover:text-green-300 transform-gpu"
            >
<CheckCircle2 className="h-4 w-4 mr-1 transition-all duration-300 hover:rotate-180" /> Completar
            </Button>
          )}
          <Button 
            variant="default" 
            size="sm" 
            onClick={handleViewDetails}
            className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/25 transform-gpu"
          >
            Ver detalles
          </Button>
        </div>
      </CardFooter>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  );
};

export default TaskCard;