import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getDashboardStats, getProjects } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Progress } from '../components/ui/progress';
import { Badge } from '../components/ui/badge';
import { 
  LayoutDashboard, 
  Layers, 
  CreditCard, 
  CheckSquare,
  Users,
  TrendingUp,
  AlertTriangle,
  DollarSign,
  Calendar
} from 'lucide-react';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const StatCard = ({ title, value, subtitle, icon: Icon, color, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
  >
    <Card className="bg-slate-800/50 border-slate-700/50 hover:border-blue-500/30 transition-colors">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">{title}</p>
            <p className="text-3xl font-bold text-white mt-2">{value}</p>
            {subtitle && (
              <p className="text-sm text-slate-500 mt-1">{subtitle}</p>
            )}
          </div>
          <div className={`p-3 rounded-xl ${color}`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
        </div>
      </CardContent>
    </Card>
  </motion.div>
);

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, projectsRes] = await Promise.all([
          getDashboardStats(),
          getProjects()
        ]);
        setStats(statsRes.data);
        if (projectsRes.data.length > 0) {
          setProject(projectsRes.data[0]);
        }
      } catch (error) {
        console.error('Error loading dashboard:', error);
        toast.error('Error al cargar el dashboard');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalTasks = stats?.tasks ? Object.values(stats.tasks).reduce((a, b) => a + b, 0) : 0;
  const completedTasks = stats?.tasks?.Hecho || 0;
  const taskProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  const phaseProgress = stats?.phases?.total > 0 
    ? (stats.phases.completed / stats.phases.total) * 100 
    : 0;

  return (
    <div className="space-y-8" data-testid="dashboard">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Dashboard</h1>
          <p className="text-slate-400 mt-1">
            {project?.name || 'Cargando proyecto...'}
          </p>
        </div>
        {stats?.payments?.delayed_count > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-lg"
          >
            <AlertTriangle className="w-5 h-5 text-red-400" />
            <span className="text-sm text-red-400">
              {stats.payments.delayed_count} pago(s) retrasado(s) - Impacta timeline
            </span>
          </motion.div>
        )}
      </div>

      {/* Project Info */}
      {project && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700/50">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-slate-400">Cliente</p>
                  <p className="text-lg font-semibold text-white mt-1">{project.client_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Período</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    {new Date(project.start_date).toLocaleDateString('es-ES')} - {new Date(project.end_date).toLocaleDateString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Monto Total</p>
                  <p className="text-lg font-semibold text-white mt-1">
                    USD ${project.total_usd?.toLocaleString()} <span className="text-slate-400 text-sm">/ C$ {project.total_cordobas?.toLocaleString()}</span>
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Estado</p>
                  <Badge className="mt-2 bg-blue-600/20 text-blue-400 border-blue-500/30">
                    {project.status}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Fases Completadas"
          value={`${stats?.phases?.completed || 0}/${stats?.phases?.total || 0}`}
          subtitle={`${phaseProgress.toFixed(0)}% completado`}
          icon={Layers}
          color="bg-blue-600"
          delay={0.1}
        />
        <StatCard
          title="Tareas Completadas"
          value={`${completedTasks}/${totalTasks}`}
          subtitle={`${taskProgress.toFixed(0)}% completado`}
          icon={CheckSquare}
          color="bg-emerald-600"
          delay={0.2}
        />
        <StatCard
          title="Pagos Recibidos"
          value={`C$ ${(stats?.payments?.total_paid || 0).toLocaleString()}`}
          subtitle={`Pendiente: C$ ${(stats?.payments?.total_pending || 0).toLocaleString()}`}
          icon={CreditCard}
          color="bg-amber-600"
          delay={0.3}
        />
        <StatCard
          title="Clientes CRM"
          value={stats?.crm?.clients || 0}
          subtitle={`${stats?.crm?.opportunities || 0} oportunidades`}
          icon={Users}
          color="bg-purple-600"
          delay={0.4}
        />
      </div>

      {/* Progress Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Task Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-blue-400" />
                Estado de Tareas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {stats?.tasks && Object.entries(stats.tasks).map(([status, count]) => {
                const percentage = totalTasks > 0 ? (count / totalTasks) * 100 : 0;
                const colors = {
                  'Backlog': 'bg-slate-500',
                  'En progreso': 'bg-blue-500',
                  'En revisión': 'bg-amber-500',
                  'Bloqueado': 'bg-red-500',
                  'Hecho': 'bg-emerald-500'
                };
                return (
                  <div key={status}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-slate-300">{status}</span>
                      <span className="text-slate-400">{count} ({percentage.toFixed(0)}%)</span>
                    </div>
                    <Progress value={percentage} className="h-2" indicatorClassName={colors[status]} />
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </motion.div>

        {/* Phases Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-400" />
                Progreso de Fases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="relative w-40 h-40">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      className="text-slate-700"
                    />
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="12"
                      strokeDasharray={`${phaseProgress * 4.4} 440`}
                      strokeLinecap="round"
                      className="text-blue-500"
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-3xl font-bold text-white">{phaseProgress.toFixed(0)}%</span>
                    <span className="text-sm text-slate-400">Completado</span>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 text-center pt-4">
                <div>
                  <p className="text-2xl font-bold text-slate-300">{stats?.phases?.completed || 0}</p>
                  <p className="text-xs text-slate-500">Completadas</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-400">{stats?.phases?.in_progress || 0}</p>
                  <p className="text-xs text-slate-500">En Progreso</p>
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-400">{stats?.phases?.pending || 0}</p>
                  <p className="text-xs text-slate-500">Pendientes</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* CRM Quick Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.7 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-400" />
              Resumen CRM
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Link to="/crm/clientes" className="group">
                <div className="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Users className="w-8 h-8 text-blue-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{stats?.crm?.clients || 0}</p>
                  <p className="text-sm text-slate-400 group-hover:text-blue-400 transition-colors">Clientes</p>
                </div>
              </Link>
              <Link to="/crm/pipeline" className="group">
                <div className="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <TrendingUp className="w-8 h-8 text-emerald-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{stats?.crm?.opportunities || 0}</p>
                  <p className="text-sm text-slate-400 group-hover:text-emerald-400 transition-colors">Oportunidades</p>
                </div>
              </Link>
              <div className="p-4 rounded-xl bg-slate-700/30">
                <DollarSign className="w-8 h-8 text-amber-400 mb-2" />
                <p className="text-2xl font-bold text-white">${(stats?.crm?.opportunity_value || 0).toLocaleString()}</p>
                <p className="text-sm text-slate-400">Valor Pipeline</p>
              </div>
              <Link to="/crm/actividades" className="group">
                <div className="p-4 rounded-xl bg-slate-700/30 hover:bg-slate-700/50 transition-colors">
                  <Calendar className="w-8 h-8 text-purple-400 mb-2" />
                  <p className="text-2xl font-bold text-white">{stats?.crm?.pending_activities || 0}</p>
                  <p className="text-sm text-slate-400 group-hover:text-purple-400 transition-colors">Actividades Pendientes</p>
                </div>
              </Link>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
