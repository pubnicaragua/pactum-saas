import React, { useState, useEffect } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { getProjects } from '../lib/api-multitenant';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { toast } from 'sonner';
import { 
  Briefcase, 
  DollarSign, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  FileText,
  TrendingUp,
  User
} from 'lucide-react';

const ProjectView = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const response = await getProjects();
      setProjects(response.data);
    } catch (error) {
      toast.error('Error al cargar proyectos');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Cargando proyecto...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Briefcase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500">No tienes proyectos asignados</p>
        </div>
      </div>
    );
  }

  const project = projects[0]; // Usuario solo tiene un proyecto asignado

  const getStatusColor = (status) => {
    const colors = {
      'planificacion': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'en_progreso': 'bg-blue-100 text-blue-800 border-blue-200',
      'completado': 'bg-green-100 text-green-800 border-green-200',
      'pausado': 'bg-gray-100 text-gray-800 border-gray-200'
    };
    return colors[status] || colors['en_progreso'];
  };

  const getStatusText = (status) => {
    const texts = {
      'planificacion': 'Planificación',
      'en_progreso': 'En Progreso',
      'completado': 'Completado',
      'pausado': 'Pausado'
    };
    return texts[status] || status;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Mi Proyecto</h1>
          <p className="text-gray-600 mt-1">Detalles y progreso del proyecto asignado</p>
        </div>
      </div>

      {/* Project Overview Card */}
      <Card className="border-2 border-blue-100 bg-gradient-to-br from-white to-blue-50">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-900 rounded-lg flex items-center justify-center shadow-lg">
                  <Briefcase className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl text-gray-900">{project.name}</CardTitle>
                  <CardDescription className="text-base text-gray-600">{project.client_name}</CardDescription>
                </div>
              </div>
            </div>
            <div className={`px-4 py-2 rounded-lg border-2 font-medium ${getStatusColor(project.status)}`}>
              {getStatusText(project.status)}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-gray-700 leading-relaxed mb-6">{project.description}</p>
          
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Presupuesto</p>
                  <p className="text-xl font-bold text-gray-900">${project.budget.toLocaleString()}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Progreso</p>
                  <p className="text-xl font-bold text-gray-900">{project.progress_percentage}%</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4 border-2 border-gray-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Duración</p>
                  <p className="text-xl font-bold text-gray-900">90 días</p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Progreso del Proyecto</span>
              <span className="text-sm font-bold text-blue-600">{project.progress_percentage}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="bg-gradient-to-r from-blue-600 to-blue-700 h-3 rounded-full transition-all duration-500"
                style={{ width: `${project.progress_percentage}%` }}
              />
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <Clock className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Fecha de Inicio</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(project.start_date).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white rounded-lg p-3 border border-gray-200">
              <Calendar className="h-5 w-5 text-gray-500" />
              <div>
                <p className="text-xs text-gray-500">Fecha de Entrega</p>
                <p className="text-sm font-medium text-gray-900">
                  {new Date(project.end_date).toLocaleDateString('es-ES', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Deliverables */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-blue-600" />
            Entregables del Proyecto
          </CardTitle>
          <CardDescription>Lista de entregables comprometidos</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {project.deliverables.map((deliverable, index) => (
              <div 
                key={index}
                className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
              >
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-bold text-blue-600">{index + 1}</span>
                </div>
                <p className="text-gray-700">{deliverable}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {project.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              Notas del Proyecto
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border-l-4 border-blue-600 p-4 rounded">
              <p className="text-gray-700">{project.notes}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Team Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-blue-600" />
            Información del Equipo
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white font-bold text-lg">{user.name.charAt(0)}</span>
            </div>
            <div>
              <p className="font-medium text-gray-900">{user.name}</p>
              <p className="text-sm text-gray-600">{user.email}</p>
              <span className="inline-block mt-1 px-2 py-1 bg-blue-600 text-white text-xs rounded-full">
                Miembro del Proyecto
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectView;
