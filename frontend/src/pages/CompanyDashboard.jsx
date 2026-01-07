import React, { useState, useEffect } from 'react';
import { getDashboardStats, getClients, getActivities } from '../lib/api-multitenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { Users, Calendar, CheckCircle2, Clock, TrendingUp, Activity } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CompanyDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await getDashboardStats();
      setStats(response.data);
    } catch (error) {
      toast.error('Error al cargar estadísticas');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500">Resumen de tu empresa</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="cursor-pointer hover:shadow-lg hover:shadow-slate-700/50 transition-shadow bg-slate-800/50 border-slate-700" onClick={() => navigate('/clientes')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Total Clientes</CardTitle>
            <Users className="h-4 w-4 text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.total_clients || 0}</div>
            <p className="text-xs text-slate-400">
              {stats?.active_clients || 0} activos
            </p>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg hover:shadow-slate-700/50 transition-shadow bg-slate-800/50 border-slate-700" onClick={() => navigate('/actividades')}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Actividades Pendientes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.pending_activities || 0}</div>
            <p className="text-xs text-slate-400">
              {stats?.total_activities || 0} total
            </p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-300">Completadas</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{stats?.completed_activities || 0}</div>
            <p className="text-xs text-slate-400">
              Este mes
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuarios</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              En tu empresa
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activities */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Actividades Recientes</CardTitle>
            <CardDescription>Últimas 10 actividades creadas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent_activities?.slice(0, 10).map((activity) => (
                <div key={activity.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{activity.title}</h4>
                      <Badge variant={
                        activity.status === 'completada' ? 'default' :
                        activity.status === 'en_progreso' ? 'secondary' :
                        'outline'
                      }>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">{activity.type}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      {new Date(activity.start_date).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={
                    activity.priority === 'alta' ? 'destructive' :
                    activity.priority === 'media' ? 'default' :
                    'secondary'
                  }>
                    {activity.priority}
                  </Badge>
                </div>
              ))}
              {(!stats?.recent_activities || stats.recent_activities.length === 0) && (
                <p className="text-center text-gray-500 py-8">No hay actividades recientes</p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/actividades')}
            >
              Ver Todas las Actividades
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Clientes Recientes</CardTitle>
            <CardDescription>Últimos 10 clientes agregados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats?.recent_clients?.slice(0, 10).map((client) => (
                <div key={client.id} className="flex items-start justify-between p-3 border rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <h4 className="font-medium">{client.name}</h4>
                    {client.company_name && (
                      <p className="text-sm text-gray-500">{client.company_name}</p>
                    )}
                    <div className="flex gap-2 mt-1">
                      {client.email && (
                        <span className="text-xs text-gray-400">{client.email}</span>
                      )}
                      {client.phone && (
                        <span className="text-xs text-gray-400">{client.phone}</span>
                      )}
                    </div>
                  </div>
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status}
                  </Badge>
                </div>
              ))}
              {(!stats?.recent_clients || stats.recent_clients.length === 0) && (
                <p className="text-center text-gray-500 py-8">No hay clientes recientes</p>
              )}
            </div>
            <Button 
              variant="outline" 
              className="w-full mt-4"
              onClick={() => navigate('/clientes')}
            >
              Ver Todos los Clientes
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CompanyDashboard;
