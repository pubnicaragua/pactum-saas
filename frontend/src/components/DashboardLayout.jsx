import { useState, useEffect } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { 
  LayoutDashboard, 
  FileText, 
  Layers, 
  CreditCard, 
  CheckSquare,
  Users,
  TrendingUp,
  Phone,
  Settings,
  Activity,
  LogOut,
  Menu,
  X,
  ChevronDown
} from 'lucide-react';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { 
    name: 'Proyecto', 
    icon: FileText,
    children: [
      { name: 'Contrato', href: '/proyecto/contrato', icon: FileText },
      { name: 'Fases', href: '/proyecto/fases', icon: Layers },
      { name: 'Pagos', href: '/proyecto/pagos', icon: CreditCard },
      { name: 'Tareas', href: '/proyecto/tareas', icon: CheckSquare },
    ]
  },
  { 
    name: 'CRM', 
    icon: Users,
    children: [
      { name: 'Clientes', href: '/crm/clientes', icon: Users },
      { name: 'Pipeline', href: '/crm/pipeline', icon: TrendingUp },
      { name: 'Actividades', href: '/crm/actividades', icon: Phone },
    ]
  },
  { name: 'Admin', href: '/admin', icon: Settings, adminOnly: true },
  { name: 'Actividad', href: '/actividad', icon: Activity },
];

const NavItem = ({ item, mobile = false }) => {
  const { isAdmin } = useAuth();
  const location = useLocation();
  const isChildActive = item.children?.some(child => location.pathname.startsWith(child.href));
  const [isOpen, setIsOpen] = useState(isChildActive);
  
  useEffect(() => {
    if (isChildActive) setIsOpen(true);
  }, [isChildActive]);

  if (item.adminOnly && !isAdmin()) return null;

  if (item.children) {
    return (
      <div className={mobile ? 'w-full' : ''}>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full px-3 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/50 transition-colors ${mobile ? 'w-full' : ''}`}
        >
          <span className="flex items-center gap-3">
            <item.icon className="w-5 h-5" />
            {item.name}
          </span>
          <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </button>
        {isOpen && (
          <div className="ml-4 mt-1 space-y-1">
            {item.children.map((child) => (
              <NavLink
                key={child.href}
                to={child.href}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                  }`
                }
              >
                <child.icon className="w-4 h-4" />
                {child.name}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <NavLink
      to={item.href}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-600/20 text-blue-400 border-l-2 border-blue-500'
            : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
        }`
      }
    >
      <item.icon className="w-5 h-5" />
      {item.name}
    </NavLink>
  );
};

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 bg-slate-950 border-r border-slate-800 transform transition-transform duration-200 ease-in-out lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">MP</span>
              </div>
              <span className="text-lg font-semibold text-white">Pactum</span>
            </div>
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavItem key={item.name} item={item} />
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-slate-800">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-3 w-full px-3 py-2 rounded-lg hover:bg-slate-800/50 transition-colors">
                  <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                    <span className="text-white text-sm font-medium">
                      {user?.name?.charAt(0) || 'U'}
                    </span>
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium text-white truncate">{user?.name}</p>
                    <p className="text-xs text-slate-400">{user?.role}</p>
                  </div>
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 bg-slate-900 border-slate-700">
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="text-red-400 focus:text-red-400 focus:bg-red-400/10 cursor-pointer"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Cerrar sesión
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/80 backdrop-blur-sm border-b border-slate-800">
          <div className="flex items-center justify-between h-full px-4 lg:px-8">
            <button 
              className="lg:hidden text-slate-400 hover:text-white"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <div className="flex-1 lg:flex-none">
              <h1 className="text-lg font-semibold text-white lg:hidden">Pactum</h1>
            </div>

            <div className="flex items-center gap-4">
              <span className="text-sm text-slate-400 hidden sm:block">
                {new Date().toLocaleDateString('es-ES', { 
                  weekday: 'long', 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
