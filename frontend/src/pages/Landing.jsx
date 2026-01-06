import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCompany } from '../lib/api-multitenant';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { Building2, CheckCircle2, Users, Calendar, TrendingUp, Shield, Zap } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    admin_name: '',
    admin_email: '',
    admin_password: '',
    selected_modules: []
  });

  const availableModules = [
    { id: 'clients', name: 'Gestión de Clientes', icon: Users },
    { id: 'activities', name: 'Actividades y Tareas', icon: Calendar },
    { id: 'calendar', name: 'Calendario', icon: Calendar },
    { id: 'pipeline', name: 'Pipeline de Ventas', icon: TrendingUp },
  ];

  const handleModuleToggle = (moduleId) => {
    setFormData(prev => ({
      ...prev,
      selected_modules: prev.selected_modules.includes(moduleId)
        ? prev.selected_modules.filter(id => id !== moduleId)
        : [...prev.selected_modules, moduleId]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.selected_modules.length === 0) {
      toast.error('Selecciona al menos un módulo');
      return;
    }

    setLoading(true);
    try {
      const response = await registerCompany(formData);
      localStorage.setItem('pactum_token', response.data.access_token);
      localStorage.setItem('pactum_user', JSON.stringify(response.data.user));
      toast.success('¡Empresa registrada! Trial de 14 días activado');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Error al registrar empresa');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Building2 className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">Pactum SaaS</span>
          </div>
          <Button 
            variant="ghost" 
            className="text-white hover:text-blue-400"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Multi-ERP / Multi-CRM
            <span className="block text-blue-400 mt-2">para tu Empresa</span>
          </h1>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Gestiona clientes, actividades, proyectos y más. Todo en una plataforma moderna y fácil de usar.
          </p>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <Shield className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Multi-Tenant Seguro</CardTitle>
              <CardDescription className="text-slate-300">
                Datos completamente aislados por empresa con seguridad enterprise
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <Zap className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Trial Gratuito 14 Días</CardTitle>
              <CardDescription className="text-slate-300">
                Prueba todas las funcionalidades sin necesidad de tarjeta de crédito
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm">
            <CardHeader>
              <TrendingUp className="h-12 w-12 text-blue-400 mb-4" />
              <CardTitle className="text-white">Módulos Flexibles</CardTitle>
              <CardDescription className="text-slate-300">
                Activa solo los módulos que necesitas para tu negocio
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Registration Form */}
        <Card className="max-w-4xl mx-auto bg-slate-800/80 border-slate-700 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-2xl text-white">Registra tu Empresa</CardTitle>
            <CardDescription className="text-slate-300">
              Comienza tu trial gratuito de 14 días ahora
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Información de la Empresa</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name" className="text-slate-200">Nombre de la Empresa</Label>
                    <Input
                      id="company-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Mi Empresa S.A."
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email" className="text-slate-200">Email de la Empresa</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="contacto@miempresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone" className="text-slate-200">Teléfono</Label>
                    <Input
                      id="company-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="+505 8888-8888"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Administrador Principal</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-name" className="text-slate-200">Nombre Completo</Label>
                    <Input
                      id="admin-name"
                      value={formData.admin_name}
                      onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-email" className="text-slate-200">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="admin@miempresa.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="admin-password" className="text-slate-200">Contraseña</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      required
                      className="bg-slate-700 border-slate-600 text-white"
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* Module Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white">Selecciona Módulos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {availableModules.map((module) => (
                    <div
                      key={module.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.selected_modules.includes(module.id)
                          ? 'border-blue-500 bg-blue-500/10'
                          : 'border-slate-600 bg-slate-700/50 hover:border-slate-500'
                      }`}
                      onClick={() => handleModuleToggle(module.id)}
                    >
                      <Checkbox
                        checked={formData.selected_modules.includes(module.id)}
                        onCheckedChange={() => handleModuleToggle(module.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <module.icon className="h-5 w-5 text-blue-400" />
                          <Label className="text-white font-medium cursor-pointer">
                            {module.name}
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex items-center justify-between pt-4">
                <div className="flex items-center gap-2 text-sm text-slate-300">
                  <CheckCircle2 className="h-5 w-5 text-green-400" />
                  <span>14 días gratis, sin tarjeta de crédito</span>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8"
                >
                  {loading ? 'Registrando...' : 'Comenzar Trial Gratuito'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 text-slate-400">
          <p>¿Ya tienes una cuenta? <button onClick={() => navigate('/login')} className="text-blue-400 hover:underline">Inicia sesión aquí</button></p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
