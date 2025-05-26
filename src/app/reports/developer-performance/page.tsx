'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRole, ITask, ISprint } from '@/core/interfaces/models';
import {
  BarChart as BarChartIcon,
  ChevronLeft,
  Download,
  Users,
  Calendar,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

import { TaskService, SprintService, UserService, TaskAssigneeService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

interface DeveloperPerformance {
  sprintId: number;
  sprintName: string;
  developerId: number;
  developerName: string;
  hoursWorked: number;
  tasksCompleted: number;
  tasksAssigned: number;
  efficiency: number;
}

interface ChartData {
  sprint: string;
  [key: string]: string | number;
}

export default function DeveloperPerformancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all');
  const [performanceData, setPerformanceData] = useState<DeveloperPerformance[]>([]);
  const [developers, setDevelopers] = useState<any[]>([]);
  const [sprints, setSprints] = useState<ISprint[]>([]);
  const [hoursWorkedChartData, setHoursWorkedChartData] = useState<ChartData[]>([]);
  const [tasksCompletedChartData, setTasksCompletedChartData] = useState<ChartData[]>([]);
  const [totalHoursPerSprintData, setTotalHoursPerSprintData] = useState<ChartData[]>([]);

  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  const developerColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', 
    '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57'
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // Fetch all required data
      const [tasksData, sprintsData, usersData, assigneesData] = await Promise.all([
        TaskService.getTasks(),
        SprintService.getSprints(),
        UserService.getUsers(),
        TaskAssigneeService.getTaskAssignees()
      ]);

      // Use all users as potential developers
      const developersData = usersData;

      setDevelopers(developersData);
      setSprints(sprintsData);
      console.log('Sample tasks:', tasksData.slice(0, 2));
      console.log('Sample assignees:', assigneesData.slice(0, 2));


      // Calculate performance data
      const performance: DeveloperPerformance[] = [];

      for (const sprint of sprintsData) {
        for (const developer of developersData) {
          // Get tasks assigned to this developer in this sprint
          const developerAssignments = assigneesData.filter(
            assignee => assignee.user_id === developer.id && 
            assignee.task?.sprint_id === sprint.id
          );

          console.log(`Developer ${developer.username} in sprint ${sprint.name}:`, {
            assignments: developerAssignments.length,
            tasks: developerAssignments.map(a => ({
              id: a.task?.id,
              real_hours: a.task?.real_hours,
              status: a.task?.status
            }))
          });
          const assignedTasks = developerAssignments.map(a => a.task).filter(Boolean);
const completedTasks = assignedTasks.filter(task => task.real_hours > 0); // Tasks with real hours worked

          // Calculate total hours worked (sum of real_hours from completed tasks)
          const hoursWorked = completedTasks.reduce((sum, task) => {
            const taskAssignees = assigneesData.filter(a => a.task_id === task.id);
            const assigneeCount = taskAssignees.length || 1;
            return sum + ((task.real_hours || 0) / assigneeCount);
          }, 0);

          // Calculate efficiency (estimated vs real hours)
          const totalEstimated = completedTasks.reduce((sum, task) => 
            sum + task.estimated_hours, 0
          );
          
          const efficiency = totalEstimated > 0 && hoursWorked > 0 
            ? (totalEstimated / hoursWorked) * 100 
            : 0;

          performance.push({
            sprintId: sprint.id!,
            sprintName: sprint.name,
            developerId: developer.id!,
            developerName: developer.full_name || developer.username,
            hoursWorked,
            tasksCompleted: completedTasks.length,
            tasksAssigned: assignedTasks.length,
            efficiency
          });
        }
      }

      setPerformanceData(performance);
      const developersWithData = developersData.filter(dev => 
  performance.some(p => p.developerId === dev.id && (p.hoursWorked > 0 || p.tasksCompleted > 0))
);
setDevelopers(developersWithData);

prepareChartData(performance, sprintsData, developersWithData);
    } catch (error) {
      console.error('Error fetching performance data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const prepareChartData = (
    performance: DeveloperPerformance[],
    sprintsData: ISprint[],
    developersData: any[]
  ) => {
    // Filter based on current selections
    const filteredSprints = selectedSprint === 'all' 
      ? sprintsData 
      : sprintsData.filter(s => s.id === parseInt(selectedSprint));
    
    const filteredDevelopers = selectedDeveloper === 'all'
      ? developersData
      : developersData.filter(d => d.id === parseInt(selectedDeveloper));

    const filteredPerformance = performance.filter(p => 
      (selectedSprint === 'all' || p.sprintId === parseInt(selectedSprint)) &&
      (selectedDeveloper === 'all' || p.developerId === parseInt(selectedDeveloper))
    );

    // 1. Total hours per sprint
    const totalHoursData: ChartData[] = filteredSprints.map(sprint => {
      const sprintPerf = filteredPerformance.filter(p => p.sprintId === sprint.id);
      return {
        sprint: sprint.name,
        totalHours: sprintPerf.reduce((sum, p) => sum + p.hoursWorked, 0)
      };
    });
    setTotalHoursPerSprintData(totalHoursData);

    // 2. Hours worked by developer per sprint
    const hoursData: ChartData[] = filteredSprints.map(sprint => {
      const sprintData: ChartData = { sprint: sprint.name };
      
      filteredDevelopers.forEach(dev => {
        const devPerf = filteredPerformance.find(
          p => p.sprintId === sprint.id && p.developerId === dev.id
        );
        sprintData[dev.username] = devPerf ? devPerf.hoursWorked : 0;
      });
      
      return sprintData;
    });
    setHoursWorkedChartData(hoursData);

    // 3. Tasks completed by developer per sprint
    const tasksData: ChartData[] = filteredSprints.map(sprint => {
      const sprintData: ChartData = { sprint: sprint.name };
      
      filteredDevelopers.forEach(dev => {
        const devPerf = filteredPerformance.find(
          p => p.sprintId === sprint.id && p.developerId === dev.id
        );
        sprintData[dev.username] = devPerf ? devPerf.tasksCompleted : 0;
      });
      
      return sprintData;
    });
    setTasksCompletedChartData(tasksData);
  };

  // Re-prepare chart data when filters change
  useEffect(() => {
    if (performanceData.length > 0) {
      prepareChartData(performanceData, sprints, developers);
    }
  }, [selectedSprint, selectedDeveloper]);

  // Calculate filtered totals for metrics
  const filteredPerformance = performanceData.filter(p => 
    (selectedSprint === 'all' || p.sprintId === parseInt(selectedSprint)) &&
    (selectedDeveloper === 'all' || p.developerId === parseInt(selectedDeveloper))
  );

  const totalTasksCompleted = filteredPerformance.reduce((sum, p) => sum + p.tasksCompleted, 0);
  const totalHoursWorked = filteredPerformance.reduce((sum, p) => sum + p.hoursWorked, 0);
  const averageEfficiency = filteredPerformance.length > 0 
    ? filteredPerformance.reduce((sum, p) => sum + p.efficiency, 0) / filteredPerformance.length 
    : 0;

  const activeDevelopers = selectedDeveloper === 'all' 
    ? [...new Set(filteredPerformance.map(p => p.developerId))].length
    : 1;

  const activeSprints = selectedSprint === 'all'
    ? [...new Set(filteredPerformance.map(p => p.sprintId))].length
    : 1;

  return (
    <ProtectedRoute requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER]}>
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/reports" passHref>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold">Rendimiento por Desarrollador</h1>
            </div>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-1" /> Exportar
            </Button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sprints</SelectItem>
                {sprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id!.toString()}>
                    {sprint.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={selectedDeveloper} onValueChange={setSelectedDeveloper}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Desarrollador" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los desarrolladores</SelectItem>
                {developers.map(dev => (
                  <SelectItem key={dev.id} value={dev.id.toString()}>
                    {dev.full_name || dev.username}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Desarrolladores</p>
                    <h3 className="text-2xl font-bold mt-1">{activeDevelopers}</h3>
                  </div>
                  <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Sprints</p>
                    <h3 className="text-2xl font-bold mt-1">{activeSprints}</h3>
                  </div>
                  <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Tareas Completadas</p>
                    <h3 className="text-2xl font-bold mt-1">{totalTasksCompleted}</h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Horas Trabajadas</p>
                    <h3 className="text-2xl font-bold mt-1">{totalHoursWorked}h</h3>
                  </div>
                  <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Total Hours per Sprint Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    <div className="flex items-center">
                      <Clock className="h-5 w-5 mr-2" />
                      Horas Totales Trabajadas por Sprint
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={totalHoursPerSprintData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="sprint" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value) => [`${value} horas`, 'Total']} />
                        <Legend />
                        <Bar dataKey="totalHours" name="Horas Totales" fill="#8884d8" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Hours Worked by Developer per Sprint */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    <div className="flex items-center">
                      <BarChartIcon className="h-5 w-5 mr-2" />
                      Horas Trabajadas por Desarrollador por Sprint
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={hoursWorkedChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="sprint" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis label={{ value: 'Horas', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value, name) => [`${value} horas`, name]} />
                        <Legend />
                        {developers
                          .filter(dev => selectedDeveloper === 'all' || dev.id === parseInt(selectedDeveloper))
                          .map((dev, index) => (
                            <Bar 
                              key={dev.id} 
                              dataKey={dev.username} 
                              name={dev.full_name || dev.username} 
                              fill={developerColors[index % developerColors.length]} 
                            />
                          ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Completed by Developer per Sprint */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-xl">
                    <div className="flex items-center">
                      <CheckCircle2 className="h-5 w-5 mr-2" />
                      Tareas Completadas por Desarrollador por Sprint
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={tasksCompletedChartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis 
                          dataKey="sprint" 
                          angle={-45} 
                          textAnchor="end"
                          height={70}
                        />
                        <YAxis label={{ value: 'Tareas', angle: -90, position: 'insideLeft' }} />
                        <Tooltip formatter={(value, name) => [`${value} tareas`, name]} />
                        <Legend />
                        {developers
                          .filter(dev => selectedDeveloper === 'all' || dev.id === parseInt(selectedDeveloper))
                          .map((dev, index) => (
                            <Bar 
                              key={dev.id} 
                              dataKey={dev.username} 
                              name={dev.full_name || dev.username} 
                              fill={developerColors[index % developerColors.length]} 
                            />
                          ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </MainLayout>
    </ProtectedRoute>
  );
}