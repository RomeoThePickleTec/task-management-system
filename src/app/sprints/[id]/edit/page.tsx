'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { IProject, ISprint, UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';

// Import services
import { ProjectService, SprintService } from '@/services/api';
import SprintForm from '@/components/sprints/SprintForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function EditSprintPage() {
  const params = useParams();
  const router = useRouter();
  const sprintId = Number(params.id);

  const [sprint, setSprint] = useState<ISprint | null>(null);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setMessage(null);
      try {
        // Fetch the sprint data
        const sprintData = await SprintService.getSprintById(sprintId);
        if (!sprintData) {
          setMessage({
            type: 'error',
            text: 'No se pudo encontrar el sprint. Por favor, intenta de nuevo.',
          });
          setTimeout(() => {
            router.push('/sprints');
          }, 3000);
          return;
        }
        setSprint(sprintData);

        // Fetch projects for the dropdown
        const projectsData = await ProjectService.getProjects();
        setProjects(projectsData);
      } catch (error) {
        console.error('Error fetching sprint data:', error);
        setMessage({
          type: 'error',
          text: 'Error al cargar los datos del sprint. Por favor, intenta de nuevo.',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (sprintId) {
      fetchData();
    }
  }, [sprintId, router]);

  const handleSubmit = async (sprintData: Omit<ISprint, 'id' | 'created_at' | 'updated_at'>) => {
    if (!sprint?.id) return;

    setIsSubmitting(true);
    setMessage(null);

    try {
      // Format the data for update
      const formattedSprintData = {
        ...sprintData,
        status: sprintData.status,
        start_date: sprintData.start_date,
        project_id: sprintData.project_id,
        name: sprintData.name,
        description: sprintData.description,
        end_date: sprintData.end_date,
      };

      console.log('Updating sprint data:', formattedSprintData);

      // Call the updateSprint method from SprintService
      const updatedSprint = await SprintService.updateSprint(sprint.id, formattedSprintData);

      if (updatedSprint) {
        setMessage({
          type: 'success',
          text: '¡Sprint actualizado correctamente! Redirigiendo...',
        });

        // Wait for user to see success message
        setTimeout(() => {
          router.push(`/sprints/${sprint.id}`);
        }, 2000);
      } else {
        throw new Error('No se recibió confirmación de la actualización');
      }
    } catch (error) {
      console.error('Error updating sprint:', error);
      setMessage({
        type: 'error',
        text: 'Hubo un error al actualizar el sprint. Por favor, intenta de nuevo.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex items-center space-x-4">
            <Link href={`/sprints/${sprintId}`} passHref>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" /> Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Editar Sprint</h1>
          </div>

          {message && (
            <div
              className={`${
                message.type === 'success'
                  ? 'bg-green-100 border-green-400 text-green-700'
                  : 'bg-red-100 border-red-400 text-red-700'
              } px-4 py-3 rounded relative border`}
              role="alert"
            >
              <strong className="font-bold">
                {message.type === 'success' ? 'Éxito: ' : 'Aviso: '}
              </strong>
              <span className="block sm:inline">{message.text}</span>
            </div>
          )}

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : sprint ? (
            <SprintForm
              sprint={sprint}
              projects={projects}
              onSubmit={handleSubmit}
              onCancel={() => router.push(`/sprints/${sprintId}`)}
              isSubmitting={isSubmitting}
            />
          ) : (
            <div className="text-center p-8">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Sprint no encontrado</h2>
              <p className="text-gray-600 mb-6">
                El sprint que intentas editar no existe o ha sido eliminado.
              </p>
              <Link href="/sprints" passHref>
                <Button>
                  <ChevronLeft className="h-4 w-4 mr-2" />
                  Volver a la lista de sprints
                </Button>
              </Link>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}