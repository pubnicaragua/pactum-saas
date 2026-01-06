import React, { useState, useEffect } from 'react';
import { getAllCompanies, getGlobalMetrics, updateCompany, updateSubscription, assignModules, getAvailableModules } from '../lib/api-multitenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Building2, Users, TrendingUp, DollarSign, Calendar, CheckCircle2, XCircle, Clock, Settings } from 'lucide-react';

const SuperAdminDashboard = () => {
  const [metrics, setMetrics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [modules, setModules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [metricsRes, companiesRes, modulesRes] = await Promise.all([
        getGlobalMetrics(),
        getAllCompanies(),
        getAvailableModules()
      ]);
      setMetrics(metricsRes.data);
      setCompanies(companiesRes.data);
      setModules(modulesRes.data);
    } catch (error) {
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateCompanyStatus = async (companyId, status) => {
    try {
      await updateCompany(companyId, { status });
      toast.success('Estado actualizado');
      loadData();
    } catch (error) {
      toast.error('Error al actualizar estado');
    }
  };

  const handleExtendTrial = async (companyId, days) => {
    try {
      await updateSubscription(companyId, { 
        status: 'trial', 
        trial_days_extension: days 
      });
      toast.success(`Trial extendido ${days} días`);
      loadData();
    } catch (error) {
      toast.error('Error al extender trial');
    }
  };

  const handleActivateSubscription = async (companyId) => {
    try {
      await updateSubscription(companyId, { 
        status: 'active',
        plan_type: 'professional'
      });
      toast.success('Suscripción activada');
      loadData();
    } catch (error) {
      toast.error('Error al activar suscripción');
    }
  };

  const CompanyEditDialog = ({ company }) => {
    const [selectedModules, setSelectedModules] = useState(company?.active_modules || []);

    const handleSaveModules = async () => {
      try {
        await assignModules(company.id, selectedModules);
        toast.success('Módulos actualizados');
        setEditDialogOpen(false);
        loadData();
      } catch (error) {
        toast.error('Error al actualizar módulos');
      }
    };

    return (
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Gestionar Empresa: {company?.name}</DialogTitle>
          <DialogDescription>
            Configura módulos y permisos para esta empresa
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label>Módulos Activos</Label>
            <div className="grid grid-cols-2 gap-3 mt-2">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className={`flex items-start space-x-3 p-3 rounded-lg border cursor-pointer ${
                    selectedModules.includes(module.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                  onClick={() => {
                    setSelectedModules(prev =>
                      prev.includes(module.id)
                        ? prev.filter(id => id !== module.id)
                        : [...prev, module.id]
                    );
                  }}
                >
                  <Checkbox
                    checked={selectedModules.includes(module.id)}
                    onCheckedChange={() => {}}
                  />
                  <div>
                    <div className="font-medium text-sm">{module.name}</div>
                    <div className="text-xs text-gray-500">{module.description}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSaveModules}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      </DialogContent>
    );
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
        <h1 className="text-3xl font-bold text-gray-900">Panel Super Admin</h1>
        <p className="text-gray-500">Gestión global del sistema</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Empresas</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              {metrics?.active_companies || 0} activas
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">En Trial</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.trial_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Período de prueba
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.paid_companies || 0}</div>
            <p className="text-xs text-muted-foreground">
              Empresas pagando
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usuarios</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.total_users || 0}</div>
            <p className="text-xs text-muted-foreground">
              En todas las empresas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Companies Table */}
      <Card>
        <CardHeader>
          <CardTitle>Empresas Registradas</CardTitle>
          <CardDescription>
            Gestiona todas las empresas del sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {companies.map((company) => (
              <div
                key={company.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <div>
                      <h3 className="font-semibold text-lg">{company.name}</h3>
                      <p className="text-sm text-gray-500">{company.email}</p>
                    </div>
                    <Badge variant={company.status === 'active' ? 'default' : 'secondary'}>
                      {company.status}
                    </Badge>
                    <Badge variant={company.subscription_status === 'trial' ? 'outline' : 'default'}>
                      {company.subscription_status}
                    </Badge>
                  </div>
                  <div className="flex gap-4 mt-2 text-sm text-gray-600">
                    <span>{company.user_count || 0} usuarios</span>
                    <span>{company.client_count || 0} clientes</span>
                    <span>{company.active_modules?.length || 0} módulos</span>
                    {company.trial_ends_at && (
                      <span className="text-orange-600">
                        Trial termina: {new Date(company.trial_ends_at).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Dialog open={editDialogOpen && selectedCompany?.id === company.id} onOpenChange={(open) => {
                    setEditDialogOpen(open);
                    if (open) setSelectedCompany(company);
                  }}>
                    <DialogTrigger asChild>
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-1" />
                        Configurar
                      </Button>
                    </DialogTrigger>
                    <CompanyEditDialog company={company} />
                  </Dialog>
                  
                  {company.subscription_status === 'trial' && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleExtendTrial(company.id, 7)}
                      >
                        +7 días
                      </Button>
                      <Button
                        variant="default"
                        size="sm"
                        onClick={() => handleActivateSubscription(company.id)}
                      >
                        Activar
                      </Button>
                    </>
                  )}
                  
                  {company.status === 'active' ? (
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleUpdateCompanyStatus(company.id, 'suspended')}
                    >
                      Suspender
                    </Button>
                  ) : (
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleUpdateCompanyStatus(company.id, 'active')}
                    >
                      Activar
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SuperAdminDashboard;
