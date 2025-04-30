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
          <Badge variant="outline" className="bg-purple-100 text-purple-800">
            Planificación
          </Badge>
        );
      case SprintStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-500">
            Activo
          </Badge>
        );
      case SprintStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-blue-500">
            Completado
          </Badge>
        );
      default:
        return <Badge variant="outline">Desconocido</Badge>;
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

    if (diffDays < 0) return 'text-red-600';
    if (diffDays <= 3) return 'text-amber-600';
    return 'text-gray-600';
  };

  // Calcular el progreso
  const getProgress = () => {
    if (taskCount === 0) return 0;
    return Math.round((completedTaskCount / taskCount) * 100);
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{sprint.name}</CardTitle>
          {getStatusBadge(sprint.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{sprint.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-600" />
            <span>Inicia: {formatDate(sprint.start_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className={`h-4 w-4 ${getRemainingDaysClass()}`} />
            <span className={getRemainingDaysClass()}>
              Termina: {formatDate(sprint.end_date)} ({getRemainingDays()})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <CheckSquare className="h-4 w-4 text-gray-600" />
            <span>
              {completedTaskCount}/{taskCount} tareas completadas
            </span>
          </div>
          <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
            <div
              className="h-full bg-blue-500 rounded-full"
              style={{ width: `${getProgress()}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="text-sm text-gray-600">{getProgress()}% completado</div>
        <Button variant="default" size="sm" onClick={onViewDetails}>
          Ver sprint
        </Button>
      </CardFooter>
    </Card>
  );
};

export default SprintCard;
