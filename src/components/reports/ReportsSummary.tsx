// components/reports/ReportsSummary.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Calendar, CheckCircle, ChevronRight } from 'lucide-react';
import Link from 'next/link';
import { gsap } from 'gsap';

interface Statistics {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  blockedTasks: number;
}

interface ReportsSummaryProps {
  statistics: Statistics;
  isLoading: boolean;
}

export default function ReportsSummary({ statistics, isLoading }: ReportsSummaryProps) {
  const summaryCardsRef = useRef<HTMLDivElement>(null);
  const taskProgressRef = useRef<HTMLDivElement>(null);

  const animateSummary = () => {
    const tl = gsap.timeline();

    // Animate summary cards
    tl.fromTo(summaryCardsRef.current?.children || [],
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.6,
        stagger: 0.2,
        ease: "power2.out"
      }
    );

    // Animate task progress bars
    setTimeout(() => {
      const taskProgressBars = taskProgressRef.current?.querySelectorAll('.task-progress-segment');
      if (taskProgressBars) {
        gsap.fromTo(taskProgressBars,
          { width: '0%' },
          {
            width: (i, el) => el.dataset.width + '%',
            duration: 1.2,
            stagger: 0.1,
            ease: "power2.out"
          }
        );
      }
    }, 500);
  };

  // Enhanced hover animation for project items
  const handleProjectItemHover = (e: React.MouseEvent, enter: boolean) => {
    const item = e.currentTarget;
    const icon = item.querySelector('.project-icon');
    const number = item.querySelector('.project-number');
    
    if (enter) {
      gsap.to(icon, { scale: 1.2, rotation: 5, duration: 0.3, ease: "back.out(1.7)" });
      gsap.to(number, { scale: 1.1, color: "#3b82f6", duration: 0.3 });
      gsap.to(item, { x: 5, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(icon, { scale: 1, rotation: 0, duration: 0.3 });
      gsap.to(number, { scale: 1, color: "", duration: 0.3 });
      gsap.to(item, { x: 0, duration: 0.3 });
    }
  };

  // Enhanced hover animation for task items
  const handleTaskItemHover = (e: React.MouseEvent, enter: boolean) => {
    const item = e.currentTarget;
    const dot = item.querySelector('.task-dot');
    const number = item.querySelector('.task-number');
    
    if (enter) {
      gsap.to(dot, { scale: 1.5, duration: 0.3, ease: "back.out(1.7)" });
      gsap.to(number, { scale: 1.2, fontWeight: "bold", duration: 0.3 });
      gsap.to(item, { x: 8, duration: 0.3, ease: "power2.out" });
    } else {
      gsap.to(dot, { scale: 1, duration: 0.3 });
      gsap.to(number, { scale: 1, fontWeight: "500", duration: 0.3 });
      gsap.to(item, { x: 0, duration: 0.3 });
    }
  };

  // Progress bar hover effect
  const handleProgressBarHover = (e: React.MouseEvent, enter: boolean) => {
    const progressBar = e.currentTarget;
    
    if (enter) {
      gsap.to(progressBar, { 
        scale: 1.02, 
        y: -2, 
        boxShadow: "0 8px 25px rgba(0,0,0,0.15)",
        duration: 0.3,
        ease: "power2.out"
      });
    } else {
      gsap.to(progressBar, { 
        scale: 1, 
        y: 0, 
        boxShadow: "none",
        duration: 0.3 
      });
    }
  };

  useEffect(() => {
    if (!isLoading) {
      setTimeout(animateSummary, 100);
    }
  }, [isLoading]);

  const inProgressTasks = statistics.pendingTasks - (statistics.totalTasks - statistics.completedTasks - statistics.blockedTasks);
  const todoTasks = statistics.pendingTasks - statistics.blockedTasks;

  return (
    <div ref={summaryCardsRef} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-background hover:to-muted/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Resumen de Proyectos</span>
            <Link href="/projects" passHref>
              <Button variant="ghost" size="sm" className="flex items-center hover:scale-110 transition-transform">
                Ver todos <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between hover:bg-muted/50 rounded-lg p-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => handleProjectItemHover(e, true)}
              onMouseLeave={(e) => handleProjectItemHover(e, false)}
            >
              <div className="flex items-center">
                <div className="project-icon h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3 transition-all duration-300">
                  <BarChart className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Total de proyectos</p>
                  <p className="text-sm text-muted-foreground">Todos los proyectos registrados</p>
                </div>
              </div>
              <span className="project-number font-bold text-xl text-foreground transition-all duration-300">{statistics.totalProjects}</span>
            </div>

            <div 
              className="flex items-center justify-between hover:bg-muted/50 rounded-lg p-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => handleProjectItemHover(e, true)}
              onMouseLeave={(e) => handleProjectItemHover(e, false)}
            >
              <div className="flex items-center">
                <div className="project-icon h-10 w-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3 transition-all duration-300">
                  <Calendar className="h-5 w-5 text-green-600 dark:text-green-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Proyectos activos</p>
                  <p className="text-sm text-muted-foreground">Proyectos en desarrollo</p>
                </div>
              </div>
              <span className="project-number font-bold text-xl text-foreground transition-all duration-300">{statistics.activeProjects}</span>
            </div>

            <div 
              className="flex items-center justify-between hover:bg-muted/50 rounded-lg p-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => handleProjectItemHover(e, true)}
              onMouseLeave={(e) => handleProjectItemHover(e, false)}
            >
              <div className="flex items-center">
                <div className="project-icon h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mr-3 transition-all duration-300">
                  <CheckCircle className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div>
                  <p className="font-medium text-foreground">Proyectos completados</p>
                  <p className="text-sm text-muted-foreground">Proyectos finalizados</p>
                </div>
              </div>
              <span className="project-number font-bold text-xl text-foreground transition-all duration-300">{statistics.completedProjects}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="hover:shadow-xl transition-all duration-500 hover:-translate-y-2 hover:bg-gradient-to-br hover:from-background hover:to-muted/30">
        <CardHeader>
          <CardTitle className="text-lg flex items-center justify-between">
            <span>Estado de Tareas</span>
            <Link href="/tasks" passHref>
              <Button variant="ghost" size="sm" className="flex items-center hover:scale-110 transition-transform">
                Ver todas <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div 
              className="flex items-center justify-between hover:bg-muted/50 rounded p-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => handleTaskItemHover(e, true)}
              onMouseLeave={(e) => handleTaskItemHover(e, false)}
            >
              <div className="flex items-center">
                <div className="task-dot h-3 w-3 rounded-full bg-orange-300 dark:bg-orange-400 mr-2 transition-all duration-300"></div>
                <p className="text-foreground">Por hacer</p>
              </div>
              <span className="task-number font-medium text-foreground transition-all duration-300">{todoTasks}</span>
            </div>

            <div 
              className="flex items-center justify-between hover:bg-muted/50 rounded p-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => handleTaskItemHover(e, true)}
              onMouseLeave={(e) => handleTaskItemHover(e, false)}
            >
              <div className="flex items-center">
                <div className="task-dot h-3 w-3 rounded-full bg-blue-500 mr-2 transition-all duration-300"></div>
                <p className="text-foreground">En progreso</p>
              </div>
              <span className="task-number font-medium text-foreground transition-all duration-300">{inProgressTasks}</span>
            </div>

            <div 
              className="flex items-center justify-between hover:bg-muted/50 rounded p-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => handleTaskItemHover(e, true)}
              onMouseLeave={(e) => handleTaskItemHover(e, false)}
            >
              <div className="flex items-center">
                <div className="task-dot h-3 w-3 rounded-full bg-green-500 mr-2 transition-all duration-300"></div>
                <p className="text-foreground">Completadas</p>
              </div>
              <span className="task-number font-medium text-foreground transition-all duration-300">{statistics.completedTasks}</span>
            </div>

            <div 
              className="flex items-center justify-between hover:bg-muted/50 rounded p-2 transition-all duration-300 cursor-pointer"
              onMouseEnter={(e) => handleTaskItemHover(e, true)}
              onMouseLeave={(e) => handleTaskItemHover(e, false)}
            >
              <div className="flex items-center">
                <div className="task-dot h-3 w-3 rounded-full bg-red-500 mr-2 transition-all duration-300"></div>
                <p className="text-foreground">Bloqueadas</p>
              </div>
              <span className="task-number font-medium text-foreground transition-all duration-300">{statistics.blockedTasks}</span>
            </div>

            <div className="pt-4">
              <div 
                ref={taskProgressRef} 
                className="w-full h-4 bg-muted rounded-full overflow-hidden cursor-pointer transition-all duration-300"
                onMouseEnter={(e) => handleProgressBarHover(e, true)}
                onMouseLeave={(e) => handleProgressBarHover(e, false)}
              >
                <div className="flex h-full">
                  <div
                    className="task-progress-segment bg-green-500 h-full transition-all duration-300"
                    data-width={statistics.totalTasks ? (statistics.completedTasks / statistics.totalTasks) * 100 : 0}
                    style={{
                      width: `${statistics.totalTasks ? (statistics.completedTasks / statistics.totalTasks) * 100 : 0}%`,
                    }}
                  ></div>
                  <div
                    className="task-progress-segment bg-blue-500 h-full transition-all duration-300"
                    data-width={statistics.totalTasks ? (inProgressTasks / statistics.totalTasks) * 100 : 0}
                    style={{
                      width: `${statistics.totalTasks ? (inProgressTasks / statistics.totalTasks) * 100 : 0}%`,
                    }}
                  ></div>
                  <div
                    className="task-progress-segment bg-orange-300 dark:bg-orange-400 h-full transition-all duration-300"
                    data-width={statistics.totalTasks ? (todoTasks / statistics.totalTasks) * 100 : 0}
                    style={{
                      width: `${statistics.totalTasks ? (todoTasks / statistics.totalTasks) * 100 : 0}%`,
                    }}
                  ></div>
                  <div
                    className="task-progress-segment bg-red-500 h-full transition-all duration-300"
                    data-width={statistics.totalTasks ? (statistics.blockedTasks / statistics.totalTasks) * 100 : 0}
                    style={{
                      width: `${statistics.totalTasks ? (statistics.blockedTasks / statistics.totalTasks) * 100 : 0}%`,
                    }}
                  ></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}