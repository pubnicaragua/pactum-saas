import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { toast } from 'sonner';
import { ArrowRight, User, Calendar, FileText, Search } from 'lucide-react';

const ReassignmentHistory = () => {
  const [reassignments, setReassignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterUser, setFilterUser] = useState('all');

  useEffect(() => {
    loadReassignments();
  }, []);

  const loadReassignments = async () => {
    try {
      const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
      const token = localStorage.getItem('pactum_token');
      
      const response = await fetch(`${API_URL}/api/tasks/reassignments/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al cargar historial');

      const data = await response.json();
      setReassignments(data);
    } catch (error) {
      toast.error('Error al cargar historial de reasignaciones');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uniqueUsers = [...new Set(reassignments.flatMap(r => [r.from_user_name, r.to_user_name]))];

  const filteredReassignments = reassignments.filter(r => {
    const matchesSearch = 
      r.task_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.from_user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.to_user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesUser = filterUser === 'all' || 
      r.from_user_name === filterUser || 
      r.to_user_name === filterUser;

    return matchesSearch && matchesUser;
  });

  const getStatsByUser = () => {
    const stats = {};
    reassignments.forEach(r => {
      // Count tasks reassigned FROM this user
      if (!stats[r.from_user_name]) {
        stats[r.from_user_name] = { sent: 0, received: 0 };
      }
      stats[r.from_user_name].sent += 1;

      // Count tasks reassigned TO this user
      if (!stats[r.to_user_name]) {
        stats[r.to_user_name] = { sent: 0, received: 0 };
      }
      stats[r.to_user_name].received += 1;
    });
    return stats;
  };

  const userStats = getStatsByUser();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Historial de Reasignaciones</h1>
        <p className="text-slate-400 mt-1">Seguimiento completo de tareas reasignadas</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Total Reasignaciones</p>
                <p className="text-2xl font-bold text-white">{reassignments.length}</p>
              </div>
              <ArrowRight className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Usuarios Involucrados</p>
                <p className="text-2xl font-bold text-white">{uniqueUsers.length}</p>
              </div>
              <User className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-400">Última Reasignación</p>
                <p className="text-sm font-semibold text-white">
                  {reassignments.length > 0 
                    ? new Date(reassignments[0].reassigned_at).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* User Stats */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">Estadísticas por Usuario</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(userStats).map(([userName, stats]) => (
              <div key={userName} className="p-4 bg-slate-900 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 mb-2">
                  <User className="h-4 w-4 text-blue-400" />
                  <p className="font-semibold text-white">{userName}</p>
                </div>
                <div className="flex gap-4 text-sm">
                  <div>
                    <p className="text-slate-400">Reasignadas</p>
                    <p className="text-orange-400 font-bold">{stats.sent}</p>
                  </div>
                  <div>
                    <p className="text-slate-400">Recibidas</p>
                    <p className="text-green-400 font-bold">{stats.received}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  placeholder="Buscar por tarea, usuario o motivo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>
            <div>
              <select
                value={filterUser}
                onChange={(e) => setFilterUser(e.target.value)}
                className="w-full md:w-48 px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white"
              >
                <option value="all">Todos los usuarios</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Reassignments List */}
      <Card className="border-slate-700 bg-slate-800/50">
        <CardHeader>
          <CardTitle className="text-white">
            Historial Detallado ({filteredReassignments.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredReassignments.length === 0 ? (
              <div className="text-center py-12 text-slate-500">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No se encontraron reasignaciones</p>
              </div>
            ) : (
              filteredReassignments.map((reassignment, index) => (
                <div
                  key={`${reassignment.task_id}-${index}`}
                  className="p-4 bg-slate-900 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileText className="h-4 w-4 text-blue-400" />
                        <h3 className="font-semibold text-white">{reassignment.task_title}</h3>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className="bg-red-500/20 text-red-300 border-red-500/30">
                          {reassignment.from_user_name}
                        </Badge>
                        <ArrowRight className="h-4 w-4 text-slate-500" />
                        <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                          {reassignment.to_user_name}
                        </Badge>
                      </div>

                      <div className="bg-slate-800 p-3 rounded border border-slate-700 mt-2">
                        <p className="text-sm text-slate-400 mb-1">Motivo:</p>
                        <p className="text-sm text-slate-200">{reassignment.reason}</p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 text-sm text-slate-400">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span>{new Date(reassignment.reassigned_at).toLocaleString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span>Por: {reassignment.reassigned_by_name}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReassignmentHistory;
