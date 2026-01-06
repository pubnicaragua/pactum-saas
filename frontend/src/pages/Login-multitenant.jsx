import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-multitenant';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { toast } from 'sonner';
import { LogIn, Sparkles } from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(formData.email, formData.password);
      toast.success('¡Bienvenido!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Credenciales inválidas');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <span className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Pactum SaaS</span>
          </div>
          <p className="text-gray-600 text-lg">Multi-ERP / Multi-CRM Platform</p>
        </div>

        <Card className="bg-white border-2 border-gray-200 shadow-2xl">
          <CardHeader className="border-b border-gray-100 pb-6">
            <CardTitle className="text-2xl text-gray-900 font-bold">Iniciar Sesión</CardTitle>
            <CardDescription className="text-gray-600 text-base">
              Ingresa tus credenciales para acceder a tu cuenta
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label htmlFor="email" className="text-gray-700 font-medium">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 mt-1"
                  placeholder="tu@email.com"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-gray-700 font-medium">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  className="bg-white border-gray-300 text-gray-900 focus:border-blue-500 focus:ring-blue-500 mt-1"
                  placeholder="••••••••"
                />
              </div>
              <Button
                type="submit"
                disabled={loading}
                size="lg"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base rounded-xl shadow-lg hover:shadow-xl transition-all mt-6"
              >
                {loading ? (
                  'Iniciando sesión...'
                ) : (
                  <>
                    <LogIn className="h-5 w-5 mr-2" />
                    Iniciar Sesión
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-gray-600 text-sm">
                ¿No tienes una cuenta?{' '}
                <button
                  onClick={() => navigate('/')}
                  className="text-blue-600 hover:text-blue-700 font-medium hover:underline"
                >
                  Registra tu empresa
                </button>
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-500 text-xs text-center mb-3 font-medium">Usuarios de demostración:</p>
              <div className="space-y-2 text-xs">
                <div className="bg-blue-50 border border-blue-100 p-3 rounded-lg">
                  <strong className="text-blue-700">Super Admin:</strong> <span className="text-gray-700">admin@softwarenicaragua.com / SoftwareNic2026!</span>
                </div>
                <div className="bg-green-50 border border-green-100 p-3 rounded-lg">
                  <strong className="text-green-700">Cliente Pactum:</strong> <span className="text-gray-700">admin@pactum.com / Pactum#2026!</span>
                </div>
                <div className="bg-purple-50 border border-purple-100 p-3 rounded-lg">
                  <strong className="text-purple-700">Usuario B&T:</strong> <span className="text-gray-700">activo2_26@gmail.com / Pactum#2026!</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Login;
