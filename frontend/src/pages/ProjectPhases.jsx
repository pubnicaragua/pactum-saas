import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { getPhases, updatePhase, createPhaseComment } from '../lib/api-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import ProjectSelector from '../components/ProjectSelector';
import { 
  Layers, 
  Calendar, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  MessageSquare,
  Send,
  ChevronRight
} from 'lucide-react';

const statusColors = {
  'pendiente': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'en_progreso': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'completado': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
};

const statusIcons = {
  'pendiente': Clock,
  'en_progreso': AlertCircle,
  'completado': CheckCircle
};

export default function ProjectPhases() {
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhase, setSelectedPhase] = useState(null);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    fetchPhases();
    
    // Listen for project updates
    const handleProjectUpdate = () => {
      fetchPhases();
    };
    
    window.addEventListener('projectUpdated', handleProjectUpdate);
    window.addEventListener('projectChanged', handleProjectUpdate);
    
    return () => {
      window.removeEventListener('projectUpdated', handleProjectUpdate);
      window.removeEventListener('projectChanged', handleProjectUpdate);
    };
  }, []);

  const fetchPhases = async () => {
    try {
      const response = await getPhases();
      setPhases(response.data);
    } catch (error) {
      console.error('Error loading phases:', error);
      toast.error('Error al cargar las fases');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (phaseId, newStatus) => {
    try {
      await updatePhase(phaseId, { status: newStatus });
      toast.success('Estado actualizado');
      fetchPhases();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar estado');
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
    <div className="space-y-8" data-testid="project-phases">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Fases del Proyecto</h1>
        <p className="text-slate-400 mt-1">Gestiona y aprueba las fases del proyecto CRM</p>
      </div>

      {/* Project Selector for COMPANY_ADMIN */}
      <ProjectSelector />
      
      {/* Timeline */}
      <div className="relative">
        {Array.isArray(phases) && phases.map((phase, index) => {
          // Normalizar status y obtener icono de forma segura
          const statusKey = phase.status ? String(phase.status).toLowerCase().trim() : 'pendiente';
          const IconComponent = statusIcons[statusKey] || Clock;
          
          return (
            <motion.div
              key={phase.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative pl-8 pb-8 last:pb-0"
            >
              {/* Timeline line */}
              {index < phases.length - 1 && (
                <div className="absolute left-3 top-8 bottom-0 w-0.5 bg-slate-700" />
              )}
              
              {/* Timeline dot */}
              <div className={`absolute left-0 top-1 w-6 h-6 rounded-full flex items-center justify-center ${
                statusKey === 'completado' ? 'bg-emerald-500' : 
                statusKey === 'en_progreso' ? 'bg-blue-500' : 'bg-slate-600'
              }`}>
                {React.createElement(IconComponent, { className: "w-3 h-3 text-white" })}
              </div>

              <Card className="bg-slate-800/50 border-slate-700/50 hover:border-slate-600 transition-colors">
                <CardHeader className="pb-2">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <CardTitle className="text-xl text-white">{phase.name}</CardTitle>
                      <Badge className={statusColors[phase.status]}>
                        {phase.status}
                      </Badge>
                      {phase.is_approved && (
                        <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Aprobada
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {isAdmin() && (
                        <Select
                          value={phase.status}
                          onValueChange={(value) => handleStatusChange(phase.id, value)}
                        >
                          <SelectTrigger className="w-40 bg-slate-900/50 border-slate-700" data-testid={`phase-status-${phase.id}`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-slate-900 border-slate-700">
                            <SelectItem value="pendiente">Pendiente</SelectItem>
                            <SelectItem value="en_progreso">En progreso</SelectItem>
                            <SelectItem value="completado">Completada</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                      {!phase.is_approved && (
                        <Button
                          onClick={() => handleApprove(phase.id)}
                          className="bg-emerald-600 hover:bg-emerald-700"
                          data-testid={`approve-phase-${phase.id}`}
                        >
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Aprobar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Calendar className="w-4 h-4" />
                    <span>Semana {phase.week}: {phase.start_date} - {phase.end_date}</span>
                  </div>

                  {phase.description && (
                    <p className="text-slate-300">{phase.description}</p>
                  )}

                  {/* Deliverables */}
                  <div>
                    <h4 className="text-sm font-medium text-slate-400 mb-2">Entregables:</h4>
                    <ul className="space-y-2">
                      {phase.deliverables?.map((deliverable, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-slate-300">{deliverable}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Approval Criteria */}
                  <div className="p-3 rounded-lg bg-slate-700/30 border border-slate-700">
                    <p className="text-sm text-slate-400">
                      <strong className="text-slate-300">Criterio de aprobación:</strong> {phase.approval_criteria}
                    </p>
                  </div>

                  {/* Approved Info */}
                  {phase.is_approved && phase.approved_at && (
                    <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
                      <p className="text-sm text-emerald-400">
                        Aprobada el {new Date(phase.approved_at).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  )}

                  {/* Comments Section */}
                  <div className="pt-4 border-t border-slate-700">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          className="border-slate-700 hover:bg-slate-700/50"
                          onClick={() => setSelectedPhase(phase)}
                          data-testid={`comments-btn-${phase.id}`}
                        >
                          <MessageSquare className="w-4 h-4 mr-2" />
                          Comentarios ({phase.comments?.length || 0})
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
                        <DialogHeader>
                          <DialogTitle className="text-white">Comentarios - {phase.name}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 max-h-96 overflow-y-auto">
                          {phase.comments?.length === 0 && (
                            <p className="text-center text-slate-500 py-8">No hay comentarios aún</p>
                          )}
                          {phase.comments?.map((comment) => (
                            <div key={comment.id} className="p-3 rounded-lg bg-slate-800/50">
                              <div className="flex items-center gap-2 mb-2">
                                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                                  <span className="text-white text-xs font-medium">
                                    {comment.user_name?.charAt(0)}
                                  </span>
                                </div>
                                <div>
                                  <p className="text-sm font-medium text-white">{comment.user_name}</p>
                                  <p className="text-xs text-slate-500">
                                    {new Date(comment.created_at).toLocaleDateString('es-ES')}
                                  </p>
                                </div>
                              </div>
                              <p className="text-slate-300 text-sm">{comment.text}</p>
                            </div>
                          ))}
                        </div>
                        <div className="flex gap-2 pt-4 border-t border-slate-700">
                          <Textarea
                            placeholder="Escribe un comentario..."
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            className="bg-slate-800/50 border-slate-700 resize-none"
                            rows={2}
                            data-testid="comment-input"
                          />
                          <Button
                            onClick={handleAddComment}
                            disabled={submitting || !newComment.trim()}
                            className="bg-blue-600 hover:bg-blue-700"
                            data-testid="send-comment-btn"
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
