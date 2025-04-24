"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md text-center">
        <ShieldAlert className="mx-auto h-24 w-24 text-red-500" />
        
        <h1 className="mt-6 text-3xl font-bold text-gray-900">Acceso denegado</h1>
        
        <p className="mt-3 text-lg text-gray-600">
          No tienes permisos para acceder a esta página.
        </p>
        
        <div className="mt-8 space-y-4">
          <Button
            onClick={() => router.push('/')}
            className="w-full"
          >
            Volver al inicio
          </Button>
          
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="w-full"
          >
            Volver atrás
          </Button>
        </div>
      </div>
    </div>
  );
}