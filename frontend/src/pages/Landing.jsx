import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { registerCompany } from '../lib/api-multitenant';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Checkbox } from '../components/ui/checkbox';
import { toast } from 'sonner';
import { CheckCircle2, Users, Calendar, TrendingUp, Shield, Zap, ArrowRight, Mountain } from 'lucide-react';

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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                <Mountain className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">Pactum SaaS</span>
            </div>
          </div>
          <Button 
            variant="ghost" 
            className="text-gray-700 hover:text-blue-600 hover:bg-blue-50"
            onClick={() => navigate('/login')}
          >
            Iniciar Sesión
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-50 to-blue-100 rounded-full mb-6 border border-blue-200">
            <Mountain className="h-4 w-4 text-blue-900" />
            <span className="text-sm font-medium text-blue-900">Plataforma Multi-Tenant Enterprise</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            Gestión Empresarial
            <span className="block bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent mt-2">Todo en un Solo Lugar</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            CRM, gestión de clientes, actividades y proyectos. Una plataforma moderna, segura y escalable para hacer crecer tu negocio.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mt-8">
            <Button 
              size="lg"
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-lg rounded-xl shadow-lg hover:shadow-xl transition-all"
              onClick={() => document.getElementById('registro').scrollIntoView({ behavior: 'smooth' })}
            >
              Comenzar Gratis
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
            <Button 
              size="lg"
              variant="outline"
              className="border-2 border-gray-300 text-gray-700 hover:border-blue-600 hover:text-blue-600 px-8 py-6 text-lg rounded-xl"
              onClick={() => navigate('/login')}
            >
              Ver Demo
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <Card className="bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center mb-4">
                <Shield className="h-7 w-7 text-blue-600" />
              </div>
              <CardTitle className="text-gray-900 text-xl">Multi-Tenant Seguro</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Datos completamente aislados por empresa con seguridad de nivel enterprise
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center mb-4">
                <Zap className="h-7 w-7 text-green-600" />
              </div>
              <CardTitle className="text-gray-900 text-xl">Trial Gratuito 14 Días</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Prueba todas las funcionalidades sin necesidad de tarjeta de crédito
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="bg-white border-2 border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all">
            <CardHeader>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center mb-4">
                <TrendingUp className="h-7 w-7 text-purple-600" />
              </div>
              <CardTitle className="text-gray-900 text-xl">Módulos Flexibles</CardTitle>
              <CardDescription className="text-gray-600 text-base leading-relaxed">
                Activa solo los módulos que necesitas para tu negocio
              </CardDescription>
            </CardHeader>
          </Card>
        </div>

        {/* Registration Form */}
        <Card id="registro" className="max-w-4xl mx-auto bg-white border-2 border-gray-200 shadow-2xl">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-3xl text-gray-900 font-bold">Registra tu Empresa</CardTitle>
            <CardDescription className="text-gray-600 text-lg">
              Comienza tu trial gratuito de 14 días ahora. Sin tarjeta de crédito.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Company Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Información de la Empresa</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="company-name" className="text-gray-700 font-medium">Nombre de la Empresa</Label>
                    <Input
                      id="company-name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Mi Empresa S.A."
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-email" className="text-gray-700 font-medium">Email de la Empresa</Label>
                    <Input
                      id="company-email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="contacto@miempresa.com"
                    />
                  </div>
                  <div>
                    <Label htmlFor="company-phone" className="text-gray-700 font-medium">Teléfono</Label>
                    <Input
                      id="company-phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="+505 8888-8888"
                    />
                  </div>
                </div>
              </div>

              {/* Admin Info */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Administrador Principal</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="admin-name" className="text-gray-700 font-medium">Nombre Completo</Label>
                    <Input
                      id="admin-name"
                      value={formData.admin_name}
                      onChange={(e) => setFormData({ ...formData, admin_name: e.target.value })}
                      required
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Juan Pérez"
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin-email" className="text-gray-700 font-medium">Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      value={formData.admin_email}
                      onChange={(e) => setFormData({ ...formData, admin_email: e.target.value })}
                      required
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="admin@miempresa.com"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="admin-password" className="text-gray-700 font-medium">Contraseña</Label>
                    <Input
                      id="admin-password"
                      type="password"
                      value={formData.admin_password}
                      onChange={(e) => setFormData({ ...formData, admin_password: e.target.value })}
                      required
                      className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500"
                      placeholder="Mínimo 8 caracteres"
                      minLength={8}
                    />
                  </div>
                </div>
              </div>

              {/* Module Selection */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">Selecciona Módulos</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {availableModules.map((module) => (
                    <div
                      key={module.id}
                      className={`flex items-start space-x-3 p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.selected_modules.includes(module.id)
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50'
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
                          <module.icon className="h-5 w-5 text-blue-600" />
                          <Label className="text-gray-900 font-medium cursor-pointer">
                            {module.name}
                          </Label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Submit */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  <span className="font-medium">14 días gratis, sin tarjeta de crédito</span>
                </div>
                <Button
                  type="submit"
                  disabled={loading}
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all w-full sm:w-auto"
                >
                  {loading ? 'Registrando...' : (
                    <>
                      Comenzar Trial Gratuito
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-16 pb-12">
          <p className="text-gray-600">¿Ya tienes una cuenta? <button onClick={() => navigate('/login')} className="text-blue-600 hover:text-blue-700 font-medium hover:underline">Inicia sesión aquí</button></p>
        </div>
      </section>
    </div>
  );
};

export default Landing;
