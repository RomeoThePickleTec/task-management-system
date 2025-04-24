"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Sheet, SheetContent } from "@/components/ui/sheet";
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userRole, logout } = useAuth();
  
  // Derive username from user email
  const username = currentUser?.email?.split('@')[0] || 'User';

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will happen automatically via the AuthContext
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64">
          <Sidebar userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* App Header */}
      <AppHeader 
        username={username} 
        userRole={userRole} 
        onLogout={handleLogout}
        onToggleSidebar={toggleSidebar}
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div className="hidden md:block w-64 flex-shrink-0">
          <Sidebar userRole={userRole} className="h-full" />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main className="py-6 px-4 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}