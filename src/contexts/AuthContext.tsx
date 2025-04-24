// src/contexts/AuthContext.tsx
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
import { UserRole } from '@/core/interfaces/models';

interface AuthContextType {
  currentUser: User | null;
  userRole: UserRole;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, fullName: string) => Promise<void>;
  logout: () => Promise<void>;
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

  // Fetch user role from backend API
  const fetchUserRole = async (user: User) => {
    try {
      if (user && user.email) {
        // Implement API call to get user role based on user email
        const userData = await apiClient.get(`/userlist/email/${user.email}`);
        if (userData && userData.role) {
          setUserRole(userData.role as UserRole);
        }
      }
    } catch (error) {
      console.error("Failed to fetch user role:", error);
      // Default to DEVELOPER role if we can't determine the actual role
      setUserRole(UserRole.DEVELOPER);
    }
  };

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = FirebaseAuthService.onAuthStateChanged((user) => {
      setCurrentUser(user);
      if (user) {
        updateApiAuthToken(user);
        fetchUserRole(user);
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
      
      // If successful, create user in backend API
      if (userCredential.user) {
        await apiClient.post('/userlist', {
          username: email.split('@')[0], // Simple username from email
          email: email,
          full_name: fullName,
          password_hash: password, // Note: In a real app, don't send plain password to backend
          role: "DEVELOPER", // Default role for new users
          work_mode: "REMOTE"
        });
      }
    } catch (err: any) {
      setError(err.message || "Failed to register");
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setError(null);
      await FirebaseAuthService.logout();
    } catch (err: any) {
      setError(err.message || "Failed to log out");
      throw err;
    }
  };

  const value = {
    currentUser,
    userRole,
    loading,
    error,
    login,
    register,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;