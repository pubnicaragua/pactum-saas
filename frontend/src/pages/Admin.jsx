import { useState, useEffect } from 'react';
import { getUsers, resetDemoData, exportData } from '../lib/api';
import { useAuth } from '../lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from '../components/ui/dialog';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Users,
  Building,
  Shield,
  RefreshCw,
  Download,
  AlertTriangle,
  User,
  Mail
} from 'lucide-react';

export default function Admin() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resetting, setResetting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (isAdmin()) {
      fetchUsers();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await getUsers();
      setUsers(response.data);
    } catch (error) {
      console.error('Error loading users:', error);
      toast.error('Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      await resetDemoData();
      toast.success('Datos demo reseteados exitosamente');
      setIsResetDialogOpen(false);
      fetchUsers();
    } catch (error) {
      console.error('Error resetting data:', error);
      toast.error('Error al resetear datos');
    } finally {
      setResetting(false);
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await exportData();
      const dataStr = JSON.stringify(response.data, null, 2);
      const blob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `pactum-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Datos exportados');
    } catch (error) {
      console.error('Error exporting data:', error);
      toast.error('Error al exportar');
    } finally {
      setExporting(false);
    }
  };

  if (!isAdmin()) {
    return (
      <div className="flex flex-col items-center justify-center h-64" data-testid="admin-access-denied">
        <Shield className="w-16 h-16 text-slate-600 mb-4" />
        <h2 className="text-xl font-semibold text-white">Acceso Denegado</h2>
        <p className="text-slate-400 mt-2">Solo administradores pueden acceder a esta sección</p>
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

  const demoCompanies = [
    { id: 1, name: 'Business and Technology', status: 'Activo', users: 2 },
    { id: 2, name: 'Empresa Demo 2', status: 'Demo', users: 0 },
    { id: 3, name: 'Empresa Demo 3', status: 'Demo', users: 0 },
  ];

  return (
    <div className="space-y-6" data-testid="admin-panel">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Administración</h1>
          <p className="text-slate-400 mt-1">Gestión de usuarios, empresas y configuración</p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleExport}
            disabled={exporting}
            className="border-slate-700 hover:bg-slate-700/50"
            data-testid="export-data-btn"
          >
            <Download className="w-4 h-4 mr-2" />
            {exporting ? 'Exportando...' : 'Exportar JSON'}
          </Button>
          
          <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                className="border-red-500/30 text-red-400 hover:bg-red-500/10"
                data-testid="reset-demo-btn"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Demo
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  Confirmar Reset
                </DialogTitle>
                <DialogDescription className="text-slate-400">
                  Esta acción eliminará todos los datos del proyecto (tareas, pagos, fases, clientes, etc.) 
                  y restaurará los datos de demostración iniciales. Los usuarios se mantendrán.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsResetDialogOpen(false)} className="border-slate-700">
                  Cancelar
                </Button>
                <Button
                  onClick={handleReset}
                  disabled={resetting}
                  className="bg-red-600 hover:bg-red-700"
                  data-testid="confirm-reset-btn"
                >
                  {resetting ? 'Reseteando...' : 'Confirmar Reset'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
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
                  <p className="text-sm text-slate-400">Usuarios</p>
                  <p className="text-2xl font-bold text-white mt-1">{users.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-blue-600/20">
                  <Users className="w-6 h-6 text-blue-400" />
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
                  <p className="text-sm text-slate-400">Empresas</p>
                  <p className="text-2xl font-bold text-white mt-1">{demoCompanies.length}</p>
                </div>
                <div className="p-3 rounded-xl bg-purple-600/20">
                  <Building className="w-6 h-6 text-purple-400" />
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
                  <p className="text-sm text-slate-400">Roles</p>
                  <p className="text-2xl font-bold text-white mt-1">2</p>
                  <p className="text-xs text-slate-500 mt-1">Admin, Cliente</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-600/20">
                  <Shield className="w-6 h-6 text-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Users Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-blue-400" />
              Usuarios del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Usuario</TableHead>
                  <TableHead className="text-slate-400">Email</TableHead>
                  <TableHead className="text-slate-400">Rol</TableHead>
                  <TableHead className="text-slate-400">Creado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id} className="border-slate-700 hover:bg-slate-700/30" data-testid={`user-row-${u.id}`}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                          <span className="text-white text-sm font-medium">{u.name?.charAt(0)}</span>
                        </div>
                        <span className="font-medium text-white">{u.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="text-slate-300 flex items-center gap-2">
                        <Mail className="w-4 h-4 text-slate-500" />
                        {u.email}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Badge className={u.role === 'Admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-blue-500/20 text-blue-400'}>
                        {u.role}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-400">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString('es-ES') : 'N/A'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      {/* Companies Table */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Building className="w-5 h-5 text-blue-400" />
              Empresas (Multi-tenant Demo)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="border-slate-700 hover:bg-transparent">
                  <TableHead className="text-slate-400">Empresa</TableHead>
                  <TableHead className="text-slate-400">Estado</TableHead>
                  <TableHead className="text-slate-400">Usuarios</TableHead>
                  <TableHead className="text-slate-400">Módulos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demoCompanies.map((company) => (
                  <TableRow key={company.id} className="border-slate-700 hover:bg-slate-700/30">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center">
                          <Building className="w-4 h-4 text-slate-400" />
                        </div>
                        <span className="font-medium text-white">{company.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={company.status === 'Activo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-500/20 text-slate-400'}>
                        {company.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-300">{company.users}</TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">CRM</Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">Pipeline</Badge>
                        <Badge variant="outline" className="border-slate-600 text-slate-400 text-xs">Actividades</Badge>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
