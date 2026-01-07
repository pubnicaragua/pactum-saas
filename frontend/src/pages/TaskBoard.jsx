import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { getTasks, updateTaskStatus, createTask, updateTask, deleteTask } from '../lib/api-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
  ListTodo, 
  Plus, 
  Clock, 
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit,
  GripVertical,
  UserPlus
} from 'lucide-react';
import ProjectSelector from '../components/ProjectSelector';
import TaskAttachments from '../components/TaskAttachments';

const TaskBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  const [reassignDialogOpen, setReassignDialogOpen] = useState(false);
  const [reassignData, setReassignData] = useState({ new_assigned_to: '', reason: '' });
  const [users, setUsers] = useState([]);
  const [taskAttachments, setTaskAttachments] = useState([]);
  const [viewingTask, setViewingTask] = useState(null);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  
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

  const columns = [
    { id: 'backlog', title: 'Backlog', color: 'slate', icon: ListTodo },
    { id: 'todo', title: 'Por Hacer', color: 'blue', icon: Clock },
    { id: 'in_progress', title: 'En Progreso', color: 'yellow', icon: AlertCircle },
    { id: 'review', title: 'En Revisión', color: 'purple', icon: CheckCircle2 },
    { id: 'done', title: 'Completado', color: 'green', icon: CheckCircle2 }
  ];

  const getTasksByStatus = (status) => {
    return tasks.filter(task => task.status === status);
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

  const handleDragStart = (e, task) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask || draggedTask.status === newStatus) return;

    try {
      await updateTaskStatus(draggedTask.id, newStatus);
      setTasks(tasks.map(task => 
        task.id === draggedTask.id ? { ...task, status: newStatus } : task
      ));
      toast.success('Estado actualizado');
    } catch (error) {
      toast.error('Error al actualizar estado');
      console.error(error);
    } finally {
      setDraggedTask(null);
    }
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
        priority: 'medium',
        estimated_hours: '',
        due_date: '',
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
      priority: task.priority,
      estimated_hours: task.estimated_hours || '',
      due_date: task.due_date ? task.due_date.split('T')[0] : '',
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
      await updateTask(editingTask.id, { technical_notes: formData.technical_notes });

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
      
      <div>
        <h1 className="text-3xl font-bold text-white">Tablero Kanban</h1>
        <p className="text-slate-400 mt-1">Gestión visual de tareas</p>
      </div>
        
      <div className="flex items-center justify-between">
        <div>
        </div>
        
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

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {columns.map(column => {
          const count = getTasksByStatus(column.id).length;
          return (
            <Card key={column.id} className="border-slate-700 bg-slate-800/50">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-slate-400">{column.title}</p>
                    <p className="text-2xl font-bold text-white">{count}</p>
                  </div>
                  <column.icon className={`h-8 w-8 text-${column.color}-400`} />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="flex-shrink-0 w-80"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, column.id)}
          >
            <Card className="border-slate-700 bg-slate-800/30 h-full">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-slate-300 flex items-center gap-2">
                  <column.icon className={`h-4 w-4 text-${column.color}-400`} />
                  {column.title}
                  <Badge variant="secondary" className="ml-auto">
                    {getTasksByStatus(column.id).length}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 max-h-[600px] overflow-y-auto">
                {getTasksByStatus(column.id).map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task)}
                    onClick={() => {
                      setViewingTask(task);
                      setTaskAttachments(task.attachments || []);
                      setViewDialogOpen(true);
                    }}
                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 cursor-pointer hover:border-blue-500 transition-colors group"
                  >
                    <div className="flex items-start gap-2">
                      <GripVertical className="h-4 w-4 text-slate-600 mt-1 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-white mb-1 line-clamp-2">
                          {task.title}
                        </h4>
                        {task.description && (
                          <p className="text-xs text-slate-400 mb-2 line-clamp-2">
                            {task.description}
                          </p>
                        )}
                        
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </Badge>
                          {task.estimated_hours && (
                            <span className="text-xs text-slate-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimated_hours}h
                            </span>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEdit(task);
                            }}
                            className="h-6 px-2 text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(task.id);
                            }}
                            className="h-6 px-2 text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {getTasksByStatus(column.id).length === 0 && (
                  <div className="text-center py-8 text-slate-500 text-sm">
                    No hay tareas
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ))}
      </div>

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

      {/* Modal de Vista de Detalle */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalle de Tarea</DialogTitle>
          </DialogHeader>
          {viewingTask && (
            <div className="space-y-4">
              <div>
                <Label className="text-slate-400">Título</Label>
                <p className="text-white font-medium">{viewingTask.title}</p>
              </div>

              {viewingTask.description && (
                <div>
                  <Label className="text-slate-400">Descripción</Label>
                  <p className="text-white">{viewingTask.description}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-slate-400">Estado</Label>
                  <Badge className="mt-1">{getStatusLabel(viewingTask.status)}</Badge>
                </div>
                <div>
                  <Label className="text-slate-400">Prioridad</Label>
                  <Badge className={`mt-1 ${getPriorityColor(viewingTask.priority)}`}>
                    {viewingTask.priority}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {viewingTask.estimated_hours && (
                  <div>
                    <Label className="text-slate-400">Horas Estimadas</Label>
                    <p className="text-white">{viewingTask.estimated_hours}h</p>
                  </div>
                )}
                {viewingTask.due_date && (
                  <div>
                    <Label className="text-slate-400">Fecha de Vencimiento</Label>
                    <p className="text-white">{new Date(viewingTask.due_date).toLocaleDateString()}</p>
                  </div>
                )}
              </div>

              {viewingTask.technical_notes && (
                <div>
                  <Label className="text-slate-400">Notas Técnicas</Label>
                  <p className="text-white bg-slate-900 p-3 rounded border border-slate-700">
                    {viewingTask.technical_notes}
                  </p>
                </div>
              )}

              {taskAttachments.length > 0 && (
                <div>
                  <Label className="text-slate-400">Archivos Adjuntos</Label>
                  <TaskAttachments
                    taskId={viewingTask.id}
                    attachments={taskAttachments}
                    onAttachmentAdded={(newAttachment) => {
                      setTaskAttachments([...taskAttachments, newAttachment]);
                      loadTasks();
                    }}
                    requireImages={false}
                  />
                </div>
              )}

              <div className="flex gap-2 justify-end pt-4 border-t border-slate-700">
                <Button 
                  variant="outline" 
                  onClick={() => setViewDialogOpen(false)}
                >
                  Cerrar
                </Button>
                <Button 
                  onClick={() => {
                    setViewDialogOpen(false);
                    handleEdit(viewingTask);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TaskBoard;
