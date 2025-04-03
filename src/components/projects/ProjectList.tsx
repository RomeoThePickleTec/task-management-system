// src/components/projects/ProjectList.tsx
import React from 'react';
import { IProject } from '@/core/interfaces/models';
import ProjectCard from './ProjectCard';

interface ProjectWithMetadata extends IProject {
  taskCount?: number;
  memberCount?: number;
}

interface ProjectListProps {
  projects: ProjectWithMetadata[];
  onProjectClick?: (projectId: number | undefined) => void;
  isLoading?: boolean;
  emptyMessage?: string;
}

const ProjectList: React.FC<ProjectListProps> = ({
  projects,
  onProjectClick,
  isLoading = false,
  emptyMessage = 'No hay proyectos disponibles',
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          <span className="mt-2 text-gray-500">Cargando proyectos...</span>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
        <p className="text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {projects.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          taskCount={project.taskCount}
          memberCount={project.memberCount}
          onViewDetails={() => onProjectClick && onProjectClick(project.id)}
        />
      ))}
    </div>
  );
};

export default ProjectList;
