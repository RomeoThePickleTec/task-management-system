// src/app/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Layers, 
  CheckSquare, 
  PlusCircle,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  Calendar
} from "lucide-react";
import { ITask, IProject, ISprint, TaskStatus, ProjectStatus, UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Importamos los servicios reales de API
import { 
  TaskService, 
  ProjectService,
  SprintService,
  UserService
} from '@/services/api';

export default function HomePage() {
  const [recentTasks, setRecentTasks] = useState<ITask[]>([]);
  const [activeProjects, setActiveProjects] = useState<IProject[]>([]);
  const [activeSprints, setActiveSprints] = useState<ISprint[]>([]);
  const [currentUser, setCurrentUser] = useState<UserRole>(UserRole.DEVELOPER);
  const [isLoading, setIsLoading] = useState({
    tasks: true,
    projects: true,
    sprints: true,
    user: true
  });
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

  const router = useRouter();

  useEffect(() => {
    // Cargar tareas recientes
    const fetchTasks = async () => {
      try {
        const tasks = await TaskService.getTasks();
        // Ordenar por fecha de creación (más recientes primero) y tomar las 6 primeras
        const sortedTasks = tasks
          .filter(task => task.created_at) // Asegurémonos de que tienen fecha de creación
          .sort((a, b) => {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            return dateB - dateA;
          })
          .slice(0, 3);
        setRecentTasks(sortedTasks);
      } catch (error) {
        console.error("Error fetching tasks:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, tasks: false }));
      }
    };

    // Cargar proyectos activos
    const fetchProjects = async () => {
      try {
        const projects = await ProjectService.getProjects({ status: ProjectStatus.ACTIVE });
        setActiveProjects(projects.slice(0, 3)); // Mostrar solo los primeros 3
      } catch (error) {
        console.error("Error fetching projects:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, projects: false }));
      }
    };

    // Cargar sprints activos
    const fetchSprints = async () => {
      try {
        // Obtener sprints con estado ACTIVE (1)
        const sprints = await SprintService.getSprints({ status: 1 });
        setActiveSprints(sprints.slice(0, 3)); // Mostrar solo los primeros 3
      } catch (error) {
        console.error("Error fetching sprints:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, sprints: false }));
      }
    };

    // Intentar cargar un usuario (para demo, usar el primero que encontremos)
    const fetchUser = async () => {
      try {
        const users = await UserService.getUsers();
        if (users.length > 0) {
          // Asumimos que el primer usuario es el actual para esta demo
          setCurrentUser(UserRole.MANAGER); // Por defecto lo ponemos como MANAGER
        }
      } catch (error) {
        console.error("Error fetching user:", error);
      } finally {
        setIsLoading(prev => ({ ...prev, user: false }));
      }
    };

    fetchTasks();
    fetchProjects();
    fetchSprints();
    fetchUser();
  }, []);

  // Cambiar el estado de una tarea
  const handleTaskStatusChange = async (taskId: number | undefined, status: TaskStatus) => {
    if (!taskId) return;
    
    try {
      setLoadingTaskId(taskId);
      
      const currentTask = await TaskService.getTaskById(taskId);
      
      if (!currentTask) {
        console.error(`Task with ID ${taskId} not found`);
        return;
      }
      
      const updatedTaskData = {
        title: currentTask.title,
        description: currentTask.description,
        created_at: currentTask.created_at,
        updated_at: new Date().toISOString(),
        due_date: currentTask.due_date,
        priority: currentTask.priority,
        status: status,
        estimated_hours: currentTask.estimated_hours
      };
      
      const updatedTask = await TaskService.updateTask(taskId, updatedTaskData);
      
      if (updatedTask) {
        // Actualizar la lista de tareas
        const allTasks = await TaskService.getTasks();
        const sortedTasks = allTasks
          .filter(task => task.created_at)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            return dateB - dateA;
          });
        
        // Actualizar las tareas recientes
        setRecentTasks(sortedTasks.slice(0, 3));
        
        console.log(`Tarea ${taskId} actualizada a estado ${status}`);
      }
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: currentUser
  };

  return (
    <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Panel de Control</h1>
          <div className="flex space-x-2">
            <Link href="/tasks/new" passHref>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" /> Nueva tarea
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Proyectos activos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Layers className="h-5 w-5 mr-2 text-blue-500" />
                Proyectos activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading.projects ? (
                <div className="h-24 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                </div>
              ) : activeProjects.length > 0 ? (
                <div className="space-y-3">
                  {activeProjects.map(project => (
                    <div key={project.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{project.name}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(project.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/projects/${project.id}`} passHref>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-gray-500">
                  No hay proyectos activos
                </div>
              )}
              <div className="mt-4">
                <Link href="/projects" passHref>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos los proyectos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Sprints activos */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-green-500" />
                Sprints activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading.sprints ? (
                <div className="h-24 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-500"></div>
                </div>
              ) : activeSprints.length > 0 ? (
                <div className="space-y-3">
                  {activeSprints.map(sprint => (
                    <div key={sprint.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{sprint.name}</p>
                        <p className="text-sm text-gray-500">
                          Termina: {new Date(sprint.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/sprints/${sprint.id}`} passHref>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-gray-500">
                  No hay sprints activos
                </div>
              )}
              <div className="mt-4">
                <Link href="/sprints" passHref>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todos los sprints
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Tareas pendientes */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <CheckSquare className="h-5 w-5 mr-2 text-amber-500" />
                Mis tareas recientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading.tasks ? (
                <div className="h-24 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-amber-500"></div>
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-3">
                  {recentTasks.map(task => (
                    <div key={task.id} className="flex justify-between items-center border-b pb-2 last:border-0">
                      <div>
                        <p className="font-medium">{task.title}</p>
                        <p className="text-sm text-gray-500">
                          {task.due_date ? `Vence: ${new Date(task.due_date).toLocaleDateString()}` : 'Sin fecha'}
                        </p>
                      </div>
                      <Link href={`/tasks/${task.id}`} passHref>
                        <Button variant="ghost" size="sm">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-gray-500">
                  No hay tareas recientes
                </div>
              )}
              <div className="mt-4">
                <Link href="/tasks" passHref>
                  <Button variant="outline" size="sm" className="w-full">
                    Ver todas las tareas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tareas recientes */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Tareas recientes</h2>
            <Link href="/tasks" passHref>
              <Button variant="outline" size="sm">
                Ver todas
              </Button>
            </Link>
          </div>
          <Card className="w-full">
            <CardContent className="pt-6">
              {isLoading.tasks ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map(task => (
                    <Card 
                      key={task.id} 
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{task.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-1 mt-1">{task.description}</p>
                          </div>
                          <div>
                            {task.status === TaskStatus.TODO && (
                              <Badge variant="outline" className="bg-gray-100">Por hacer</Badge>
                            )}
                            {task.status === TaskStatus.IN_PROGRESS && (
                              <Badge variant="default" className="bg-blue-500">En progreso</Badge>
                            )}
                            {task.status === TaskStatus.COMPLETED && (
                              <Badge variant="default" className="bg-green-500">Completado</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-xs text-gray-500">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Sin fecha'}
                          </div>
                          {task.status !== TaskStatus.COMPLETED && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-7 text-xs"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskStatusChange(task.id, TaskStatus.COMPLETED);
                              }}
                            >
                              <CheckCircle2 className="h-3 w-3 mr-1" /> Completar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">No hay tareas recientes para mostrar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}