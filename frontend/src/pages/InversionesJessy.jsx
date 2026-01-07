import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Lock, DollarSign, Calendar, TrendingDown, AlertCircle, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

const InversionesJessy = () => {
  const [accessCode, setAccessCode] = useState('');
  const [isUnlocked, setIsUnlocked] = useState(false);

  const handleUnlock = () => {
    if (accessCode === '123456') {
      setIsUnlocked(true);
      toast.success('Acceso concedido');
    } else {
      toast.error('Código incorrecto');
    }
  };

  if (!isUnlocked) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-slate-700 bg-slate-800/50">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-4">
              <Lock className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl text-white">Inversiones - Jessy Vargas</CardTitle>
            <CardDescription className="text-slate-400">Ingresa el código de acceso para ver tu estado de cuenta</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="code" className="text-white">Código de Acceso</Label>
              <Input
                id="code"
                type="password"
                value={accessCode}
                onChange={(e) => setAccessCode(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleUnlock()}
                placeholder="Ingresa tu código"
                className="bg-slate-900 border-slate-700 text-white mt-2"
              />
            </div>
            <Button onClick={handleUnlock} className="w-full bg-blue-600 hover:bg-blue-700">
              Acceder
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const deudaTotal = 1311.43;
  const deudaTotalCordobas = 47683.68;
  const totalSalida = 1917.66;
  const totalAbonos = 606.23;
  const saldoPendiente = deudaTotal;

  const movimientos = [
    { mes: 'JUNIO', salidas: 409.84, abonos: 0, detalles: 'Préstamo para ROPA, ZAPATOS - C$15,000' },
    { mes: 'JULIO', salidas: 0, abonos: 310.00, detalles: 'Retención de comisiones' },
    { mes: 'AGOSTO', salidas: 290.00, abonos: 249.95, detalles: 'Préstamo para aros de moto + Retención' },
    { mes: 'SEPTIEMBRE', salidas: 720.00, abonos: 0, detalles: 'Préstamos varios ($300 + $420)' },
    { mes: 'OCTUBRE', salidas: 46.28, abonos: 0, detalles: 'Anticipos y retiros varios' },
    { mes: 'NOVIEMBRE', salidas: 451.54, abonos: 46.28, detalles: 'Préstamos e inversión - Cancela anticipo octubre' },
    { mes: 'DICIEMBRE', salidas: 55.01, abonos: 244.77, detalles: 'Abonos en efectivo (18 y 31 dic)' }
  ];

  const tablaPagos = [
    { num: 1, fecha: '15 diciembre', monto: 3400, saldo: 44283.68, pagado: true },
    { num: 2, fecha: '22 diciembre', monto: 2000, saldo: 42283.68, pagado: true },
    { num: 3, fecha: '29 diciembre', monto: 2000, saldo: 40283.68, pagado: false, vencido: true },
    { num: 4, fecha: '5 enero', monto: 2000, saldo: 38283.68, pagado: false, vencido: true },
    { num: 5, fecha: '12 enero', monto: 2000, saldo: 36283.68, pagado: false },
    { num: 6, fecha: '19 enero', monto: 2000, saldo: 34283.68, pagado: false },
    { num: 7, fecha: '26 enero', monto: 2000, saldo: 32283.68, pagado: false }
  ];

  const nuevoEsquema = [
    { dia: 'Lunes', monto: 500 },
    { dia: 'Miércoles', monto: 500 },
    { dia: 'Viernes', monto: 500 },
    { dia: 'Domingo', monto: 500 },
    { dia: 'Martes', monto: 500 },
    { dia: 'Jueves', monto: 500 },
    { dia: 'Sábado', monto: 500 }
  ];

  const comisionesPendientes = [
    { concepto: 'Alma IA', monto: 500, porcentaje: 5, comision: 25, fecha: '15 Enero' },
    { concepto: 'Korean Cable', monto: 9500, moneda: 'NIO', porcentaje: 9, comision: 855, fecha: 'Procesado' },
    { concepto: 'Investi', monto: 3286, porcentaje: 9, comision: 295.74, fecha: '20 Enero' },
    { concepto: 'Alma IA', monto: 400, porcentaje: 9, comision: 36, fecha: '15 Enero' }
  ];

  return (
    <div className="min-h-screen bg-slate-900 p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Estado de Cuenta - Jessy Vargas</h1>
          <p className="text-slate-400">Detalle completo de préstamos y pagos</p>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Salidas</p>
                  <p className="text-2xl font-bold text-red-400">${totalSalida.toFixed(2)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Abonos</p>
                  <p className="text-2xl font-bold text-green-400">${totalAbonos.toFixed(2)}</p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Saldo USD</p>
                  <p className="text-2xl font-bold text-yellow-400">${saldoPendiente.toFixed(2)}</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-slate-700 bg-slate-800/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Saldo Córdobas</p>
                  <p className="text-xl font-bold text-yellow-400">C${deudaTotalCordobas.toFixed(2)}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-yellow-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Movimientos Mensuales */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white">Movimientos por Mes</CardTitle>
            <CardDescription className="text-slate-400">Resumen de salidas y abonos</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Mes</TableHead>
                  <TableHead className="text-slate-400 text-right">Salidas</TableHead>
                  <TableHead className="text-slate-400 text-right">Abonos</TableHead>
                  <TableHead className="text-slate-400">Detalles</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {movimientos.map((mov, idx) => (
                  <TableRow key={idx} className="border-slate-700">
                    <TableCell className="font-medium text-white">{mov.mes}</TableCell>
                    <TableCell className="text-right text-red-400">${mov.salidas.toFixed(2)}</TableCell>
                    <TableCell className="text-right text-green-400">${mov.abonos.toFixed(2)}</TableCell>
                    <TableCell className="text-slate-300 text-sm">{mov.detalles}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Tabla de Pagos Original */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Tabla de Pagos Original (INCUMPLIDA)
            </CardTitle>
            <CardDescription className="text-slate-400">Esquema de pagos semanales acordado inicialmente</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-slate-700">
                    <TableHead className="text-slate-400">Nº</TableHead>
                    <TableHead className="text-slate-400">Fecha</TableHead>
                    <TableHead className="text-slate-400 text-right">Monto</TableHead>
                    <TableHead className="text-slate-400 text-right">Saldo</TableHead>
                    <TableHead className="text-slate-400">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {tablaPagos.map((pago) => (
                    <TableRow key={pago.num} className="border-slate-700">
                      <TableCell className="text-white">{pago.num}</TableCell>
                      <TableCell className="text-white">{pago.fecha}</TableCell>
                      <TableCell className="text-right text-white">C${pago.monto.toLocaleString()}</TableCell>
                      <TableCell className="text-right text-slate-300">C${pago.saldo.toLocaleString()}</TableCell>
                      <TableCell>
                        {pago.pagado ? (
                          <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Pagado</Badge>
                        ) : pago.vencido ? (
                          <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Vencido</Badge>
                        ) : (
                          <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Pendiente</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Nuevo Esquema de Pagos */}
        <Card className="border-slate-700 bg-gradient-to-br from-blue-500/10 to-purple-500/10">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Calendar className="h-5 w-5 text-blue-400" />
              Nuevo Esquema de Pagos (Desde 8 de Enero)
            </CardTitle>
            <CardDescription className="text-slate-400">
              Abonos de C$500 cada 2 días - Más fácil de cumplir
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
              {nuevoEsquema.map((dia, idx) => (
                <div key={idx} className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 text-center">
                  <p className="text-sm text-slate-400 mb-1">{dia.dia}</p>
                  <p className="text-xl font-bold text-white">C${dia.monto}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
              <p className="text-sm text-blue-300">
                <strong>Total semanal:</strong> C$3,500 (7 pagos de C$500)
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Este esquema es más manejable y te permite cumplir con tus compromisos de forma consistente
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Comisiones Pendientes */}
        <Card className="border-slate-700 bg-slate-800/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-400" />
              Comisiones Pendientes
            </CardTitle>
            <CardDescription className="text-slate-400">
              Sujetas a cumplimiento de abonos pendientes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700">
                  <TableHead className="text-slate-400">Concepto</TableHead>
                  <TableHead className="text-slate-400 text-right">Monto Base</TableHead>
                  <TableHead className="text-slate-400 text-center">%</TableHead>
                  <TableHead className="text-slate-400 text-right">Tu Comisión</TableHead>
                  <TableHead className="text-slate-400">Fecha Límite</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {comisionesPendientes.map((com, idx) => (
                  <TableRow key={idx} className="border-slate-700">
                    <TableCell className="text-white">{com.concepto}</TableCell>
                    <TableCell className="text-right text-white">
                      {com.moneda === 'NIO' ? 'C$' : '$'}{com.monto.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center text-blue-400">{com.porcentaje}%</TableCell>
                    <TableCell className="text-right text-green-400 font-bold">
                      {com.moneda === 'NIO' ? 'C$' : '$'}{com.comision.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-slate-300">{com.fecha}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <p className="text-sm text-yellow-300 flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                <strong>Importante:</strong> Estas comisiones se destinarán a pagar el préstamo de Carlos si no cumples con el abono pendiente de C$10,000 al 15 de Diciembre.
              </p>
              <p className="text-xs text-slate-400 mt-2">
                Para solicitar el detalle completo de estas comisiones, envía un mensaje formal por WhatsApp.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Nota Final */}
        <Card className="border-slate-700 bg-gradient-to-br from-slate-800/50 to-slate-700/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-6 w-6 text-blue-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Información Importante</h3>
                <ul className="space-y-2 text-sm text-slate-300">
                  <li>• <strong>Deuda Total:</strong> $1,311.43 USD (C$47,683.68)</li>
                  <li>• <strong>Nuevo esquema:</strong> C$500 cada 2 días desde el 8 de enero</li>
                  <li>• <strong>Abono pendiente:</strong> C$10,000 al 15 de Diciembre (VENCIDO)</li>
                  <li>• <strong>Comisiones:</strong> Sujetas a cumplimiento de pagos</li>
                  <li>• <strong>Contacto:</strong> Para consultas, envía mensaje por WhatsApp</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default InversionesJessy;
