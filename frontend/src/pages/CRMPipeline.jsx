import { useState, useEffect } from 'react';
import { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity, getClients } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  TrendingUp, 
  Plus, 
  DollarSign,
  Percent,
  Calendar,
  Trash2,
  Edit,
  User
} from 'lucide-react';

const stages = [
  { id: 'Prospecto', label: 'Prospecto', color: 'bg-slate-500' },
  { id: 'Calificado', label: 'Calificado', color: 'bg-blue-500' },
  { id: 'Propuesta', label: 'Propuesta', color: 'bg-purple-500' },
  { id: 'Negociación', label: 'Negociación', color: 'bg-amber-500' },
  { id: 'Cierre', label: 'Cierre', color: 'bg-orange-500' },
  { id: 'Ganada', label: 'Ganada', color: 'bg-emerald-500' },
  { id: 'Perdida', label: 'Perdida', color: 'bg-red-500' },
];

const stageColors = {
  'Prospecto': 'bg-slate-500/20 text-slate-400 border-slate-500/30',
  'Calificado': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'Propuesta': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  'Negociación': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  'Cierre': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  'Ganada': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'Perdida': 'bg-red-500/20 text-red-400 border-red-500/30',
};

const OpportunityCard = ({ opp, clients, onStageChange, onEdit, onDelete }) => {
  const client = clients.find(c => c.id === opp.client_id);
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-3 rounded-lg bg-slate-800/80 border border-slate-700 hover:border-slate-600 transition-all group"
      data-testid={`opp-card-${opp.id}`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="font-medium text-white text-sm truncate">{opp.name}</p>
          {client && (
            <p className="text-xs text-slate-400 flex items-center gap-1 mt-1">
              <User className="w-3 h-3" />
              {client.name}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => onEdit(opp)}>
            <Edit className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-400" onClick={() => onDelete(opp.id)}>
            <Trash2 className="w-3 h-3" />
          </Button>
        </div>
      </div>
      
      <div className="flex items-center gap-3 mt-3">
        <div className="flex items-center gap-1 text-emerald-400">
          <DollarSign className="w-4 h-4" />
          <span className="font-semibold">${opp.value?.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-slate-400">
          <Percent className="w-3 h-3" />
          <span className="text-sm">{opp.probability}%</span>
        </div>
      </div>
      
      {opp.expected_close_date && (
        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
          <Calendar className="w-3 h-3" />
          Cierre: {new Date(opp.expected_close_date).toLocaleDateString('es-ES')}
        </p>
      )}
      
      <Select value={opp.stage} onValueChange={(value) => onStageChange(opp.id, value)}>
        <SelectTrigger className="w-full mt-3 h-7 text-xs bg-slate-900/50 border-slate-700" data-testid={`opp-stage-${opp.id}`}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="bg-slate-900 border-slate-700">
          {stages.map(stage => (
            <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </motion.div>
  );
};

export default function CRMPipeline() {
  const [opportunities, setOpportunities] = useState([]);
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editOpp, setEditOpp] = useState(null);
  const [formData, setFormData] = useState({
    client_id: '',
    name: '',
    value: 0,
    probability: 50,
    stage: 'Prospecto',
    expected_close_date: '',
    notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [oppsRes, clientsRes] = await Promise.all([
        getOpportunities(),
        getClients()
      ]);
      setOpportunities(oppsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (oppId, newStage) => {
    try {
      await updateOpportunity(oppId, { stage: newStage });
      setOpportunities(opportunities.map(o => o.id === oppId ? { ...o, stage: newStage } : o));
      toast.success('Etapa actualizada');
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim() || !formData.client_id) {
      toast.error('Nombre y cliente son requeridos');
      return;
    }

    try {
      await createOpportunity(formData);
      toast.success('Oportunidad creada');
      setIsCreateOpen(false);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error creating opportunity:', error);
      toast.error('Error al crear');
    }
  };

  const handleUpdate = async () => {
    if (!editOpp) return;

    try {
      await updateOpportunity(editOpp.id, formData);
      toast.success('Oportunidad actualizada');
      setEditOpp(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error updating opportunity:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (oppId) => {
    if (!window.confirm('¿Eliminar esta oportunidad?')) return;

    try {
      await deleteOpportunity(oppId);
      toast.success('Oportunidad eliminada');
      fetchData();
    } catch (error) {
      console.error('Error deleting opportunity:', error);
      toast.error('Error al eliminar');
    }
  };

  const openEditDialog = (opp) => {
    setEditOpp(opp);
    setFormData({
      client_id: opp.client_id,
      name: opp.name,
      value: opp.value,
      probability: opp.probability,
      stage: opp.stage,
      expected_close_date: opp.expected_close_date || '',
      notes: opp.notes || ''
    });
  };

  const resetForm = () => {
    setFormData({ client_id: '', name: '', value: 0, probability: 50, stage: 'Prospecto', expected_close_date: '', notes: '' });
  };

  const getOppsByStage = (stage) => opportunities.filter(o => o.stage === stage);
  const getTotalValue = (stage) => getOppsByStage(stage).reduce((sum, o) => sum + (o.value || 0), 0);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const totalPipeline = opportunities.reduce((sum, o) => sum + (o.value || 0), 0);
  const weightedPipeline = opportunities.reduce((sum, o) => sum + ((o.value || 0) * (o.probability / 100)), 0);

  return (
    <div className="space-y-6" data-testid="crm-pipeline">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Pipeline de Ventas</h1>
          <p className="text-slate-400 mt-1">{opportunities.length} oportunidades activas</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm text-slate-400">Valor Total</p>
            <p className="text-xl font-bold text-white">${totalPipeline.toLocaleString()}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-slate-400">Valor Ponderado</p>
            <p className="text-xl font-bold text-emerald-400">${weightedPipeline.toLocaleString()}</p>
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-opp-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nueva Oportunidad
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Nueva Oportunidad</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Cliente *</label>
                  <Select value={formData.client_id} onValueChange={(v) => setFormData({...formData, client_id: v})}>
                    <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700" data-testid="opp-client-select">
                      <SelectValue placeholder="Seleccionar cliente" />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-900 border-slate-700">
                      {clients.map(client => (
                        <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Nombre *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 bg-slate-800/50 border-slate-700"
                    data-testid="opp-name-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Valor USD</label>
                    <Input
                      type="number"
                      value={formData.value}
                      onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                      className="mt-1 bg-slate-800/50 border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Probabilidad %</label>
                    <Input
                      type="number"
                      min="0"
                      max="100"
                      value={formData.probability}
                      onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value) || 0})}
                      className="mt-1 bg-slate-800/50 border-slate-700"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Etapa</label>
                    <Select value={formData.stage} onValueChange={(v) => setFormData({...formData, stage: v})}>
                      <SelectTrigger className="mt-1 bg-slate-800/50 border-slate-700">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-900 border-slate-700">
                        {stages.map(stage => (
                          <SelectItem key={stage.id} value={stage.id}>{stage.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Fecha Cierre</label>
                    <Input
                      type="date"
                      value={formData.expected_close_date}
                      onChange={(e) => setFormData({...formData, expected_close_date: e.target.value})}
                      className="mt-1 bg-slate-800/50 border-slate-700"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700" data-testid="save-opp-btn">
                  Crear Oportunidad
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editOpp} onOpenChange={(open) => !open && setEditOpp(null)}>
        <DialogContent className="bg-slate-900 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Oportunidad</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Valor USD</label>
                <Input
                  type="number"
                  value={formData.value}
                  onChange={(e) => setFormData({...formData, value: parseFloat(e.target.value) || 0})}
                  className="mt-1 bg-slate-800/50 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Probabilidad %</label>
                <Input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({...formData, probability: parseInt(e.target.value) || 0})}
                  className="mt-1 bg-slate-800/50 border-slate-700"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pipeline Kanban */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-4 min-w-max">
          {stages.filter(s => s.id !== 'Perdida').map((stage) => (
            <div key={stage.id} className="w-64 flex-shrink-0">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${stage.color}`} />
                  <h3 className="font-medium text-white">{stage.label}</h3>
                </div>
                <div className="text-right">
                  <Badge variant="outline" className="border-slate-600 text-slate-400">
                    {getOppsByStage(stage.id).length}
                  </Badge>
                  <p className="text-xs text-emerald-400 mt-1">${getTotalValue(stage.id).toLocaleString()}</p>
                </div>
              </div>
              <div className="space-y-2 min-h-[400px] p-2 rounded-lg bg-slate-800/20 border border-slate-800">
                {getOppsByStage(stage.id).map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    clients={clients}
                    onStageChange={handleStageChange}
                    onEdit={openEditDialog}
                    onDelete={handleDelete}
                  />
                ))}
                {getOppsByStage(stage.id).length === 0 && (
                  <p className="text-center text-slate-600 py-8 text-sm">Sin oportunidades</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
