import { useState, useEffect } from 'react';
import { getActivityLogs } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Activity, 
  CheckSquare,
  Layers,
  CreditCard,
  Users,
  FileText,
  TrendingUp,
  Clock,
  User
} from 'lucide-react';

const entityIcons = {
  'task': CheckSquare,
  'phase': Layers,
  'payment': CreditCard,
  'client': Users,
  'contract': FileText,
  'opportunity': TrendingUp,
  'project': FileText
};

const actionColors = {
  'created': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'updated': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'deleted': 'bg-red-500/20 text-red-400 border-red-500/30',
  'approved': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'status_changed': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'stage_changed': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'comment_added': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'uploaded': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const actionLabels = {
  'created': 'Creado',
  'updated': 'Actualizado',
  'deleted': 'Eliminado',
  'approved': 'Aprobado',
  'status_changed': 'Estado cambiado',
  'stage_changed': 'Etapa cambiada',
  'comment_added': 'Comentario agregado',
  'uploaded': 'Subido',
};

const entityLabels = {
  'task': 'Tarea',
  'phase': 'Fase',
  'payment': 'Pago',
  'client': 'Cliente',
  'contract': 'Contrato',
  'opportunity': 'Oportunidad',
  'project': 'Proyecto'
};

export default function ActivityLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, [filter]);

  const fetchLogs = async () => {
    try {
      const entityType = filter !== 'all' ? filter : undefined;
      const response = await getActivityLogs(entityType, 200);
      setLogs(response.data);
    } catch (error) {
      console.error('Error loading logs:', error);
      toast.error('Error al cargar el historial');
    } finally {
      setLoading(false);
    }
  };

  const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Hace un momento';
    if (diffMins < 60) return `Hace ${diffMins} min`;
    if (diffHours < 24) return `Hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `Hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
    });
  };

  const formatChanges = (changes) => {
    if (!changes || Object.keys(changes).length === 0) return null;
    
    const parts = [];
    if (changes.old_status && changes.new_status) {
      parts.push(`${changes.old_status} → ${changes.new_status}`);
    }
    if (changes.old_stage && changes.new_stage) {
      parts.push(`${changes.old_stage} → ${changes.new_stage}`);
    }
    if (changes.title) {
      parts.push(`"${changes.title}"`);
    }
    if (changes.name) {
      parts.push(`"${changes.name}"`);
    }
    if (changes.filename) {
      parts.push(`Archivo: ${changes.filename}`);
    }
    if (changes.comment) {
      parts.push(`"${changes.comment.substring(0, 50)}${changes.comment.length > 50 ? '...' : ''}"`);
    }
    if (changes.approved_by) {
      parts.push(`Por: ${changes.approved_by}`);
    }
    
    return parts.length > 0 ? parts.join(' • ') : null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="activity-log">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Historial de Actividad</h1>
          <p className="text-slate-400 mt-1">Registro de cambios de los últimos 30 días</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-44 bg-slate-800/50 border-slate-700" data-testid="log-filter">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900 border-slate-700">
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="task">Tareas</SelectItem>
            <SelectItem value="phase">Fases</SelectItem>
            <SelectItem value="payment">Pagos</SelectItem>
            <SelectItem value="client">Clientes</SelectItem>
            <SelectItem value="opportunity">Oportunidades</SelectItem>
            <SelectItem value="contract">Contratos</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Activity Timeline */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Registro de Cambios
            <Badge variant="outline" className="ml-2 border-slate-600 text-slate-400">
              {logs.length} eventos
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-slate-600 mx-auto mb-4" />
              <p className="text-slate-400">No hay actividad registrada</p>
            </div>
          ) : (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-slate-700" />
              
              <div className="space-y-4">
                {logs.map((log, index) => {
                  const Icon = entityIcons[log.entity_type] || Activity;
                  const changeDetails = formatChanges(log.changes);
                  
                  return (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03 }}
                      className="relative pl-14"
                      data-testid={`log-entry-${log.id}`}
                    >
                      {/* Timeline dot */}
                      <div className="absolute left-3 top-2 w-6 h-6 rounded-full bg-slate-800 border-2 border-slate-700 flex items-center justify-center">
                        <Icon className="w-3 h-3 text-slate-400" />
                      </div>
                      
                      <div className="p-4 rounded-lg bg-slate-800/30 border border-slate-700/50 hover:border-slate-600 transition-colors">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <Badge className={actionColors[log.action] || 'bg-slate-500/20 text-slate-400'}>
                                {actionLabels[log.action] || log.action}
                              </Badge>
                              <Badge variant="outline" className="border-slate-600 text-slate-400">
                                {entityLabels[log.entity_type] || log.entity_type}
                              </Badge>
                            </div>
                            
                            {changeDetails && (
                              <p className="text-sm text-slate-300 mt-2">{changeDetails}</p>
                            )}
                            
                            <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                              <span className="flex items-center gap-1">
                                <User className="w-3 h-3" />
                                {log.user_name}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {formatTimestamp(log.timestamp)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Retention Notice */}
      <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/30">
        <p className="text-sm text-blue-400 flex items-center gap-2">
          <Clock className="w-4 h-4" />
          Los registros de actividad se conservan por 30 días. Los datos más antiguos son eliminados automáticamente.
        </p>
      </div>
    </div>
  );
}
