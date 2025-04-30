'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { IProject, UserRole } from '@/core/interfaces/models';
import { ArrowLeft, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import ProjectForm from '@/components/projects/ProjectForm';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { ProjectService } from '@/services/api';
import Link from 'next/link';

const NewProjectPage = () => {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  // Manejar creación de proyecto
  const handleCreateProject = async (
    projectData: Omit<IProject, 'id' | 'created_at' | 'updated_at'>
  ) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const newProject = await ProjectService.createProject(projectData);

      if (newProject) {
        setSuccessMessage('Proyecto creado correctamente');

        // Redirigir a la página del proyecto después de 1.5 segundos
        setTimeout(() => {
          router.push(`/projects/${newProject.id}`);
        }, 1500);
      } else {
        throw new Error('No se pudo crear el proyecto');
      }
    } catch (err) {
      console.error('Error al crear el proyecto:', err);
      setError('Error al crear el proyecto. Por favor, inténtelo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Manejar cancelación
  const handleCancel = () => {
    router.push('/projects');
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.MANAGER, UserRole.DEVELOPER, UserRole.ADMIN]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          {/* Cabecera */}
          <div className="flex items-center">
            <Link href="/projects" className="mr-4">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Crear Nuevo Proyecto</h1>
          </div>

          {/* Mensajes de error/éxito */}
          {error && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {successMessage && (
            <Alert variant="default" className="bg-green-50 border-green-200">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-600">{successMessage}</AlertDescription>
            </Alert>
          )}

          {/* Formulario de creación */}
          <Card>
            <CardHeader>
              <CardTitle>Información del Proyecto</CardTitle>
              <CardDescription>
                Complete los detalles para crear un nuevo proyecto. Los campos marcados con * son
                obligatorios.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectForm
                onSubmit={handleCreateProject}
                onCancel={handleCancel}
                isSubmitting={isSubmitting}
              />
            </CardContent>
          </Card>
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
};

export default NewProjectPage;
