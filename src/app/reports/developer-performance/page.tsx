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
import { Badge } from '@/components/ui/badge';
import { UserRole } from '@/core/interfaces/models';
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

import ProtectedRoute from '@/components/auth/ProtectedRoute';


// Datos mock para desarrolladores
const mockDevelopers = [
    { id: 1, username: 'jesusbanales', fullName: 'Jesus Enrique Bañales Lopez | A01642425' },
    { id: 2, username: 'luiscuevas', fullName: 'Luis Fernando Cuevas Arroyo | A01647254' },
    { id: 3, username: 'carlostellez', fullName: 'Carlos Tellez Bermudez | A01637089' },
    { id: 4, username: 'aaronhernandez', fullName: 'Aaron Hernandez Jimenez | A01642529' },
    { id: 5, username: 'diegovillanueva', fullName: 'Diego Villanueva Terrazas | A01568601' },
    { id: 6, username: 'arambarsegyan', fullName: 'Aram Barsegyan | A01642781' }
  ];
  
  // Datos mock para sprints
  const mockSprints = [
    { id: 1, name: 'Sprint 1', startDate: '2025-03-23', endDate: '2025-04-03' },
    { id: 2, name: 'Sprint 2', startDate: '2025-04-06', endDate: '2025-04-26' },
    { id: 3, name: 'Sprint 3', startDate: '2025-04-27', endDate: '2025-05-15' }
  ];
  
  // Datos mock para rendimiento por desarrollador
  const mockPerformanceData = [
    // Sprint 1
    { sprintId: 1, sprintName: 'Sprint 1', developerId: 1, developerName: 'Jesus Enrique Bañales Lopez | A01642425', hoursWorked: 16, tasksCompleted: 4 },
    { sprintId: 1, sprintName: 'Sprint 1', developerId: 2, developerName: 'Luis Fernando Cuevas Arroyo | A01647254', hoursWorked: 12, tasksCompleted: 3 },
    { sprintId: 1, sprintName: 'Sprint 1', developerId: 3, developerName: 'Carlos Tellez Bermudez | A01637089', hoursWorked: 14, tasksCompleted: 3 },
    { sprintId: 1, sprintName: 'Sprint 1', developerId: 4, developerName: 'Aaron Hernandez Jimenez | A01642529', hoursWorked: 10, tasksCompleted: 2 },
    { sprintId: 1, sprintName: 'Sprint 1', developerId: 5, developerName: 'Diego Villanueva Terrazas | A01568601', hoursWorked: 18, tasksCompleted: 4 },
    { sprintId: 1, sprintName: 'Sprint 1', developerId: 6, developerName: 'Aram Barsegyan | A01642781', hoursWorked: 13, tasksCompleted: 3 },
  
    // Sprint 2
    { sprintId: 2, sprintName: 'Sprint 2', developerId: 1, developerName: 'Jesus Enrique Bañales Lopez | A01642425', hoursWorked: 14, tasksCompleted: 3 },
    { sprintId: 2, sprintName: 'Sprint 2', developerId: 2, developerName: 'Luis Fernando Cuevas Arroyo | A01647254', hoursWorked: 20, tasksCompleted: 5 },
    { sprintId: 2, sprintName: 'Sprint 2', developerId: 3, developerName: 'Carlos Tellez Bermudez | A01637089', hoursWorked: 8, tasksCompleted: 2 },
    { sprintId: 2, sprintName: 'Sprint 2', developerId: 4, developerName: 'Aaron Hernandez Jimenez | A01642529', hoursWorked: 13, tasksCompleted: 3 },
    { sprintId: 2, sprintName: 'Sprint 2', developerId: 5, developerName: 'Diego Villanueva Terrazas | A01568601', hoursWorked: 19, tasksCompleted: 4 },
    { sprintId: 2, sprintName: 'Sprint 2', developerId: 6, developerName: 'Aram Barsegyan | A01642781', hoursWorked: 15, tasksCompleted: 4 },
  
    // Sprint 3
    { sprintId: 3, sprintName: 'Sprint 3', developerId: 1, developerName: 'Jesus Enrique Bañales Lopez | A01642425', hoursWorked: 17, tasksCompleted: 4 },
    { sprintId: 3, sprintName: 'Sprint 3', developerId: 2, developerName: 'Luis Fernando Cuevas Arroyo | A01647254', hoursWorked: 15, tasksCompleted: 3 },
    { sprintId: 3, sprintName: 'Sprint 3', developerId: 3, developerName: 'Carlos Tellez Bermudez | A01637089', hoursWorked: 11, tasksCompleted: 2 },
    { sprintId: 3, sprintName: 'Sprint 3', developerId: 4, developerName: 'Aaron Hernandez Jimenez | A01642529', hoursWorked: 20, tasksCompleted: 5 },
    { sprintId: 3, sprintName: 'Sprint 3', developerId: 5, developerName: 'Diego Villanueva Terrazas | A01568601', hoursWorked: 18, tasksCompleted: 4 },
    { sprintId: 3, sprintName: 'Sprint 3', developerId: 6, developerName: 'Aram Barsegyan | A01642781', hoursWorked: 16, tasksCompleted: 3 }
  ];
  
  

// Interfaz para los datos de las gráficas
interface ChartData {
  sprint: string;
  [key: string]: string | number;
}

export default function DeveloperPerformancePage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [selectedSprint, setSelectedSprint] = useState<string>('all');
  const [selectedDeveloper, setSelectedDeveloper] = useState<string>('all');
  const [hoursWorkedChartData, setHoursWorkedChartData] = useState<ChartData[]>([]);
  const [tasksCompletedChartData, setTasksCompletedChartData] = useState<ChartData[]>([]);
  const [totalHoursPerSprintData, setTotalHoursPerSprintData] = useState<ChartData[]>([]);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
  };

  // Colores para los diferentes desarrolladores en las gráficas
  const developerColors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088fe', 
    '#00c49f', '#ffbb28', '#ff8042', '#a4de6c', '#d0ed57'
  ];

  useEffect(() => {
    // Simular carga de datos
    setIsLoading(true);
    setTimeout(() => {
      prepareChartData(mockPerformanceData, mockSprints, mockDevelopers);
      setIsLoading(false);
    }, 1000);
  }, []);

  // Preparar datos para las gráficas
  const prepareChartData = (
    performance: typeof mockPerformanceData,
    sprints: typeof mockSprints,
    developers: typeof mockDevelopers
  ) => {
    // 1. Datos para la gráfica de horas totales por sprint
    const totalHoursData: ChartData[] = sprints.map(sprint => {
      const sprintPerf = performance.filter(p => p.sprintId === sprint.id);
      return {
        sprint: sprint.name,
        totalHours: sprintPerf.reduce((sum, p) => sum + p.hoursWorked, 0)
      };
    });
    
    setTotalHoursPerSprintData(totalHoursData);
    
    // 2. Datos para la gráfica de horas trabajadas por desarrollador por sprint
    const hoursData: ChartData[] = [];
    
    for (const sprint of sprints) {
      const sprintData: ChartData = { sprint: sprint.name };
      
      for (const dev of developers) {
        const devPerf = performance.find(
          p => p.sprintId === sprint.id && p.developerId === dev.id
        );
        
        sprintData[dev.username] = devPerf ? devPerf.hoursWorked : 0;
      }
      
      hoursData.push(sprintData);
    }
    
    setHoursWorkedChartData(hoursData);
    
    // 3. Datos para la gráfica de tareas completadas por desarrollador por sprint
    const tasksData: ChartData[] = [];
    
    for (const sprint of sprints) {
      const sprintData: ChartData = { sprint: sprint.name };
      
      for (const dev of developers) {
        const devPerf = performance.find(
          p => p.sprintId === sprint.id && p.developerId === dev.id
        );
        
        sprintData[dev.username] = devPerf ? devPerf.tasksCompleted : 0;
      }
      
      tasksData.push(sprintData);
    }
    
    setTasksCompletedChartData(tasksData);
  };

  // Filtrar datos de rendimiento cuando cambian los filtros
  useEffect(() => {
    if (selectedSprint !== 'all' || selectedDeveloper !== 'all') {
      const filteredPerformance = mockPerformanceData.filter(data => {
        const sprintMatch = selectedSprint === 'all' || data.sprintId === parseInt(selectedSprint);
        const devMatch = selectedDeveloper === 'all' || data.developerId === parseInt(selectedDeveloper);
        return sprintMatch && devMatch;
      });
      
      // Re-preparar los datos de las gráficas basados en los filtros
      const filteredSprints = mockSprints.filter(
        sprint => selectedSprint === 'all' || sprint.id === parseInt(selectedSprint)
      );
      
      const filteredDevs = mockDevelopers.filter(
        dev => selectedDeveloper === 'all' || dev.id === parseInt(selectedDeveloper)
      );
      
      prepareChartData(filteredPerformance, filteredSprints, filteredDevs);
    } else {
      // Si no hay filtros, usar todos los datos
      prepareChartData(mockPerformanceData, mockSprints, mockDevelopers);
    }
  }, [selectedSprint, selectedDeveloper]);

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

          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Select value={selectedSprint} onValueChange={setSelectedSprint}>
              <SelectTrigger className="w-full sm:w-44">
                <SelectValue placeholder="Sprint" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los sprints</SelectItem>
                {mockSprints.map(sprint => (
                  <SelectItem key={sprint.id} value={sprint.id.toString()}>
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
                {mockDevelopers.map(dev => (
                  <SelectItem key={dev.id} value={dev.id.toString()}>
                    {dev.fullName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Mostrar indicadores o métricas clave */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-500">Desarrolladores</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {selectedDeveloper === 'all' ? mockDevelopers.length : 1}
                    </h3>
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
                    <h3 className="text-2xl font-bold mt-1">
                      {selectedSprint === 'all' ? mockSprints.length : 1}
                    </h3>
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
                    <p className="text-sm font-medium text-gray-500">Tareas completadas</p>
                    <h3 className="text-2xl font-bold mt-1">
                      {mockPerformanceData
                        .filter(p => 
                          (selectedSprint === 'all' || p.sprintId === parseInt(selectedSprint)) &&
                          (selectedDeveloper === 'all' || p.developerId === parseInt(selectedDeveloper))
                        )
                        .reduce((sum, p) => sum + p.tasksCompleted, 0)}
                    </h3>
                  </div>
                  <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                    <CheckCircle2 className="h-6 w-6 text-purple-600" />
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
              {/* Gráfica 1: Horas Totales trabajadas por Sprint */}
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

              {/* Gráfica 2: Horas Trabajadas por Developer por Sprint */}
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
                        {mockDevelopers
                          .filter(dev => selectedDeveloper === 'all' || dev.id === parseInt(selectedDeveloper))
                          .map((dev, index) => (
                            <Bar 
                              key={dev.id} 
                              dataKey={dev.username} 
                              name={dev.fullName} 
                              fill={developerColors[index % developerColors.length]} 
                            />
                          ))}
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Gráfica 3: Tareas Completadas por Developer por Sprint */}
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
                        {mockDevelopers
                          .filter(dev => selectedDeveloper === 'all' || dev.id === parseInt(selectedDeveloper))
                          .map((dev, index) => (
                            <Bar 
                              key={dev.id} 
                              dataKey={dev.username} 
                              name={dev.fullName} 
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