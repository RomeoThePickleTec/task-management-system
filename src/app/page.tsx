'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/contexts/BackendAuthContext';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import MainLayout from '@/components/layout/MainLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Layers,
  CheckSquare,
  PlusCircle,
  ArrowRight,
  CalendarIcon,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { ITask, IProject, ISprint, TaskStatus, ProjectStatus } from '@/core/interfaces/models';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { gsap } from 'gsap';

// Import API services
import { TaskService, ProjectService, SprintService } from '@/services/api';

export default function HomePage() {
  const { currentUser, loading } = useAuth();
  const router = useRouter();

  // If no user and not loading, redirect to login
  useEffect(() => {
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
  }, [loading, currentUser, router]);

  // If still loading, show loading spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
      </div>
    );
  }

  // If not authenticated, don't render the page content
  if (!currentUser) {
    return null;
  }

  // Render the dashboard with authentication protection
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}

// Separate component for the dashboard content
function DashboardContent() {
  const [recentTasks, setRecentTasks] = useState<ITask[]>([]);
  const [activeProjects, setActiveProjects] = useState<IProject[]>([]);
  const [activeSprints, setActiveSprints] = useState<ISprint[]>([]);
  const [isLoading, setIsLoading] = useState({
    tasks: true,
    projects: true,
    sprints: true,
  });
  const [loadingTaskId, setLoadingTaskId] = useState<number | null>(null);

  // Refs for GSAP animations
  const headerRef = useRef<HTMLDivElement>(null);
  const cardsContainerRef = useRef<HTMLDivElement>(null);
  const tasksHeaderRef = useRef<HTMLDivElement>(null);
  const tasksSectionRef = useRef<HTMLDivElement>(null);
  const taskCardsRef = useRef<HTMLDivElement[]>([]);

  const router = useRouter();

  useEffect(() => {
    // Initial page animations
    const tl = gsap.timeline();
    
    // Animate header
    tl.fromTo(headerRef.current, 
      { opacity: 0, y: -30 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
    );

    // Animate cards container
    tl.fromTo(cardsContainerRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.4"
    );

    // Animate tasks header
    tl.fromTo(tasksHeaderRef.current,
      { opacity: 0, x: -20 },
      { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" },
      "-=0.3"
    );

    // Load data with staggered animations
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    const fetchTasks = async () => {
      try {
        const tasks = await TaskService.getTasks();
        const sortedTasks = tasks
          .filter((task) => task.created_at)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            return dateB - dateA;
          })
          .slice(0, 3);
        setRecentTasks(sortedTasks);
        
        // Animate task cards when loaded
        setTimeout(() => {
          gsap.fromTo(tasksSectionRef.current,
            { opacity: 0, y: 30 },
            { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" }
          );
        }, 100);
      } catch (error) {
        console.error('Error fetching tasks:', error);
      } finally {
        setIsLoading((prev) => ({ ...prev, tasks: false }));
      }
    };

    const fetchProjects = async () => {
      try {
        const projects = await ProjectService.getProjects({ status: ProjectStatus.ACTIVE });
        setActiveProjects(projects.slice(0, 3));
      } catch (error) {
        console.error('Error fetching projects:', error);
      } finally {
        setIsLoading((prev) => ({ ...prev, projects: false }));
      }
    };

    const fetchSprints = async () => {
      try {
        const sprints = await SprintService.getSprints({ status: 1 });
        setActiveSprints(sprints.slice(0, 3));
      } catch (error) {
        console.error('Error fetching sprints:', error);
      } finally {
        setIsLoading((prev) => ({ ...prev, sprints: false }));
      }
    };

    await Promise.all([fetchTasks(), fetchProjects(), fetchSprints()]);
  };

  // Animate task cards when they're added
  useEffect(() => {
    if (recentTasks.length > 0 && !isLoading.tasks) {
      gsap.fromTo(taskCardsRef.current,
        { opacity: 0, y: 20, scale: 0.95 },
        { 
          opacity: 1, 
          y: 0, 
          scale: 1,
          duration: 0.6,
          stagger: 0.1,
          ease: "back.out(1.7)"
        }
      );
    }
  }, [recentTasks, isLoading.tasks]);

  // Change task status with animation
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
        estimated_hours: currentTask.estimated_hours,
      };

      const updatedTask = await TaskService.updateTask(taskId, updatedTaskData);

      if (updatedTask) {
        // Animate the update
        const taskElement = taskCardsRef.current.find(el => 
          el?.dataset.taskId === taskId.toString()
        );
        
        if (taskElement) {
          gsap.to(taskElement, {
            scale: 1.05,
            duration: 0.2,
            yoyo: true,
            repeat: 1,
            ease: "power2.inOut"
          });
        }

        // Refresh task list
        const allTasks = await TaskService.getTasks();
        const sortedTasks = allTasks
          .filter((task) => task.created_at)
          .sort((a, b) => {
            const dateA = new Date(a.created_at || '').getTime();
            const dateB = new Date(b.created_at || '').getTime();
            return dateB - dateA;
          });

        setRecentTasks(sortedTasks.slice(0, 3));
      }
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
    } finally {
      setLoadingTaskId(null);
    }
  };

  const addTaskCardRef = (el: HTMLDivElement | null, index: number) => {
    if (el) {
      taskCardsRef.current[index] = el;
    }
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header with animation */}
        <div 
          ref={headerRef}
          className="flex justify-between items-center"
        >
          <h1 className="text-2xl font-bold text-foreground">Panel de Control</h1>
          <div className="flex space-x-2">
            <Link href="/tasks/new" passHref>
              <Button className="hover:scale-105 transition-transform duration-200">
                <PlusCircle className="h-4 w-4 mr-2" /> Nueva tarea
              </Button>
            </Link>
          </div>
        </div>

        {/* Cards grid with animation */}
        <div 
          ref={cardsContainerRef}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          {/* Active Projects */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium flex items-center">
                <Layers className="h-5 w-5 mr-2 text-red-500" />
                Proyectos activos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading.projects ? (
                <div className="h-24 flex justify-center items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                </div>
              ) : activeProjects.length > 0 ? (
                <div className="space-y-3">
                  {activeProjects.map((project) => (
                    <div
                      key={project.id}
                      className="flex justify-between items-center border-b border-border pb-2 last:border-0 hover:bg-muted/50 rounded px-2 py-1 transition-colors duration-200"
                    >
                      <div>
                        <p className="font-medium text-foreground">{project.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(project.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/projects/${project.id}`} passHref>
                        <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-muted-foreground">
                  No hay proyectos activos
                </div>
              )}
              <div className="mt-4">
                <Link href="/projects" passHref>
                  <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-transform">
                    Ver todos los proyectos
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Active Sprints */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                  {activeSprints.map((sprint) => (
                    <div
                      key={sprint.id}
                      className="flex justify-between items-center border-b border-border pb-2 last:border-0 hover:bg-muted/50 rounded px-2 py-1 transition-colors duration-200"
                    >
                      <div>
                        <p className="font-medium text-foreground">{sprint.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Termina: {new Date(sprint.end_date).toLocaleDateString()}
                        </p>
                      </div>
                      <Link href={`/sprints/${sprint.id}`} passHref>
                        <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-muted-foreground">
                  No hay sprints activos
                </div>
              )}
              <div className="mt-4">
                <Link href="/sprints" passHref>
                  <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-transform">
                    Ver todos los sprints
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Recent Tasks */}
          <Card className="hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
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
                  {recentTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex justify-between items-center border-b border-border pb-2 last:border-0 hover:bg-muted/50 rounded px-2 py-1 transition-colors duration-200"
                    >
                      <div>
                        <p className="font-medium text-foreground">{task.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {task.due_date
                            ? `Vence: ${new Date(task.due_date).toLocaleDateString()}`
                            : 'Sin fecha'}
                        </p>
                      </div>
                      <Link href={`/tasks/${task.id}`} passHref>
                        <Button variant="ghost" size="sm" className="hover:scale-110 transition-transform">
                          <ArrowRight className="h-4 w-4" />
                        </Button>
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="h-24 flex justify-center items-center text-muted-foreground">
                  No hay tareas recientes
                </div>
              )}
              <div className="mt-4">
                <Link href="/tasks" passHref>
                  <Button variant="outline" size="sm" className="w-full hover:scale-105 transition-transform">
                    Ver todas las tareas
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Tasks Section */}
        <div>
          <div 
            ref={tasksHeaderRef}
            className="flex justify-between items-center mb-4"
          >
            <h2 className="text-xl font-semibold text-foreground">Tareas recientes</h2>
            <Link href="/tasks" passHref>
              <Button variant="outline" size="sm" className="hover:scale-105 transition-transform">
                Ver todas
              </Button>
            </Link>
          </div>
          <Card 
            ref={tasksSectionRef}
            className="w-full hover:shadow-lg transition-shadow duration-300"
          >
            <CardContent className="pt-6">
              {isLoading.tasks ? (
                <div className="flex justify-center items-center h-40">
                  <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
                </div>
              ) : recentTasks.length > 0 ? (
                <div className="space-y-4">
                  {recentTasks.map((task, index) => (
                    <Card
                      key={task.id}
                      ref={(el) => addTaskCardRef(el, index)}
                      data-task-id={task.id}
                      className="cursor-pointer hover:shadow-md transition-all duration-300 hover:-translate-y-1"
                      onClick={() => router.push(`/tasks/${task.id}`)}
                    >
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium text-foreground">{task.title}</h3>
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {task.description}
                            </p>
                          </div>
                          <div>
                            {task.status === TaskStatus.TODO && (
                              <Badge variant="outline" className="bg-muted">
                                Por hacer
                              </Badge>
                            )}
                            {task.status === TaskStatus.IN_PROGRESS && (
                              <Badge variant="default" className="bg-blue-500">
                                En progreso
                              </Badge>
                            )}
                            {task.status === TaskStatus.COMPLETED && (
                              <Badge variant="default" className="bg-green-500">
                                Completado
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex justify-between items-center mt-3 text-xs text-muted-foreground">
                          <div className="flex items-center">
                            <CalendarIcon className="h-3 w-3 mr-1" />
                            {task.due_date
                              ? new Date(task.due_date).toLocaleDateString()
                              : 'Sin fecha'}
                          </div>
                          {task.status !== TaskStatus.COMPLETED && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-7 text-xs hover:scale-110 transition-transform"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTaskStatusChange(task.id, TaskStatus.COMPLETED);
                              }}
                              disabled={loadingTaskId === task.id}
                            >
                              {loadingTaskId === task.id ? (
                                <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-primary mr-1"></div>
                              ) : (
                                <CheckCircle2 className="h-3 w-3 mr-1" />
                              )}
                              Completar
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 border border-dashed border-border rounded-lg">
                  <p className="text-muted-foreground">No hay tareas recientes para mostrar</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </MainLayout>
  );
}