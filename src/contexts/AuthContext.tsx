"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode
} from 'react';
import { User } from 'firebase/auth';
import FirebaseAuthService from '@/services/auth/firebaseAuth';
import { apiClient } from '@/services/api/apiClient';
import { UserRole, IUser } from '@/core/interfaces/models';
import { toast } from '@/components/ui/use-toast';
import { UserService } from '@/services/api/userService';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  backendUser: IUser | null;
  loading: boolean;
  error: string | null;
  isBackendAvailable: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string, workMode?: string, role?: UserRole }) => Promise<boolean>;
  retryBackendConnection: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [backendUser, setBackendUser] = useState<IUser | null>(null);
  const [userRole, setUserRole] = useState<UserRole>(UserRole.DEVELOPER); // Default role
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isBackendAvailable, setIsBackendAvailable] = useState<boolean>(true);

  // Update API client headers with auth token
  const updateApiAuthToken = async (user: User | null) => {
    if (user) {
      try {
        const token = await FirebaseAuthService.getAuthToken();
        // Update default headers for API requests
        if (token) {
          apiClient.setAuthToken(token);
        }
      } catch (error) {
        console.error("Failed to get auth token:", error);
      }
    } else {
      // Clear auth token when user is signed out
      apiClient.clearAuthToken();
    }
  };

  // Check if backend is available
  const checkBackendConnection = async (): Promise<boolean> => {
    try {
      // Try to make a simple request to the backend
      // If this succeeds, we know the backend is available
      const isAvailable = await apiClient.healthCheck();
      setIsBackendAvailable(isAvailable);
      return isAvailable;
    } catch (error) {
      console.error("Backend connection failed:", error);
      setIsBackendAvailable(false);
      return false;
    }
  };

  // Retry backend connection
  const retryBackendConnection = async (): Promise<boolean> => {
    setLoading(true);
    const isAvailable = await checkBackendConnection();
    
    if (isAvailable && currentUser) {
      // If backend is available and user is logged in, try to sync
      await syncUserWithBackend(currentUser);
    }
    
    setLoading(false);
    return isAvailable;
  };

// Sync user with backend and fetch user details
// Sync user with backend and fetch user details
const syncUserWithBackend = async (user: User) => {
  try {
    // First check if the user exists in the backend
    let backendUser = null;
    if (user.email) {
      try {
        backendUser = await UserService.getUserByEmail(user.email);
      } catch (error) {
        console.error(`Error finding user by email ${user.email}:`, error);
        // Continue to create a new user
      }
    }
    
    // If user exists in Firebase but not in backend, create it in backend
    if (!backendUser && user.email) {
      // Create a new user in the backend based on Firebase data
      const newUser = {
        username: user.email.split('@')[0] || user.uid.substring(0, 8),
        email: user.email,
        full_name: user.displayName || user.email.split('@')[0],
        role: UserRole.DEVELOPER, // Default role
        work_mode: 'REMOTE', // Default work mode
        active: true,
        last_login: new Date().toISOString()
      };
      
      try {
        backendUser = await UserService.createUser(newUser);
        console.log('Created user in backend from Firebase auth:', backendUser);
        
        // Show success toast only if we actually got a user back with an ID
        if (backendUser && backendUser.id) {
          toast({
            title: "Usuario sincronizado",
            description: "Se ha creado tu perfil en el sistema. ¡Bienvenido!",
            variant: "default",
          });
        }
      } catch (error) {
        console.error("Failed to create user in backend:", error);
        
        // Even if there was an error, we might have a local user from UserService
        if (backendUser) {
          toast({
            title: "Sincronización parcial",
            description: "Se ha creado tu perfil localmente pero ocurrió un error al sincronizar con el servidor.",
            variant: "default",
          });
        }
      }
    }
    
    // If we found or created a backend user, use it
    if (backendUser) {
      setBackendUser(backendUser);
      setUserRole(backendUser.role as UserRole || UserRole.DEVELOPER);
      setIsBackendAvailable(backendUser.id !== null); // If we have an ID, assume backend is available
    } else {
      // Use fallback data from Firebase
      const fallbackUser = {
        id: null,
        username: user.email?.split('@')[0] || '',
        email: user.email || '',
        full_name: user.displayName || '',
        role: UserRole.DEVELOPER,
        work_mode: 'REMOTE',
        active: true
      };
      
      setBackendUser(fallbackUser);
      setUserRole(UserRole.DEVELOPER);
      
      toast({
        title: "Modo limitado",
        description: "No se pudo crear tu perfil en el sistema. Algunas funciones estarán limitadas.",
        variant: "destructive",
      });
    }
  } catch (error) {
    console.error("Failed to sync user with backend:", error);
    // If we get here, there was an error communicating with the backend
    setIsBackendAvailable(false);
    
    // Use fallback data from Firebase
    const fallbackUser = {
      id: null,
      username: user.email?.split('@')[0] || '',
      email: user.email || '',
      full_name: user.displayName || '',
      role: UserRole.DEVELOPER,
      work_mode: 'REMOTE',
      active: true
    };
    
    setBackendUser(fallbackUser);
    setUserRole(UserRole.DEVELOPER);
    
    // Show warning toast
    toast({
      title: "Error de conexión",
      description: "No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.",
      variant: "destructive",
      duration: 5000,
    });
  }
};

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await updateApiAuthToken(user);
        
        // Check backend connection before attempting to sync
        const isConnected = await checkBackendConnection();
        
        if (isConnected) {
          await syncUserWithBackend(user);
        } else {
          // Use fallback data from Firebase if backend is unavailable
          const fallbackUser = {
            id: null,
            username: user.email?.split('@')[0] || '',
            email: user.email || '',
            full_name: user.displayName || '',
            role: UserRole.DEVELOPER,
            work_mode: 'REMOTE',
            active: true
          };
          
          setBackendUser(fallbackUser);
          setUserRole(UserRole.DEVELOPER);
          
          // Show warning toast
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.",
            variant: "destructive",
            duration: 5000,
          });
        }
      } else {
        setBackendUser(null);
        setUserRole(UserRole.DEVELOPER);
      }
      
      setLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setError(null);
      setLoading(true);
      await FirebaseAuthService.login(email, password);
      
      // Auth state change will handle the rest
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      setLoading(false);
      throw err;
    }
  };

  const register = async (email: string, password: string, fullName: string) => {
    try {
      setError(null);
      setLoading(true);
      
      // Register user in Firebase
      const userCredential = await FirebaseAuthService.register(email, password);
      
      // If successful, update the display name
      if (userCredential.user) {
        await userCredential.user.updateProfile({
          displayName: fullName
        });
        
        // Force refresh the user to get the updated profile
        setCurrentUser({ ...userCredential.user });
        
        // Check if backend is available before attempting to sync
        const isConnected = await checkBackendConnection();
        
        if (isConnected) {
          // Try to create user in backend
          await syncUserWithBackend(userCredential.user);
        } else {
          // Use fallback data
          const fallbackUser = {
            id: null,
            username: email.split('@')[0] || '',
            email: email,
            full_name: fullName,
            role: UserRole.DEVELOPER,
            work_mode: 'REMOTE',
            active: true
          };
          
          setBackendUser(fallbackUser);
          setUserRole(UserRole.DEVELOPER);
          
          // Show warning toast
          toast({
            title: "Error de conexión",
            description: "No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.",
            variant: "destructive",
            duration: 5000,
          });
        }
      }
      
      setLoading(false);
    } catch (err: any) {
      setError(err.message || "Failed to register");
      setLoading(false);
      throw err;
    }
  };

  const updateProfile = async (data: { fullName?: string, workMode?: string, role?: UserRole }) => {
    try {
      setError(null);
      
      if (!currentUser) {
        throw new Error("User not authenticated");
      }
      
      // Update Firebase profile if fullName is provided
      if (data.fullName) {
        try {
          await currentUser.updateProfile({
            displayName: data.fullName
          });
        } catch (firebaseError) {
          console.error("Failed to update Firebase profile:", firebaseError);
          // Continue with backend update even if Firebase update fails
          toast({
            title: "Advertencia",
            description: "No se pudo actualizar el perfil en Firebase, pero se intentará actualizar en el backend.",
            variant: "default",
          });
        }
      }
      
      // Update backend user if available
      if (backendUser && isBackendAvailable) {
        try {
          const updatedData: Partial<IUser> = {
            full_name: data.fullName || backendUser.full_name,
            work_mode: data.workMode || backendUser.work_mode,
            role: data.role || backendUser.role,
            updated_at: new Date().toISOString()
          };
          
          // If backendUser has an ID, update the existing user
          if (backendUser.id) {
            const updatedUser = await UserService.updateUser(backendUser.id, updatedData);
            
            if (updatedUser) {
              setBackendUser(updatedUser);
              if (data.role) {
                setUserRole(data.role);
              }
            }
          } else {
            // If no ID, this is probably a local/offline user
            // Create a new user in the backend
            const newUserData = {
              username: backendUser.username || currentUser.email?.split('@')[0] || '',
              email: currentUser.email || '',
              full_name: data.fullName || backendUser.full_name,
              work_mode: data.workMode || backendUser.work_mode,
              role: data.role || backendUser.role,
              active: true
            };
            
            const newUser = await UserService.createUser(newUserData);
            if (newUser) {
              setBackendUser(newUser);
              if (data.role) {
                setUserRole(data.role);
              }
              
              toast({
                title: "Usuario creado",
                description: "Se ha creado tu perfil en el backend con la información actualizada.",
                variant: "default",
              });
            }
          }
        } catch (error) {
          console.error("Failed to update backend user:", error);
          
          // Update local state even if backend update fails
          if (backendUser) {
            const updatedUser = {
              ...backendUser,
              full_name: data.fullName || backendUser.full_name,
              work_mode: data.workMode || backendUser.work_mode,
              role: data.role || backendUser.role
            };
            
            setBackendUser(updatedUser);
            if (data.role) {
              setUserRole(data.role);
            }
            
            toast({
              title: "Actualización parcial",
              description: "Se actualizó tu perfil localmente, pero hubo un problema al sincronizar con el servidor.",
              variant: "destructive",
            });
          }
        }
      } else {
        // Backend not available, just update local state
        if (backendUser) {
          const updatedUser = {
            ...backendUser,
            full_name: data.fullName || backendUser.full_name,
            work_mode: data.workMode || backendUser.work_mode,
            role: data.role || backendUser.role
          };
          
          setBackendUser(updatedUser);
          if (data.role) {
            setUserRole(data.role);
          }
          
          toast({
            title: "Actualización local",
            description: "Se actualizó tu perfil localmente. Los cambios se sincronizarán cuando el servidor esté disponible.",
            variant: "default",
          });
        }
      }
      
      return true;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
      toast({
        title: "Error",
        description: err.message || "No se pudo actualizar el perfil.",
        variant: "destructive",
      });
      return false;
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await FirebaseAuthService.logout();
      // Auth state change will handle clearing the user state
    } catch (err: any) {
      setError(err.message || "Failed to log out");
      throw err;
    }
  };

  const value = {
    currentUser,
    backendUser,
    userRole,
    loading,
    error,
    isBackendAvailable,
    login,
    register,
    logout,
    updateProfile,
    retryBackendConnection
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;