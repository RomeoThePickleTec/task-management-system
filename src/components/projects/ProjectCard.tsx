// src/components/projects/ProjectCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { IProject, ProjectStatus } from '@/core/interfaces/models';
import { CalendarIcon, Users } from 'lucide-react';

interface ProjectCardProps {
  project: IProject;
  taskCount?: number;
  memberCount?: number;
  onViewDetails?: () => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  taskCount = 0,
  memberCount = 0,
  onViewDetails,
}) => {
  // Helper para obtener badge según el estado
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return (
          <Badge variant="outline" className="bg-purple-100 text-purple-800 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Planificación
          </Badge>
        );
      case ProjectStatus.ACTIVE:
        return (
          <Badge variant="default" className="bg-green-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Activo
          </Badge>
        );
      case ProjectStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-blue-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Completado
          </Badge>
        );
      case ProjectStatus.ON_HOLD:
        return (
          <Badge variant="default" className="bg-amber-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            En pausa
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
    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Vencido';
    if (diffDays === 0) return 'Vence hoy';
    return `${diffDays} días restantes`;
  };

  // Calcular la clase para los días restantes
  const getRemainingDaysClass = () => {
    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'text-red-600 dark:text-red-400';
    if (diffDays <= 7) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <Card className="w-full group cursor-pointer relative overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-purple-500/10 hover:-translate-y-2 hover:scale-[1.02] border-2 hover:border-purple-300/50 dark:hover:border-purple-600/50">
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-50/0 via-blue-50/0 to-green-50/0 group-hover:from-purple-50/30 group-hover:via-blue-50/20 group-hover:to-green-50/30 dark:group-hover:from-purple-950/20 dark:group-hover:via-blue-950/10 dark:group-hover:to-green-950/20 transition-all duration-700 ease-out"></div>
      
      {/* Subtle animated border shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-200/0 to-transparent group-hover:via-purple-200/50 dark:group-hover:via-purple-700/30 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <CardHeader className="pb-2 relative z-10">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium transition-all duration-300 group-hover:text-purple-700 dark:group-hover:text-purple-300 group-hover:scale-105 transform-gpu">
            {project.name}
          </CardTitle>
          {getStatusBadge(project.status)}
        </div>
      </CardHeader>
      
      <CardContent className="pb-2 relative z-10">
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3 transition-all duration-300 group-hover:text-foreground/80 transform-gpu group-hover:translate-x-1">
          {project.description}
        </p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu">
            <CalendarIcon className="h-4 w-4 text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            <span className="transition-all duration-300 group-hover:text-foreground/80">Inicia: {formatDate(project.start_date)}</span>
          </div>
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-75">
            <CalendarIcon className={`h-4 w-4 ${getRemainingDaysClass()} transition-all duration-300 group-hover:scale-110 group-hover:rotate-12`} />
            <span className={`${getRemainingDaysClass()} transition-all duration-300`}>
              Termina: {formatDate(project.end_date)} ({getRemainingDays()})
            </span>
          </div>
          <div className="flex items-center gap-2 transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-150">
            <Users className="h-4 w-4 text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-purple-600 dark:group-hover:text-purple-400" />
            <span className="transition-all duration-300 group-hover:text-foreground/80">{memberCount} miembros</span>
          </div>
        </div>
      </CardContent>
      
      <CardFooter className="pt-2 flex justify-between relative z-10">
        <div className="text-sm text-gray-600 dark:text-gray-400 transition-all duration-300 group-hover:text-foreground/80 group-hover:scale-105 transform-gpu">
          {taskCount} tareas
        </div>
        <Button 
          variant="default" 
          size="sm" 
          onClick={onViewDetails}
          className="transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-purple-500/25 transform-gpu"
        >
          Ver proyecto
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

export default ProjectCard;