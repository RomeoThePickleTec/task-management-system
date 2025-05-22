// src/app/reports/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  IProject,
  TaskStatus,
  ProjectStatus,
  SprintStatus,
  UserRole,
} from '@/core/interfaces/models';
import {
  BarChart,
  Calendar,
  AlertTriangle,
  CheckCircle,
  Timer,
  FileBarChart,
  ChevronRight,
  Users,
} from 'lucide-react';
import Link from 'next/link';

// Importamos los servicios reales de API
import { ProjectService, TaskService, SprintService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function ReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [statistics, setStatistics] = useState({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    totalSprints: 0,
    activeSprints: 0,
    nearEndSprints: 0,
    projectProgress: 0,
    overdueTasks: 0,
    averageTasksPerSprint: 0,
  });

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Obtener todos los proyectos
        const projectsData = await ProjectService.getProjects();
        setProjects(projectsData);

        // Inicializar estadísticas
        const stats = {
          totalProjects: projectsData.length,
          activeProjects: projectsData.filter((p) => p.status === ProjectStatus.ACTIVE).length,
          completedProjects: projectsData.filter((p) => p.status === ProjectStatus.COMPLETED)
            .length,
          totalTasks: 0,
          completedTasks: 0,
          pendingTasks: 0,
          blockedTasks: 0,
          totalSprints: 0,
          activeSprints: 0,
          nearEndSprints: 0,
          projectProgress: 0,
          overdueTasks: 0,
          averageTasksPerSprint: 0,
        };

        // Obtener todas las tareas
        const tasksData = await TaskService.getTasks();

        stats.totalTasks = tasksData.length;
        stats.completedTasks = tasksData.filter((t) => t.status === TaskStatus.COMPLETED).length;
        stats.pendingTasks = tasksData.filter(
          (t) => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS
        ).length;
        stats.blockedTasks = tasksData.filter((t) => t.status === TaskStatus.BLOCKED).length;

        // Contar tareas vencidas
        const today = new Date();
        stats.overdueTasks = tasksData.filter((t) => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate < today && t.status !== TaskStatus.COMPLETED;
        }).length;

        // Obtener todos los sprints
        const sprintsData = await SprintService.getSprints();

        stats.totalSprints = sprintsData.length;
        stats.activeSprints = sprintsData.filter((s) => s.status === SprintStatus.ACTIVE).length;

        // Contar sprints que terminan pronto (en menos de 3 días)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        stats.nearEndSprints = sprintsData.filter((s) => {
          const endDate = new Date(s.end_date);
          return (
            endDate <= threeDaysFromNow && endDate >= today && s.status === SprintStatus.ACTIVE
          );
        }).length;

        // Calcular progreso global de proyectos
        if (stats.totalTasks > 0) {
          stats.projectProgress = Math.round((stats.completedTasks / stats.totalTasks) * 100);
        }

        // Calcular promedio de tareas por sprint
        if (stats.totalSprints > 0) {
          stats.averageTasksPerSprint = Math.round(stats.totalTasks / stats.totalSprints);
        }

        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Actualizar estadísticas cuando se selecciona un proyecto específico
  useEffect(() => {
    const fetchProjectSpecificData = async () => {
      if (selectedProject === 'all') {
        return; // Ya tenemos las estadísticas globales
      }

      setIsLoading(true);
      try {
        const projectId = parseInt(selectedProject);

        // Obtener tareas del proyecto seleccionado
        const tasksData = await TaskService.getTasks({ project_id: projectId });

        // Obtener sprints del proyecto seleccionado
        const sprintsData = await SprintService.getSprints({ project_id: projectId });

        // Inicializar estadísticas específicas del proyecto
        const stats = {
          ...statistics,
          totalTasks: tasksData.length,
          completedTasks: tasksData.filter((t) => t.status === TaskStatus.COMPLETED).length,
          pendingTasks: tasksData.filter(
            (t) => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS
          ).length,
          blockedTasks: tasksData.filter((t) => t.status === TaskStatus.BLOCKED).length,
          totalSprints: sprintsData.length,
          activeSprints: sprintsData.filter((s) => s.status === SprintStatus.ACTIVE).length,
        };

        // Contar tareas vencidas
        const today = new Date();
        stats.overdueTasks = tasksData.filter((t) => {
          if (!t.due_date) return false;
          const dueDate = new Date(t.due_date);
          return dueDate < today && t.status !== TaskStatus.COMPLETED;
        }).length;

        // Contar sprints que terminan pronto (en menos de 3 días)
        const threeDaysFromNow = new Date();
        threeDaysFromNow.setDate(today.getDate() + 3);

        stats.nearEndSprints = sprintsData.filter((s) => {
          const endDate = new Date(s.end_date);
          return (
            endDate <= threeDaysFromNow && endDate >= today && s.status === SprintStatus.ACTIVE
          );
        }).length;

        // Calcular progreso del proyecto
        if (stats.totalTasks > 0) {
          stats.projectProgress = Math.round((stats.completedTasks / stats.totalTasks) * 100);
        } else {
          stats.projectProgress = 0;
        }

        // Calcular promedio de tareas por sprint
        if (stats.totalSprints > 0) {
          stats.averageTasksPerSprint = Math.round(stats.totalTasks / stats.totalSprints);
        } else {
          stats.averageTasksPerSprint = 0;
        }

        setStatistics(stats);
      } catch (error) {
        console.error('Error fetching project specific data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProjectSpecificData();
  }, [selectedProject, statistics]);

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <h1 className="text-2xl font-bold text-foreground">Panel de Informes</h1>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id?.toString() || ''}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              {/* Métricas principales */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Progreso general</p>
                        <h3 className="text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                          {statistics.projectProgress}%
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-blue-200 dark:bg-blue-800/50 rounded-full flex items-center justify-center">
                        <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                    </div>
                    <div className="mt-4 h-2 w-full bg-blue-200 dark:bg-blue-800/30 rounded-full">
                      <div
                        className="h-full bg-blue-600 dark:bg-blue-500 rounded-full"
                        style={{ width: `${statistics.projectProgress}%` }}
                      ></div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-green-200 dark:border-green-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-green-600 dark:text-green-400">Tareas completadas</p>
                        <h3 className="text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                          {statistics.completedTasks} / {statistics.totalTasks}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-green-200 dark:bg-green-800/50 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-green-800 dark:text-green-200 text-sm">
                      {statistics.pendingTasks} pendientes, {statistics.blockedTasks} bloqueadas
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/30 border-amber-200 dark:border-amber-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Sprints activos</p>
                        <h3 className="text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                          {statistics.activeSprints} / {statistics.totalSprints}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-amber-200 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
                        <Timer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-amber-800 dark:text-amber-200 text-sm">
                      {statistics.nearEndSprints} terminan pronto
                    </p>
                  </CardContent>
                </Card>

                <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 border-red-200 dark:border-red-800">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-red-600 dark:text-red-400">Tareas vencidas</p>
                        <h3 className="text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                          {statistics.overdueTasks}
                        </h3>
                      </div>
                      <div className="h-12 w-12 bg-red-200 dark:bg-red-800/50 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
                      </div>
                    </div>
                    <p className="mt-2 text-red-800 dark:text-red-200 text-sm">Requieren atención inmediata</p>
                  </CardContent>
                </Card>
              </div>

              {/* Proyectos y Sprints */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Resumen de Proyectos</span>
                      <Link href="/projects" passHref>
                        <Button variant="ghost" size="sm" className="flex items-center">
                          Ver todos <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                            <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Total de proyectos</p>
                            <p className="text-sm text-muted-foreground">Todos los proyectos registrados</p>
                          </div>
                        </div>
                        <span className="font-bold text-xl text-foreground">{statistics.totalProjects}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                            <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Proyectos activos</p>
                            <p className="text-sm text-muted-foreground">Proyectos en desarrollo</p>
                          </div>
                        </div>
                        <span className="font-bold text-xl text-foreground">{statistics.activeProjects}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3">
                            <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground">Proyectos completados</p>
                            <p className="text-sm text-muted-foreground">Proyectos finalizados</p>
                          </div>
                        </div>
                        <span className="font-bold text-xl text-foreground">{statistics.completedProjects}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center justify-between">
                      <span>Estado de Tareas</span>
                      <Link href="/tasks" passHref>
                        <Button variant="ghost" size="sm" className="flex items-center">
                          Ver todas <ChevronRight className="h-4 w-4 ml-1" />
                        </Button>
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-orange-300 dark:bg-orange-400 mr-2"></div>
                          <p className="text-foreground">Por hacer</p>
                        </div>
                        <span className="font-medium text-foreground">
                          {statistics.pendingTasks - statistics.blockedTasks}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-blue-500 mr-2"></div>
                          <p className="text-foreground">En progreso</p>
                        </div>
                        <span className="font-medium text-foreground">
                          {statistics.pendingTasks -
                            (statistics.totalTasks -
                              statistics.completedTasks -
                              statistics.blockedTasks)}
                        </span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-green-500 mr-2"></div>
                          <p className="text-foreground">Completadas</p>
                        </div>
                        <span className="font-medium text-foreground">{statistics.completedTasks}</span>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="h-3 w-3 rounded-full bg-red-500 mr-2"></div>
                          <p className="text-foreground">Bloqueadas</p>
                        </div>
                        <span className="font-medium text-foreground">{statistics.blockedTasks}</span>
                      </div>

                      <div className="pt-4">
                        <div className="w-full h-4 bg-muted rounded-full overflow-hidden">
                          <div className="flex h-full">
                            <div
                              className="bg-green-500 h-full"
                              style={{
                                width: `${statistics.totalTasks ? (statistics.completedTasks / statistics.totalTasks) * 100 : 0}%`,
                              }}
                            ></div>
                            <div
                              className="bg-blue-500 h-full"
                              style={{
                                width: `${statistics.totalTasks ? ((statistics.pendingTasks - (statistics.totalTasks - statistics.completedTasks - statistics.blockedTasks)) / statistics.totalTasks) * 100 : 0}%`,
                              }}
                            ></div>
                            <div
                              className="bg-orange-300 dark:bg-orange-400 h-full"
                              style={{
                                width: `${statistics.totalTasks ? ((statistics.pendingTasks - statistics.blockedTasks) / statistics.totalTasks) * 100 : 0}%`,
                              }}
                            ></div>
                            <div
                              className="bg-red-500 h-full"
                              style={{
                                width: `${statistics.totalTasks ? (statistics.blockedTasks / statistics.totalTasks) * 100 : 0}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Informes detallados */}
              <div>
                <h2 className="text-xl font-semibold mb-4 text-foreground">Informes Detallados</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/reports/tasks')}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-foreground">Informe de Tareas</h3>
                      <p className="text-sm text-muted-foreground">
                        Estado detallado de todas las tareas, tiempos de completado y responsables.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/reports/sprints')}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4">
                        <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-foreground">Informe de Sprints</h3>
                      <p className="text-sm text-muted-foreground">
                        Análisis de sprints, velocidad del equipo y capacidad de entrega.
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => router.push('/reports/projects')}
                  >
                    <CardContent className="p-6 flex flex-col items-center text-center">
                      <div className="h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <FileBarChart className="h-6 w-6 text-green-600 dark:text-green-400" />
                      </div>
                      <h3 className="font-semibold text-lg mb-2 text-foreground">Informe de Proyectos</h3>
                      <p className="text-sm text-muted-foreground">
                        Progreso de proyectos, desviaciones de cronograma y métricas de éxito.
                      </p>
                    </CardContent>
                  </Card>
                  
            <Card
              className="hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => router.push('/reports/developer-performance')}
            >
              <CardContent className="p-6 flex flex-col items-center text-center">
                <div className="h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-foreground">Rendimiento por Desarrollador</h3>
                <p className="text-sm text-muted-foreground">
                  Análisis de horas trabajadas y tareas completadas por cada miembro del equipo en diferentes sprints.
                </p>
              </CardContent>
            </Card>
                </div>
              </div>
            </>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}