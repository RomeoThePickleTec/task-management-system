// src/components/projects/ProjectCard.tsx
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { IProject, ProjectStatus } from '@/core/interfaces/models';
import { CalendarIcon, Users } from "lucide-react";

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
  onViewDetails 
}) => {
  // Helper para obtener badge según el estado
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.PLANNING:
        return <Badge variant="outline" className="bg-purple-100 text-purple-800">Planificación</Badge>;
      case ProjectStatus.ACTIVE:
        return <Badge variant="default" className="bg-green-500">Activo</Badge>;
      case ProjectStatus.COMPLETED:
        return <Badge variant="default" className="bg-blue-500">Completado</Badge>;
      case ProjectStatus.ON_HOLD:
        return <Badge variant="default" className="bg-amber-500">En pausa</Badge>;
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
    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "Vencido";
    if (diffDays === 0) return "Vence hoy";
    return `${diffDays} días restantes`;
  };

  // Calcular la clase para los días restantes
  const getRemainingDaysClass = () => {
    const endDate = new Date(project.end_date);
    const today = new Date();
    const diffTime = endDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return "text-red-600";
    if (diffDays <= 7) return "text-amber-600";
    return "text-gray-600";
  };

  return (
    <Card className="w-full hover:shadow-md transition-shadow">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg font-medium">{project.name}</CardTitle>
          {getStatusBadge(project.status)}
        </div>
      </CardHeader>
      <CardContent className="pb-2">
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{project.description}</p>
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-gray-600" />
            <span>Inicia: {formatDate(project.start_date)}</span>
          </div>
          <div className="flex items-center gap-2">
            <CalendarIcon className={`h-4 w-4 ${getRemainingDaysClass()}`} />
            <span className={getRemainingDaysClass()}>
              Termina: {formatDate(project.end_date)} ({getRemainingDays()})
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-gray-600" />
            <span>{memberCount} miembros</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="pt-2 flex justify-between">
        <div className="text-sm text-gray-600">{taskCount} tareas</div>
        <Button variant="default" size="sm" onClick={onViewDetails}>
          Ver proyecto
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProjectCard;