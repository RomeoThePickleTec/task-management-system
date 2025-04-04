// src/app/users/page.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IUser, IProject, UserRole, WorkMode } from '@/core/interfaces/models';
import Link from 'next/link';
import { PlusCircle, Search, User, Briefcase, Mail, MapPin } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Importamos los servicios reales de API
import { UserService, ProjectService, ProjectMemberService } from '@/services/api';

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
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [workModeFilter, setWorkModeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // El usuario actual para esta demo
  const currentUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER
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
                  projects = projectsData.filter(p => p !== null) as IProject[];
                  projectCount = projects.length;
                }
              } catch (error) {
                console.error(`Error fetching projects for user ${user.id}:`, error);
              }
            }
            
            return {
              ...user,
              projectCount,
              projects
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
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        user => user.role === roleFilter
      );
    }
    
    // Aplicar filtro de modo de trabajo
    if (workModeFilter !== "all") {
      filtered = filtered.filter(
        user => user.work_mode === workModeFilter
      );
    }
    
    // Aplicar filtro de búsqueda
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        user => 
          user.username.toLowerCase().includes(query) ||
          user.full_name.toLowerCase().includes(query) ||
          user.email.toLowerCase().includes(query)
      );
    }
    
    setFilteredUsers(filtered);
  }, [roleFilter, workModeFilter, searchQuery, users]);

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

  return (
    <MainLayout username={currentUser.username} userRole={currentUser.userRole}>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Equipo</h1>
          {currentUser.userRole === UserRole.ADMIN || currentUser.userRole === UserRole.MANAGER ? (
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
              <Card 
                key={user.id} 
                className="hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => router.push(`/users/${user.id}`)}
              >
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${getColorFromName(user.full_name)}`}>
                      {getInitials(user.full_name)}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-medium text-lg">{user.full_name}</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        {getRoleBadge(user.role)}
                        {getWorkModeBadge(user.work_mode)}
                      </div>
                      
                      <div className="mt-4 space-y-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-2" />
                          <span>{user.username}</span>
                        </div>
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-2" />
                          <span>{user.email}</span>
                        </div>
                        <div className="flex items-center">
                          <Briefcase className="h-4 w-4 mr-2" />
                          <span>{user.projectCount} proyectos</span>
                        </div>
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-2" />
                          <span>
                            {user.work_mode === WorkMode.OFFICE ? 'Trabaja en oficina' : 
                             user.work_mode === WorkMode.REMOTE ? 'Trabaja remoto' : 
                             'Modo híbrido'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center h-40 border border-dashed border-gray-300 rounded-lg">
            <p className="text-gray-500">
              {searchQuery || roleFilter !== "all" || workModeFilter !== "all"
                ? "No hay miembros que coincidan con los filtros"
                : "No hay miembros disponibles"}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}