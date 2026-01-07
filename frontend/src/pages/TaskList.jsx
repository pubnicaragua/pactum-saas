import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { getTasks, createTask, updateTask, deleteTask } from '../lib/api-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import ProjectSelector from '../components/ProjectSelector';
import TaskAttachments from '../components/TaskAttachments';
import { toast } from 'sonner';
import { 
  ListTodo, 
  Plus, 
  Clock, 
  Trash2,
  Edit,
  CheckCircle2,
  Circle,
  AlertCircle,
  Download,
  Upload,
  UserPlus
} from 'lucide-react';

const TaskList = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [importing, setImporting] = useState(false);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [reassignData, setReassignData] = useState({ new_assigned_to: '', reason: '' });
  const [users, setUsers] = useState([]);
  const [taskAttachments, setTaskAttachments] = useState([]);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: '',
    due_date: '',
    technical_notes: ''
  });

  useEffect(() => {
    loadTasks();
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
      const token = localStorage.getItem('pactum_token');
      const response = await fetch(`${API_URL}/api/users`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      setUsers(data.filter(u => u.role === 'TEAM_MEMBER' || u.role === 'COMPANY_ADMIN'));
    } catch (error) {
      console.error('Error loading users:', error);
    }
  };

  const calculateDueDate = (estimatedHours) => {
    if (!estimatedHours || estimatedHours <= 0) return '';
    const hoursPerDay = 8;
    const daysNeeded = Math.ceil(estimatedHours / hoursPerDay);
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + daysNeeded);
    return dueDate.toISOString().split('T')[0];
  };

  const loadTasks = async () => {
    try {
      const response = await getTasks();
      setTasks(response.data);
    } catch (error) {
      toast.error('Error al cargar tareas');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      medium: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      urgent: 'bg-red-500/20 text-red-300 border-red-500/30'
    };
    return colors[priority] || colors.medium;
  };

  const getStatusIcon = (status) => {
    const icons = {
      backlog: Circle,
      todo: Circle,
      in_progress: AlertCircle,
      review: Clock,
      done: CheckCircle2
    };
    return icons[status] || Circle;
  };

  const getStatusColor = (status) => {
    const colors = {
      backlog: 'text-slate-400',
      todo: 'text-blue-400',
      in_progress: 'text-yellow-400',
      review: 'text-purple-400',
      done: 'text-green-400'
    };
    return colors[status] || 'text-slate-400';
  };

  const getStatusLabel = (status) => {
    const labels = {
      backlog: 'Backlog',
      todo: 'Por Hacer',
      in_progress: 'En Progreso',
      review: 'En Revisión',
      done: 'Completado'
    };
    return labels[status] || status;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingTask) {
        await updateTask(editingTask.id, formData);
        setTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData } : t));
        toast.success('Tarea actualizada');
      } else {
        const response = await createTask({
          ...formData,
          project_id: tasks[0]?.project_id || '',
          status: 'backlog'
        });
        await loadTasks();
        toast.success('Tarea creada');
      }
      
      setDialogOpen(false);
      setEditingTask(null);
      setFormData({
        title: '',
        description: '',
        status: 'backlog',
        priority: 'medium',
        estimated_hours: '',
        due_date: '',
        assigned_to: '',
        technical_notes: ''
      });
      setTaskAttachments([]);
    } catch (error) {
      toast.error('Error al guardar tarea');
      console.error(error);
    }
  };

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      estimated_hours: task.estimated_hours || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
      assigned_to: task.assigned_to || '',
      technical_notes: task.technical_notes || ''
    });
    setTaskAttachments(task.attachments || []);
    setDialogOpen(true);
  };

  const handleReassign = async () => {
    if (!reassignData.new_assigned_to || !reassignData.reason) {
      toast.error('Debes seleccionar un usuario y proporcionar un motivo');
      return;
    }

    if (!formData.technical_notes || formData.technical_notes.trim() === '') {
      toast.error('Debes documentar los endpoints técnicos antes de reasignar');
      return;
    }

    try {
      // Primero actualizar technical_notes
      await updateTask(editingTask.id, { technical_notes: formData.technical_notes });

      // Luego reasignar
      const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
      const token = localStorage.getItem('pactum_token');
      const response = await fetch(`${API_URL}/api/tasks/${editingTask.id}/reassign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(reassignData)
      });

      if (!response.ok) throw new Error('Error al reasignar');

      toast.success('Tarea reasignada exitosamente');
      setReassignDialogOpen(false);
      setDialogOpen(false);
      setReassignData({ new_assigned_to: '', reason: '' });
      await loadTasks();
    } catch (error) {
      toast.error('Error al reasignar tarea');
      console.error(error);
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    
    try {
      await deleteTask(taskId);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Tarea eliminada');
    } catch (error) {
      toast.error('Error al eliminar tarea');
      console.error(error);
    }
  };

  const handleExport = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
      const token = localStorage.getItem('pactum_token');
      
      const response = await fetch(`${API_URL}/api/tasks/export`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) throw new Error('Error al exportar');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `tareas_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success('Tareas exportadas exitosamente');
    } catch (error) {
      toast.error('Error al exportar tareas');
      console.error(error);
    }
  };

  const handleImport = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    
    if (!tasks[0]?.project_id) {
      toast.error('No se encontró el proyecto');
      return;
    }
    
    setImporting(true);
    
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
      const token = localStorage.getItem('pactum_token');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('project_id', tasks[0].project_id);
      
      const response = await fetch(`${API_URL}/api/tasks/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      
      const result = await response.json();
      
      if (!response.ok) throw new Error(result.detail || 'Error al importar');
      
      toast.success(result.message);
      if (result.errors && result.errors.length > 0) {
        console.warn('Errores de importación:', result.errors);
      }
      
      await loadTasks();
    } catch (error) {
      toast.error(error.message || 'Error al importar tareas');
      console.error(error);
    } finally {
      setImporting(false);
      event.target.value = '';
    }
  };

  const filteredTasks = filterStatus === 'all' 
    ? tasks 
    : tasks.filter(t => t.status === filterStatus);

  const taskStats = {
    total: tasks.length,
    backlog: tasks.filter(t => t.status === 'backlog').length,
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    done: tasks.filter(t => t.status === 'done').length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Project Selector for COMPANY_ADMIN */}
      <ProjectSelector />
      
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Tareas del Proyecto</h1>
          <p className="text-slate-400 mt-1">Gestiona las tareas y actividades</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleExport}
            className="border-slate-700 hover:bg-slate-800"
          >
            <Download className="h-4 w-4 mr-2" />
            Exportar Excel
          </Button>
          
          <label htmlFor="import-excel">
            <Button 
              variant="outline" 
              disabled={importing}
              className="border-slate-700 hover:bg-slate-800"
              asChild
            >
              <span>
                <Upload className="h-4 w-4 mr-2" />
                {importing ? 'Importando...' : 'Importar Excel'}
              </span>
            </Button>
          </label>
          <input
            id="import-excel"
            type="file"
            accept=".xlsx,.xls"
            onChange={handleImport}
            className="hidden"
          />
          
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Editar Tarea' : 'Nueva Tarea'}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label>Título</Label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
                
                <div>
                  <Label>Descripción</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    rows={3}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Prioridad</Label>
                    <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                      <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700 text-white">
                        <SelectItem value="low">Baja</SelectItem>
                        <SelectItem value="medium">Media</SelectItem>
                        <SelectItem value="high">Alta</SelectItem>
                        <SelectItem value="urgent">Urgente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label>Horas Estimadas</Label>
                    <Input
                      type="number"
                      value={formData.estimated_hours}
                      onChange={(e) => {
                        const hours = e.target.value;
                        setFormData({ 
                          ...formData, 
                          estimated_hours: hours,
                          due_date: calculateDueDate(parseFloat(hours))
                        });
                      }}
                      className="bg-slate-900 border-slate-700 text-white"
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Fecha de Vencimiento (calculada automáticamente)</Label>
                  <Input
                    type="date"
                    value={formData.due_date}
                    onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    readOnly
                  />
                  <p className="text-xs text-slate-500 mt-1">Se calcula automáticamente según las horas estimadas (8h/día)</p>
                </div>
                
                <div>
                  <Label>Endpoints Técnicos / Notas de Implementación</Label>
                  <Textarea
                    value={formData.technical_notes}
                    onChange={(e) => setFormData({ ...formData, technical_notes: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                    rows={3}
                    placeholder="Ej: POST /api/users/validate, GET /api/reports/daily, etc."
                  />
                  <p className="text-xs text-slate-500 mt-1">Documenta los endpoints, APIs o detalles técnicos necesarios</p>
                </div>

                {editingTask && (
                  <TaskAttachments
                    taskId={editingTask.id}
                    attachments={taskAttachments}
                    onAttachmentAdded={(newAttachment) => {
                      setTaskAttachments([...taskAttachments, newAttachment]);
                      loadTasks();
                    }}
                    requireImages={editingTask.created_at && new Date(editingTask.created_at) < new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)}
                  />
                )}
                
                <div className="flex gap-2 justify-between">
                  <div>
                    {editingTask && (
                      <Button 
                        type="button" 
                        variant="outline"
                        onClick={() => setReassignDialogOpen(true)}
                        className="border-orange-500 text-orange-400 hover:bg-orange-500/10"
                      >
                        <UserPlus className="h-4 w-4 mr-2" />
                        Reasignar Tarea
                      </Button>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                      {editingTask ? 'Actualizar' : 'Crear'}
                    </Button>
                  </div>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card className="border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('all')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total</p>
                <p className="text-2xl font-bold text-white">{taskStats.total}</p>
              </div>
              <ListTodo className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('backlog')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Backlog</p>
                <p className="text-2xl font-bold text-white">{taskStats.backlog}</p>
              </div>
              <Circle className="h-8 w-8 text-slate-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('todo')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Por Hacer</p>
                <p className="text-2xl font-bold text-white">{taskStats.todo}</p>
              </div>
              <Circle className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('in_progress')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">En Progreso</p>
                <p className="text-2xl font-bold text-white">{taskStats.in_progress}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50 cursor-pointer hover:bg-slate-800/70 transition-colors"
              onClick={() => setFilterStatus('done')}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completado</p>
                <p className="text-2xl font-bold text-white">{taskStats.done}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter Info */}
      {filterStatus !== 'all' && (
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-sm">
            Filtrando por: {getStatusLabel(filterStatus)}
          </Badge>
          <Button 
            size="sm" 
            variant="ghost" 
            onClick={() => setFilterStatus('all')}
            className="text-slate-400 hover:text-white"
          >
            Limpiar filtro
          </Button>
        </div>
      )}

      {/* Task List */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">
            {filterStatus === 'all' ? 'Todas las Tareas' : getStatusLabel(filterStatus)}
            <span className="text-slate-400 text-sm ml-2">({filteredTasks.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredTasks.map(task => {
              const StatusIcon = getStatusIcon(task.status);
              return (
                <div
                  key={task.id}
                  className="flex items-start gap-4 p-4 bg-slate-900/50 rounded-lg border border-slate-700 hover:border-blue-500/50 transition-colors group"
                >
                  <StatusIcon className={`h-5 w-5 mt-0.5 flex-shrink-0 ${getStatusColor(task.status)}`} />
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white mb-1">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-400 mb-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {getStatusLabel(task.status)}
                          </Badge>
                          {task.estimated_hours && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimated_hours}h
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEdit(task)}
                          className="h-8 px-2 text-blue-400 hover:text-blue-300"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDelete(task.id)}
                          className="h-8 px-2 text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-slate-500">
                <ListTodo className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No hay tareas {filterStatus !== 'all' ? `en estado "${getStatusLabel(filterStatus)}"` : ''}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Reasignación */}
      <Dialog open={reassignDialogOpen} onOpenChange={setReassignDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>Reasignar Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Tarea: {editingTask?.title}</Label>
              <p className="text-sm text-slate-400 mt-1">{editingTask?.description}</p>
            </div>

            <div>
              <Label>Reasignar a</Label>
              <Select 
                value={reassignData.new_assigned_to} 
                onValueChange={(value) => setReassignData({ ...reassignData, new_assigned_to: value })}
              >
                <SelectTrigger className="bg-slate-900 border-slate-700 text-white">
                  <SelectValue placeholder="Selecciona un usuario" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-700 text-white">
                  {users.map(u => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.full_name || u.name || u.email} ({u.role === 'TEAM_MEMBER' ? 'Desarrollador' : 'Admin'})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Endpoints Técnicos / Notas de Implementación *</Label>
              <Textarea
                value={formData.technical_notes}
                onChange={(e) => setFormData({ ...formData, technical_notes: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                rows={3}
                placeholder="Ej: POST /api/users/validate, GET /api/reports/daily, etc."
                required
              />
              <p className="text-xs text-slate-500 mt-1">Documenta los endpoints, APIs o detalles técnicos necesarios</p>
            </div>

            <div>
              <Label>Motivo de la reasignación *</Label>
              <Textarea
                value={reassignData.reason}
                onChange={(e) => setReassignData({ ...reassignData, reason: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                rows={3}
                placeholder="Ej: Esta tarea requiere conocimientos de frontend que corresponden a Miguel..."
                required
              />
              <p className="text-xs text-slate-500 mt-1">Explica por qué esta tarea debe ser reasignada</p>
            </div>

            <div className="flex gap-2 justify-end">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setReassignDialogOpen(false);
                  setReassignData({ new_assigned_to: '', reason: '' });
                }}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleReassign}
                className="bg-orange-600 hover:bg-orange-700"
              >
                Reasignar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskList;
