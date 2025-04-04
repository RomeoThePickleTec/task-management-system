// src/app/tasks/new/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import TaskForm from '@/components/tasks/TaskForm';
import { Button } from "@/components/ui/button";
import { IProject, ISprint, ITask, UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import { ChevronLeft } from "lucide-react";

// Importamos los servicios reales de API
import { ProjectService, SprintService, TaskService } from '@/services/api';

export default function NewTaskPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<IProject[]>([]);
  const [sprints, setSprints] = useState<ISprint[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        // Obtener proyectos
        const projectsData = await ProjectService.getProjects();
        console.log('Proyectos obtenidos:', projectsData);
        setProjects(projectsData);
        
        // Obtener sprints
        const sprintsData = await SprintService.getSprints();
        console.log('Sprints obtenidos:', sprintsData);
        setSprints(sprintsData);
      } catch (error) {
        console.error('Error fetching form data:', error);
        setMessage({ 
          type: 'error',
          text: 'No se pudieron cargar los datos. Por favor, intenta de nuevo.'
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSubmit = async (taskData: Omit<ITask, 'id' | 'created_at' | 'updated_at'>) => {
    console.log('Submit task data:', taskData);
    setIsSubmitting(true);
    setMessage(null);
    
    try {
      // Asegurarnos de que los datos tienen el formato correcto
      const formattedTaskData = {
        ...taskData,
        priority: Number(taskData.priority),
        status: Number(taskData.status),
        estimated_hours: Number(taskData.estimated_hours),
        project_id: taskData.project_id ? Number(taskData.project_id) : undefined,
        sprint_id: taskData.sprint_id ? Number(taskData.sprint_id) : undefined,
      };
      
      console.log('Formatted task data to send:', formattedTaskData);
      
      const createdTask = await TaskService.createTask(formattedTaskData);
      console.log('Task created:', createdTask);
      
      // Consideramos la tarea creada incluso si la respuesta es null
      setMessage({ 
        type: 'success',
        text: '¡Tarea creada correctamente! Redirigiendo...'
      });
      
      // Esperar un momento para que el usuario vea el mensaje de éxito
      setTimeout(() => {
        // Redirigir a la lista de tareas ya que no tenemos el ID
        router.push('/tasks');
      }, 2000);
    } catch (error) {
      console.error('Error creating task:', error);
      setMessage({
        type: 'error',
        text: 'Hubo un error al crear la tarea. La tarea podría haberse creado pero no pudimos recibir la confirmación.'
      });
      
      // Aún así, después de un tiempo prudencial, volvemos a la lista de tareas
      setTimeout(() => {
        router.push('/tasks');
      }, 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link href="/tasks" passHref>
            <Button variant="outline" size="sm">
              <ChevronLeft className="h-4 w-4 mr-1" /> Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Nueva tarea</h1>
        </div>

        {message && (
          <div 
            className={`${
              message.type === 'success' ? 'bg-green-100 border-green-400 text-green-700' : 'bg-red-100 border-red-400 text-red-700'
            } px-4 py-3 rounded relative border`} 
            role="alert"
          >
            <strong className="font-bold">{message.type === 'success' ? 'Éxito: ' : 'Aviso: '}</strong>
            <span className="block sm:inline">{message.text}</span>
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <TaskForm 
            projects={projects}
            sprints={sprints}
            onSubmit={handleSubmit}
            onCancel={() => router.push('/tasks')}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </MainLayout>
  );
}