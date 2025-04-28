"use client";

import React from 'react';
import { useAuth } from '@/contexts/BackendAuthContext';
import { Button } from './button';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import { toast } from './use-toast';

export function BackendStatus() {
  const { isBackendAvailable, retryBackendConnection } = useAuth();
  const [isRetrying, setIsRetrying] = React.useState(false);

  // If backend is available, don't show anything
  if (isBackendAvailable) {
    return null;
  }

  const handleRetry = async () => {
    setIsRetrying(true);
    try {
      const result = await retryBackendConnection();
      if (result) {
        toast({
          title: "Conexión restaurada",
          description: "Se ha restablecido la conexión con el servidor.",
          variant: "default",
        });
      } else {
        toast({
          title: "Error de conexión",
          description: "No se pudo conectar con el servidor. Algunas funciones pueden no estar disponibles.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error retrying connection:", error);
    } finally {
      setIsRetrying(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 shadow-lg">
        <div className="flex items-start">
          <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-3" />
          <div className="flex-1">
            <h3 className="font-medium text-red-800">Error de conexión</h3>
            <p className="text-sm text-red-700 mt-1">
              No se pudo conectar con el servidor. La aplicación está funcionando en modo offline.
              Algunas funciones pueden no estar disponibles.
            </p>
            <div className="mt-3">
              <Button 
                variant="outline" 
                size="sm" 
                className="bg-white hover:bg-red-50 text-red-700 border-red-300"
                onClick={handleRetry}
                disabled={isRetrying}
              >
                {isRetrying ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Reconectando...
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2" />
                    Reintentar conexión
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}