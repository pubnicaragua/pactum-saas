import React, { useState, useEffect } from 'react';
import { getActivities, createActivity, updateActivity, deleteActivity, getClients, getCompanyUsers } from '../lib/api-multitenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Calendar, List, Edit, Trash2, Phone, Video, Mail, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, parseISO, startOfWeek, endOfWeek } from 'date-fns';
import { es } from 'date-fns/locale';

const ActivitiesManagement = () => {
  const [activities, setActivities] = useState([]);
  const [clients, setClients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState('list');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'tarea',
    client_id: '',
    assigned_to: '',
    start_date: '',
    end_date: '',
    status: 'pendiente',
    priority: 'media'
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [activitiesRes, clientsRes, usersRes] = await Promise.all([
        getActivities(),
        getClients(),
        getCompanyUsers()
      ]);
      setActivities(activitiesRes.data);
      setClients(clientsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Error loading activities:', error);
      toast.error('Error al cargar actividades');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (activity = null) => {
    if (activity) {
      setSelectedActivity(activity);
      setFormData({
        title: activity.title || '',
        description: activity.description || '',
        type: activity.type || 'tarea',
        client_id: activity.client_id || '',
        assigned_to: activity.assigned_to || '',
        start_date: activity.start_date ? activity.start_date.split('T')[0] + 'T' + activity.start_date.split('T')[1].substring(0, 5) : '',
        end_date: activity.end_date ? activity.end_date.split('T')[0] + 'T' + activity.end_date.split('T')[1].substring(0, 5) : '',
        status: activity.status || 'pendiente',
        priority: activity.priority || 'media'
      });
    } else {
      setSelectedActivity(null);
      const now = new Date();
      const startDate = format(now, "yyyy-MM-dd'T'HH:mm");
      const endDate = format(new Date(now.getTime() + 60 * 60 * 1000), "yyyy-MM-dd'T'HH:mm");
      setFormData({
        title: '',
        description: '',
        type: 'tarea',
        client_id: '',
        assigned_to: '',
        start_date: startDate,
        end_date: endDate,
        status: 'pendiente',
        priority: 'media'
      });
    }
    setDialogOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const submitData = {
        ...formData,
        start_date: new Date(formData.start_date).toISOString(),
        end_date: formData.end_date ? new Date(formData.end_date).toISOString() : null,
        client_id: formData.client_id || null,
        assigned_to: formData.assigned_to || null
      };

      if (selectedActivity) {
        await updateActivity(selectedActivity.id, submitData);
        toast.success('Actividad actualizada');
      } else {
        await createActivity(submitData);
        toast.success('Actividad creada');
      }
      setDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al guardar actividad');
    }
  };

  const handleDelete = async () => {
    try {
      await deleteActivity(selectedActivity.id);
      toast.success('Actividad eliminada');
      setDeleteDialogOpen(false);
      loadData();
    } catch (error) {
      toast.error('Error al eliminar actividad');
    }
  };

  const handleToggleComplete = async (activity) => {
    try {
      await updateActivity(activity.id, {
        completed: !activity.completed,
        status: !activity.completed ? 'completada' : 'pendiente'
      });
      toast.success(activity.completed ? 'Marcada como pendiente' : 'Marcada como completada');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar actividad');
    }
  };

  const getActivityIcon = (type) => {
    switch (type) {
      case 'llamada': return <Phone className="h-4 w-4" />;
      case 'reunion': return <Video className="h-4 w-4" />;
      case 'email': return <Mail className="h-4 w-4" />;
      default: return <CheckCircle2 className="h-4 w-4" />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'alta': return 'destructive';
      case 'media': return 'default';
      case 'baja': return 'secondary';
      default: return 'outline';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completada': return 'default';
      case 'en_progreso': return 'secondary';
      case 'pendiente': return 'outline';
      default: return 'outline';
    }
  };

  // Calendar View Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  const calendarDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const getActivitiesForDay = (day) => {
    return activities.filter(activity => {
      const activityDate = parseISO(activity.start_date);
      return isSameDay(activityDate, day);
    });
  };

  const CalendarView = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">
          {format(currentDate, 'MMMM yyyy', { locale: es })}
        </h2>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
          >
            Anterior
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date())}
          >
            Hoy
          </Button>
          <Button
            variant="outline"
            onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
          >
            Siguiente
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(day => (
          <div key={day} className="text-center font-semibold text-sm text-gray-600 p-2">
            {day}
          </div>
        ))}
        {calendarDays.map(day => {
          const dayActivities = getActivitiesForDay(day);
          const isCurrentMonth = day.getMonth() === currentDate.getMonth();
          const isToday = isSameDay(day, new Date());

          return (
            <div
              key={day.toISOString()}
              className={`min-h-24 p-2 border rounded-lg ${
                isCurrentMonth ? 'bg-white' : 'bg-gray-50'
              } ${isToday ? 'border-blue-500 border-2' : 'border-gray-200'}`}
            >
              <div className={`text-sm font-medium mb-1 ${isToday ? 'text-blue-600' : 'text-gray-600'}`}>
                {format(day, 'd')}
              </div>
              <div className="space-y-1">
                {dayActivities.slice(0, 3).map(activity => (
                  <div
                    key={activity.id}
                    className={`text-xs p-1 rounded cursor-pointer hover:opacity-80 ${
                      activity.completed ? 'bg-green-100 text-green-800' :
                      activity.priority === 'alta' ? 'bg-red-100 text-red-800' :
                      activity.priority === 'media' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}
                    onClick={() => handleOpenDialog(activity)}
                  >
                    <div className="truncate font-medium">{activity.title}</div>
                  </div>
                ))}
                {dayActivities.length > 3 && (
                  <div className="text-xs text-gray-500 text-center">
                    +{dayActivities.length - 3} más
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  const ListView = () => (
    <div className="space-y-4">
      {activities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-gray-500">No hay actividades registradas</p>
          </CardContent>
        </Card>
      ) : (
        activities.map((activity) => (
          <Card key={activity.id} className={`hover:shadow-lg transition-shadow ${activity.completed ? 'opacity-60' : ''}`}>
            <CardContent className="p-4">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getActivityIcon(activity.type)}
                    <h3 className={`font-semibold text-lg ${activity.completed ? 'line-through' : ''}`}>
                      {activity.title}
                    </h3>
                    <Badge variant={getStatusColor(activity.status)}>
                      {activity.status}
                    </Badge>
                    <Badge variant={getPriorityColor(activity.priority)}>
                      {activity.priority}
                    </Badge>
                  </div>
                  {activity.description && (
                    <p className="text-gray-600 text-sm mb-2">{activity.description}</p>
                  )}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {format(parseISO(activity.start_date), "dd MMM yyyy HH:mm", { locale: es })}
                    </div>
                    {activity.client_name && (
                      <div>Cliente: <span className="font-medium">{activity.client_name}</span></div>
                    )}
                    {activity.assigned_to_name && (
                      <div>Asignado a: <span className="font-medium">{activity.assigned_to_name}</span></div>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={activity.completed ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleToggleComplete(activity)}
                  >
                    {activity.completed ? 'Reabrir' : 'Completar'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleOpenDialog(activity)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      setSelectedActivity(activity);
                      setDeleteDialogOpen(true);
                    }}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestión de Actividades</h1>
          <p className="text-gray-500">Organiza y da seguimiento a tus actividades</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => handleOpenDialog()}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{selectedActivity ? 'Editar Actividad' : 'Nueva Actividad'}</DialogTitle>
              <DialogDescription>
                {selectedActivity ? 'Actualiza la información de la actividad' : 'Crea una nueva actividad o tarea'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="title">Título *</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                    placeholder="Reunión con cliente..."
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detalles de la actividad..."
                    rows={3}
                  />
                </div>
                <div>
                  <Label htmlFor="type">Tipo *</Label>
                  <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="llamada">Llamada</SelectItem>
                      <SelectItem value="reunion">Reunión</SelectItem>
                      <SelectItem value="tarea">Tarea</SelectItem>
                      <SelectItem value="seguimiento">Seguimiento</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="priority">Prioridad *</Label>
                  <Select value={formData.priority} onValueChange={(value) => setFormData({ ...formData, priority: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baja">Baja</SelectItem>
                      <SelectItem value="media">Media</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="client_id">Cliente</Label>
                  <Select value={formData.client_id} onValueChange={(value) => setFormData({ ...formData, client_id: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin cliente</SelectItem>
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="assigned_to">Asignado a</Label>
                  <Select value={formData.assigned_to} onValueChange={(value) => setFormData({ ...formData, assigned_to: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar usuario" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Sin asignar</SelectItem>
                      {users.map(user => (
                        <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="start_date">Fecha y Hora Inicio *</Label>
                  <Input
                    id="start_date"
                    type="datetime-local"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="end_date">Fecha y Hora Fin</Label>
                  <Input
                    id="end_date"
                    type="datetime-local"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label htmlFor="status">Estado *</Label>
                  <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pendiente">Pendiente</SelectItem>
                      <SelectItem value="en_progreso">En Progreso</SelectItem>
                      <SelectItem value="completada">Completada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {selectedActivity ? 'Actualizar' : 'Crear'} Actividad
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* View Toggle */}
      <Tabs value={viewMode} onValueChange={setViewMode}>
        <TabsList>
          <TabsTrigger value="list">
            <List className="h-4 w-4 mr-2" />
            Lista
          </TabsTrigger>
          <TabsTrigger value="calendar">
            <Calendar className="h-4 w-4 mr-2" />
            Calendario
          </TabsTrigger>
        </TabsList>
        <TabsContent value="list" className="mt-6">
          <ListView />
        </TabsContent>
        <TabsContent value="calendar" className="mt-6">
          <CalendarView />
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar actividad?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. Se eliminará permanentemente la actividad{' '}
              <strong>{selectedActivity?.title}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ActivitiesManagement;
