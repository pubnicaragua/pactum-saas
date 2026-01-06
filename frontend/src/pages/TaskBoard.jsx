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
  GripVertical
} from 'lucide-react';

const TaskBoard = () => {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [draggedTask, setDraggedTask] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    estimated_hours: '',
    due_date: ''
  });

  useEffect(() => {
    loadTasks();
  }, []);

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
        due_date: ''
      });
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
      due_date: task.due_date ? task.due_date.split('T')[0] : ''
    });
    setDialogOpen(true);
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
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Tablero de Tareas</h1>
          <p className="text-slate-400 mt-1">Gestiona tus tareas con vista Kanban</p>
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
                    onChange={(e) => setFormData({ ...formData, estimated_hours: e.target.value })}
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>
              </div>
              
              <div>
                <Label>Fecha de Vencimiento</Label>
                <Input
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              
              <div className="flex gap-2 justify-end">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700">
                  {editingTask ? 'Actualizar' : 'Crear'}
                </Button>
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
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 overflow-x-auto pb-4">
        {columns.map(column => (
          <div
            key={column.id}
            className="min-w-[280px]"
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
                    className="bg-slate-900/50 border border-slate-700 rounded-lg p-3 cursor-move hover:border-blue-500 transition-colors group"
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
                            onClick={() => handleEdit(task)}
                            className="h-6 px-2 text-blue-400 hover:text-blue-300"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(task.id)}
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
    </div>
  );
};

export default TaskBoard;
