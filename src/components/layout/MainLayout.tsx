'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '@/contexts/BackendAuthContext';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import Sidebar from './Sidebar';
import AppHeader from './AppHeader';
import { BackendStatus } from '@/components/ui/BackendStatus';
import { gsap } from 'gsap';

interface MainLayoutProps {
  children: React.ReactNode;
}

export default function MainLayout({ children }: MainLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser, userRole, backendUser, logout } = useAuth();

  // Refs for animations
  const headerRef = useRef<HTMLDivElement>(null);
  const sidebarRef = useRef<HTMLDivElement>(null);
  const mainContentRef = useRef<HTMLDivElement>(null);

  // Derive username from user data
  const username = backendUser?.username || currentUser?.email?.split('@')[0] || 'User';

  useEffect(() => {
    // Initial page load animations
    const tl = gsap.timeline();
    
    // Animate header sliding down
    tl.fromTo(headerRef.current,
      { y: -100, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );

    // Animate sidebar sliding in from left (desktop only)
    tl.fromTo(sidebarRef.current,
      { x: -280, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.7, ease: "power2.out" },
      "-=0.4"
    );

    // Animate main content fading in
    tl.fromTo(mainContentRef.current,
      { opacity: 0, y: 20 },
      { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
      "-=0.5"
    );
  }, []);

  const handleLogout = async () => {
    // Animate logout
    gsap.to([headerRef.current, sidebarRef.current, mainContentRef.current], {
      opacity: 0,
      y: -20,
      duration: 0.4,
      stagger: 0.1,
      ease: "power2.in",
      onComplete: async () => {
        try {
          await logout();
        } catch (error) {
          console.error('Failed to log out:', error);
        }
      }
    });
  };

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
    
    // Add a subtle animation when toggling mobile sidebar
    if (!sidebarOpen) {
      gsap.fromTo('.sheet-content',
        { x: -280 },
        { x: 0, duration: 0.3, ease: "power2.out" }
      );
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col overflow-hidden">
      {/* Mobile sidebar */}
      <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
        <SheetContent side="left" className="p-0 w-64 sheet-content">
          <Sidebar userRole={userRole} />
        </SheetContent>
      </Sheet>

      {/* App Header */}
      <div ref={headerRef}>
        <AppHeader
          username={username}
          userRole={userRole}
          onLogout={handleLogout}
          onToggleSidebar={toggleSidebar}
        />
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Desktop sidebar */}
        <div 
          ref={sidebarRef}
          className="hidden md:block w-64 flex-shrink-0"
        >
          <Sidebar userRole={userRole} className="h-full" />
        </div>

        {/* Main content */}
        <div className="flex-1 overflow-auto">
          <main 
            ref={mainContentRef}
            className="py-6 px-4 sm:px-6 lg:px-8"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Backend status notification */}
      <BackendStatus />
    </div>
  );
}