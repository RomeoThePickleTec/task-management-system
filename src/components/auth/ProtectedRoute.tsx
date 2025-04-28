"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/BackendAuthContext'; // Actualizar la importación
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
    // Si no está cargando y no hay usuario, redirigir a login
    if (!loading && !currentUser) {
      router.push('/auth/login');
    }
    
    // Si se requieren roles, verificar si el usuario tiene el rol requerido
    if (!loading && currentUser && requiredRoles.length > 0) {
      const hasRequiredRole = requiredRoles.includes(userRole);
      if (!hasRequiredRole) {
        router.push('/unauthorized');
      }
    }
  }, [loading, currentUser, userRole, requiredRoles, router]);

  // Mostrar estado de carga
  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Si no está autenticado, no renderizar los hijos
  if (!currentUser) {
    return null;
  }

  // Si se requieren roles y el usuario no los tiene, no renderizar los hijos
  if (requiredRoles.length > 0 && !requiredRoles.includes(userRole)) {
    return null;
  }

  // Renderizar hijos si está autorizado
  return <>{children}</>;
};

export default ProtectedRoute;