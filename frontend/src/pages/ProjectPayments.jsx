import { useState, useEffect } from 'react';
import { getPayments, updatePayment, getPhases } from '../lib/api-multitenant';
import { useAuth } from '../lib/auth-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  CreditCard, 
  Calendar, 
  DollarSign, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Edit,
  FileText
} from 'lucide-react';

const statusColors = {
  'pendiente': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  'pagado': 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  'vencido': 'bg-red-500/20 text-red-400 border-red-500/30'
};

export default function ProjectPayments() {
  const [payments, setPayments] = useState([]);
  const [phases, setPhases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editPayment, setEditPayment] = useState(null);
  const [editData, setEditData] = useState({});
  const { isAdmin } = useAuth();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [paymentsRes, phasesRes] = await Promise.all([
        getPayments(),
        getPhases()
      ]);
      
      // Check for delayed payments (48h rule)
      const now = new Date();
      const updatedPayments = paymentsRes.data.map(payment => {
        if (payment.status === 'pendiente') {
          const dueDate = new Date(payment.due_date);
          const diffHours = (now - dueDate) / (1000 * 60 * 60);
          if (diffHours > 48) {
            return { ...payment, isDelayed: true };
          }
        }
        return payment;
      });
      
      setPayments(updatedPayments);
      setPhases(phasesRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (paymentId, newStatus) => {
    try {
      await updatePayment(paymentId, { status: newStatus });
      toast.success('Estado actualizado');
      fetchData();
    } catch (error) {
      console.error('Error updating status:', error);
      toast.error('Error al actualizar estado');
    }
  };

  const handleSaveEdit = async () => {
    if (!editPayment) return;
    
    try {
      await updatePayment(editPayment.id, editData);
      toast.success('Pago actualizado');
      setEditPayment(null);
      fetchData();
    } catch (error) {
      console.error('Error updating payment:', error);
      toast.error('Error al actualizar pago');
    }
  };

  const openEditDialog = (payment) => {
    setEditPayment(payment);
    setEditData({
      reference: payment.reference || '',
      notes: payment.notes || ''
    });
  };

  const totalPaid = payments.filter(p => p.status === 'pagado').reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalPending = payments.filter(p => p.status !== 'pagado').reduce((sum, p) => sum + (p.amount || 0), 0);
  const delayedCount = payments.filter(p => p.isDelayed || p.status === 'vencido').length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8" data-testid="project-payments">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Pagos Programados</h1>
        <p className="text-slate-400 mt-1">Control de pagos por hito del proyecto</p>
      </div>

      {/* Delayed Warning */}
      {delayedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 flex items-center gap-3"
        >
          <AlertTriangle className="w-6 h-6 text-red-400" />
          <div>
            <p className="font-medium text-red-400">
              {delayedCount} pago(s) retrasado(s) más de 48 horas hábiles
            </p>
            <p className="text-sm text-red-300/70">
              Impacta timeline. Reprogramación requerida.
            </p>
          </div>
        </motion.div>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Pagado</p>
                  <p className="text-2xl font-bold text-emerald-400 mt-1">
                    ${totalPaid.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-600/20">
                  <CheckCircle className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Pendiente</p>
                  <p className="text-2xl font-bold text-amber-400 mt-1">
                    ${totalPending.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-amber-600/20">
                  <Clock className="w-6 h-6 text-amber-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Proyecto</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${(totalPaid + totalPending).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600/20">
                  <DollarSign className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Payments Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              Calendario de Pagos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700 hover:bg-transparent">
                    <TableHead className="text-slate-400">Descripción</TableHead>
                    <TableHead className="text-slate-400">Fase</TableHead>
                    <TableHead className="text-slate-400">Fecha</TableHead>
                    <TableHead className="text-slate-400 text-right">Monto</TableHead>
                    <TableHead className="text-slate-400">Estado</TableHead>
                    <TableHead className="text-slate-400">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {payments.map((payment) => {
                    const phase = phases.find(p => p.id === payment.phase_id);
                    return (
                      <TableRow 
                        key={payment.id} 
                        className={`border-slate-700 hover:bg-slate-700/30 ${payment.isDelayed ? 'bg-red-500/5' : ''}`}
                        data-testid={`payment-row-${payment.id}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{payment.description}</p>
                            <p className="text-sm text-slate-500">{payment.percentage}% del total</p>
                          </div>
                        </TableCell>
                        <TableCell className="text-slate-300">
                          {phase?.name?.split(':')[0] || 'Inicio'}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-slate-500" />
                            <span className="text-slate-300">
                              {new Date(payment.due_date).toLocaleDateString('es-ES')}
                            </span>
                          </div>
                          {payment.paid_at && (
                            <p className="text-xs text-emerald-400 mt-1">
                              Pagado: {new Date(payment.paid_at).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium text-white">
                          ${(payment.amount || 0).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Badge className={statusColors[payment.status]}>
                              {payment.status}
                            </Badge>
                            {payment.isDelayed && payment.status !== 'Retrasado' && (
                              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                                +48h
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Select
                              value={payment.status}
                              onValueChange={(value) => handleStatusChange(payment.id, value)}
                            >
                              <SelectTrigger className="w-32 h-8 bg-slate-900/50 border-slate-700 text-xs" data-testid={`payment-status-${payment.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent className="bg-slate-900 border-slate-700">
                                <SelectItem value="Programado">Programado</SelectItem>
                                <SelectItem value="Pagado">Pagado</SelectItem>
                                <SelectItem value="Retrasado">Retrasado</SelectItem>
                              </SelectContent>
                            </Select>
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => openEditDialog(payment)}
                                  data-testid={`edit-payment-${payment.id}`}
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="bg-slate-900 border-slate-700">
                                <DialogHeader>
                                  <DialogTitle className="text-white">Editar Pago</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <label className="text-sm text-slate-400">Referencia de pago</label>
                                    <Input
                                      placeholder="Ej: Transferencia #12345"
                                      value={editData.reference || ''}
                                      onChange={(e) => setEditData({...editData, reference: e.target.value})}
                                      className="mt-1 bg-slate-800/50 border-slate-700"
                                      data-testid="payment-reference-input"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-sm text-slate-400">Notas</label>
                                    <Textarea
                                      placeholder="Notas adicionales..."
                                      value={editData.notes || ''}
                                      onChange={(e) => setEditData({...editData, notes: e.target.value})}
                                      className="mt-1 bg-slate-800/50 border-slate-700"
                                      data-testid="payment-notes-input"
                                    />
                                  </div>
                                </div>
                                <DialogFooter>
                                  <Button
                                    onClick={handleSaveEdit}
                                    className="bg-blue-600 hover:bg-blue-700"
                                    data-testid="save-payment-btn"
                                  >
                                    Guardar
                                  </Button>
                                </DialogFooter>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
