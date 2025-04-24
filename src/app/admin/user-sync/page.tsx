"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { IUser, UserRole } from '@/core/interfaces/models';
import { 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  Loader2, 
  User, 
  Mail 
} from "lucide-react";
import { UserService } from '@/services/api/userService';
import BackendToFirebaseSync from '@/services/auth/backendToFirebaseSync';
import { toast } from '@/components/ui/use-toast';
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function UserSyncPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <UserSyncContent />
    </ProtectedRoute>
  );
}

function UserSyncContent() {
  const [users, setUsers] = useState<IUser[]>([]);
  const [userStatus, setUserStatus] = useState<Record<number, 'unknown' | 'exists' | 'missing'>>({});
  const [selectedUsers, setSelectedUsers] = useState<Record<number, boolean>>({});
  const [loading, setLoading] = useState(true);
  const [syncingAll, setSyncingAll] = useState(false);
  const [syncingSingle, setSyncingSingle] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showResetOption, setShowResetOption] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Load all users from backend
      const backendUsers = await UserService.getUsers();
      setUsers(backendUsers);
      
      // Initialize user status and selection
      const initialStatus: Record<number, 'unknown' | 'exists' | 'missing'> = {};
      const initialSelection: Record<number, boolean> = {};
      
      backendUsers.forEach(user => {
        if (user.id) {
          initialStatus[user.id] = 'unknown';
          initialSelection[user.id] = false;
        }
      });
      
      setUserStatus(initialStatus);
      setSelectedUsers(initialSelection);
      
      // Check Firebase status for each user
      for (const user of backendUsers) {
        if (user.id && user.email) {
          await checkUserFirebaseStatus(user.id, user.email);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
      setError('Error al cargar los usuarios. Inténtalo de nuevo más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const checkUserFirebaseStatus = async (userId: number, email: string) => {
    try {
      const exists = await BackendToFirebaseSync.checkUserExistsInFirebase(email);
      
      setUserStatus(prevStatus => ({
        ...prevStatus,
        [userId]: exists ? 'exists' : 'missing'
      }));
      
      // Auto-select users that are missing in Firebase
      if (!exists) {
        setSelectedUsers(prevSelected => ({
          ...prevSelected,
          [userId]: true
        }));
      }
    } catch (error) {
      console.error(`Error checking Firebase status for user ${userId}:`, error);
    }
  };

  const handleSelectAll = (selectMissing: boolean) => {
    const newSelection = { ...selectedUsers };
    
    users.forEach(user => {
      if (user.id) {
        // If selectMissing is true, only select users missing in Firebase
        // Otherwise, select all users
        newSelection[user.id] = selectMissing 
          ? userStatus[user.id] === 'missing'
          : true;
      }
    });
    
    setSelectedUsers(newSelection);
  };

  const handleSyncSelected = async () => {
    const selectedUserIds = Object.entries(selectedUsers)
      .filter(([_, selected]) => selected)
      .map(([id]) => parseInt(id));
    
    if (selectedUserIds.length === 0) {
      toast({
        title: "Ningún usuario seleccionado",
        description: "Por favor selecciona al menos un usuario para sincronizar.",
        variant: "destructive",
      });
      return;
    }
    
    setSyncingAll(true);
    setError(null);
    
    try {
      let successCount = 0;
      let failCount = 0;
      
      for (const userId of selectedUserIds) {
        const user = users.find(u => u.id === userId);
        
        if (!user || !user.email) {
          failCount++;
          continue;
        }
        
        // Check if already exists
        const alreadyExists = userStatus[userId] === 'exists';
        if (alreadyExists) {
          successCount++;
          continue;
        }
        
        // Sync user to Firebase
        const success = await BackendToFirebaseSync.syncBackendUserToFirebase(
          userId, 
          showResetOption
        );
        
        if (success) {
          successCount++;
          
          // Update status
          setUserStatus(prevStatus => ({
            ...prevStatus,
            [userId]: 'exists'
          }));
          
          // Deselect user
          setSelectedUsers(prevSelected => ({
            ...prevSelected,
            [userId]: false
          }));
        } else {
          failCount++;
        }
      }
      
      toast({
        title: "Sincronización completada",
        description: `${successCount} usuarios sincronizados correctamente. ${failCount} fallidos.`,
        variant: failCount > 0 ? "destructive" : "default",
      });
    } catch (error) {
      console.error('Error synchronizing users:', error);
      setError('Error al sincronizar usuarios. Inténtalo de nuevo más tarde.');
    } finally {
      setSyncingAll(false);
    }
  };

  const handleSyncSingle = async (userId: number) => {
    const user = users.find(u => u.id === userId);
    
    if (!user || !user.email) {
      toast({
        title: "Error de sincronización",
        description: "Usuario no válido o sin correo electrónico.",
        variant: "destructive",
      });
      return;
    }
    
    setSyncingSingle(userId);
    
    try {
      const success = await BackendToFirebaseSync.syncBackendUserToFirebase(
        userId, 
        showResetOption
      );
      
      if (success) {
        toast({
          title: "Usuario sincronizado",
          description: `${user.email} ha sido sincronizado con Firebase.`,
        });
        
        // Update status
        setUserStatus(prevStatus => ({
          ...prevStatus,
          [userId]: 'exists'
        }));
        
        // Deselect user
        setSelectedUsers(prevSelected => ({
          ...prevSelected,
          [userId]: false
        }));
      } else {
        toast({
          title: "Error de sincronización",
          description: `No se pudo sincronizar ${user.email} con Firebase.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error(`Error synchronizing user ${userId}:`, error);
      toast({
        title: "Error de sincronización",
        description: "Ocurrió un error inesperado.",
        variant: "destructive",
      });
    } finally {
      setSyncingSingle(null);
    }
  };

  // Count users by status
  const counts = {
    total: users.length,
    exists: Object.values(userStatus).filter(status => status === 'exists').length,
    missing: Object.values(userStatus).filter(status => status === 'missing').length,
    unknown: Object.values(userStatus).filter(status => status === 'unknown').length,
    selected: Object.values(selectedUsers).filter(selected => selected).length
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Sincronización de Usuarios con Firebase</h1>
          <Button 
            variant="outline" 
            onClick={loadUsers}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualizar
          </Button>
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{counts.total}</p>
              <p className="text-sm text-gray-500">usuarios en el sistema</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-green-600">En Firebase</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{counts.exists}</p>
              <p className="text-sm text-gray-500">usuarios sincronizados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-red-600">Pendientes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{counts.missing}</p>
              <p className="text-sm text-gray-500">usuarios no sincronizados</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-blue-600">Seleccionados</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-blue-600">{counts.selected}</p>
              <p className="text-sm text-gray-500">para sincronizar</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Usuarios</CardTitle>
            <CardDescription>
              Usuarios disponibles en el sistema y su estado en Firebase Authentication.
            </CardDescription>
            <div className="flex flex-wrap gap-2 mt-4">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSelectAll(false)}
              >
                Seleccionar todos
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleSelectAll(true)}
              >
                Seleccionar faltantes
              </Button>
              <Button 
                variant="outline"
                size="sm"
                onClick={() => setSelectedUsers({})}
              >
                Deseleccionar todos
              </Button>
              <div className="flex items-center ml-auto space-x-2">
                <Checkbox 
                  id="resetPassword"
                  checked={showResetOption}
                  onCheckedChange={(checked) => setShowResetOption(!!checked)}
                />
                <label 
                  htmlFor="resetPassword" 
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Enviar email para resetear contraseña
                </label>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center items-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              </div>
            ) : users.length === 0 ? (
              <div className="flex justify-center items-center py-8 text-gray-500">
                No hay usuarios disponibles
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-end mb-2">
                  <Button 
                    onClick={handleSyncSelected}
                    disabled={syncingAll || counts.selected === 0}
                  >
                    {syncingAll ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sincronizando...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Sincronizar seleccionados
                      </>
                    )}
                  </Button>
                </div>
                
                <div className="border rounded-md">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b bg-gray-50">
                        <th className="px-4 py-2 text-left w-10">
                          <Checkbox 
                            checked={counts.selected > 0 && counts.selected === counts.total}
                            onCheckedChange={(checked) => handleSelectAll(false)}
                          />
                        </th>
                        <th className="px-4 py-2 text-left">Usuario</th>
                        <th className="px-4 py-2 text-left">Email</th>
                        <th className="px-4 py-2 text-left">Estado</th>
                        <th className="px-4 py-2 text-left w-32">Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50">
                          <td className="px-4 py-2">
                            {user.id && (
                              <Checkbox 
                                checked={!!selectedUsers[user.id]}
                                onCheckedChange={(checked) => {
                                  setSelectedUsers(prev => ({
                                    ...prev,
                                    [user.id!]: !!checked
                                  }));
                                }}
                              />
                            )}
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <User className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{user.full_name}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            <div className="flex items-center">
                              <Mail className="h-4 w-4 mr-2 text-gray-500" />
                              <span>{user.email}</span>
                            </div>
                          </td>
                          <td className="px-4 py-2">
                            {user.id && userStatus[user.id] === 'exists' && (
                              <Badge className="bg-green-100 text-green-800">
                                <CheckCircle className="h-3 w-3 mr-1" /> En Firebase
                              </Badge>
                            )}
                            {user.id && userStatus[user.id] === 'missing' && (
                              <Badge variant="destructive">
                                <AlertCircle className="h-3 w-3 mr-1" /> No sincronizado
                              </Badge>
                            )}
                            {user.id && userStatus[user.id] === 'unknown' && (
                              <Badge variant="outline">
                                Verificando...
                              </Badge>
                            )}
                          </td>
                          <td className="px-4 py-2">
                            {user.id && userStatus[user.id] === 'missing' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleSyncSingle(user.id!)}
                                disabled={syncingSingle === user.id || syncingAll}
                              >
                                {syncingSingle === user.id ? (
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                ) : (
                                  <RefreshCw className="h-3 w-3" />
                                )}
                              </Button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}