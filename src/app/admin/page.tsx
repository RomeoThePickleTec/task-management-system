"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { UserRole } from '@/core/interfaces/models';
import { 
  Users, 
  RefreshCw, 
  Settings, 
  Shield, 
  Database, 
  Layers, 
  ArrowRight 
} from "lucide-react";

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute requiredRoles={[UserRole.ADMIN, UserRole.MANAGER]}>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
}

function AdminDashboardContent() {
  const router = useRouter();

  const adminFeatures = [
    {
      title: "Gestión de Usuarios",
      description: "Administra usuarios, roles y permisos",
      icon: <Users className="h-12 w-12 text-blue-500" />,
      href: "/users",
      color: "bg-blue-50"
    },
    {
      title: "Sincronización Firebase",
      description: "Sincroniza usuarios del backend con Firebase Auth",
      icon: <RefreshCw className="h-12 w-12 text-green-500" />,
      href: "/admin/user-sync",
      color: "bg-green-50"
    },
    {
      title: "Configuración del Sistema",
      description: "Configura parámetros globales del sistema",
      icon: <Settings className="h-12 w-12 text-purple-500" />,
      href: "/settings",
      color: "bg-purple-50"
    },
    {
      title: "Seguridad",
      description: "Configuración de seguridad y protección",
      icon: <Shield className="h-12 w-12 text-red-500" />,
      href: "/admin/security",
      color: "bg-red-50"
    },
    {
      title: "Gestión de Proyectos",
      description: "Administra proyectos y plantillas",
      icon: <Layers className="h-12 w-12 text-orange-500" />,
      href: "/projects",
      color: "bg-orange-50"
    },
    {
      title: "Backup y Restauración",
      description: "Gestiona backups y restauración de datos",
      icon: <Database className="h-12 w-12 text-indigo-500" />,
      href: "/admin/backup",
      color: "bg-indigo-50"
    }
  ];

  return (
    <MainLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Panel de Administración</h1>
          <p className="text-gray-500 mt-1">
            Herramientas y configuraciones para administradores del sistema
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {adminFeatures.map((feature, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className={`${feature.color} rounded-t-lg`}>
                <div className="flex justify-center py-3">
                  {feature.icon}
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription className="mt-2">
                  {feature.description}
                </CardDescription>
              </CardContent>
              <CardFooter>
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => router.push(feature.href)}
                >
                  Acceder
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </MainLayout>
  );
}