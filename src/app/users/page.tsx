// src/app/users/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { IUser, IProject, UserRole, WorkMode } from '@/core/interfaces/models';
import Link from 'next/link';
import { PlusCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import UserCard from '@/components/users/UserCard';

// Importamos los servicios reales de API
import { UserService, ProjectService, ProjectMemberService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

// Tipo extendido para usuarios con metadatos
type UserWithMetadata = IUser & {
  projectCount: number;
  projects: IProject[];
};

export default function TeamPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserWithMetadata[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserWithMetadata[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [workModeFilter, setWorkModeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // El usuario actual para esta demo
  const currentUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        // Obtener todos los usuarios
        const usersData = await UserService.getUsers();

        // Para cada usuario, obtenemos la información de sus proyectos
        const usersWithMetadata = await Promise.all(
          usersData.map(async (user) => {
            let projects: IProject[] = [];
            let projectCount = 0;

            if (user.id) {
              try {
                // Obtener membresías de proyectos del usuario
                const memberships = await ProjectMemberService.getProjectMembersByUser(user.id);

                if (memberships && memberships.length > 0) {
                  // Para cada membresía, obtener el proyecto completo
                  const projectsData = await Promise.all(
                    memberships.map(async (membership) => {
                      return await ProjectService.getProjectById(membership.project_id);
                    })
                  );

                  // Filtrar los proyectos null (por si alguno falló)
                  projects = projectsData.filter((p) => p !== null) as IProject[];
                  projectCount = projects.length;
                }
              } catch (error) {
                console.error(`Error fetching projects for user ${user.id}:`, error);
              }
            }

            return {
              ...user,
              projectCount,
              projects,
            };
          })
        );

        setUsers(usersWithMetadata);
        setFilteredUsers(usersWithMetadata);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Efecto para filtrar usuarios cuando cambia el filtro o la búsqueda
  useEffect(() => {
    let filtered = [...users];

    // Aplicar filtro de rol
    if (roleFilter !== 'all') {
      filtered = filtered.filter((user) => user.role === roleFilter);
    }

    // Aplicar filtro de modo de trabajo
    if (workModeFilter !== 'all') {
      filtered = filtered.filter((user) => user.work_mode === workModeFilter);
    }

    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (user) =>
          user.username.toLowerCase().includes(query) ||
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }

    setFilteredUsers(filtered);
  }, [roleFilter, workModeFilter, searchQuery, users]);

  // Handler para navegar a detalles del usuario
  const handleViewUserDetails = (userId: number | undefined) => {
    if (userId) {
      router.push(`/users/${userId}`);
    }
  };

  return (
    <ProtectedRoute
      requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.TESTER, UserRole.ADMIN]}
    >
      <MainLayout username={currentUser.username} userRole={currentUser.userRole}>
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold">Equipo</h1>
            {currentUser.userRole === UserRole.ADMIN ||
            currentUser.userRole === UserRole.MANAGER ? (
              <div className="flex space-x-2">
                <Link href="/users/new" passHref>
                  <Button>
                    <PlusCircle className="h-4 w-4 mr-2" /> Añadir miembro
                  </Button>
                </Link>
              </div>
            ) : null}
          </div>

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                placeholder="Buscar miembros..."
                className="pl-8"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value={UserRole.ADMIN}>Admin</SelectItem>
                <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                <SelectItem value={UserRole.DEVELOPER}>Developer</SelectItem>
                <SelectItem value={UserRole.TESTER}>Tester</SelectItem>
              </SelectContent>
            </Select>
            <Select value={workModeFilter} onValueChange={setWorkModeFilter}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Filtrar por modo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los modos</SelectItem>
                <SelectItem value={WorkMode.OFFICE}>Oficina</SelectItem>
                <SelectItem value={WorkMode.REMOTE}>Remoto</SelectItem>
                <SelectItem value={WorkMode.HYBRID}>Híbrido</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Lista de usuarios */}
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="flex flex-col items-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
                <span className="mt-2 text-gray-500">Cargando miembros del equipo...</span>
              </div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  projectCount={user.projectCount}
                  onClick={() => handleViewUserDetails(user.id)}
                />
              ))}
            </div>
          ) : (
            <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
              <p className="text-gray-500">
                {searchQuery || roleFilter !== 'all' || workModeFilter !== 'all'
                  ? 'No hay miembros que coincidan con los filtros'
                  : 'No hay miembros disponibles'}
              </p>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}