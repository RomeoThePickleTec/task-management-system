// src/components/sprints/SprintCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ISprint, SprintStatus } from '@/core/interfaces/models';
import { CalendarIcon, CheckSquare } from 'lucide-react';

interface SprintCardProps {
  sprint: ISprint;
  taskCount?: number;
  completedTaskCount?: number;
  onViewDetails?: () => void;
}

const SprintCard: React.FC<SprintCardProps> = ({
  sprint,
  taskCount = 0,
  completedTaskCount = 0,
  onViewDetails,
}) => {
  // Helper para obtener badge según el estado
  const getStatusBadge = (status: SprintStatus) => {
    switch (status) {
      case SprintStatus.PLANNING:
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Planificación
          </Badge>
        );
      case SprintStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Activo
          </Badge>
        );
      case SprintStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-blue-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Completado
          </Badge>
        );
      default:
        return <Badge variant="outline" className="transition-all duration-300 group-hover:scale-105">Desconocido</Badge>;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Calcular días restantes
  const getRemainingDays = () => {
    const endDate = new Date(sprint.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Terminado';
    if (diffDays === 0) return 'Termina hoy';
    return `${diffDays} días restantes`;
  };

  // Calcular la clase para los días restantes
  const getRemainingDaysClass = () => {
    const endDate = new Date(sprint.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 dark:text-red-400';
    if (diffDays <= 3) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  // Calcular el progreso
  const getProgress = () => {
    if (taskCount === 0) return 0;
    return Math.round((completedTaskCount / taskCount) * 100);
  };

  return (
    <Card className="w-full group cursor-pointer relative overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-orange-500/10 hover:-translate-y-2 hover:scale-[1.02] border-2 hover:border-orange-300/50 dark:hover:border-orange-600/50">
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-50/0 via-yellow-50/0 to-red-50/0 group-hover:from-orange-50/30 group-hover:via-yellow-50/20 group-hover:to-red-50/30 dark:group-hover:from-orange-950/20 dark:group-hover:via-yellow-950/10 dark:group-hover:to-red-950/20 transition-all duration-700 ease-out"></div>
      
      {/* Subtle animated border shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-orange-200/0 to-transparent group-hover:via-orange-200/50 dark:group-hover:via-orange-700/30 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium transition-all duration-300 group-hover:text-orange-700 dark:group-hover:text-orange-300 group-hover:scale-105 transform-gpu">
            {sprint.name}
          </CardTitle>
          {getStatusBadge(sprint.status)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 relative z-10">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 transition-all duration-300 group-hover:text-foreground/80 transform-gpu group-hover:translate-x-1">
          {sprint.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu">
            <CalendarIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
            <span className="transition-all duration-300 group-hover:text-foreground/80">Inicia: {formatDate(sprint.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-75">
            <CalendarIcon className={`h-4 w-4 ${getRemainingDaysClass()} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`} />
            <span className={`${getRemainingDaysClass()} transition-all duration-300`}>
              Termina: {formatDate(sprint.end_date)} ({getRemainingDays()})
            </span>
          </div>
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-150">
            <CheckSquare className="h-4 w-4 text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-orange-600 dark:group-hover:text-orange-400" />
            <span className="transition-all duration-300 group-hover:text-foreground/80">
              {completedTaskCount}/{taskCount} tareas completadas
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 h-2 rounded-full mt-2 overflow-hidden relative transition-all duration-300 group-hover:h-3 group-hover:shadow-lg">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full transition-all duration-500 ease-out group-hover:shadow-lg relative overflow-hidden"
              style={{ width: `${getProgress()}%` }}
            >
              {/* Animated shimmer effect on progress bar */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out"></div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between relative z-10">
        <div className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:text-foreground/80 group-hover:scale-105 transform-gpu">
          {getProgress()}% completado
        </div>
        <Button 
          variant="default" 
          size="sm" 
          onClick={onViewDetails}
          className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-orange-500/25 transform-gpu"
        >
          Ver sprint
        </Button>
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

export default SprintCard;