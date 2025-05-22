'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ITask, UserRole, IProject, ISprint } from '@/core/interfaces/models';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import TaskForm from '@/components/tasks/TaskForm';

// Importamos los servicios reales de API
import { TaskService } from '@/services/api';
import { ProjectService } from '@/services/api/projectService'; // Asumimos que existe este servicio
import { SprintService } from '@/services/api/sprintService'; // Asumimos que existe este servicio
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function EditTaskPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const [task, setTask] = useState<ITask | null>(null);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [sprints, setSprints] = useState<ISprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
    id: 12,
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Obtener la tarea
        const taskData = await TaskService.getTaskById(taskId);
        if (!taskData) {
          setError(`Tarea con ID ${taskId} no encontrada`);
          return;
        }
        setTask(taskData);

        // Obtener proyectos
        try {
          const projectsData = await ProjectService.getProjects();
          setProjects(projectsData || []);
        } catch (err) {
          console.error('Error al obtener proyectos:', err);
          setProjects([]);
        }

        // Obtener sprints
        try {
          const sprintsData = await SprintService.getSprints();
          setSprints(sprintsData || []);
        } catch (err) {
          console.error('Error al obtener sprints:', err);
          setSprints([]);
        }
      } catch (error) {
        console.error(`Error al obtener datos para la tarea ${taskId}:`, error);
        setError(`Error al cargar la información de la tarea: ${error}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (taskId) {
      fetchData();
    }
  }, [taskId]);

  const handleSubmit = async (taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => {
    if (!task) return;

    setIsSubmitting(true);
    setError(null);
    try {
      const updatedTask = await TaskService.updateTask(taskId, taskData);
      if (updatedTask) {
        router.push(`/tasks/${taskId}`);
      } else {
        setError('Error al actualizar la tarea. Por favor, inténtalo de nuevo.');
      }
    } catch (error) {
      console.error('Error al actualizar la tarea:', error);
      setError(`Error al actualizar la tarea: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (isLoading) {
    return (
      <ProtectedRoute
        requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.TESTER]}
      >
        <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (error || !task) {
    return (
      <ProtectedRoute
        requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.TESTER]}
      >
        <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Error</h2>
            <p className="text-gray-600 mb-6">
              {error || `La tarea con ID ${taskId} no existe o ha sido eliminada.`}
            </p>
            <Link href="/tasks" passHref>
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a la lista de tareas
              </Button>
            </Link>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.TESTER]}
    >
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href={`/tasks/${taskId}`} passHref>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Editar Tarea</h1>
            </div>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Detalles de la Tarea</CardTitle>
            </CardHeader>
            <CardContent>
              <TaskForm
                task={task}
                projects={projects}
                sprints={sprints}
                onSubmit={handleSubmit}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>

          {/* Mensaje de error si existe */}
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}