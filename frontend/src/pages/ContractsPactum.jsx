import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import {
  Anchor,
  TrendingUp,
  Shield,
  Globe,
  CheckCircle,
  ArrowRight,
  DollarSign,
  Calendar,
  Users,
  FileText,
  BarChart3,
  Sparkles
} from 'lucide-react';

export default function ContractsPactum() {
  const navigate = useNavigate();
  const [hoveredCard, setHoveredCard] = useState(null);

  const industries = [
    {
      icon: Anchor,
      title: 'Yates & Charters',
      description: 'Gestión completa de contratos de yates en Miami, charters de lujo y mantenimiento de embarcaciones',
      color: 'from-blue-500 to-cyan-500',
      features: ['Calendario de Charters', 'Gestión de Tripulación', 'Mantenimiento', 'Comisiones']
    },
    {
      icon: Globe,
      title: 'Tecnología & Software',
      description: 'Contratos de desarrollo de software, proyectos tecnológicos y soluciones digitales',
      color: 'from-purple-500 to-pink-500',
      features: ['Fases de Desarrollo', 'Sprints Ágiles', 'Entregables', 'Pagos por Milestone']
    },
    {
      icon: TrendingUp,
      title: 'Inversiones & Finanzas',
      description: 'Gestión de préstamos, inversiones, comisiones y seguimiento financiero detallado',
      color: 'from-emerald-500 to-teal-500',
      features: ['Tracking de Deuda', 'Comisiones', 'Pagos Programados', 'Reportes Financieros']
    },
    {
      icon: Shield,
      title: 'Consultoría & Servicios',
      description: 'Contratos de consultoría, servicios profesionales y proyectos empresariales',
      color: 'from-orange-500 to-red-500',
      features: ['Horas Facturables', 'Entregables', 'KPIs', 'Cumplimiento']
    }
  ];

  const features = [
    {
      icon: FileText,
      title: 'Contratos Inteligentes',
      description: 'Upload de PDFs con extracción automática de datos mediante IA'
    },
    {
      icon: BarChart3,
      title: '% Cumplimiento',
      description: 'Métricas en tiempo real del progreso y cumplimiento del contrato'
    },
    {
      icon: Calendar,
      title: 'Gestión de Fases',
      description: 'Control total de milestones, entregables y fechas límite'
    },
    {
      icon: DollarSign,
      title: 'Tracking de Pagos',
      description: 'Seguimiento detallado de pagos, comisiones y flujo de caja'
    },
    {
      icon: Users,
      title: 'Multi-tenant',
      description: 'Gestiona múltiples clientes y proyectos desde una sola plataforma'
    },
    {
      icon: Sparkles,
      title: 'Escalable',
      description: 'Arquitectura preparada para crecer con tu negocio'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 animate-pulse"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center space-y-8">
            {/* Badge */}
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white border-0 px-6 py-2 text-sm">
              <Sparkles className="w-4 h-4 mr-2 inline" />
              Sistema de Gestión de Contratos Multi-Industria
            </Badge>

            {/* Title */}
            <h1 className="text-6xl md:text-7xl font-bold text-white">
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Pactum Contracts
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 max-w-3xl mx-auto">
              Gestiona contratos de <span className="text-blue-400 font-semibold">yates en Miami</span>, 
              <span className="text-purple-400 font-semibold"> proyectos tecnológicos</span>, 
              <span className="text-emerald-400 font-semibold"> inversiones</span> y más.
              Todo en una plataforma escalable y profesional.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8 py-6 text-lg"
                onClick={() => navigate('/login')}
              >
                Comenzar Ahora
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg"
                onClick={() => navigate('/inversiones-jessy')}
              >
                Ver Demo
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Industries Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-white mb-4">Industrias que Soportamos</h2>
          <p className="text-xl text-slate-400">Backend escalable diseñado para múltiples sectores</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {industries.map((industry, idx) => (
            <Card
              key={idx}
              className="bg-slate-800/50 border-slate-700 hover:border-slate-600 transition-all duration-300 cursor-pointer transform hover:scale-105"
              onMouseEnter={() => setHoveredCard(idx)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-to-br ${industry.color}`}>
                    <industry.icon className="h-8 w-8 text-white" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-white text-2xl mb-2">{industry.title}</CardTitle>
                    <p className="text-slate-400">{industry.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {industry.features.map((feature, featureIdx) => (
                    <div key={featureIdx} className="flex items-center gap-2 text-sm text-slate-300">
                      <CheckCircle className="h-4 w-4 text-emerald-400" />
                      {feature}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Features Section */}
      <div className="bg-slate-900/50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Funcionalidades Clave</h2>
            <p className="text-xl text-slate-400">Todo lo que necesitas para gestionar contratos profesionalmente</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="p-6 rounded-lg bg-slate-800/50 border border-slate-700 hover:border-slate-600 transition-all duration-300"
              >
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <feature.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                    <p className="text-sm text-slate-400">{feature.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
        <Card className="bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 border-slate-700">
          <CardContent className="p-12 text-center">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Listo para Gestionar tus Contratos?
            </h2>
            <p className="text-xl text-slate-300 mb-8 max-w-2xl mx-auto">
              Únete a empresas que ya están gestionando yates, proyectos tecnológicos e inversiones con Pactum Contracts
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg" 
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white border-0 px-8 py-6 text-lg"
                onClick={() => navigate('/login')}
              >
                Comenzar Gratis
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-slate-600 text-white hover:bg-slate-800 px-8 py-6 text-lg"
              >
                Contactar Ventas
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="border-t border-slate-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-slate-500">
            © 2026 Pactum Contracts by Software Nicaragua. Sistema escalable para gestión de contratos multi-industria.
          </p>
        </div>
      </div>
    </div>
  );
}
