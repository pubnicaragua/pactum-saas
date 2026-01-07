import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { toast } from 'sonner';
import { DollarSign, TrendingUp, TrendingDown, AlertCircle, Save, Plus, Trash2 } from 'lucide-react';
import api from '../lib/api-multitenant';

export default function FinancialDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [summary, setSummary] = useState({});
  const [totalIncome, setTotalIncome] = useState(47606);
  const [payments, setPayments] = useState([
    { concept: 'Abono a Carlos', planned_amount: 11000, executed_amount: 0, status_note: '' },
    { concept: 'Pago de préstamo (cuota actual)', planned_amount: 13000, executed_amount: 0, status_note: '' },
    { concept: 'Campañas Meta Ads', planned_amount: 6500, executed_amount: 0, status_note: '' },
    { concept: 'Pago a Ofilio', planned_amount: 2000, executed_amount: 0, status_note: '' },
    { concept: 'Pagos a Miguel y Jonathan', planned_amount: 2500, executed_amount: 0, status_note: '' },
    { concept: 'Pago a Paolo Fernández', planned_amount: 2500, executed_amount: 0, status_note: '' },
    { concept: 'Pago a Danny Carranza (investigación)', planned_amount: 600, executed_amount: 0, status_note: '' },
  ]);
  const [reserves, setReserves] = useState([
    { concept: 'Meta Ads (siguiente inversión)', reserve_amount: 2600, executed_amount: 0, status_note: '' },
    { concept: 'Préstamo (siguiente pago en 15 días)', reserve_amount: 6500, executed_amount: 0, status_note: '' },
    { concept: 'Revisión camioneta + gasolina', reserve_amount: 2000, executed_amount: 0, status_note: '' },
    { concept: 'Gasolina (1 semana)', reserve_amount: 1000, executed_amount: 0, status_note: '' },
  ]);

  useEffect(() => {
    if (user?.email !== 'admin@pactum.com') {
      toast.error('Acceso denegado - Solo para administrador');
      return;
    }
    loadFinancialData();
  }, [user]);

  const loadFinancialData = async () => {
    try {
      const [reportRes, summaryRes] = await Promise.all([
        api.get('/financial/report'),
        api.get('/financial/summary')
      ]);

      if (reportRes.data.payments && reportRes.data.payments.length > 0) {
        setPayments(reportRes.data.payments);
      }
      if (reportRes.data.reserves && reportRes.data.reserves.length > 0) {
        setReserves(reportRes.data.reserves);
      }
      if (reportRes.data.total_income) {
        setTotalIncome(reportRes.data.total_income);
      }

      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error loading financial data:', error);
      toast.error('Error al cargar datos financieros');
    } finally {
      setLoading(false);
    }
  };

  const calculateSummary = () => {
    const totalAssigned = payments.reduce((sum, p) => sum + (parseFloat(p.executed_amount) || 0), 0);
    const totalReserves = reserves.reduce((sum, r) => sum + (parseFloat(r.reserve_amount) || 0), 0);
    const availableBalance = totalIncome - totalAssigned;
    const projectedBalance = availableBalance - totalReserves;

    return {
      total_income: totalIncome,
      total_assigned: totalAssigned,
      available_balance: availableBalance,
      total_reserves: totalReserves,
      projected_balance: projectedBalance
    };
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.post('/financial/report', {
        total_income: totalIncome,
        payments: payments,
        reserves: reserves
      });

      const summaryRes = await api.get('/financial/summary');
      setSummary(summaryRes.data);

      toast.success('Reporte financiero guardado exitosamente');
    } catch (error) {
      console.error('Error saving financial data:', error);
      toast.error('Error al guardar reporte financiero');
    } finally {
      setSaving(false);
    }
  };

  const updatePayment = (index, field, value) => {
    const newPayments = [...payments];
    newPayments[index][field] = value;
    setPayments(newPayments);
  };

  const updateReserve = (index, field, value) => {
    const newReserves = [...reserves];
    newReserves[index][field] = value;
    setReserves(newReserves);
  };

  const addPayment = () => {
    setPayments([...payments, { concept: '', planned_amount: 0, executed_amount: 0, status_note: '' }]);
  };

  const removePayment = (index) => {
    setPayments(payments.filter((_, i) => i !== index));
  };

  const addReserve = () => {
    setReserves([...reserves, { concept: '', reserve_amount: 0, executed_amount: 0, status_note: '' }]);
  };

  const removeReserve = (index) => {
    setReserves(reserves.filter((_, i) => i !== index));
  };

  const currentSummary = calculateSummary();

  if (user?.email !== 'admin@pactum.com') {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white">Acceso Denegado</h2>
          <p className="text-slate-400 mt-2">Este módulo es solo para el administrador</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">Control Financiero</h1>
          <p className="text-slate-400 mt-1">Software Nicaragua - Gestión de Ingresos y Gastos</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Ingreso Recibido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">C${currentSummary.total_income.toLocaleString()}</div>
            <Input
              type="number"
              value={totalIncome}
              onChange={(e) => setTotalIncome(parseFloat(e.target.value) || 0)}
              className="mt-2 bg-slate-700 border-slate-600 text-white"
            />
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Total Asignado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-400">C${currentSummary.total_assigned.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Pagos ejecutados</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Saldo Disponible</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-400">C${currentSummary.available_balance.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Después de asignaciones</p>
          </CardContent>
        </Card>

        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Costos Futuros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-400">C${currentSummary.total_reserves.toLocaleString()}</div>
            <p className="text-xs text-slate-500 mt-1">Reservas planificadas</p>
          </CardContent>
        </Card>

        <Card className={`bg-slate-800/50 border-slate-700/50 ${currentSummary.projected_balance < 0 ? 'border-red-500/50' : ''}`}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-slate-400">Saldo Proyectado</CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${currentSummary.projected_balance < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
              C${currentSummary.projected_balance.toLocaleString()}
            </div>
            {currentSummary.projected_balance < 0 && (
              <div className="flex items-center gap-1 mt-1">
                <AlertCircle className="w-3 h-3 text-red-400" />
                <p className="text-xs text-red-400">Déficit proyectado</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pagos/Abonos */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Uso Planificado (Pagos/Abonos)</CardTitle>
              <CardDescription>Registra los montos ejecutados y notas de estado</CardDescription>
            </div>
            <Button onClick={addPayment} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Concepto</th>
                  <th className="text-right py-2 px-2 text-slate-400 font-medium">Planificado</th>
                  <th className="text-right py-2 px-2 text-slate-400 font-medium">Ejecutado</th>
                  <th className="text-right py-2 px-2 text-slate-400 font-medium">Variación</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Estado/Nota</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {payments.map((payment, index) => {
                  const variation = payment.executed_amount - payment.planned_amount;
                  return (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-2 px-2">
                        <Input
                          value={payment.concept}
                          onChange={(e) => updatePayment(index, 'concept', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Concepto"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={payment.planned_amount}
                          onChange={(e) => updatePayment(index, 'planned_amount', parseFloat(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-white text-right"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={payment.executed_amount}
                          onChange={(e) => updatePayment(index, 'executed_amount', parseFloat(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-white text-right"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className={variation > 0 ? 'text-red-400' : variation < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          C${variation.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <Textarea
                          value={payment.status_note}
                          onChange={(e) => updatePayment(index, 'status_note', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white min-h-[60px]"
                          placeholder="Notas, estado, observaciones..."
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Button
                          onClick={() => removePayment(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Reservas */}
      <Card className="bg-slate-800/50 border-slate-700/50">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-white">Reservas / Costos Futuros</CardTitle>
              <CardDescription>Montos reservados para gastos próximos</CardDescription>
            </div>
            <Button onClick={addReserve} size="sm" className="bg-emerald-600 hover:bg-emerald-700">
              <Plus className="w-4 h-4 mr-1" />
              Agregar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Concepto</th>
                  <th className="text-right py-2 px-2 text-slate-400 font-medium">A Reservar</th>
                  <th className="text-right py-2 px-2 text-slate-400 font-medium">Ejecutado</th>
                  <th className="text-right py-2 px-2 text-slate-400 font-medium">Variación</th>
                  <th className="text-left py-2 px-2 text-slate-400 font-medium">Estado/Nota</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {reserves.map((reserve, index) => {
                  const variation = reserve.executed_amount - reserve.reserve_amount;
                  return (
                    <tr key={index} className="border-b border-slate-700/50">
                      <td className="py-2 px-2">
                        <Input
                          value={reserve.concept}
                          onChange={(e) => updateReserve(index, 'concept', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white"
                          placeholder="Concepto"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={reserve.reserve_amount}
                          onChange={(e) => updateReserve(index, 'reserve_amount', parseFloat(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-white text-right"
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Input
                          type="number"
                          value={reserve.executed_amount}
                          onChange={(e) => updateReserve(index, 'executed_amount', parseFloat(e.target.value) || 0)}
                          className="bg-slate-700 border-slate-600 text-white text-right"
                        />
                      </td>
                      <td className="py-2 px-2 text-right">
                        <span className={variation > 0 ? 'text-red-400' : variation < 0 ? 'text-emerald-400' : 'text-slate-400'}>
                          C${variation.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-2 px-2">
                        <Textarea
                          value={reserve.status_note}
                          onChange={(e) => updateReserve(index, 'status_note', e.target.value)}
                          className="bg-slate-700 border-slate-600 text-white min-h-[60px]"
                          placeholder="Notas, estado, observaciones..."
                        />
                      </td>
                      <td className="py-2 px-2">
                        <Button
                          onClick={() => removeReserve(index)}
                          size="sm"
                          variant="ghost"
                          className="text-red-400 hover:text-red-300 hover:bg-red-400/10"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Sugerencias de Uso */}
      <Card className="bg-blue-500/10 border-blue-500/30">
        <CardHeader>
          <CardTitle className="text-blue-400 flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Sugerencias de Uso
          </CardTitle>
        </CardHeader>
        <CardContent className="text-slate-300 space-y-2">
          <p>• <strong>Actualización frecuente:</strong> Actualiza los montos ejecutados diariamente para mantener control preciso</p>
          <p>• <strong>Notas detalladas:</strong> Usa el campo "Estado/Nota" para registrar fechas, métodos de pago, y observaciones importantes</p>
          <p>• <strong>Revisión semanal:</strong> Revisa el saldo proyectado cada semana para tomar decisiones informadas</p>
          <p>• <strong>Auto-guardado:</strong> Los cambios se guardan automáticamente cada 30 segundos (próximamente)</p>
          <p>• <strong>Alertas:</strong> Si el saldo proyectado es negativo, considera ajustar gastos o buscar ingresos adicionales</p>
        </CardContent>
      </Card>
    </div>
  );
}
