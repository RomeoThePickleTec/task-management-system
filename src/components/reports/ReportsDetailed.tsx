// components/reports/ReportsDetailed.tsx
'use client';

import React, { useRef, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { CheckCircle, Calendar, FileBarChart, Users } from 'lucide-react';
import { gsap } from 'gsap';

interface ReportsDetailedProps {
  isLoading: boolean;
  onReportClick: (route: string) => void;
}

export default function ReportsDetailed({ isLoading, onReportClick }: ReportsDetailedProps) {
  const detailedReportsRef = useRef<HTMLDivElement>(null);

  const animateDetailed = () => {
    gsap.fromTo(detailedReportsRef.current?.children || [],
      { opacity: 0, y: 40, rotationX: -10 },
      {
        opacity: 1,
        y: 0,
        rotationX: 0,
        duration: 0.7,
        stagger: 0.15,
        ease: "power2.out"
      }
    );
  };

  // Animación de hover con GSAP
  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.report-icon');
    const title = card.querySelector('.report-title');
    const description = card.querySelector('.report-description');
    
    gsap.to(card, {
      duration: 0.3,
      boxShadow: '0 20px 40px rgba(0,0,0,0.15)',
      ease: "power2.out"
    });

    gsap.to(icon, {
      duration: 0.3,
      scale: 1.2,
      rotation: 5,
      ease: "back.out(1.7)"
    });

    gsap.to(title, {
      duration: 0.2,
      color: '#3b82f6',
      ease: "power2.out"
    });

    gsap.to(description, {
      duration: 0.2,
      opacity: 0.8,
      ease: "power2.out"
    });
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const icon = card.querySelector('.report-icon');
    const title = card.querySelector('.report-title');
    const description = card.querySelector('.report-description');
    
    gsap.to(card, {
      duration: 0.3,
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
      ease: "power2.out"
    });

    gsap.to(icon, {
      duration: 0.3,
      scale: 1,
      rotation: 0,
      ease: "power2.out"
    });

    gsap.to(title, {
      duration: 0.2,
      color: '',
      ease: "power2.out"
    });

    gsap.to(description, {
      duration: 0.2,
      opacity: 1,
      ease: "power2.out"
    });
  };

  useEffect(() => {
    if (!isLoading) {
      setTimeout(animateDetailed, 400);
    }
  }, [isLoading]);

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4 text-foreground">Informes Detallados</h2>
      <div ref={detailedReportsRef} className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card
          className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 group"
          onClick={() => onReportClick('/reports/tasks')}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CardContent className="p-6 flex flex-col items-center text-center relative overflow-hidden">
            {/* Efecto de fondo que aparece en hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/10 dark:to-blue-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="report-icon h-12 w-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mb-4 relative z-10">
              <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="report-title font-semibold text-lg mb-2 text-foreground relative z-10">Informe de Tareas</h3>
            <p className="report-description text-sm text-muted-foreground relative z-10">
              Estado detallado de todas las tareas, tiempos de completado y responsables.
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 group"
          onClick={() => onReportClick('/reports/sprints')}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CardContent className="p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/10 dark:to-purple-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="report-icon h-12 w-12 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-4 relative z-10">
              <Calendar className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="report-title font-semibold text-lg mb-2 text-foreground relative z-10">Informe de Sprints</h3>
            <p className="report-description text-sm text-muted-foreground relative z-10">
              Análisis de sprints, velocidad del equipo y capacidad de entrega.
            </p>
          </CardContent>
        </Card>

        <Card
          className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 group"
          onClick={() => onReportClick('/reports/projects')}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CardContent className="p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/10 dark:to-green-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="report-icon h-12 w-12 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mb-4 relative z-10">
              <FileBarChart className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="report-title font-semibold text-lg mb-2 text-foreground relative z-10">Informe de Proyectos</h3>
            <p className="report-description text-sm text-muted-foreground relative z-10">
              Progreso de proyectos, desviaciones de cronograma y métricas de éxito.
            </p>
          </CardContent>
        </Card>
        
        <Card
          className="hover:shadow-xl transition-all duration-300 cursor-pointer hover:-translate-y-2 hover:scale-105 group"
          onClick={() => onReportClick('/reports/developer-performance')}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <CardContent className="p-6 flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-800/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            
            <div className="report-icon h-12 w-12 bg-amber-100 dark:bg-amber-900/30 rounded-full flex items-center justify-center mb-4 relative z-10">
              <Users className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <h3 className="report-title font-semibold text-lg mb-2 text-foreground relative z-10">Rendimiento por Desarrollador</h3>
            <p className="report-description text-sm text-muted-foreground relative z-10">
              Análisis de horas trabajadas y tareas completadas por cada miembro del equipo en diferentes sprints.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}