// src/components/users/UserCard.tsx
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { IUser, UserRole, WorkMode } from '@/core/interfaces/models';
import { User, Briefcase, Mail, MapPin } from 'lucide-react';

interface UserCardProps {
  user: IUser;
  projectCount?: number;
  onClick?: () => void;
}

const UserCard: React.FC<UserCardProps> = ({ user, projectCount = 0, onClick }) => {
  // Función para obtener el badge de rol
  const getRoleBadge = (role: string) => {
    switch (role) {
      case UserRole.ADMIN:
        return (
          <Badge variant="default" className="bg-purple-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Admin
          </Badge>
        );
      case UserRole.MANAGER:
        return (
          <Badge variant="default" className="bg-blue-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Manager
          </Badge>
        );
      case UserRole.DEVELOPER:
        return (
          <Badge variant="default" className="bg-green-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Developer
          </Badge>
        );
      case UserRole.TESTER:
        return (
          <Badge variant="default" className="bg-yellow-500 transition-all duration-300 group-hover:scale-105 group-hover:shadow-lg">
            Tester
          </Badge>
        );
      default:
        return <Badge variant="outline" className="transition-all duration-300 group-hover:scale-105">Desconocido</Badge>;
    }
  };

  // Función para obtener el badge de modo de trabajo
  const getWorkModeBadge = (workMode: string) => {
    switch (workMode) {
      case WorkMode.OFFICE:
        return (
          <Badge variant="outline" className="bg-gray-100 transition-all duration-300 group-hover:scale-105">
            Oficina
          </Badge>
        );
      case WorkMode.REMOTE:
        return (
          <Badge variant="outline" className="bg-blue-100 text-blue-800 transition-all duration-300 group-hover:scale-105">
            Remoto
          </Badge>
        );
      case WorkMode.HYBRID:
        return (
          <Badge variant="outline" className="bg-green-100 text-green-800 transition-all duration-300 group-hover:scale-105">
            Híbrido
          </Badge>
        );
      default:
        return <Badge variant="outline" className="transition-all duration-300 group-hover:scale-105">Desconocido</Badge>;
    }
  };

  // Función para obtener las iniciales del nombre
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((part) => part.charAt(0))
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Función para obtener un color basado en el nombre (para avatares)
  const getColorFromName = (name: string) => {
    const colors = [
      'bg-blue-500',
      'bg-green-500',
      'bg-purple-500',
      'bg-yellow-500',
      'bg-pink-500',
      'bg-indigo-500',
      'bg-red-500',
      'bg-teal-500',
    ];

    const sum = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[sum % colors.length];
  };

  return (
    <Card 
      className="w-full group cursor-pointer relative overflow-hidden transition-all duration-500 ease-out hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-2 hover:scale-[1.02] border-2 hover:border-indigo-300/50 dark:hover:border-indigo-600/50"
      onClick={onClick}
    >
      {/* Animated background gradient on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-50/0 via-cyan-50/0 to-purple-50/0 group-hover:from-indigo-50/30 group-hover:via-cyan-50/20 group-hover:to-purple-50/30 dark:group-hover:from-indigo-950/20 dark:group-hover:via-cyan-950/10 dark:group-hover:to-purple-950/20 transition-all duration-700 ease-out"></div>
      
      {/* Subtle animated border shimmer */}
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-200/0 to-transparent group-hover:via-indigo-200/50 dark:group-hover:via-indigo-700/30 animate-shimmer opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

      <CardContent className="p-6 relative z-10">
        <div className="flex items-start space-x-4">
          <div
            className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold transition-all duration-300 group-hover:scale-110 group-hover:shadow-lg transform-gpu ${getColorFromName(user.full_name)}`}
          >
            {getInitials(user.full_name)}
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-lg transition-all duration-300 group-hover:text-indigo-700 dark:group-hover:text-indigo-300 group-hover:scale-105 transform-gpu">
              {user.full_name}
            </h3>
            <div className="flex items-center space-x-2 mt-1">
              {getRoleBadge(user.role)}
              {getWorkModeBadge(user.work_mode)}
            </div>

            <div className="mt-4 space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <div className="flex items-center transition-all duration-300 group-hover:translate-x-2 transform-gpu">
                <User className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="transition-all duration-300 group-hover:text-foreground/80">{user.username}</span>
              </div>
              <div className="flex items-center transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-75">
                <Mail className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="transition-all duration-300 group-hover:text-foreground/80">{user.email}</span>
              </div>
              <div className="flex items-center transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-150">
                <Briefcase className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="transition-all duration-300 group-hover:text-foreground/80">{projectCount} proyectos</span>
              </div>
              <div className="flex items-center transition-all duration-300 group-hover:translate-x-2 transform-gpu delay-200">
                <MapPin className="h-4 w-4 mr-2 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:text-indigo-600 dark:group-hover:text-indigo-400" />
                <span className="transition-all duration-300 group-hover:text-foreground/80">
                  {user.work_mode === WorkMode.OFFICE
                    ? 'Trabaja en oficina'
                    : user.work_mode === WorkMode.REMOTE
                      ? 'Trabaja remoto'
                      : 'Modo híbrido'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
      
      <style jsx>{`
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  );
};

export default UserCard;