import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { getProjects, getTasks, getPayments, getPhases } from '../lib/api-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import ProjectSelector from '../components/ProjectSelector';
import ProjectDocumentation from '../components/ProjectDocumentation';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  AlertCircle
} from 'lucide-react';

const ProjectDashboard = () => {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [projectsRes, tasksRes, paymentsRes, phasesRes] = await Promise.all([
        getProjects(),
        getTasks(),
        getPayments(),
        getPhases()
      ]);
      
      if (projectsRes.data.length > 0) {
        setProject(projectsRes.data[0]);
      }
      setTasks(tasksRes.data);
      setPayments(paymentsRes.data);
      setPhases(phasesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const taskStats = {
    total: tasks.length,
    completed: tasks.filter(t => t.status === 'done').length,
    inProgress: tasks.filter(t => t.status === 'in_progress').length,
    pending: tasks.filter(t => t.status === 'backlog' || t.status === 'todo').length
  };

  const paymentStats = {
    total: payments.length,
    paid: payments.filter(p => p.status === 'pagado').length,
    pending: payments.filter(p => p.status === 'pendiente').length,
    totalAmount: payments.reduce((sum, p) => sum + (p.amount || 0), 0),
    paidAmount: payments.filter(p => p.status === 'pagado').reduce((sum, p) => sum + (p.amount || 0), 0)
  };

  const phaseStats = {
    total: phases.length,
    completed: phases.filter(p => p.status === 'completado').length,
    inProgress: phases.filter(p => p.status === 'en_progreso').length,
    pending: phases.filter(p => p.status === 'pendiente').length
  };

  const projectProgress = project?.progress_percentage || 0;

  return (
    <div className="space-y-6">
      {/* Project Selector for COMPANY_ADMIN */}
      <ProjectSelector />
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <LayoutDashboard className="h-8 w-8 text-blue-400" />
          Dashboard del Proyecto
        </h1>
        <p className="text-slate-400 mt-1">Vista general de {project?.name || 'tu proyecto'}</p>
      </div>

      {/* Project Overview */}
      <Card className="border-slate-700 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <CardHeader>
          <CardTitle className="text-white">{project?.name || 'Proyecto'}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progreso General</span>
                <span className="text-sm font-bold text-white">{projectProgress}%</span>
              </div>
              <Progress value={projectProgress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-400">{project?.deliverables?.length || 0}</p>
                <p className="text-xs text-slate-400">Entregables</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-400">{taskStats.completed}</p>
                <p className="text-xs text-slate-400">Tareas Completadas</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-400">{phaseStats.total}</p>
                <p className="text-xs text-slate-400">Fases Totales</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-400">{project?.estimated_days || 30} días</p>
                <p className="text-xs text-slate-400">Duración Estimada</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Tasks Card */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-blue-400" />
              Tareas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total</span>
                <Badge variant="secondary">{taskStats.total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Completadas</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {taskStats.completed}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">En Progreso</span>
                <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">
                  {taskStats.inProgress}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pendientes</span>
                <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                  {taskStats.pending}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Payments Card */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <DollarSign className="h-5 w-5 text-green-400" />
              Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total</span>
                <span className="text-lg font-bold text-white">
                  ${paymentStats.totalAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pagado</span>
                <span className="text-sm font-bold text-green-400">
                  ${paymentStats.paidAmount.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pendiente</span>
                <span className="text-sm font-bold text-yellow-400">
                  ${(paymentStats.totalAmount - paymentStats.paidAmount).toLocaleString()}
                </span>
              </div>
              <div className="mt-2">
                <Progress 
                  value={(paymentStats.paidAmount / paymentStats.totalAmount) * 100} 
                  className="h-2" 
                />
                <p className="text-xs text-slate-500 mt-1">
                  {paymentStats.paid} de {paymentStats.total} pagos realizados
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Phases Card */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <Target className="h-5 w-5 text-purple-400" />
              Fases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Total</span>
                <Badge variant="secondary">{phaseStats.total}</Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Completadas</span>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                  {phaseStats.completed}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">En Progreso</span>
                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30">
                  {phaseStats.inProgress}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-400">Pendientes</span>
                <Badge className="bg-slate-500/20 text-slate-400 border-slate-500/30">
                  {phaseStats.pending}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity / Next Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Next Payment */}
        {payments.filter(p => p.status === 'pendiente').length > 0 && (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <Calendar className="h-5 w-5 text-yellow-400" />
                Próximo Pago
              </CardTitle>
            </CardHeader>
            <CardContent>
              {payments
                .filter(p => p.status === 'pendiente')
                .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))
                .slice(0, 1)
                .map(payment => (
                  <div key={payment.id} className="space-y-2">
                    <p className="text-sm text-slate-400">{payment.description}</p>
                    <p className="text-2xl font-bold text-white">
                      ${payment.amount?.toLocaleString() || 0}
                    </p>
                    <p className="text-xs text-slate-500">
                      Vence: {new Date(payment.due_date).toLocaleDateString('es-ES')}
                    </p>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}

        {/* Current Phase */}
        {phases.filter(p => p.status === 'en_progreso' || p.status === 'pendiente').length > 0 && (
          <Card className="border-slate-700 bg-slate-800/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2 text-lg">
                <TrendingUp className="h-5 w-5 text-blue-400" />
                Fase Actual
              </CardTitle>
            </CardHeader>
            <CardContent>
              {phases
                .filter(p => p.status === 'en_progreso' || p.status === 'pendiente')
                .sort((a, b) => a.order - b.order)
                .slice(0, 1)
                .map(phase => (
                  <div key={phase.id} className="space-y-2">
                    <p className="text-sm font-medium text-white">{phase.name}</p>
                    <p className="text-xs text-slate-400">{phase.description}</p>
                    <div className="mt-2">
                      <Progress value={phase.progress || 0} className="h-2" />
                      <p className="text-xs text-slate-500 mt-1">
                        {phase.progress || 0}% completado
                      </p>
                    </div>
                  </div>
                ))}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Contract Info */}
      {project?.contract_number && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2 text-lg">
              <AlertCircle className="h-5 w-5 text-blue-400" />
              Información del Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-xs text-slate-400">Número de Contrato</p>
                <p className="text-sm font-medium text-white">{project.contract_number}</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Fecha de Inicio</p>
                <p className="text-sm font-medium text-white">
                  {project.start_date ? new Date(project.start_date).toLocaleDateString('es-ES') : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Duración</p>
                <p className="text-sm font-medium text-white">{project.estimated_days || 30} días</p>
              </div>
              <div>
                <p className="text-xs text-slate-400">Valor Total</p>
                <p className="text-sm font-medium text-white">
                  ${project.total_amount?.toLocaleString() || paymentStats.totalAmount.toLocaleString()}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Documentation */}
      {project && <ProjectDocumentation projectId={project.id} />}
    </div>
  );
};

export default ProjectDashboard;
