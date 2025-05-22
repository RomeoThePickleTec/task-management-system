// components/reports/ReportsMetrics.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { BarChart, CheckCircle, Timer, AlertTriangle } from 'lucide-react';
import { gsap } from 'gsap';

interface Statistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
  totalSprints: number;
  activeSprints: number;
  nearEndSprints: number;
  projectProgress: number;
  overdueTasks: number;
  averageTasksPerSprint: number;
}

interface ReportsMetricsProps {
  statistics: Statistics;
  isLoading: boolean;
}

export default function ReportsMetrics({ statistics, isLoading }: ReportsMetricsProps) {
  const metricsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isLoading && statistics.projectProgress > 0) {
      // Animate progress bar when statistics are updated
      gsap.fromTo('.progress-fill',
        { width: '0%' },
        { 
          width: `${statistics.projectProgress}%`,
          duration: 2,
          ease: "steps(12)",
          delay: 0.5
        }
      );
    }
  }, [statistics.projectProgress, isLoading]);

  const animateMetrics = () => {
    gsap.fromTo(metricsRef.current?.children || [],
      { opacity: 0, y: 30, scale: 0.9 },
      { 
        opacity: 1, 
        y: 10, 
        scale: 1,
        duration: 0.8,
        stagger: 0.1,
        ease: "back.out(1.7)"
      }
    );
  };

  useEffect(() => {
    if (!isLoading) {
      setTimeout(animateMetrics, 100);
    }
  }, [isLoading]);

  // Hover animations
  const handleMouseEnter = (element: HTMLElement) => {
    const icon = element.querySelector('.metric-icon');
    const number = element.querySelector('.metric-number');
    const progressBar = element.querySelector('.progress-fill');
    
    // Scale and rotate icon
    gsap.to(icon, {
      scale: 1.15,
      rotation: 5,
      duration: 0.3,
      ease: "back.out(1.7)"
    });
    
    // Bounce number
    gsap.to(number, {
      scale: 1.1,
      duration: 0.3,
      ease: "elastic.out(1, 0.3)"
    });
    
    // Pulse progress bar if exists
    if (progressBar) {
      gsap.to(progressBar, {
        scale: 1.02,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    
    // Add glow effect
    gsap.to(element, {
      boxShadow: "0 20px 40px -10px rgba(0,0,0,0.15)",
      duration: 0.3
    });
  };

  const handleMouseLeave = (element: HTMLElement) => {
    const icon = element.querySelector('.metric-icon');
    const number = element.querySelector('.metric-number');
    const progressBar = element.querySelector('.progress-fill');
    
    // Reset icon
    gsap.to(icon, {
      scale: 1,
      rotation: 0,
      duration: 0.3,
      ease: "power2.out"
    });
    
    // Reset number
    gsap.to(number, {
      scale: 1,
      duration: 0.3,
      ease: "power2.out"
    });
    
    // Reset progress bar
    if (progressBar) {
      gsap.to(progressBar, {
        scale: 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
    
    // Remove glow
    gsap.to(element, {
      boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)",
      duration: 0.3
    });
  };

  return (
    <div ref={metricsRef} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card 
        className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400">Progreso general</p>
              <h3 className="metric-number text-2xl font-bold text-blue-900 dark:text-blue-100 mt-1">
                {statistics.projectProgress}%
              </h3>
            </div>
            <div className="metric-icon h-12 w-12 bg-blue-200 dark:bg-blue-600/50 rounded-full flex items-center justify-center">
              <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-4 h-2 w-full bg-blue-200 dark:bg-blue-800/30 rounded-full overflow-hidden">
            <div className="progress-fill h-full bg-blue-600 dark:bg-blue-500 rounded-full transition-all duration-300"></div>
          </div>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 border-green-200 dark:border-green-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400">Tareas completadas</p>
              <h3 className="metric-number text-2xl font-bold text-green-900 dark:text-green-100 mt-1">
                {statistics.completedTasks} / {statistics.totalTasks}
              </h3>
            </div>
            <div className="metric-icon h-12 w-12 bg-green-200 dark:bg-green-800/50 rounded-full flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <p className="mt-2 text-green-800 dark:text-green-200 text-sm">
            {statistics.pendingTasks} pendientes, {statistics.blockedTasks} bloqueadas
          </p>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/30 border-amber-200 dark:border-amber-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Sprints activos</p>
              <h3 className="metric-number text-2xl font-bold text-amber-900 dark:text-amber-100 mt-1">
                {statistics.activeSprints} / {statistics.totalSprints}
              </h3>
            </div>
            <div className="metric-icon h-12 w-12 bg-amber-200 dark:bg-amber-800/50 rounded-full flex items-center justify-center">
              <Timer className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <p className="mt-2 text-amber-800 dark:text-amber-200 text-sm">
            {statistics.nearEndSprints} terminan pronto
          </p>
        </CardContent>
      </Card>

      <Card 
        className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/30 border-red-200 dark:border-red-800 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer"
        onMouseEnter={(e) => handleMouseEnter(e.currentTarget)}
        onMouseLeave={(e) => handleMouseLeave(e.currentTarget)}
      >
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400">Tareas vencidas</p>
              <h3 className="metric-number text-2xl font-bold text-red-900 dark:text-red-100 mt-1">
                {statistics.overdueTasks}
              </h3>
            </div>
            <div className="metric-icon h-12 w-12 bg-red-200 dark:bg-red-800/50 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
          </div>
          <p className="mt-2 text-red-800 dark:text-red-200 text-sm">Requieren atención inmediata</p>
        </CardContent>
      </Card>
    </div>
  );
}