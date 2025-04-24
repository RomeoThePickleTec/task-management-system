"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { UserRole } from '@/core/interfaces/models';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Layers,
  CheckSquare,
  Calendar,
  Users,
  Settings,
  BarChart,
  LogOut,
  Menu,
  X
} from 'lucide-react';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const pathname = usePathname();

  const { currentUser, userRole, logout } = useAuth();
  
  // Derive username and initials from user email
  const username = currentUser?.email?.split('@')[0] || 'User';
  const initials = username.substring(0, 2).toUpperCase();

  const handleLogout = async () => {
    try {
      await logout();
      // Redirect will happen automatically via the AuthContext
    } catch (error) {
      console.error("Failed to log out:", error);
    }
  };

  // Define navigation items
  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/',
      icon: BarChart,
      roles: [UserRole.DEVELOPER, UserRole.MANAGER]
    },
    {
      name: 'Projects',
      href: '/projects',
      icon: Layers,
      roles: [UserRole.DEVELOPER, UserRole.MANAGER]
    },
    {
      name: 'Tasks',
      href: '/tasks',
      icon: CheckSquare,
      roles: [UserRole.DEVELOPER, UserRole.MANAGER]
    },
    {
      name: 'Sprints',
      href: '/sprints',
      icon: Calendar,
      roles: [UserRole.DEVELOPER, UserRole.MANAGER]
    },
    {
      name: 'Team',
      href: '/team',
      icon: Users,
      roles: [UserRole.MANAGER]
    },
    {
      name: 'Settings',
      href: '/settings',
      icon: Settings,
      roles: [UserRole.DEVELOPER, UserRole.MANAGER]
    },
  ];

  // Filter navigation items based on user role
  const filteredNavItems = navigationItems.filter(item => 
    item.roles.includes(userRole)
  );

  // Render sidebar links
  const renderNavLinks = () => (
    <ul className="space-y-2 py-4">
      {filteredNavItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <item.icon className={`h-5 w-5 mr-3 ${isActive ? 'text-blue-700' : 'text-gray-500'}`} />
              {item.name}
            </Link>
          </li>
        );
      })}
    </ul>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile navigation */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            className="md:hidden fixed top-4 left-4 z-40 p-2"
            aria-label="Open menu"
            size="sm"
          >
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0">
          <div className="flex flex-col h-full">
            <div className="border-b p-4 flex items-center justify-between">
              <Link href="/" className="font-bold text-xl text-blue-600">
                JAI-VIER
              </Link>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            <div className="flex-1 overflow-auto">
              {renderNavLinks()}
            </div>
          </div>
        </SheetContent>
      </Sheet>

      {/* Desktop sidebar */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0">
        <div className="flex flex-col flex-1 border-r border-gray-200 bg-white">
          <div className="flex items-center h-16 flex-shrink-0 px-4 border-b">
            <Link href="/" className="font-bold text-xl text-blue-600">
              JAI-VIER
            </Link>
          </div>
          <div className="flex-1 flex flex-col overflow-y-auto">
            {renderNavLinks()}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="md:pl-64">
        {/* Top navigation */}
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
          <div className="flex h-16 items-center justify-end px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/placeholder-avatar.jpg" alt={username} />
                      <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuLabel className="font-normal text-xs text-gray-500">
                    {currentUser?.email}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/settings">Settings</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="h-4 w-4 mr-2" />
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          {children}
        </main>
      </div>
    </div>
  );
}