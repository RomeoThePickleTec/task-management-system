// src/components/layout/Sidebar.tsx
import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Layers, CheckSquare, Users, Calendar, BarChart2, Settings, Home } from 'lucide-react';
import { UserRole } from '@/core/interfaces/models';

interface SidebarProps {
  className?: string;
  userRole?: UserRole;
}

const Sidebar: React.FC<SidebarProps> = ({ className, userRole = UserRole.DEVELOPER }) => {
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
  const filteredNavItems = navItems.filter((item) => item.roles.includes(userRole));

  return (
    <div className={cn('pb-12 border-r border-border bg-sidebar h-full relative group', className)}>
      {/* Animated background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-blue-50/0 via-purple-50/0 to-indigo-50/0 group-hover:from-blue-50/30 group-hover:via-purple-50/20 group-hover:to-indigo-50/30 dark:group-hover:from-blue-950/20 dark:group-hover:via-purple-950/10 dark:group-hover:to-indigo-950/20 transition-all duration-700 ease-out"></div>
      
      <div className="space-y-4 py-4 relative z-10">
        <div className="px-4 py-2">
          <h2 className="mb-2 px-2 text-lg font-semibold tracking-tight text-sidebar-foreground transition-all duration-300 group-hover:text-blue-700 dark:group-hover:text-blue-300 group-hover:scale-105">
            Navegación
          </h2>
          <ScrollArea className="h-[calc(100vh-9rem)]">
            <div className="space-y-1">
              {filteredNavItems.map((item, index) => (
                <Link key={index} href={item.href} passHref>
                  <Button
                    variant={isActive(item.href) ? 'secondary' : 'ghost'}
                    size="sm"
                    className={cn(
                      "w-full justify-start group/item relative overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg transform-gpu",
                      isActive(item.href)
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-md scale-105"
                        : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                    )}
                    style={{ 
                      animationDelay: `${index * 100}ms`,
                      transform: isActive(item.href) ? 'scale(1.05)' : undefined
                    }}
                  >
                    {/* Hover shimmer effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent translate-x-[-100%] group-hover/item:translate-x-[100%] transition-transform duration-500 ease-in-out"></div>
                    
                    <div className="transition-all duration-300 group-hover/item:scale-110 group-hover/item:rotate-12">
                      {item.icon}
                    </div>
                    <span className="ml-2 transition-all duration-300 group-hover/item:translate-x-1">
                      {item.title}
                    </span>
                    
                    {/* Active indicator */}
                    {isActive(item.href) && (
                      <div className="absolute right-2 w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    )}
                  </Button>
                </Link>
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>
      
      {/* Subtle border shimmer */}
      <div className="absolute right-0 top-0 w-0.5 h-full bg-gradient-to-b from-transparent via-blue-200/0 to-transparent group-hover:via-blue-200/50 dark:group-hover:via-blue-700/30 transition-all duration-700"></div>
    </div>
  );
};

export default Sidebar;