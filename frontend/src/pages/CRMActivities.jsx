import { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, deleteActivity, getClients, getOpportunities } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Phone, 
  Plus, 
  Calendar,
  CheckCircle,
  Circle,
  Trash2,
  Edit,
  User,
  Clock,
  Bell,
  ListTodo
} from 'lucide-react';

const activityTypes = [
  { id: 'llamada', label: 'Llamada', icon: Phone, color: 'bg-blue-500' },
  { id: 'tarea', label: 'Tarea', icon: ListTodo, color: 'bg-purple-500' },
  { id: 'recordatorio', label: 'Recordatorio', icon: Bell, color: 'bg-amber-500' },
];

const typeColors = {
  'llamada': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'tarea': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'recordatorio': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
};

export default function CRMActivities() {
  const [activities, setActivities] = useState([]);
  const [clients, setClients] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editActivity, setEditActivity] = useState(null);
  const [filter, setFilter] = useState('all');
  const [formData, setFormData] = useState({
    client_id: '',
    opportunity_id: '',
    type: 'tarea',
    title: '',
    description: '',
    due_date: '',
    completed: false
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [activitiesRes, clientsRes, oppsRes] = await Promise.all([
        getActivities(),
        getClients(),
        getOpportunities()
      ]);
      setActivities(activitiesRes.data);
      setClients(clientsRes.data);
      setOpportunities(oppsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleComplete = async (activity) => {
    try {
      await updateActivity(activity.id, { completed: !activity.completed });
      setActivities(activities.map(a => 
        a.id === activity.id ? { ...a, completed: !a.completed } : a
      ));
      toast.success(activity.completed ? 'Marcado como pendiente' : 'Completado');
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleCreate = async () => {
    if (!formData.title.trim()) {
      toast.error('El título es requerido');
      return;
    }

    try {
      await createActivity(formData);
      toast.success('Actividad creada');
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating activity:', error);
      toast.error('Error al crear');
    }
  };

  const handleUpdate = async () => {
    if (!editActivity) return;

    try {
      await updateActivity(editActivity.id, formData);
      toast.success('Actividad actualizada');
      setEditActivity(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating activity:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (activityId) => {
    if (!window.confirm('¿Eliminar esta actividad?')) return;

    try {
      await deleteActivity(activityId);
      toast.success('Actividad eliminada');
      fetchData();
    } catch (error) {
      console.error('Error deleting activity:', error);
      toast.error('Error al eliminar');
    }
  };

  const openEditDialog = (activity) => {
    setEditActivity(activity);
    setFormData({
      client_id: activity.client_id || '',
      opportunity_id: activity.opportunity_id || '',
      type: activity.type,
      title: activity.title,
      description: activity.description || '',
      due_date: activity.due_date || '',
      completed: activity.completed
    });
  };

  const resetForm = () => {
    setFormData({ client_id: '', opportunity_id: '', type: 'tarea', title: '', description: '', due_date: '', completed: false });
  };

  const filteredActivities = activities.filter(activity => {
    if (filter === 'pending') return !activity.completed;
    if (filter === 'completed') return activity.completed;
    return true;
  }).sort((a, b) => {
    // Sort by due date, then by completion status
    if (a.completed !== b.completed) return a.completed ? 1 : -1;
    if (a.due_date && b.due_date) return new Date(a.due_date) - new Date(b.due_date);
    return 0;
  });

  const pendingCount = activities.filter(a => !a.completed).length;
  const todayCount = activities.filter(a => {
    if (!a.due_date || a.completed) return false;
    const today = new Date().toISOString().split('T')[0];
    return a.due_date === today;
  }).length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="crm-activities">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Actividades</h1>
          <p className="text-slate-400 mt-1">{pendingCount} pendientes, {todayCount} para hoy</p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36 bg-slate-800/50 border-slate-700" data-testid="activity-filter">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-slate-900 border-slate-700">
              <SelectItem value="all">Todas</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="completed">Completadas</SelectItem>
            </SelectContent>
          </Select>
          
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-activity-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Actividad
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Nueva Actividad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Tipo</label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({...formData, type: v})}>
                    <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {activityTypes.map(type => (
                        <SelectItem key={type.id} value={type.id}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Título *</label>
                  <Input
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="mt-1 bg-slate-800/50 border-slate-700"
                    data-testid="activity-title-input"
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
                    <label className="text-sm text-slate-400">Cliente</label>
                    <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                        <SelectValue placeholder="Seleccionar" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        <SelectItem value="">Ninguno</SelectItem>
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Fecha</label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                      className="mt-1 bg-slate-800/50 border-slate-700"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700" data-testid="save-activity-btn">
                  Crear Actividad
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editActivity} onOpenChange={(open) => !open && setEditActivity(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Actividad</DialogTitle>
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
            <div>
              <label className="text-sm text-slate-400">Fecha</label>
              <Input
                type="date"
                value={formData.due_date}
                onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Activities List */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <ListTodo className="w-5 h-5 text-blue-400" />
            Lista de Actividades
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActivities.length === 0 ? (
              <p className="text-center text-slate-500 py-8">No hay actividades</p>
            ) : (
              filteredActivities.map((activity, index) => {
                const client = clients.find(c => c.id === activity.client_id);
                const typeInfo = activityTypes.find(t => t.id === activity.type);
                const TypeIcon = typeInfo?.icon || ListTodo;
                const isOverdue = activity.due_date && !activity.completed && new Date(activity.due_date) < new Date();
                
                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors ${
                      activity.completed 
                        ? 'bg-slate-800/30 border-slate-800' 
                        : isOverdue 
                          ? 'bg-red-500/5 border-red-500/30' 
                          : 'bg-slate-800/50 border-slate-700'
                    }`}
                    data-testid={`activity-item-${activity.id}`}
                  >
                    <button 
                      onClick={() => handleToggleComplete(activity)}
                      className="mt-1 flex-shrink-0"
                    >
                      {activity.completed ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400" />
                      ) : (
                        <Circle className="w-5 h-5 text-slate-500 hover:text-blue-400 transition-colors" />
                      )}
                    </button>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className={`font-medium ${activity.completed ? 'text-slate-500 line-through' : 'text-white'}`}>
                            {activity.title}
                          </p>
                          {activity.description && (
                            <p className="text-sm text-slate-400 mt-1">{activity.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-1 flex-shrink-0">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => openEditDialog(activity)}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400" onClick={() => handleDelete(activity.id)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 mt-2 flex-wrap">
                        <Badge className={typeColors[activity.type]}>
                          <TypeIcon className="w-3 h-3 mr-1" />
                          {typeInfo?.label}
                        </Badge>
                        {client && (
                          <span className="text-xs text-slate-400 flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {client.name}
                          </span>
                        )}
                        {activity.due_date && (
                          <span className={`text-xs flex items-center gap-1 ${isOverdue ? 'text-red-400' : 'text-slate-400'}`}>
                            <Calendar className="w-3 h-3" />
                            {new Date(activity.due_date).toLocaleDateString('es-ES')}
                            {isOverdue && <span className="text-red-400">(Vencida)</span>}
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
