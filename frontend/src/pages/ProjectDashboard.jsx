import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { getProjects, getTasks, getPayments, getPhases, updateProject } from '../lib/api-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Progress } from '../components/ui/progress';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import ProjectSelector from '../components/ProjectSelector';
import ProjectDocumentation from '../components/ProjectDocumentation';
import { toast } from 'sonner';
import { 
  LayoutDashboard, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  TrendingUp,
  Calendar,
  Target,
  AlertCircle,
  Edit,
  Save,
  X
} from 'lucide-react';

const ProjectDashboard = () => {
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [payments, setPayments] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData();
    
    // Listen for project changes
    const handleProjectChange = () => {
      loadData();
    };
    
    window.addEventListener('projectChanged', handleProjectChange);
    
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange);
    };
  }, []);

  const loadData = async () => {
    try {
      const projectId = localStorage.getItem('project_id');
      const [projectsRes, tasksRes, paymentsRes, phasesRes] = await Promise.all([
        getProjects(),
        getTasks(projectId),
        getPayments(projectId),
        getPhases(projectId)
      ]);
      
      if (projectsRes.data.length > 0) {
        const proj = projectsRes.data[0];
        setProject(proj);
        setEditData({
          name: proj.name || '',
          description: proj.description || '',
          progress_percentage: proj.progress_percentage || 0,
          estimated_days: proj.estimated_days || 30,
          budget: proj.budget || 0,
          start_date: proj.start_date ? proj.start_date.split('T')[0] : '',
          end_date: proj.end_date ? proj.end_date.split('T')[0] : '',
          status: proj.status || 'active'
        });
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

  const handleSaveProject = async () => {
    if (!project) return;
    
    setSaving(true);
    try {
      await updateProject(project.id, editData);
      toast.success('Proyecto actualizado exitosamente');
      setEditing(false);
      await loadData();
      
      // Notify other components
      window.dispatchEvent(new CustomEvent('projectUpdated', { detail: { projectId: project.id } }));
    } catch (error) {
      console.error('Error updating project:', error);
      toast.error('Error al actualizar el proyecto');
    } finally {
      setSaving(false);
    }
  };

  const handleCancelEdit = () => {
    setEditing(false);
    if (project) {
      setEditData({
        name: project.name || '',
        description: project.description || '',
        progress_percentage: project.progress_percentage || 0,
        estimated_days: project.estimated_days || 30,
        budget: project.budget || 0,
        start_date: project.start_date ? project.start_date.split('T')[0] : '',
        end_date: project.end_date ? project.end_date.split('T')[0] : '',
        status: project.status || 'active'
      });
    }
  };

  const projectProgress = editing ? editData.progress_percentage : (project?.progress_percentage || 0);

  return (
    <div className="space-y-6">
      {/* Project Selector for COMPANY_ADMIN */}
      <ProjectSelector />
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <LayoutDashboard className="h-8 w-8 text-blue-400" />
            Dashboard del Proyecto
          </h1>
          <p className="text-slate-400 mt-1">Vista general de {editing ? editData.name : (project?.name || 'tu proyecto')}</p>
        </div>
        {user?.role === 'COMPANY_ADMIN' && !editing && (
          <Button
            onClick={() => setEditing(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar Proyecto
          </Button>
        )}
        {editing && (
          <div className="flex gap-2">
            <Button
              onClick={handleSaveProject}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {saving ? 'Guardando...' : 'Guardar'}
            </Button>
            <Button
              onClick={handleCancelEdit}
              variant="outline"
              className="border-slate-600"
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          </div>
        )}
      </div>

      {/* Project Overview */}
      <Card className="border-slate-700 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
        <CardHeader>
          {editing ? (
            <Input
              value={editData.name}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              className="text-xl font-bold bg-slate-900 border-slate-700 text-white"
              placeholder="Nombre del proyecto"
            />
          ) : (
            <CardTitle className="text-white">{project?.name || 'Proyecto'}</CardTitle>
          )}
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {editing && (
              <div>
                <label className="text-sm text-slate-400">Descripción</label>
                <Textarea
                  value={editData.description}
                  onChange={(e) => setEditData({ ...editData, description: e.target.value })}
                  className="mt-1 bg-slate-900 border-slate-700 text-white"
                  placeholder="Descripción del proyecto"
                  rows={3}
                />
              </div>
            )}
            {editing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Presupuesto</label>
                  <Input
                    type="number"
                    min="0"
                    value={editData.budget}
                    onChange={(e) => setEditData({ ...editData, budget: parseFloat(e.target.value) || 0 })}
                    className="mt-1 bg-slate-900 border-slate-700 text-white"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Estado</label>
                  <Select value={editData.status} onValueChange={(value) => setEditData({ ...editData, status: value })}>
                    <SelectTrigger className="mt-1 bg-slate-900 border-slate-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      <SelectItem value="active" className="text-white">Activo</SelectItem>
                      <SelectItem value="on_hold" className="text-white">En Pausa</SelectItem>
                      <SelectItem value="completed" className="text-white">Completado</SelectItem>
                      <SelectItem value="cancelled" className="text-white">Cancelado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            {editing && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-slate-400">Fecha de Inicio</label>
                  <Input
                    type="date"
                    value={editData.start_date}
                    onChange={(e) => setEditData({ ...editData, start_date: e.target.value })}
                    className="mt-1 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Fecha de Fin</label>
                  <Input
                    type="date"
                    value={editData.end_date}
                    onChange={(e) => setEditData({ ...editData, end_date: e.target.value })}
                    className="mt-1 bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
            )}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-slate-400">Progreso General</span>
                {editing ? (
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={editData.progress_percentage}
                    onChange={(e) => setEditData({ ...editData, progress_percentage: parseInt(e.target.value) || 0 })}
                    className="w-20 h-8 text-sm bg-slate-900 border-slate-700 text-white text-right"
                  />
                ) : (
                  <span className="text-sm font-bold text-white">{projectProgress}%</span>
                )}
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
                {editing ? (
                  <Input
                    type="number"
                    min="1"
                    value={editData.estimated_days}
                    onChange={(e) => setEditData({ ...editData, estimated_days: parseInt(e.target.value) || 30 })}
                    className="w-24 mx-auto text-2xl font-bold bg-slate-900 border-slate-700 text-yellow-400 text-center"
                  />
                ) : (
                  <p className="text-2xl font-bold text-yellow-400">{project?.estimated_days || 30} días</p>
                )}
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
