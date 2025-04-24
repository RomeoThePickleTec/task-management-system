"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/core/interfaces/models';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRoles?: UserRole[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  requiredRoles = [] 
}) => {
  const { currentUser, userRole, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and no user is logged in, redirect to login
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
    
    // If roles are required, check if user has the required role
    if (!loading && currentUser && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(userRole);
      if (!hasRequiredRole) {
        // Redirect to dashboard or unauthorized page
        router.push('/unauthorized');
      }
    }
  }, [loading, currentUser, userRole, requiredRoles, router]);

  // Show loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // If not logged in, don't render children
  if (!currentUser) {
    return null;
  }

  // If roles are required and user doesn't have them, don't render children
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return null;
  }

  // Render children if authorized
  return <>{children}</>;
};

export default ProtectedRoute;