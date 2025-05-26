// src/app/tasks/[id]/page.tsx
'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ITask, ISubtask, IComment, TaskStatus, UserRole } from '@/core/interfaces/models';
import Link from 'next/link';
import {
  ChevronLeft,
  Clock,
  Calendar,
  Users,
  CheckCircle2,
  XCircle,
  Edit,
  Trash,
  PlusCircle,
  Timer,
  BarChart3,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';

// Importamos los servicios reales de API
import { TaskService, SubtaskService, CommentService, TaskAssigneeService, UserService } from '@/services/api';
import ProtectedRoute from '@/components/auth/ProtectedRoute';

export default function TaskDetailPage() {
  const params = useParams();
  const router = useRouter();
  const taskId = Number(params.id);

  const [task, setTask] = useState<ITask | null>(null);
  const [subtasks, setSubtasks] = useState<ISubtask[]>([]);
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Estados para gestión de asignados
  const [isAddAssigneeDialogOpen, setIsAddAssigneeDialogOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const [isAddingAssignee, setIsAddingAssignee] = useState(false);
  const [isDeletingAssignee, setIsDeletingAssignee] = useState<number | null>(null);

  // El usuario por defecto para esta demo
  const demoUser = {
    username: 'djeison',
    userRole: UserRole.MANAGER,
    id: 12,
  };

  // Cargar usuarios disponibles para asignar
  const fetchAvailableUsers = async () => {
    setIsLoadingUsers(true);
    try {
      const users = await UserService.getUsers();
      const existingAssigneeIds = task?.asignees?.map(assignee => assignee.id) || [];
      const filteredUsers = users.filter(user => !existingAssigneeIds.includes(user.id));
      setAvailableUsers(filteredUsers);
    } catch (err) {
      console.error('Error al cargar usuarios disponibles:', err);
    } finally {
      setIsLoadingUsers(false);
    }
  };

  // Asignar usuario a la tarea
// Simplify the handleAddAssignee function
const handleAddAssignee = async () => {
  if (!selectedUserId || !task) return;

  setIsAddingAssignee(true);
  try {
    const newAssignee = {
      task_id: task.id!,
      user_id: parseInt(selectedUserId)
    };

    const added = await TaskAssigneeService.addTaskAssignee(newAssignee);
    if (added) {
      await fetchTaskDetails();
      setIsAddAssigneeDialogOpen(false);
      setSelectedUserId('');
    }
  } catch (error) {
    console.error('Error al asignar usuario:', error);
  } finally {
    setIsAddingAssignee(false);
  }
};
  // Desasignar usuario de la tarea
  const handleRemoveAssignee = async (userId: number) => {
    if (!task) return;

    setIsDeletingAssignee(userId);
    try {
      const success = await TaskAssigneeService.removeTaskAssignee(task.id!, userId);
      if (success) {
        await fetchTaskDetails();
      }
    } catch (error) {
      console.error('Error al desasignar usuario:', error);
    } finally {
      setIsDeletingAssignee(null);
    }
  };

  const fetchTaskDetails = async () => {
    setIsLoading(true);
    try {
      const taskData = await TaskService.getTaskById(taskId);
      if (taskData) {
        setTask(taskData);

        if (taskData.subtasks) {
          setSubtasks(taskData.subtasks);
        }

        if (taskData.comments) {
          setComments(taskData.comments);
        }
      } else {
        console.error(`Task with ID ${taskId} not found`);
        router.push('/tasks');
      }
    } catch (error) {
      console.error(`Error fetching task ${taskId}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (taskId) {
      fetchTaskDetails();
    }
  }, [taskId, router]);

  useEffect(() => {
    if (isAddAssigneeDialogOpen) {
      fetchAvailableUsers();
    }
  }, [isAddAssigneeDialogOpen, task]);

  // Helper para obtener badge según el estado
  const getStatusBadge = (status: TaskStatus) => {
    switch (status) {
      case TaskStatus.TODO:
        return (
          <Badge variant="outline" className="bg-muted">
            Por hacer
          </Badge>
        );
      case TaskStatus.IN_PROGRESS:
        return (
          <Badge variant="default" className="bg-blue-500">
            En progreso
          </Badge>
        );
      case TaskStatus.COMPLETED:
        return (
          <Badge variant="default" className="bg-green-500">
            Completado
          </Badge>
        );
      case TaskStatus.BLOCKED:
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline">Desconocido</Badge>;
    }
  };

  // Helper para obtener badge según la prioridad
  const getPriorityBadge = (priority: number) => {
    switch (priority) {
      case 1:
        return (
          <Badge variant="outline" className="bg-muted">
            Baja
          </Badge>
        );
      case 2:
        return (
          <Badge variant="default" className="bg-yellow-500">
            Media
          </Badge>
        );
      case 3:
        return <Badge variant="destructive">Alta</Badge>;
      default:
        return <Badge variant="outline">Desconocida</Badge>;
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Sin fecha';
    const date = new Date(dateString);
    return date.toLocaleDateString();
  };

  // Cambiar el estado de una tarea
  const handleStatusChange = async (status: TaskStatus) => {
    if (!task) return;

    try {
      const updatedTask = await TaskService.updateTask(task.id!, { status });
      if (updatedTask) {
        setTask(updatedTask);
      }
    } catch (error) {
      console.error(`Error updating task status:`, error);
    }
  };

  // Cambiar el estado de una subtarea
  const handleSubtaskStatusChange = async (subtaskId: number, status: TaskStatus) => {
    try {
      const updatedSubtask = await SubtaskService.updateSubtask(subtaskId, { status });
      if (updatedSubtask) {
        setSubtasks((prev) =>
          prev.map((subtask) => (subtask.id === subtaskId ? updatedSubtask : subtask))
        );
      }
    } catch (error) {
      console.error(`Error updating subtask status:`, error);
    }
  };

  // Añadir un comentario
  const handleAddComment = async () => {
    if (!newComment.trim() || !task || isSubmittingComment) return;

    setIsSubmittingComment(true);
    try {
      const commentData = {
        content: newComment,
        task_id: task.id!,
        user_id: demoUser.id,
      };

      const createdComment = await CommentService.createComment(commentData);
      if (createdComment) {
        setComments((prev) => [...prev, createdComment]);
        setNewComment('');
      }
    } catch (error) {
      console.error(`Error adding comment:`, error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <ProtectedRoute
        requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER]}
      >
        <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  if (!task) {
    return (
      <ProtectedRoute
        requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER]}
      >
        <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
          <div className="text-center p-8">
            <h2 className="text-2xl font-bold text-foreground mb-2">Tarea no encontrada</h2>
            <p className="text-muted-foreground mb-6">
              La tarea que estás buscando no existe o ha sido eliminada.
            </p>
            <Link href="/tasks" passHref>
              <Button>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a la lista de tareas
              </Button>
            </Link>
          </div>
        </MainLayout>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute
      requiredRoles={[UserRole.DEVELOPER, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER]}
    >
      <MainLayout username={demoUser.username} userRole={demoUser.userRole}>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/tasks" passHref>
                <Button variant="outline" size="sm">
                  <ChevronLeft className="h-4 w-4 mr-1" /> Volver
                </Button>
              </Link>
              <h1 className="text-2xl font-bold text-foreground">{task.title}</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Link href={`/tasks/${task.id}/edit`} passHref>
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4 mr-1" /> Editar
                </Button>
              </Link>
              <Button variant="destructive" size="sm">
                <Trash className="h-4 w-4 mr-1" /> Eliminar
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Información principal */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Detalles de la tarea</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Descripción</h3>
                    <p className="text-foreground">{task.description}</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Estado</h3>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(task.status)}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Prioridad</h3>
                      <div className="flex items-center space-x-2">
                        {getPriorityBadge(task.priority)}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start">
                      <Calendar className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Fecha de vencimiento</h3>
                        <p className="text-foreground">{formatDate(task.due_date)}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <Clock className="h-5 w-5 text-muted-foreground mr-2 mt-0.5" />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Horas estimadas</h3>
                        <p className="text-foreground">{task.estimated_hours} horas</p>
                      </div>
                    </div>
                  </div>

                  {task.real_hours && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex items-start">
                        <Timer className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Horas reales trabajadas</h3>
                          <p className="text-foreground">{task.real_hours} horas</p>
                        </div>
                      </div>
                      <div className="flex items-start">
                        <BarChart3 className="h-5 w-5 text-purple-500 mr-2 mt-0.5" />
                        <div>
                          <h3 className="text-sm font-medium text-muted-foreground">Eficiencia</h3>
                          <p className={`font-medium ${
                            task.real_hours <= task.estimated_hours 
                              ? 'text-green-600' 
                              : task.real_hours <= task.estimated_hours * 1.5 
                              ? 'text-yellow-600' 
                              : 'text-red-600'
                          }`}>
                            {((task.estimated_hours / task.real_hours) * 100).toFixed(0)}%
                            {task.real_hours <= task.estimated_hours && ' ✓'}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 border-t border-border">
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">Cambiar estado</h3>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant={task.status === TaskStatus.TODO ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(TaskStatus.TODO)}
                      >
                        Por hacer
                      </Button>
                      <Button
                        variant={task.status === TaskStatus.IN_PROGRESS ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(TaskStatus.IN_PROGRESS)}
                      >
                        En progreso
                      </Button>
                      <Button
                        variant={task.status === TaskStatus.COMPLETED ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(TaskStatus.COMPLETED)}
                      >
                        Completado
                      </Button>
                      <Button
                        variant={task.status === TaskStatus.BLOCKED ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(TaskStatus.BLOCKED)}
                      >
                        Bloqueado
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Subtareas */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Subtareas</CardTitle>
                  <Link href={`/tasks/${task.id}/subtasks/new`} passHref>
                    <Button variant="outline" size="sm">
                      <PlusCircle className="h-4 w-4 mr-1" /> Añadir subtarea
                    </Button>
                  </Link>
                </CardHeader>
                <CardContent>
                  {subtasks && subtasks.length > 0 ? (
                    <div className="space-y-3">
                      {subtasks.map((subtask) => (
                        <div
                          key={subtask.id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-md"
                        >
                          <div className="flex-1">
                            <h4 className="font-medium text-foreground">{subtask.title}</h4>
                            <p className="text-sm text-muted-foreground">{subtask.description}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            {getStatusBadge(subtask.status)}
                            {subtask.status !== TaskStatus.COMPLETED ? (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSubtaskStatusChange(subtask.id!, TaskStatus.COMPLETED)
                                }
                              >
                                <CheckCircle2 className="h-4 w-4 text-green-500" />
                              </Button>
                            ) : (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() =>
                                  handleSubtaskStatusChange(subtask.id!, TaskStatus.TODO)
                                }
                              >
                                <XCircle className="h-4 w-4 text-red-500" />
                              </Button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No hay subtareas para esta tarea
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Comentarios */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Comentarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {comments && comments.length > 0 ? (
                      <div className="space-y-4">
                        {comments.map((comment) => (
                          <div key={comment.id} className="bg-muted/50 p-4 rounded-md">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                                  {comment.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="ml-2">
                                  <p className="font-medium text-foreground">
                                    {comment.user?.username || 'Usuario'}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {comment.created_at
                                      ? new Date(comment.created_at).toLocaleString()
                                      : 'Sin fecha'}
                                  </p>
                                </div>
                              </div>
                            </div>
                            <p className="text-foreground">{comment.content}</p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 text-muted-foreground">
                        No hay comentarios para esta tarea
                      </div>
                    )}

                    <div className="mt-4">
                      <Textarea
                        placeholder="Añadir un comentario..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        rows={3}
                        className="mb-2"
                      />
                      <Button
                        onClick={handleAddComment}
                        disabled={!newComment.trim() || isSubmittingComment}
                      >
                        {isSubmittingComment ? 'Enviando...' : 'Añadir comentario'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Información lateral */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Información adicional</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Proyecto</h3>
                    <p className="text-foreground">
                      {task.sprint_id ? (
                        <Link
                          href={`/projects/${task.sprint_id}`}
                          className="text-blue-500 hover:underline"
                        >
                          Proyecto #{task.sprint_id}
                        </Link>
                      ) : (
                        'Sin proyecto asignado'
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Sprint</h3>
                    <p className="text-foreground">
                      {task.sprint_id ? (
                        <Link
                          href={`/sprints/${task.sprint_id}`}
                          className="text-blue-500 hover:underline"
                        >
                          Sprint #{task.sprint_id}
                        </Link>
                      ) : (
                        'Sin sprint asignado'
                      )}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Fecha de creación</h3>
                    <p className="text-foreground">{formatDate(task.created_at)}</p>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-1">Última actualización</h3>
                    <p className="text-foreground">{formatDate(task.updated_at)}</p>
                  </div>
                </CardContent>
              </Card>

              {/* Usuarios asignados */}
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="text-lg">Asignados</CardTitle>
                  <Dialog open={isAddAssigneeDialogOpen} onOpenChange={setIsAddAssigneeDialogOpen}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Users className="h-4 w-4 mr-1" /> Asignar usuario
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Asignar Usuario a la Tarea</DialogTitle>
                        <DialogDescription>
                          Selecciona un usuario para asignar a esta tarea.
                        </DialogDescription>
                      </DialogHeader>
                      
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="user">Usuario</Label>
                          <Select onValueChange={setSelectedUserId} value={selectedUserId}>
                            <SelectTrigger id="user" className="w-full">
                              <SelectValue placeholder="Selecciona un usuario" />
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingUsers ? (
                                <SelectItem value="loading" disabled>Cargando usuarios...</SelectItem>
                              ) : availableUsers.length > 0 ? (
                                availableUsers.map(user => (
                                  <SelectItem key={user.id} value={String(user.id)}>
                                    {user.username} ({user.email})
                                  </SelectItem>
                                ))
                              ) : (
                                <SelectItem value="none" disabled>No hay usuarios disponibles</SelectItem>
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                        

                      </div>
                      
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsAddAssigneeDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button onClick={handleAddAssignee} disabled={isAddingAssignee || !selectedUserId}>
                          {isAddingAssignee ? 'Asignando...' : 'Asignar Usuario'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </CardHeader>
                <CardContent>
                  {task.asignees && task.asignees.length > 0 ? (
                    <div className="space-y-3">
                      {task.asignees.map((assignee) => (
                        <div key={assignee.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center space-x-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold">
                              {assignee.username.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-medium text-foreground">{assignee.fullName || assignee.username}</p>
                              <p className="text-xs text-muted-foreground">{assignee.email}</p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">Asignado</Badge>
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button 
                                  variant="ghost" 
                                  size="sm" 
                                  className="h-8 w-8 p-0"
                                  disabled={isDeletingAssignee === assignee.id}
                                >
                                  <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>¿Desasignar usuario?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    ¿Estás seguro de que deseas desasignar a {assignee.fullName || assignee.username} de esta tarea?
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction 
                                    onClick={() => handleRemoveAssignee(assignee.id)}
                                    className="bg-red-600 hover:bg-red-700"
                                  >
                                    Desasignar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                      <p>No hay usuarios asignados a esta tarea</p>
                      <Button 
className="mt-4"
                       onClick={() => setIsAddAssigneeDialogOpen(true)}
                     >
                       <Users className="h-4 w-4 mr-2" /> Asignar usuario
                     </Button>
                   </div>
                 )}
               </CardContent>
             </Card>
           </div>
         </div>
       </div>
     </MainLayout>
   </ProtectedRoute>
 );
}