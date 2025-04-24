"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { IUser, UserRole, WorkMode } from '@/core/interfaces/models';
import Link from 'next/link';
import { PlusCircle, Search, User, Briefcase, Mail, MapPin, Shield } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserService } from '@/services/api/userService';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import UserSyncService from '@/services/auth/userSyncService';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminUsersPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <UserManagementContent />
    </ProtectedRoute>
  );
}

function UserManagementContent() {
  const router = useRouter();
  const [users, setUsers] = useState<IUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<IUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [workModeFilter, setWorkModeFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  
  // New user form state
  const [isAddingUser, setIsAddingUser] = useState(false);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    fullName: '',
    role: UserRole.DEVELOPER,
    workMode: WorkMode.REMOTE
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Delete user state
  const [userToDelete, setUserToDelete] = useState<IUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load all users
  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const usersData = await UserService.getUsers();
        setUsers(usersData);
        setFilteredUsers(usersData);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  // Filter users when filter criteria change
  useEffect(() => {
    let filtered = [...users];
    
    // Apply role filter
    if (roleFilter !== "all") {
      filtered = filtered.filter(
        user => user.role === roleFilter
      );
    }
    
    // Apply work mode filter
    if (workModeFilter !== "all") {
      filtered = filtered.filter(
        user => user.work_mode === workModeFilter
      );
    }
    
    // Apply search filter
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

  // Handle creating a new user (both in Firebase and backend)
  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setIsSubmitting(true);
    
    try {
      // Validate form
      if (!newUser.email || !newUser.password || !newUser.fullName) {
        setFormError('Por favor completa todos los campos requeridos');
        return;
      }
      
      // Create user in Firebase
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        newUser.email, 
        newUser.password
      );
      
      // Set display name
      await updateProfile(userCredential.user, {
        displayName: newUser.fullName
      });
      
      // Create user in backend
      const backendUser = await UserSyncService.syncUserWithBackend(userCredential.user);
      
      // If backend user was created, update its role and work mode
      if (backendUser && backendUser.id) {
        await UserService.updateUser(backendUser.id, {
          role: newUser.role,
          work_mode: newUser.workMode
        });
        
        // Refresh user list
        const updatedUsers = await UserService.getUsers();
        setUsers(updatedUsers);
      }
      
      // Reset form and close dialog
      setNewUser({
        username: '',
        email: '',
        password: '',
        fullName: '',
        role: UserRole.DEVELOPER,
        workMode: WorkMode.REMOTE
      });
      
      setIsAddingUser(false);
    } catch (error: any) {
      console.error('Error creating user:', error);
      setFormError(error.message || 'Error al crear usuario');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle deleting a user
  const handleDeleteUser = async () => {
    if (!userToDelete || !userToDelete.id) return;
    
    setIsDeleting(true);
    try {
      // Find user in Firebase
      const email = userToDelete.email;
      
      // Delete from backend
      await UserService.deleteUser(userToDelete.id);
      
      // Get updated list
      const updatedUsers = await UserService.getUsers();
      setUsers(updatedUsers);
      
      // Note: Actual Firebase user deletion should be handled by an admin,
      // as direct deletion from client side is limited for security reasons
      
      setUserToDelete(null);
    } catch (error) {
      console.error('Error deleting user:', error);
    } finally {
      setIsDeleting(false);
    }
  };

  // Get role badge
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return <Badge variant="default" className="bg-purple-500">Admin</Badge>;
      case UserRole.MANAGER:
        return <Badge variant="default" className="bg-blue-500">Manager</Badge>;
      case UserRole.DEVELOPER:
        return <Badge variant="default" className="bg-green-500">Developer</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Get work mode badge
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

  // Get initials
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Get color from name
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
    
    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Administración de Usuarios</h1>
          <Dialog open={isAddingUser} onOpenChange={setIsAddingUser}>
            <DialogTrigger asChild>
              <Button>
                <PlusCircle className="h-4 w-4 mr-2" /> Nuevo Usuario
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Añadir nuevo usuario</DialogTitle>
                <DialogDescription>
                  Crea un nuevo usuario con acceso a la plataforma.
                </DialogDescription>
              </DialogHeader>
              
              <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
                {formError && (
                  <Alert variant="destructive">
                    <AlertDescription>{formError}</AlertDescription>
                  </Alert>
                )}
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    placeholder="ejemplo@dominio.com"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={newUser.fullName}
                    onChange={(e) => setNewUser({...newUser, fullName: e.target.value})}
                    placeholder="Nombre Apellido"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña</Label>
                  <Input
                    id="password"
                    type="password"
                    value={newUser.password}
                    onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                    placeholder="••••••••"
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="role">Rol</Label>
                    <Select 
                      value={newUser.role} 
                      onValueChange={(val) => setNewUser({...newUser, role: val as UserRole})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar rol" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={UserRole.DEVELOPER}>Desarrollador</SelectItem>
                        <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                        <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="workMode">Modo de trabajo</Label>
                    <Select 
                      value={newUser.workMode} 
                      onValueChange={(val) => setNewUser({...newUser, workMode: val as WorkMode})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar modo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={WorkMode.REMOTE}>Remoto</SelectItem>
                        <SelectItem value={WorkMode.OFFICE}>Oficina</SelectItem>
                        <SelectItem value={WorkMode.HYBRID}>Híbrido</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsAddingUser(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creando...
                      </>
                    ) : (
                      'Crear Usuario'
                    )}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Filtros */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Buscar usuarios..."
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
              <span className="mt-2 text-gray-500">Cargando usuarios...</span>
            </div>
          </div>
        ) : filteredUsers.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredUsers.map((user) => (
              <Card 
                key={user.id} 
                className="hover:shadow-md transition-shadow"
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
                          <Shield className="h-4 w-4 mr-2" />
                          <span>{user.role}</span>
                        </div>
                      </div>
                      
                      <div className="flex mt-4 space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => router.push(`/users/${user.id}`)}
                        >
                          Ver perfil
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button 
                              variant="destructive" 
                              size="sm"
                              onClick={() => setUserToDelete(user)}
                            >
                              Eliminar
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>¿Eliminar usuario?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción no se puede deshacer. Eliminará permanentemente la cuenta de 
                                usuario {user.full_name} ({user.email}).
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                              >
                                {isDeleting ? (
                                  <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Eliminando...
                                  </>
                                ) : (
                                  'Eliminar'
                                )}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
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
                ? "No hay usuarios que coincidan con los filtros"
                : "No hay usuarios disponibles"}
            </p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}