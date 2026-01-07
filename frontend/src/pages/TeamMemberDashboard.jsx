import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { 
  BarChart3, 
  Clock, 
  CheckCircle2, 
  MessageSquare, 
  Mic,
  Calendar,
  TrendingUp,
  ListTodo,
  AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';

const TeamMemberDashboard = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    todayTasks: 0,
    weekTasks: 0,
    completedToday: 0,
    completedWeek: 0,
    todayHours: 0,
    weekHours: 0,
    todayComments: 0,
    weekComments: 0,
    todayAudios: 0,
    weekAudios: 0
  });
  const [recentTasks, setRecentTasks] = useState([]);
  const [recentComments, setRecentComments] = useState([]);
  const [timeRange, setTimeRange] = useState('today'); // 'today' or 'week'

  const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
  const token = localStorage.getItem('pactum_token');

  useEffect(() => {
    loadDashboardData();
  }, [timeRange]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Load tasks
      const tasksResponse = await fetch(`${API_URL}/api/tasks`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const tasks = await tasksResponse.json();
      
      // Filter tasks assigned to current user
      const myTasks = tasks.filter(task => task.assigned_to === user.id);
      
      // Get date ranges
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekStart = new Date(now);
      weekStart.setDate(weekStart.getDate() - 7);
      
      // Calculate stats
      const todayTasks = myTasks.filter(t => {
        const taskDate = new Date(t.created_at || t.updated_at);
        return taskDate >= todayStart;
      });
      
      const weekTasks = myTasks.filter(t => {
        const taskDate = new Date(t.created_at || t.updated_at);
        return taskDate >= weekStart;
      });
      
      const completedToday = myTasks.filter(t => {
        const taskDate = new Date(t.updated_at);
        return t.status === 'done' && taskDate >= todayStart;
      });
      
      const completedWeek = myTasks.filter(t => {
        const taskDate = new Date(t.updated_at);
        return t.status === 'done' && taskDate >= weekStart;
      });
      
      // Calculate hours
      const todayHours = completedToday.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
      const weekHours = completedWeek.reduce((sum, t) => sum + (t.actual_hours || 0), 0);
      
      // Load comments for all user's tasks
      let allComments = [];
      for (const task of myTasks) {
        try {
          const commentsResponse = await fetch(`${API_URL}/api/tasks/${task.id}/comments`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (commentsResponse.ok) {
            const taskComments = await commentsResponse.json();
            allComments = [...allComments, ...taskComments.filter(c => c.user_id === user.id)];
          }
        } catch (error) {
          console.error(`Error loading comments for task ${task.id}:`, error);
        }
      }
      
      const todayComments = allComments.filter(c => {
        const commentDate = new Date(c.created_at);
        return commentDate >= todayStart;
      });
      
      const weekComments = allComments.filter(c => {
        const commentDate = new Date(c.created_at);
        return commentDate >= weekStart;
      });
      
      const todayAudios = todayComments.filter(c => c.audio_url).length;
      const weekAudios = weekComments.filter(c => c.audio_url).length;
      
      setStats({
        todayTasks: todayTasks.length,
        weekTasks: weekTasks.length,
        completedToday: completedToday.length,
        completedWeek: completedWeek.length,
        todayHours,
        weekHours,
        todayComments: todayComments.length,
        weekComments: weekComments.length,
        todayAudios,
        weekAudios
      });
      
      // Set recent tasks (last 5 updated)
      const sortedTasks = [...myTasks].sort((a, b) => 
        new Date(b.updated_at || b.created_at) - new Date(a.updated_at || a.created_at)
      );
      setRecentTasks(sortedTasks.slice(0, 5));
      
      // Set recent comments
      const sortedComments = [...allComments].sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
      setRecentComments(sortedComments.slice(0, 5));
      
    } catch (error) {
      toast.error('Error al cargar datos del dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const formatChileTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleString('es-CL', {
      timeZone: 'America/Santiago',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      backlog: 'bg-slate-500/20 text-slate-300 border-slate-500/30',
      todo: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      in_progress: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      review: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      done: 'bg-green-500/20 text-green-300 border-green-500/30'
    };
    return colors[status] || colors.todo;
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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const isToday = timeRange === 'today';
  const displayStats = {
    tasks: isToday ? stats.todayTasks : stats.weekTasks,
    completed: isToday ? stats.completedToday : stats.completedWeek,
    hours: isToday ? stats.todayHours : stats.weekHours,
    comments: isToday ? stats.todayComments : stats.weekComments,
    audios: isToday ? stats.todayAudios : stats.weekAudios
  };

  const completionRate = displayStats.tasks > 0 
    ? Math.round((displayStats.completed / displayStats.tasks) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Mi Dashboard</h1>
          <p className="text-slate-400 mt-1">Resumen de tu actividad y rendimiento</p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant={isToday ? 'default' : 'outline'}
            onClick={() => setTimeRange('today')}
            className={isToday ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-700'}
          >
            <Calendar className="h-4 w-4 mr-2" />
            Hoy
          </Button>
          <Button
            variant={!isToday ? 'default' : 'outline'}
            onClick={() => setTimeRange('week')}
            className={!isToday ? 'bg-blue-600 hover:bg-blue-700' : 'border-slate-700'}
          >
            <BarChart3 className="h-4 w-4 mr-2" />
            Última Semana
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Tareas Asignadas</p>
                <p className="text-2xl font-bold text-white">{displayStats.tasks}</p>
              </div>
              <ListTodo className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Completadas</p>
                <p className="text-2xl font-bold text-green-400">{displayStats.completed}</p>
              </div>
              <CheckCircle2 className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Horas Trabajadas</p>
                <p className="text-2xl font-bold text-yellow-400">{displayStats.hours.toFixed(1)}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Comentarios</p>
                <p className="text-2xl font-bold text-purple-400">{displayStats.comments}</p>
              </div>
              <MessageSquare className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Audios</p>
                <p className="text-2xl font-bold text-orange-400">{displayStats.audios}</p>
              </div>
              <Mic className="h-8 w-8 text-orange-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Card */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Rendimiento {isToday ? 'de Hoy' : 'de la Semana'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-slate-400">Tasa de Completitud</span>
                <span className="text-lg font-bold text-white">{completionRate}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-3 rounded-full transition-all duration-500"
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
              <div>
                <p className="text-xs text-slate-500 mb-1">Promedio Horas/Tarea</p>
                <p className="text-xl font-semibold text-white">
                  {displayStats.completed > 0 
                    ? (displayStats.hours / displayStats.completed).toFixed(1) 
                    : '0.0'} hrs
                </p>
              </div>
              <div>
                <p className="text-xs text-slate-500 mb-1">Comentarios/Tarea</p>
                <p className="text-xl font-semibold text-white">
                  {displayStats.tasks > 0 
                    ? (displayStats.comments / displayStats.tasks).toFixed(1) 
                    : '0.0'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tasks */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <ListTodo className="h-5 w-5" />
              Tareas Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTasks.length === 0 && (
                <p className="text-center text-slate-500 py-8">No hay tareas recientes</p>
              )}
              {recentTasks.map(task => (
                <div key={task.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white mb-1 line-clamp-1">
                        {task.title}
                      </h4>
                      <p className="text-xs text-slate-500">
                        {formatChileTime(task.updated_at || task.created_at)}
                      </p>
                    </div>
                    <Badge className={`text-xs ${getStatusColor(task.status)}`}>
                      {getStatusLabel(task.status)}
                    </Badge>
                  </div>
                  {task.actual_hours && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-slate-400">
                      <Clock className="h-3 w-3" />
                      <span>{task.actual_hours} hrs</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Comments */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              Comentarios Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentComments.length === 0 && (
                <p className="text-center text-slate-500 py-8">No hay comentarios recientes</p>
              )}
              {recentComments.map(comment => (
                <div key={comment.id} className="bg-slate-900/50 border border-slate-700 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    {comment.audio_url && (
                      <Badge variant="secondary" className="text-xs">
                        <Mic className="h-3 w-3 mr-1" />
                        Audio
                      </Badge>
                    )}
                    {comment.images && comment.images.length > 0 && (
                      <Badge variant="secondary" className="text-xs">
                        📷 {comment.images.length}
                      </Badge>
                    )}
                    <span className="text-xs text-slate-500 ml-auto">
                      {formatChileTime(comment.created_at)}
                    </span>
                  </div>
                  {comment.text && (
                    <p className="text-sm text-slate-300 line-clamp-2">{comment.text}</p>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamMemberDashboard;
