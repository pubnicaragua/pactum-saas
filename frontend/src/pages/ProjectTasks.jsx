import { useState, useEffect } from 'react';
import { getTasks, createTask, updateTask, deleteTask } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  CheckSquare, 
  Plus, 
  GripVertical,
  User,
  Calendar,
  Trash2,
  Edit,
  Filter
} from 'lucide-react';

const statusColumns = [
  { id: 'Backlog', label: 'Backlog', color: 'bg-slate-500' },
  { id: 'En progreso', label: 'En Progreso', color: 'bg-blue-500' },
  { id: 'En revisión', label: 'En Revisión', color: 'bg-amber-500' },
  { id: 'Bloqueado', label: 'Bloqueado', color: 'bg-red-500' },
  { id: 'Hecho', label: 'Hecho', color: 'bg-emerald-500' },
];

const priorityColors = {
  'Alta': 'bg-red-500/20 text-red-400 border-red-500/30',
  'Media': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Baja': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
};

const TaskCard = ({ task, onStatusChange, onEdit, onDelete, isAdmin }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 10 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all cursor-pointer group"
    data-testid={`task-card-${task.id}`}
  >
    <div className="flex items-start justify-between gap-2">
      <div className="flex-1 min-w-0">
        <p className="font-medium text-white text-sm truncate">{task.title}</p>
        {task.description && (
          <p className="text-xs text-slate-400 mt-1 line-clamp-2">{task.description}</p>
        )}
      </div>
      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(task)}>
          <Edit className="w-3 h-3" />
        </Button>
        {isAdmin && (
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400 hover:text-red-300" onClick={() => onDelete(task.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        )}
      </div>
    </div>
    <div className="flex items-center gap-2 mt-3 flex-wrap">
      <Badge className={priorityColors[task.priority]} variant="outline">
        {task.priority}
      </Badge>
      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
        <User className="w-3 h-3 mr-1" />
        {task.responsible}
      </Badge>
      <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">
        S{task.week}
      </Badge>
    </div>
    <Select
      value={task.status}
      onValueChange={(value) => onStatusChange(task.id, value)}
    >
      <SelectTrigger className="w-full mt-3 h-7 text-xs bg-slate-900/50 border-slate-700" data-testid={`task-status-${task.id}`}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="bg-slate-900 border-slate-700">
        {statusColumns.map(col => (
          <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  </motion.div>
);

export default function ProjectTasks() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('kanban');
  const [weekFilter, setWeekFilter] = useState('all');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    week: 1,
    responsible: 'Admin',
    priority: 'Media',
    status: 'Backlog'
  });
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchTasks();
  }, [weekFilter]);

  const fetchTasks = async () => {
    try {
      const params = weekFilter !== 'all' ? parseInt(weekFilter) : undefined;
      const response = await getTasks('project-crm-amaru', params);
      setTasks(response.data);
    } catch (error) {
      console.error('Error loading tasks:', error);
      toast.error('Error al cargar las tareas');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      await updateTask(taskId, { status: newStatus });
      setTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t));
      toast.success('Estado actualizado');
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    try {
      await createTask({
        ...formData,
        project_id: 'project-crm-amaru'
      });
      toast.success('Tarea creada');
      setIsCreateOpen(false);
      setFormData({ title: '', description: '', week: 1, responsible: 'Admin', priority: 'Media', status: 'Backlog' });
      fetchTasks();
    } catch (error) {
      console.error('Error creating task:', error);
      toast.error('Error al crear tarea');
    }
  };

  const handleEdit = async () => {
    if (!editTask) return;

    try {
      await updateTask(editTask.id, formData);
      toast.success('Tarea actualizada');
      setEditTask(null);
      fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;

    try {
      await deleteTask(taskId);
      toast.success('Tarea eliminada');
      fetchTasks();
    } catch (error) {
      console.error('Error deleting task:', error);
      toast.error('Error al eliminar');
    }
  };

  const openEditDialog = (task) => {
    setEditTask(task);
    setFormData({
      title: task.title,
      description: task.description || '',
      week: task.week,
      responsible: task.responsible,
      priority: task.priority,
      status: task.status
    });
  };

  const getTasksByStatus = (status) => tasks.filter(t => t.status === status);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="project-tasks">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Tareas del Proyecto</h1>
          <p className="text-slate-400 mt-1">{tasks.length} tareas totales</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={weekFilter} onValueChange={setWeekFilter}>
            <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700" data-testid="week-filter">
              <Filter className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Semana" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="1">Semana 1</SelectItem>
              <SelectItem value="2">Semana 2</SelectItem>
              <SelectItem value="3">Semana 3</SelectItem>
              <SelectItem value="4">Semana 4</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-task-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Nueva Tarea</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Título *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 bg-slate-800/50 border-slate-700"
                    data-testid="task-title-input"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Descripción</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="mt-1 bg-slate-800/50 border-slate-700"
                    data-testid="task-description-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Semana</label>
                    <Select value={String(formData.week)} onValueChange={(v) => setFormData({...formData, week: parseInt(v)})}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="1">Semana 1</SelectItem>
                        <SelectItem value="2">Semana 2</SelectItem>
                        <SelectItem value="3">Semana 3</SelectItem>
                        <SelectItem value="4">Semana 4</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Responsable</label>
                    <Select value={formData.responsible} onValueChange={(v) => setFormData({...formData, responsible: v})}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="Admin">Admin</SelectItem>
                        <SelectItem value="Cliente">Cliente</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Prioridad</label>
                    <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="Alta">Alta</SelectItem>
                        <SelectItem value="Media">Media</SelectItem>
                        <SelectItem value="Baja">Baja</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Estado</label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({...formData, status: v})}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {statusColumns.map(col => (
                          <SelectItem key={col.id} value={col.id}>{col.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700" data-testid="save-task-btn">
                  Crear Tarea
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editTask} onOpenChange={(open) => !open && setEditTask(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Tarea</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Título *</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
            <div>
              <label className="text-sm text-slate-400">Descripción</label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Prioridad</label>
                <Select value={formData.priority} onValueChange={(v) => setFormData({...formData, priority: v})}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="Alta">Alta</SelectItem>
                    <SelectItem value="Media">Media</SelectItem>
                    <SelectItem value="Baja">Baja</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm text-slate-400">Responsable</label>
                <Select value={formData.responsible} onValueChange={(v) => setFormData({...formData, responsible: v})}>
                  <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-900 border-slate-700">
                    <SelectItem value="Admin">Admin</SelectItem>
                    <SelectItem value="Cliente">Cliente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleEdit} className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Kanban View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {statusColumns.map((column) => (
          <div key={column.id} className="flex flex-col">
            <div className="flex items-center gap-2 mb-3">
              <div className={`w-3 h-3 rounded-full ${column.color}`} />
              <h3 className="font-medium text-white">{column.label}</h3>
              <Badge variant="outline" className="ml-auto border-slate-600 text-slate-400">
                {getTasksByStatus(column.id).length}
              </Badge>
            </div>
            <div className="flex-1 space-y-2 min-h-[300px] p-2 rounded-lg bg-slate-800/20 border border-slate-800">
              {getTasksByStatus(column.id).map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onStatusChange={handleStatusChange}
                  onEdit={openEditDialog}
                  onDelete={handleDelete}
                  isAdmin={isAdmin()}
                />
              ))}
              {getTasksByStatus(column.id).length === 0 && (
                <p className="text-center text-slate-600 py-8 text-sm">Sin tareas</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
