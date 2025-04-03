// src/components/layout/MainLayout.tsx
"use client";

import React, { useState } from 'react';
import AppHeader from './AppHeader';
import Sidebar from './Sidebar';
import { UserRole } from '@/core/interfaces/models';

interface MainLayoutProps {
  children: React.ReactNode;
  username?: string;
  userRole?: UserRole;
}

const MainLayout: React.FC<MainLayoutProps> = ({ 
  children,
  username = 'Usuario', 
  userRole = UserRole.DEVELOPER,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    // Implementar lógica de cierre de sesión aquí
    console.log('Cerrando sesión...');
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <AppHeader 
        username={username} 
        userRole={userRole} 
        onLogout={handleLogout}
        onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
      />
      
      <div className="flex flex-1 overflow-hidden">
        <div 
          className={`
            fixed inset-y-0 left-0 z-50 w-64 bg-white transform transition-transform duration-300 ease-in-out 
            ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
            md:translate-x-0 md:static md:z-0
          `}
        >
          <Sidebar userRole={userRole} />
        </div>
        
        <main className="flex-1 p-4 overflow-auto">
          {sidebarOpen && (
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
          <div className="container mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;