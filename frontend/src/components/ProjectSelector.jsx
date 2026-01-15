import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-multitenant';
import { getClients } from '../lib/api-multitenant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Card, CardContent } from './ui/card';
import { Building2, Eye } from 'lucide-react';
import { toast } from 'sonner';

export default function ProjectSelector() {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState('');
  const [loading, setLoading] = useState(true);
  const { user, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Mostrar para COMPANY_ADMIN y SUPER_ADMIN
  if (!user || (user.role !== 'COMPANY_ADMIN' && user.role !== 'SUPER_ADMIN')) {
    console.log('ProjectSelector: Not showing - user role:', user?.role);
    return null;
  }

  console.log('ProjectSelector: Showing for user role:', user.role);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data || []);
      
      // Intentar obtener el cliente actual del localStorage
      const savedClientId = localStorage.getItem('selected_client_id');
      if (savedClientId) {
        setSelectedClient(savedClientId);
      }
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const handleClientChange = async (clientId) => {
    setSelectedClient(clientId);
    
    const client = clients.find(c => c.id === clientId);
    if (!client) return;
    
    // Buscar el proyecto de este cliente
    try {
      const { getProjects } = await import('../lib/api-multitenant');
      const projectsResponse = await getProjects();
      const clientProject = projectsResponse.data.find(p => p.client_id === clientId);
      
      if (clientProject) {
        // Guardar el project_id real del cliente
        localStorage.setItem('selected_client_id', clientId);
        localStorage.setItem('admin_viewing_project_id', clientProject.id);
        localStorage.setItem('project_id', clientProject.id);
        
        toast.success(`Viendo proyecto de: ${client.name}`);
        
        // Disparar evento personalizado para que otros componentes se actualicen
        window.dispatchEvent(new CustomEvent('projectChanged', { detail: { projectId: clientProject.id } }));
        
        // Recargar la página para refrescar los datos
        window.location.reload();
      } else {
        toast.error(`${client.name} no tiene proyectos asignados`);
      }
    } catch (error) {
      console.error('Error al cambiar proyecto:', error);
      toast.error('Error al cambiar de proyecto');
    }
  };

  if (loading) {
    return (
      <Card className="bg-slate-800/50 border-slate-700 mb-6">
        <CardContent className="p-4">
          <div className="animate-pulse flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-700 rounded"></div>
            <div className="flex-1 h-10 bg-slate-700 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-blue-500/30 mb-6">
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-blue-400">
            <Eye className="h-5 w-5" />
            <span className="font-semibold text-sm">Ver Proyecto de:</span>
          </div>
          
          <Select value={selectedClient} onValueChange={handleClientChange}>
            <SelectTrigger className="flex-1 bg-slate-800 border-slate-600 text-white">
              <SelectValue placeholder="Selecciona un cliente para ver su proyecto..." />
            </SelectTrigger>
            <SelectContent className="bg-slate-800 border-slate-700">
              {clients.map((client) => (
                <SelectItem 
                  key={client.id} 
                  value={client.id}
                  className="text-white hover:bg-slate-700"
                >
                  <div className="flex items-center gap-2">
                    <Building2 className="h-4 w-4 text-blue-400" />
                    <span>{client.name}</span>
                    {client.company_name && (
                      <span className="text-slate-400 text-sm">- {client.company_name}</span>
                    )}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {selectedClient && (
          <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
            <span className="inline-block w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
            Estás viendo el proyecto completo como lo ve el cliente
          </div>
        )}
      </CardContent>
    </Card>
  );
}
