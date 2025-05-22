// src/app/reports/page.tsx
'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  IProject,
  TaskStatus,
  ProjectStatus,
  SprintStatus,
  UserRole,
} from '@/core/interfaces/models';
import { gsap } from 'gsap';

// Import components
import ReportsMetrics from '@/components/reports/ReportsMetrics';
import ReportsSummary from '@/components/reports/ReportsSummary';
import ReportsDetailed from '@/components/reports/ReportsDetailed';

// Import API services
import { ProjectService, TaskService, SprintService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

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

export default function ReportsPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [projects, setProjects] = useState<IProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [statistics, setStatistics] = useState<Statistics>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    blockedTasks: 0,
    totalSprints: 0,
    activeSprints: 0,
    nearEndSprints: 0,
    projectProgress: 0,
    overdueTasks: 0,
    averageTasksPerSprint: 0,
  });

  const headerRef = useRef<HTMLDivElement>(null);

  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  useEffect(() => {
    gsap.fromTo(headerRef.current,
      { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" },
      { opacity: 0, y: -30 }
    );
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const projectsData = await ProjectService.getProjects();
      setProjects(projectsData);

      const stats: Statistics = {
        totalProjects: projectsData.length,
        activeProjects: projectsData.filter((p) => p.status === ProjectStatus.ACTIVE).length,
        completedProjects: projectsData.filter((p) => p.status === ProjectStatus.COMPLETED).length,
        totalTasks: 0,
        completedTasks: 0,
        pendingTasks: 0,
        blockedTasks: 0,
        totalSprints: 0,
        activeSprints: 0,
        nearEndSprints: 0,
        projectProgress: 0,
        overdueTasks: 0,
        averageTasksPerSprint: 0,
      };

      const tasksData = await TaskService.getTasks();
      stats.totalTasks = tasksData.length;
      stats.completedTasks = tasksData.filter((t) => t.status === TaskStatus.COMPLETED).length;
      stats.pendingTasks = tasksData.filter(
        (t) => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS
      ).length;
      stats.blockedTasks = tasksData.filter((t) => t.status === TaskStatus.BLOCKED).length;

      const today = new Date();
      stats.overdueTasks = tasksData.filter((t) => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today && t.status !== TaskStatus.COMPLETED;
      }).length;

      const sprintsData = await SprintService.getSprints();
      stats.totalSprints = sprintsData.length;
      stats.activeSprints = sprintsData.filter((s) => s.status === SprintStatus.ACTIVE).length;

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      stats.nearEndSprints = sprintsData.filter((s) => {
        const endDate = new Date(s.end_date);
        return (
          endDate <= threeDaysFromNow && endDate >= today && s.status === SprintStatus.ACTIVE
        );
      }).length;

      if (stats.totalTasks > 0) {
        stats.projectProgress = Math.round((stats.completedTasks / stats.totalTasks) * 100);
      }

      if (stats.totalSprints > 0) {
        stats.averageTasksPerSprint = Math.round(stats.totalTasks / stats.totalSprints);
      }

      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching report data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchProjectSpecificData = async (projectId: number) => {
    setIsLoading(true);
    try {
      const tasksData = await TaskService.getTasks({ project_id: projectId });
      const sprintsData = await SprintService.getSprints({ project_id: projectId });

      const stats = {
        ...statistics,
        totalTasks: tasksData.length,
        completedTasks: tasksData.filter((t) => t.status === TaskStatus.COMPLETED).length,
        pendingTasks: tasksData.filter(
          (t) => t.status === TaskStatus.TODO || t.status === TaskStatus.IN_PROGRESS
        ).length,
        blockedTasks: tasksData.filter((t) => t.status === TaskStatus.BLOCKED).length,
        totalSprints: sprintsData.length,
        activeSprints: sprintsData.filter((s) => s.status === SprintStatus.ACTIVE).length,
      };

      const today = new Date();
      stats.overdueTasks = tasksData.filter((t) => {
        if (!t.due_date) return false;
        const dueDate = new Date(t.due_date);
        return dueDate < today && t.status !== TaskStatus.COMPLETED;
      }).length;

      const threeDaysFromNow = new Date();
      threeDaysFromNow.setDate(today.getDate() + 3);

      stats.nearEndSprints = sprintsData.filter((s) => {
        const endDate = new Date(s.end_date);
        return (
          endDate <= threeDaysFromNow && endDate >= today && s.status === SprintStatus.ACTIVE
        );
      }).length;

      if (stats.totalTasks > 0) {
        stats.projectProgress = Math.round((stats.completedTasks / stats.totalTasks) * 100);
      } else {
        stats.projectProgress = 0;
      }

      if (stats.totalSprints > 0) {
        stats.averageTasksPerSprint = Math.round(stats.totalTasks / stats.totalSprints);
      } else {
        stats.averageTasksPerSprint = 0;
      }

      setStatistics(stats);
    } catch (error) {
      console.error('Error fetching project specific data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (selectedProject === 'all') {
      return;
    }
    fetchProjectSpecificData(parseInt(selectedProject));
  }, [selectedProject]);

  const handleReportClick = (route: string) => {
    gsap.to([headerRef.current], {
      opacity: 0,
      y: -20,
      duration: 0.3,
      ease: "power2.in",
      onComplete: () => router.push(route)
    });
  };

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div 
            ref={headerRef}
            className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4"
          >
            <h1 className="text-2xl font-bold text-foreground">Panel de Informes</h1>

            <Select value={selectedProject} onValueChange={setSelectedProject}>
              <SelectTrigger className="w-full sm:w-64 hover:scale-105 transition-transform">
                <SelectValue placeholder="Selecciona un proyecto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los proyectos</SelectItem>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id?.toString() || ''}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : (
            <>
              <ReportsMetrics statistics={statistics} isLoading={isLoading} />
              <ReportsSummary statistics={statistics} isLoading={isLoading} />
              <ReportsDetailed isLoading={isLoading} onReportClick={handleReportClick} />
            </>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}