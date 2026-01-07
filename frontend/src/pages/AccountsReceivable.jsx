import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { 
  getAccountsReceivable, 
  createAccountReceivable, 
  updateAccountReceivable, 
  deleteAccountReceivable,
  getAccountsReceivableStats,
  getClients 
} from '../lib/api-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { 
  DollarSign, 
  Plus, 
  Edit, 
  Trash2, 
  TrendingUp, 
  AlertCircle,
  CheckCircle2,
  Clock,
  Users
} from 'lucide-react';

const AccountsReceivable = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState([]);
  const [clients, setClients] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [formData, setFormData] = useState({
    client_id: '',
    client_name: '',
    amount: '',
    due_date: '',
    invoice_number: '',
    description: '',
    is_partner: false,
    partner_percentage: '',
    status: 'pending'
  });

  useEffect(() => {
    loadData();
  }, [filterStatus]);

  const loadData = async () => {
    try {
      const [accountsRes, statsRes, clientsRes] = await Promise.all([
        getAccountsReceivable(null, filterStatus === 'all' ? null : filterStatus),
        getAccountsReceivableStats(),
        getClients()
      ]);
      setAccounts(accountsRes.data);
      setStats(statsRes.data);
      setClients(clientsRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = {
        ...formData,
        amount: parseFloat(formData.amount),
        partner_percentage: formData.is_partner ? parseFloat(formData.partner_percentage) : null
      };

      if (editingAccount) {
        await updateAccountReceivable(editingAccount.id, data);
        toast.success('Cuenta actualizada exitosamente');
      } else {
        await createAccountReceivable(data);
        toast.success('Cuenta creada exitosamente');
      }

      setDialogOpen(false);
      resetForm();
      loadData();
    } catch (error) {
      toast.error('Error al guardar cuenta');
      console.error(error);
    }
  };

  const handleEdit = (account) => {
    setEditingAccount(account);
    setFormData({
      client_id: account.client_id,
      client_name: account.client_name,
      amount: account.amount.toString(),
      due_date: account.due_date.split('T')[0],
      invoice_number: account.invoice_number || '',
      description: account.description || '',
      is_partner: account.is_partner || false,
      partner_percentage: account.partner_percentage?.toString() || '',
      status: account.status
    });
    setDialogOpen(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Estás seguro de eliminar esta cuenta?')) return;
    try {
      await deleteAccountReceivable(id);
      toast.success('Cuenta eliminada');
      loadData();
    } catch (error) {
      toast.error('Error al eliminar cuenta');
      console.error(error);
    }
  };

  const handleMarkAsPaid = async (account) => {
    try {
      await updateAccountReceivable(account.id, {
        paid_amount: account.amount,
        paid_date: new Date().toISOString().split('T')[0],
        status: 'paid'
      });
      toast.success('Cuenta marcada como pagada');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar cuenta');
      console.error(error);
    }
  };

  const resetForm = () => {
    setFormData({
      client_id: '',
      client_name: '',
      amount: '',
      due_date: '',
      invoice_number: '',
      description: '',
      is_partner: false,
      partner_percentage: '',
      status: 'pending'
    });
    setEditingAccount(null);
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { label: 'Pendiente', className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30' },
      paid: { label: 'Pagado', className: 'bg-green-500/20 text-green-400 border-green-500/30' },
      overdue: { label: 'Vencido', className: 'bg-red-500/20 text-red-400 border-red-500/30' },
      partial: { label: 'Parcial', className: 'bg-blue-500/20 text-blue-400 border-blue-500/30' }
    };
    const badge = badges[status] || badges.pending;
    return <Badge className={badge.className}>{badge.label}</Badge>;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <DollarSign className="h-8 w-8 text-green-400" />
            Cuentas por Cobrar
          </h1>
          <p className="text-slate-400 mt-1">Gestión de cuentas por cobrar y partners</p>
        </div>
        {user?.role === 'COMPANY_ADMIN' && (
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nueva Cuenta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">
                  {editingAccount ? 'Editar Cuenta' : 'Nueva Cuenta por Cobrar'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Cliente</label>
                    <Select 
                      value={formData.client_id} 
                      onValueChange={(value) => {
                        const client = clients.find(c => c.id === value);
                        setFormData({ ...formData, client_id: value, client_name: client?.name || '' });
                      }}
                    >
                      <SelectTrigger className="bg-slate-800 border-slate-700 text-white">
                        <SelectValue placeholder="Seleccionar cliente" />
                      </SelectTrigger>
                      <SelectContent className="bg-slate-800 border-slate-700">
                        {clients.map(client => (
                          <SelectItem key={client.id} value={client.id} className="text-white">
                            {client.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Monto</label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Fecha de Vencimiento</label>
                    <Input
                      type="date"
                      value={formData.due_date}
                      onChange={(e) => setFormData({ ...formData, due_date: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Número de Factura</label>
                    <Input
                      value={formData.invoice_number}
                      onChange={(e) => setFormData({ ...formData, invoice_number: e.target.value })}
                      className="bg-slate-800 border-slate-700 text-white"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Descripción</label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="bg-slate-800 border-slate-700 text-white"
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 text-white">
                    <input
                      type="checkbox"
                      checked={formData.is_partner}
                      onChange={(e) => setFormData({ ...formData, is_partner: e.target.checked })}
                      className="w-4 h-4 rounded border-slate-600 bg-slate-800 text-blue-600"
                    />
                    Es Partner
                  </label>
                  {formData.is_partner && (
                    <div className="flex-1">
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={formData.partner_percentage}
                        onChange={(e) => setFormData({ ...formData, partner_percentage: e.target.value })}
                        className="bg-slate-800 border-slate-700 text-white"
                        placeholder="% de cobertura"
                      />
                    </div>
                  )}
                </div>
                <div className="flex gap-2 justify-end">
                  <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-green-600 hover:bg-green-700">
                    {editingAccount ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total por Cobrar</p>
                  <p className="text-2xl font-bold text-white">${stats.total_pending.toLocaleString()}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Cobrado</p>
                  <p className="text-2xl font-bold text-green-400">${stats.total_paid.toLocaleString()}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Cuentas Pendientes</p>
                  <p className="text-2xl font-bold text-yellow-400">{stats.pending_count}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Cobertura Partners</p>
                  <p className="text-2xl font-bold text-blue-400">{stats.partner_coverage_percentage.toFixed(1)}%</p>
                </div>
                <Users className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2">
        <Button
          variant={filterStatus === 'all' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('all')}
          className={filterStatus === 'all' ? 'bg-blue-600' : ''}
        >
          Todas
        </Button>
        <Button
          variant={filterStatus === 'pending' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('pending')}
          className={filterStatus === 'pending' ? 'bg-yellow-600' : ''}
        >
          Pendientes
        </Button>
        <Button
          variant={filterStatus === 'paid' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('paid')}
          className={filterStatus === 'paid' ? 'bg-green-600' : ''}
        >
          Pagadas
        </Button>
        <Button
          variant={filterStatus === 'overdue' ? 'default' : 'outline'}
          onClick={() => setFilterStatus('overdue')}
          className={filterStatus === 'overdue' ? 'bg-red-600' : ''}
        >
          Vencidas
        </Button>
      </div>

      {/* Accounts List */}
      <div className="grid gap-4">
        {accounts.map(account => (
          <Card key={account.id} className="border-slate-700 bg-slate-800/50">
            <CardContent className="pt-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-white">{account.client_name}</h3>
                    {getStatusBadge(account.status)}
                    {account.is_partner && (
                      <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                        Partner {account.partner_percentage}%
                      </Badge>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-slate-400">Monto</p>
                      <p className="text-white font-semibold">${account.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Vencimiento</p>
                      <p className="text-white">{new Date(account.due_date).toLocaleDateString()}</p>
                    </div>
                    {account.invoice_number && (
                      <div>
                        <p className="text-slate-400">Factura</p>
                        <p className="text-white">{account.invoice_number}</p>
                      </div>
                    )}
                    {account.paid_amount > 0 && (
                      <div>
                        <p className="text-slate-400">Pagado</p>
                        <p className="text-green-400 font-semibold">${account.paid_amount.toLocaleString()}</p>
                      </div>
                    )}
                  </div>
                  {account.description && (
                    <p className="text-slate-400 text-sm mt-2">{account.description}</p>
                  )}
                </div>
                {user?.role === 'COMPANY_ADMIN' && (
                  <div className="flex gap-2">
                    {account.status !== 'paid' && (
                      <Button
                        size="sm"
                        onClick={() => handleMarkAsPaid(account)}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(account)}
                      className="border-slate-600"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(account.id)}
                      className="border-red-600 text-red-400 hover:bg-red-600/10"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {accounts.length === 0 && (
        <Card className="border-slate-700 bg-slate-800/50">
          <CardContent className="pt-6">
            <p className="text-center text-slate-400">No hay cuentas por cobrar</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AccountsReceivable;
