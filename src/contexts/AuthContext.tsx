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
import UserSyncService from '@/services/auth/userSyncService';
import { apiClient } from '@/services/api/apiClient';
import { UserRole, IUser } from '@/core/interfaces/models';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  backendUser: IUser | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
  updateProfile: (data: { fullName?: string, workMode?: string, role?: UserRole }) => Promise<boolean>;
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

  // Update API client headers with auth token
  const updateApiAuthToken = async (user: User | null) => {
    if (user) {
      const token = await FirebaseAuthService.getAuthToken();
      // Update default headers for API requests
      if (token) {
        apiClient.setAuthToken(token);
      }
    } else {
      // Clear auth token when user is signed out
      apiClient.clearAuthToken();
    }
  };

  // Sync user with backend and fetch user details
  const syncUserWithBackend = async (user: User) => {
    try {
      // Sync user with backend and get the backend user
      const syncedUser = await UserSyncService.syncUserWithBackend(user);
      
      if (syncedUser) {
        setBackendUser(syncedUser);
        setUserRole(syncedUser.role as UserRole || UserRole.DEVELOPER);
      }
    } catch (error) {
      console.error("Failed to sync user with backend:", error);
      // Default to DEVELOPER role if we can't determine the actual role
      setUserRole(UserRole.DEVELOPER);
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged(async (user) => {
      setCurrentUser(user);
      
      if (user) {
        await updateApiAuthToken(user);
        await syncUserWithBackend(user);
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
    } catch (err: any) {
      setError(err.message || "Failed to log in");
      throw err;
    } finally {
      setLoading(false);
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
        
        // User will be synced with backend via the authStateChanged handler
      }
    } catch (err: any) {
      setError(err.message || "Failed to register");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfile = async (data: { fullName?: string, workMode?: string, role?: UserRole }) => {
    try {
      setError(null);
      
      if (!currentUser || !backendUser || !backendUser.id) {
        throw new Error("User not authenticated or backend user not found");
      }
      
      const updatedUser = await UserSyncService.updateUserProfile(
        backendUser.id, 
        currentUser,
        data
      );
      
      if (updatedUser) {
        setBackendUser(updatedUser);
        if (data.role) {
          setUserRole(data.role);
        }
        return true;
      }
      
      return false;
    } catch (err: any) {
      setError(err.message || "Failed to update profile");
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
    login,
    register,
    logout,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;