"use client";

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronLeft, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";
import { IUser, UserRole, WorkMode } from '@/core/interfaces/models';
import { UserService } from '@/services/api/userService';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAuth, getUser, updateProfile } from 'firebase/auth';
import UserSyncService from '@/services/auth/userSyncService';

export default function UserEditPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <UserEditContent />
    </ProtectedRoute>
  );
}

function UserEditContent() {
  const params = useParams();
  const userId = Number(params.id);
  const router = useRouter();
  const { userRole } = useAuth();
  
  // Form state
  const [userData, setUserData] = useState<IUser | null>(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [role, setRole] = useState<UserRole>(UserRole.DEVELOPER);
  const [workMode, setWorkMode] = useState<WorkMode>(WorkMode.REMOTE);
  
  // UI state
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Load user data
  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      try {
        const user = await UserService.getUserById(userId);
        if (user) {
          setUserData(user);
          setFullName(user.full_name || '');
          setEmail(user.email || '');
          setUsername(user.username || '');
          setRole(user.role as UserRole || UserRole.DEVELOPER);
          setWorkMode(user.work_mode as WorkMode || WorkMode.REMOTE);
        } else {
          setError('Usuario no encontrado');
          router.push('/users');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        setError('Error al cargar los datos del usuario');
      } finally {
        setIsLoading(false);
      }
    };
    
    if (userId) {
      fetchUserData();
    }
  }, [userId, router]);
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      if (!userData || !userData.id) {
        throw new Error('No se encontró el usuario para actualizar');
      }
      
      // Update user in backend
      const updatedUser = await UserService.updateUser(userData.id, {
        full_name: fullName,
        email,
        username,
        role,
        work_mode: workMode,
        updated_at: new Date().toISOString()
      });
      
      if (updatedUser) {
        // Try to find and update Firebase user
        try {
          const auth = getAuth();
          const users = await auth.fetchSignInMethodsForEmail(email);
          
          // If the user exists in Firebase
          if (users && users.length > 0) {
            // We can't directly update other users from the client side in Firebase
            // This would typically be handled by a Firebase Admin SDK in a backend function
            console.log('User exists in Firebase - would update via server-side function');
          }
        } catch (firebaseError) {
          console.error('Firebase operation failed:', firebaseError);
          // Continue anyway as we've updated the backend
        }
        
        setSuccess('Usuario actualizado correctamente');
        setTimeout(() => {
          router.push(`/users/${userData.id}`);
        }, 1500);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      setError('Error al actualizar el usuario');
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </MainLayout>
    );
  }
  
  return (
    <MainLayout>
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center mb-6">
          <Link href={`/users/${userId}`} passHref>
            <Button variant="outline" size="sm" className="mr-4">
              <ChevronLeft className="h-4 w-4 mr-1" /> Volver
            </Button>
          </Link>
          <h1 className="text-2xl font-bold">Editar Usuario</h1>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Información del usuario</CardTitle>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            {success && (
              <Alert className="mb-4 bg-green-50 border-green-200">
                <AlertDescription className="text-green-800">{success}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Nombre completo</Label>
                  <Input
                    id="fullName"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nombre de usuario</Label>
                  <Input
                    id="username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="role">Rol</Label>
                  <Select value={role} onValueChange={(value) => setRole(value as UserRole)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={UserRole.ADMIN}>Administrador</SelectItem>
                      <SelectItem value={UserRole.MANAGER}>Manager</SelectItem>
                      <SelectItem value={UserRole.DEVELOPER}>Desarrollador</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="workMode">Modo de trabajo</Label>
                <Select value={workMode} onValueChange={(value) => setWorkMode(value as WorkMode)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar modo de trabajo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value={WorkMode.REMOTE}>Remoto</SelectItem>
                    <SelectItem value={WorkMode.OFFICE}>Oficina</SelectItem>
                    <SelectItem value={WorkMode.HYBRID}>Híbrido</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex justify-end space-x-2 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/users/${userId}`)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSaving}>
                  {isSaving ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar cambios'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}