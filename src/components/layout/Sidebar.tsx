// src/components/layout/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Layers, 
  CheckSquare, 
  Users, 
  Calendar, 
  BarChart2,
  Settings,
  Home
} from "lucide-react";
import { UserRole } from '@/core/interfaces/models';

interface SidebarProps {
  className?: string;
  userRole?: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({
  className,
  userRole = UserRole.DEVELOPER,
}) => {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path || pathname?.startsWith(`${path}/`);
  };

  const navItems = [
    {
      title: 'Inicio',
      icon: <Home className="h-5 w-5" />,
      href: '/',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER],
    },
    {
      title: 'Proyectos',
      icon: <Layers className="h-5 w-5" />,
      href: '/projects',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER],
    },
    {
      title: 'Tareas',
      icon: <CheckSquare className="h-5 w-5" />,
      href: '/tasks',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER],
    },
    {
      title: 'Sprints',
      icon: <Calendar className="h-5 w-5" />,
      href: '/sprints',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER],
    },
    {
      title: 'Equipo',
      icon: <Users className="h-5 w-5" />,
      href: '/users',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER],
    },
    {
      title: 'Informes',
      icon: <BarChart2 className="h-5 w-5" />,
      href: '/reports',
      roles: [UserRole.ADMIN, UserRole.MANAGER, UserRole.DEVELOPER, UserRole.TESTER],
    },
    {
      title: 'Configuración',
      icon: <Settings className="h-5 w-5" />,
      href: '/settings',
      roles: [UserRole.ADMIN, UserRole.DEVELOPER, UserRole.TESTER, UserRole.MANAGER],
    },
  ];

  // Filtrar elementos de navegación según el rol del usuario
  const filteredNavItems = navItems.filter(item => 
    item.roles.includes(userRole)
  );

  return (
    <div className={cn("pb-12 border-r h-full", className)}>
      <div className="space-y-4 py-4">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight">
            Navegación
          </h2>
          <ScrollArea className="h-[calc(100vh-9rem)]">
            <div className="space-y-1">
              {filteredNavItems.map((item, index) => (
                <Link key={index} href={item.href} passHref>
                  <Button
                    variant={isActive(item.href) ? "secondary" : "ghost"}
                    size="sm"
                    className="w-full justify-start"
                  >
                    {item.icon}
                    <span className="ml-2">{item.title}</span>
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
