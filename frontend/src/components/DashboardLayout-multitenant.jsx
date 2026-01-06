import React, { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-multitenant';
import { Button } from './ui/button';
import { Avatar, AvatarFallback } from './ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Badge } from './ui/badge';
import { Building2, LayoutDashboard, Users, Calendar, LogOut, Menu, X, Shield, Briefcase, Mountain, ListTodo, KanbanSquare } from 'lucide-react';

const DashboardLayout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isRegularUser = user?.role === 'USER';

  const navigation = isSuperAdmin ? [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  ] : isRegularUser ? [
    { name: 'Mi Proyecto', href: '/proyecto', icon: Briefcase },
    { name: 'Tareas', href: '/tareas', icon: ListTodo },
    { name: 'Tablero Kanban', href: '/kanban', icon: KanbanSquare },
  ] : [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clientes', href: '/clientes', icon: Users },
    { name: 'Actividades', href: '/actividades', icon: Calendar },
  ];

  const isActive = (path) => location.pathname === path;

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-800 border-r border-slate-700 transform transition-transform duration-200 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-700">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white text-lg font-bold">MP</span>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-semibold text-white">Pactum</h2>
              {user?.company_name && (
                <p className="text-xs text-slate-400 truncate">{user.company_name}</p>
              )}
            </div>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-slate-700">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-blue-600 text-white font-semibold">
                  {getInitials(user?.name || 'U')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                <div className="flex items-center gap-2">
                  <Badge variant={isSuperAdmin ? "destructive" : "secondary"} className="text-xs bg-slate-700 text-slate-200 border-slate-600">
                    {isSuperAdmin ? (
                      <>
                        <Shield className="h-3 w-3 mr-1" />
                        SUPER ADMIN
                      </>
                    ) : user?.role === 'COMPANY_ADMIN' ? 'ADMIN' : 'USER'}
                  </Badge>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.name}
                  onClick={() => navigate(item.href)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    isActive(item.href)
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20'
                      : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  {item.name}
                </button>
              );
            })}
          </nav>

          {/* Logout */}
          <div className="p-4 border-t border-slate-700">
            <button
              onClick={logout}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all"
            >
              <LogOut className="h-5 w-5" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className={`transition-all duration-200 ${sidebarOpen ? 'lg:ml-64' : 'ml-0'}`}>
        {/* Top Bar */}
        <header className="bg-slate-800 border-b border-slate-700 sticky top-0 z-40">
          <div className="flex items-center justify-between px-4 py-3">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden text-slate-300 hover:text-white hover:bg-slate-700"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="flex-1 lg:hidden" />

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-blue-600 text-white text-xs">
                      {getInitials(user?.name || 'U')}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline">{user?.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.email}</p>
                    {user?.company_name && (
                      <p className="text-xs text-gray-500">{user?.company_name}</p>
                    )}
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="h-4 w-4 mr-2" />
                  Cerrar Sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6 min-h-screen">
          <Outlet />
        </main>
      </div>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default DashboardLayout;
