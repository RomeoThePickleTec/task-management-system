// src/app/projects/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { IProject, ITask, ProjectStatus, UserRole } from '@/core/interfaces/models';
import ProjectList from '@/components/projects/ProjectList';
import Link from 'next/link';
import { PlusCircle, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Importamos los servicios reales de API
import { 
  ProjectService,
  TaskService,
  ProjectMemberService
} from '@/services/api';

// Tipo para proyectos con metadatos
type ProjectWithMetadata = IProject & {
  taskCount: number;
  memberCount: number;
};

export default function ProjectsPage() {
  const [projects, setProjects] = useState<ProjectWithMetadata[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<ProjectWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

  useEffect(() => {
    const fetchProjects = async () => {
      setIsLoading(true);
      try {
        // Obtener todos los proyectos
        const allProjects = await ProjectService.getProjects();
        
        // Para cada proyecto, cargar los datos adicionales
        const projectsWithData = await Promise.all(
          allProjects.map(async (project) => {
            let taskCount = 0;
            let memberCount = 0;
            
            try {
              // Si el proyecto tiene sprints con tareas, contar esas tareas
              if (project.sprints && project.sprints.length > 0) {
                taskCount = project.sprints.reduce((count, sprint) => {
                  return count + (sprint.tasks ? sprint.tasks.length : 0);
                }, 0);
              } else {
                // Intentar obtener tareas por proyecto_id
                const tasks = await TaskService.getTasks({ project_id: project.id });
                taskCount = tasks.length;
              }
              
              // Obtener miembros del proyecto
              if (project.id) {
                const members = await ProjectMemberService.getProjectMembersByProject(project.id);
                memberCount = members.length;
              }
            } catch (error) {
              console.error(`Error fetching details for project ${project.id}:`, error);
            }
            
            return {
              ...project,
              taskCount,
              memberCount
            };
          })
        );
        
        setProjects(projectsWithData);
        setFilteredProjects(projectsWithData);
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjects();
  }, []);

  // Efecto para filtrar proyectos cuando cambia el filtro o la búsqueda
  useEffect(() => {
    let filtered = [...projects];
    
    // Aplicar filtro de estado
    if (statusFilter !== "all") {
      filtered = filtered.filter(
        project => project.status === parseInt(statusFilter)
      );
    }
    
    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        project => 
          project.name.toLowerCase().includes(query) ||
          (project.description && project.description.toLowerCase().includes(query))
      );
    }
    
    setFilteredProjects(filtered);
  }, [statusFilter, searchQuery, projects]);

  // Función para manejar la creación de un nuevo proyecto
  const handleCreateProject = () => {
    // Redirigir a la página de creación de proyectos
    console.log('Crear nuevo proyecto');
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Proyectos</h1>
            <div className="flex space-x-2">
            <Link href="/projects/new" passHref>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" /> Nuevo proyecto
              </Button>
            </Link>
          </div>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar proyectos..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-44">
              <SelectValue placeholder="Filtrar por estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos los estados</SelectItem>
              <SelectItem value={ProjectStatus.PLANNING.toString()}>Planificación</SelectItem>
              <SelectItem value={ProjectStatus.ACTIVE.toString()}>Activo</SelectItem>
              <SelectItem value={ProjectStatus.COMPLETED.toString()}>Completado</SelectItem>
              <SelectItem value={ProjectStatus.ON_HOLD.toString()}>En pausa</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Lista de proyectos */}
        <ProjectList 
          projects={filteredProjects}
          onProjectClick={(id) => console.log(`Ver proyecto ${id}`)}
          isLoading={isLoading}
          emptyMessage={
            searchQuery || statusFilter !== "all" 
              ? "No hay proyectos que coincidan con los filtros" 
              : "No hay proyectos disponibles"
          }
        />
      </div>
    </MainLayout>
    </ProtectedRoute>
  );
}