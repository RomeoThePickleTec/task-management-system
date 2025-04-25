// src/app/users/[id]/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IUser, IProject, IProjectMember, UserRole, WorkMode } from '@/core/interfaces/models';
import Link from 'next/link';
import { 
  ChevronLeft, 
  User, 
  Mail, 
  Briefcase, 
  MapPin, 
  Calendar, 
  Edit, 
  Trash,
  CheckCircle2,
  PlusCircle 
} from "lucide-react";

// Importamos los servicios reales de API
import { UserService, ProjectService, ProjectMemberService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = Number(params.id);
  
  const [user, setUser] = useState<IUser | null>(null);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [memberships, setMemberships] = useState<IProjectMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // El usuario actual para esta demo
  const currentUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
  };

  useEffect(() => {
    const fetchUserDetails = async () => {
      setIsLoading(true);
      try {
        // Obtener el usuario
        const userData = await UserService.getUserById(userId);
        
        if (userData) {
          setUser(userData);
          
          // Obtener membresías de proyectos del usuario
          if (userData.id) {
            const userMemberships = await ProjectMemberService.getProjectMembersByUser(userData.id);
            setMemberships(userMemberships);
            
            // Para cada membresía, obtener el proyecto completo
            if (userMemberships && userMemberships.length > 0) {
              const projectsData = await Promise.all(
                userMemberships.map(async (membership) => {
                  return await ProjectService.getProjectById(membership.project_id);
                })
              );
              
              // Filtrar los proyectos null (por si alguno falló)
              const validProjects = projectsData.filter(p => p !== null) as IProject[];
              setProjects(validProjects);
            }
          }
        } else {
          console.error(`User with ID ${userId} not found`);
          router.push('/users');
        }
      } catch (error) {
        console.error(`Error fetching user ${userId}:`, error);
      } finally {
        setIsLoading(false);
      }
    };

    if (userId) {
      fetchUserDetails();
    }
  }, [userId, router]);

  // Función para obtener el badge de rol
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="default" className="bg-purple-500">Admin</Badge>;
      case UserRole.MANAGER:
        return <Badge variant="default" className="bg-blue-500">Manager</Badge>;
      case UserRole.DEVELOPER:
        return <Badge variant="default" className="bg-green-500">Developer</Badge>;
      case UserRole.TESTER:
        return <Badge variant="default" className="bg-yellow-500">Tester</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Función para obtener el badge de modo de trabajo
  const getWorkModeBadge = (workMode: string) => {
    switch (workMode) {
      case WorkMode.OFFICE:
        return <Badge variant="outline" className="bg-gray-100">Oficina</Badge>;
      case WorkMode.REMOTE:
        return <Badge variant="outline" className="bg-blue-100 text-blue-800">Remoto</Badge>;
      case WorkMode.HYBRID:
        return <Badge variant="outline" className="bg-green-100 text-green-800">Híbrido</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Función para obtener un color basado en el nombre (para avatares)
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500'
    ];
    
    // Usar el código ASCII de las letras del nombre para determinar un índice
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  // Función para obtener el rol del proyecto
  const getProjectRole = (projectId: number) => {
    const membership = memberships.find(m => m.project_id === projectId);
    return membership?.role || 'Miembro';
  };

  if (isLoading) {
    return (
      <MainLayout username={currentUser.username} userRole={currentUser.userRole}>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }

  if (!user) {
    return (
      <MainLayout username={currentUser.username} userRole={currentUser.userRole}>
        <div className="text-center p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Usuario no encontrado</h2>
          <p className="text-gray-600 mb-6">El usuario que estás buscando no existe o ha sido eliminado.</p>
          <Link href="/users" passHref>
            <Button>
              <ChevronLeft className="h-4 w-4 mr-2" />
              Volver al equipo
            </Button>
          </Link>
        </div>
      </MainLayout>
    );
  }

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER ]}>
    <MainLayout username={currentUser.username} userRole={currentUser.userRole}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/users" passHref>
              <Button variant="outline" size="sm">
                <ChevronLeft className="h-4 w-4 mr-1" /> Volver
              </Button>
            </Link>
            <h1 className="text-2xl font-bold">Perfil de {user.full_name}</h1>
          </div>
          {(currentUser.userRole === UserRole.ADMIN || currentUser.userRole === UserRole.MANAGER || currentUser.userRole === UserRole.DEVELOPER || currentUser.userRole === UserRole.TESTER) && (
            <div className="flex items-center space-x-2">
              <Link href={`/users/${user.id}/edit`} passHref>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
              </Link>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" /> Eliminar
              </Button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Información principal */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información del Usuario</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <div className={`h-16 w-16 rounded-full flex items-center justify-center text-white font-bold text-xl ${getColorFromName(user.full_name)}`}>
                    {getInitials(user.full_name)}
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold">{user.full_name}</h2>
                    <div className="flex items-center space-x-2 mt-1">
                      {getRoleBadge(user.role)}
                      {getWorkModeBadge(user.work_mode)}
                    </div>
                  </div>
                </div>

                <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <User className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nombre de usuario</h3>
                      <p className="text-gray-800">{user.username}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Mail className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Correo electrónico</h3>
                      <p className="text-gray-800">{user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Briefcase className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                      <p className="text-gray-800">{user.role}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <MapPin className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Modo de trabajo</h3>
                      <p className="text-gray-800">
                        {user.work_mode === WorkMode.OFFICE ? 'Trabaja en oficina' : 
                         user.work_mode === WorkMode.REMOTE ? 'Trabaja remoto' : 
                         'Modo híbrido'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Fecha de registro</h3>
                      <p className="text-gray-800">{formatDate(user.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Calendar className="h-5 w-5 text-gray-500 mr-2 mt-0.5" />
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Última actualización</h3>
                      <p className="text-gray-800">{formatDate(user.updated_at)}</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Proyectos del usuario */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">Proyectos</h2>
                {(currentUser.userRole === UserRole.ADMIN || currentUser.userRole === UserRole.MANAGER || currentUser.userRole === UserRole.DEVELOPER || currentUser.userRole === UserRole.TESTER) && (
                  <Button variant="outline" size="sm">
                    <PlusCircle className="h-4 w-4 mr-1" /> Asignar a proyecto
                  </Button>
                )}
              </div>
              
              {projects.length > 0 ? (
                <div className="grid grid-cols-1 gap-4">
                  {projects.map((project) => (
                    <Card key={project.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <Link 
                              href={`/projects/${project.id}`} 
                              className="text-lg font-medium text-blue-600 hover:underline"
                            >
                              {project.name}
                            </Link>
                            <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                            <div className="flex items-center mt-2 space-x-2">
                              <Badge variant="outline">
                                {getProjectRole(project.id!)}
                              </Badge>
                              {project.status === ProjectStatus.ACTIVE && (
                                <Badge variant="default" className="bg-green-500">Activo</Badge>
                              )}
                              {project.status === ProjectStatus.COMPLETED && (
                                <Badge variant="default" className="bg-blue-500">Completado</Badge>
                              )}
                              {project.status === ProjectStatus.PLANNING && (
                                <Badge variant="outline" className="bg-purple-100 text-purple-800">Planificación</Badge>
                              )}
                              {project.status === ProjectStatus.ON_HOLD && (
                                <Badge variant="default" className="bg-yellow-500">En pausa</Badge>
                              )}
                            </div>
                          </div>
                          <div className="text-sm text-gray-500">
                            <div>Inicio: {formatDate(project.start_date)}</div>
                            <div>Fin: {formatDate(project.end_date)}</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
                  <p className="text-gray-500">Este usuario no está asignado a ningún proyecto</p>
                </div>
              )}
            </div>
          </div>

          {/* Información lateral */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Estadísticas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Proyectos activos</h3>
                  <p className="text-2xl font-bold">
                    {projects.filter(p => p.status === ProjectStatus.ACTIVE).length}
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Total de proyectos</h3>
                  <p className="text-2xl font-bold">{projects.length}</p>
                </div>

                {user.last_login && (
                  <div>
                    <h3 className="text-sm font-medium text-gray-500 mb-1">Último acceso</h3>
                    <p className="text-gray-800">{formatDate(user.last_login)}</p>
                  </div>
                )}

                <div className="pt-4">
                  <h3 className="text-sm font-medium text-gray-500 mb-2">Acciones rápidas</h3>
                  <div className="space-y-2">
                    <Link href={`/users/${user.id}/tasks`} passHref>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Ver tareas asignadas
                      </Button>
                    </Link>
                    
                    <Link href={`/messages/new?recipient=${user.id}`} passHref>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        <Mail className="h-4 w-4 mr-2" /> Enviar mensaje
                      </Button>
                    </Link>
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
