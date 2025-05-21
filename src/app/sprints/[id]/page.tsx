// src/app/sprints/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ISprint, ITask, TaskStatus, SprintStatus, UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import {
  ChevronLeft,
  Calendar,
  Edit,
  Trash,
  PlusCircle,
  CheckCircle2,
  XCircle,
  AlarmClock,
} from 'lucide-react';
import TaskList from '@/components/tasks/TaskList';

// Import services
import { SprintService, TaskService, ProjectService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Import Dialog component for confirmation
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function SprintDetailPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = Number(params.id);

  const [sprint, setSprint] = useState<ISprint | null>(null);
  const [tasks, setTasks] = useState<ITask[]>([]);
  const [projectName, setProjectName] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [taskProgress, setTaskProgress] = useState({
    total: 0,
    completed: 0,
    percentage: 0,
  });
  
  // New state for delete confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  useEffect(() => {
    const fetchSprintDetails = async () => {
      setIsLoading(true);
      try {
        // Obtener el sprint
        const sprintData = await SprintService.getSprintById(sprintId);
  
        if (sprintData) {
          setSprint(sprintData);
  
          // Obtener el nombre del proyecto
          if (sprintData.project_id) {
            const project = await ProjectService.getProjectById(sprintData.project_id);
            if (project) {
              setProjectName(project.name);
            }
          }
  
          // Get tasks directly from the sprint object if they exist
          let sprintTasks: ITask[] = [];
          
          if (sprintData.tasks && sprintData.tasks.length > 0) {
            // If tasks are already included in the sprint response
            sprintTasks = sprintData.tasks;
          } else {
            // If not, fetch tasks explicitly using the new method
            sprintTasks = await SprintService.getTasksBySprint(sprintId);
          }
  
          setTasks(sprintTasks);
  
          // Calcular progreso
          const total = sprintTasks.length;
          const completed = sprintTasks.filter(
            (task) => task.status === TaskStatus.COMPLETED
          ).length;
          const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
  
          setTaskProgress({
            total,
            completed,
            percentage,
          });
        } else {
          console.error(`Sprint with ID ${sprintId} not found`);
          router.push('/sprints');
        }
      } catch (error) {
        console.error(`Error fetching sprint ${sprintId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };
  
    if (sprintId) {
      fetchSprintDetails();
    }
  }, [sprintId, router]);
  
  // Handle delete sprint
  const handleDeleteSprint = async () => {
    if (!sprint?.id) return;
    
    setIsDeleting(true);
    try {
      // Call the deleteSprint method from SprintService
      const success = await SprintService.deleteSprint(sprint.id);
      
      if (success) {
        // Show success message
        console.log(`Sprint ${sprint.id} deleted successfully`);
        // Navigate back to sprints list
        router.push('/sprints');
      } else {
        console.error(`Failed to delete sprint ${sprint.id}`);
        // Close the dialog
        setDeleteDialogOpen(false);
      }
    } catch (error) {
      console.error(`Error deleting sprint ${sprint.id}:`, error);
    } finally {
      setIsDeleting(false);
      // Close the dialog
      setDeleteDialogOpen(false);
    }
  };

  // Cambiar el estado de una tarea
  const handleTaskStatusChange = async (taskId: number | undefined, status: TaskStatus) => {
    if (!taskId) return;

    try {
      // Obtener la tarea actual
      const currentTask = await TaskService.getTaskById(taskId);

      if (!currentTask) {
        console.error(`Task with ID ${taskId} not found`);
        return;
      }

      // Crear objeto de actualización
      const updatedTaskData = {
        ...currentTask,
        status: status,
      };

      // Actualizar la tarea
      const result = await TaskService.updateTask(taskId, updatedTaskData);

      if (result) {
        // Actualizar el estado local
        setTasks((prevTasks) =>
          prevTasks.map((task) => (task.id === taskId ? { ...task, status } : task))
        );

        // Recalcular el progreso
        const total = tasks.length;
        const completed = tasks.filter((task) =>
          task.id === taskId
            ? status === TaskStatus.COMPLETED
            : task.status === TaskStatus.COMPLETED
        ).length;
        const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

        setTaskProgress({
          total,
          completed,
          percentage,
        });
      }
    } catch (error) {
      console.error(`Error updating task ${taskId}:`, error);
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Obtener el badge de estado del sprint
  const getSprintStatusBadge = (status: SprintStatus) => {
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

  // Calcular días restantes
  const getRemainingDays = (endDate: string) => {
    const end = new Date(endDate);
    const today = new Date();
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return 'Terminado';
    if (diffDays === 0) return 'Termina hoy';
    return `${diffDays} días restantes`;
  };

  if (isLoading) {
    return (
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!sprint) {
    return (
      <ProtectedRoute>
        <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Sprint no encontrado</h2>
            <p className="text-gray-600 mb-6">
              El sprint que estás buscando no existe o ha sido eliminado.
            </p>
            <Link href="/sprints" passHref>
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a la lista de sprints
              </Button>
            </Link>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/sprints" passHref>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">{sprint.name}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/sprints/${sprint.id}/edit`} passHref>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
              </Link>
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => setDeleteDialogOpen(true)}
                disabled={isDeleting}
              >
                <Trash className="h-4 w-4 mr-1" /> Eliminar
              </Button>
            </div>
          </div>

          {/* Delete Confirmation Dialog */}
          <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción no se puede deshacer. Se eliminará permanentemente el sprint 
                  <strong> {sprint.name}</strong> y todas sus tareas asociadas.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={handleDeleteSprint} 
                  disabled={isDeleting}
                  className="bg-red-600 hover:bg-red-700"
                >
                  {isDeleting ? 'Eliminando...' : 'Eliminar'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles del Sprint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Descripción</h3>
                    <p className="text-gray-800">{sprint.description || 'Sin descripción'}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Estado</h3>
                      <div className="flex items-center space-x-2">
                        {getSprintStatusBadge(sprint.status)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-1">Proyecto</h3>
                      <div className="flex items-center space-x-2">
                        <Link
                          href={`/projects/${sprint.project_id}`}
                          className="text-blue-500 hover:underline"
                        >
                          {projectName || `Proyecto #${sprint.project_id}`}
                        </Link>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Período</h3>
                        <p className="text-gray-800">
                          {formatDate(sprint.start_date)} - {formatDate(sprint.end_date)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <AlarmClock className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Tiempo restante</h3>
                        <p className="text-gray-800">{getRemainingDays(sprint.end_date)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h3 className="text-sm font-medium text-gray-500 mb-3">Progreso del Sprint</h3>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span>
                        {taskProgress.completed} de {taskProgress.total} tareas completadas
                      </span>
                      <span className="font-medium">{taskProgress.percentage}%</span>
                    </div>
                    <div className="w-full bg-gray-200 h-2 rounded-full">
                      <div
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${taskProgress.percentage}%` }}
                      ></div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tareas del Sprint */}
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold">Tareas del Sprint</h2>
                  <Link href={`/tasks/new?sprint_id=${sprint.id}`} passHref>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-1" /> Añadir tarea
                    </Button>
                  </Link>
                </div>

                <TaskList
                  tasks={tasks}
                  onTaskClick={(id) => router.push(`/tasks/${id}`)}
                  onStatusChange={handleTaskStatusChange}
                  isLoading={false}
                  emptyMessage="No hay tareas en este sprint"
                />
              </div>
            </div>

            {/* Información lateral */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información del Sprint</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Fecha de creación</h3>
                    <p className="text-gray-800">
                      {formatDate(sprint.created_at || sprint.start_date)}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Última actualización</h3>
                    <p className="text-gray-800">
                      {formatDate(sprint.updated_at || sprint.start_date)}
                    </p>
                  </div>

                  <div className="pt-4">
                    <h3 className="text-sm font-medium text-gray-500 mb-2">Acciones rápidas</h3>
                    <div className="space-y-2">
                      {sprint.status !== SprintStatus.ACTIVE && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => console.log('Iniciar sprint')}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2" /> Iniciar sprint
                        </Button>
                      )}

                      {sprint.status !== SprintStatus.COMPLETED && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full justify-start"
                          onClick={() => console.log('Finalizar sprint')}
                        >
                          <XCircle className="h-4 w-4 mr-2" /> Finalizar sprint
                        </Button>
                      )}

                      <Link href={`/reports/sprint/${sprint.id}`} passHref>
                        <Button variant="outline" size="sm" className="w-full justify-start">
                          <Calendar className="h-4 w-4 mr-2" /> Ver informe
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Estado de las tareas */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Estado de las Tareas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Por hacer</span>
                      <Badge variant="outline" className="bg-gray-100">
                        {tasks.filter((task) => task.status === TaskStatus.TODO).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">En progreso</span>
                      <Badge variant="default" className="bg-blue-500">
                        {tasks.filter((task) => task.status === TaskStatus.IN_PROGRESS).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Completadas</span>
                      <Badge variant="default" className="bg-green-500">
                        {tasks.filter((task) => task.status === TaskStatus.COMPLETED).length}
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm">Bloqueadas</span>
                      <Badge variant="destructive">
                        {tasks.filter((task) => task.status === TaskStatus.BLOCKED).length}
                      </Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}