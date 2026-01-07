import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../components/ui/select';
import { Badge } from '../components/ui/badge';
import { toast } from 'sonner';
import { 
  Users, 
  Briefcase, 
  Building2, 
  Plus, 
  Edit, 
  Trash2,
  DollarSign,
  Clock,
  UserPlus
} from 'lucide-react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('clients');
  const [clients, setClients] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Dialog states
  const [clientDialogOpen, setClientDialogOpen] = useState(false);
  const [projectDialogOpen, setProjectDialogOpen] = useState(false);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  
  // Editing states
  const [editingClient, setEditingClient] = useState(null);
  const [editingProject, setEditingProject] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  
  // Form data
  const [clientForm, setClientForm] = useState({ name: '', email: '', phone: '', company: '', address: '' });
  const [projectForm, setProjectForm] = useState({ 
    name: '', 
    description: '', 
    client_id: '', 
    budget: '', 
    start_date: '', 
    end_date: '',
    assigned_users: []
  });
  const [userForm, setUserForm] = useState({ name: '', email: '', password: '', role: 'TEAM_MEMBER', assigned_projects: [] });

  const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
  const token = localStorage.getItem('pactum_token');

  useEffect(() => {
    loadData();
  }, [activeTab]);

  const loadData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'clients') {
        await loadClients();
      } else if (activeTab === 'projects') {
        await loadProjects();
        await loadClients(); // Needed for project form
        await loadUsers(); // Needed for assigning users to projects
      } else if (activeTab === 'users') {
        await loadUsers();
        await loadProjects(); // Needed to show user's assigned projects
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadClients = async () => {
    const response = await fetch(`${API_URL}/api/clients`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setClients(data);
  };

  const loadProjects = async () => {
    const response = await fetch(`${API_URL}/api/projects`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setProjects(data);
  };

  const loadUsers = async () => {
    const response = await fetch(`${API_URL}/api/company/users`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await response.json();
    setUsers(data);
  };

  // Client CRUD
  const handleSaveClient = async () => {
    try {
      const url = editingClient 
        ? `${API_URL}/api/clients/${editingClient.id}`
        : `${API_URL}/api/clients`;
      
      const response = await fetch(url, {
        method: editingClient ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(clientForm)
      });

      if (!response.ok) throw new Error('Error al guardar cliente');

      toast.success(editingClient ? 'Cliente actualizado' : 'Cliente creado');
      setClientDialogOpen(false);
      setEditingClient(null);
      setClientForm({ name: '', email: '', phone: '', company: '', address: '' });
      loadClients();
    } catch (error) {
      toast.error('Error al guardar cliente');
      console.error(error);
    }
  };

  const handleDeleteClient = async (clientId) => {
    if (!window.confirm('¿Eliminar este cliente?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/clients/${clientId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar cliente');

      toast.success('Cliente eliminado');
      loadClients();
    } catch (error) {
      toast.error('Error al eliminar cliente');
      console.error(error);
    }
  };

  // Project CRUD
  const handleSaveProject = async () => {
    try {
      const url = editingProject 
        ? `${API_URL}/api/projects/${editingProject.id}`
        : `${API_URL}/api/projects`;
      
      const response = await fetch(url, {
        method: editingProject ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...projectForm,
          budget: parseFloat(projectForm.budget) || 0
        })
      });

      if (!response.ok) throw new Error('Error al guardar proyecto');

      toast.success(editingProject ? 'Proyecto actualizado' : 'Proyecto creado');
      setProjectDialogOpen(false);
      setEditingProject(null);
      setProjectForm({ 
        name: '', 
        description: '', 
        client_id: '', 
        budget: '', 
        start_date: '', 
        end_date: '',
        assigned_users: []
      });
      loadProjects();
    } catch (error) {
      toast.error('Error al guardar proyecto');
      console.error(error);
    }
  };

  const handleDeleteProject = async (projectId) => {
    if (!window.confirm('¿Eliminar este proyecto?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar proyecto');

      toast.success('Proyecto eliminado');
      loadProjects();
    } catch (error) {
      toast.error('Error al eliminar proyecto');
      console.error(error);
    }
  };

  // User CRUD
  const handleSaveUser = async () => {
    try {
      const url = editingUser 
        ? `${API_URL}/api/company/users/${editingUser.id}`
        : `${API_URL}/api/company/users`;
      
      const body = editingUser && !userForm.password
        ? { name: userForm.name, email: userForm.email, role: userForm.role }
        : userForm;

      const response = await fetch(url, {
        method: editingUser ? 'PUT' : 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) throw new Error('Error al guardar usuario');

      const userData = await response.json();
      const userId = editingUser ? editingUser.id : userData.id;

      if (userForm.assigned_projects && userForm.assigned_projects.length > 0) {
        for (const projectId of userForm.assigned_projects) {
          const project = projects.find(p => p.id === projectId);
          if (project) {
            const updatedUsers = project.assigned_users || [];
            if (!updatedUsers.includes(userId)) {
              updatedUsers.push(userId);
              await fetch(`${API_URL}/api/projects/${projectId}`, {
                method: 'PUT',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({ ...project, assigned_users: updatedUsers })
              });
            }
          }
        }
      }

      toast.success(editingUser ? 'Usuario actualizado' : 'Usuario creado');
      setUserDialogOpen(false);
      setEditingUser(null);
      setUserForm({ name: '', email: '', password: '', role: 'TEAM_MEMBER', assigned_projects: [] });
      loadUsers();
      loadProjects();
    } catch (error) {
      toast.error('Error al guardar usuario');
      console.error(error);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('¿Eliminar este usuario?')) return;
    
    try {
      const response = await fetch(`${API_URL}/api/company/users/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar usuario');

      toast.success('Usuario eliminado');
      loadUsers();
    } catch (error) {
      toast.error('Error al eliminar usuario');
      console.error(error);
    }
  };

  const tabs = [
    { id: 'clients', label: 'Clientes', icon: Building2 },
    { id: 'projects', label: 'Proyectos', icon: Briefcase },
    { id: 'users', label: 'Usuarios', icon: Users }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Panel de Administración</h1>
        <p className="text-slate-400 mt-1">Gestiona clientes, proyectos y usuarios</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-700">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Icon className="h-4 w-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Clients Tab */}
      {activeTab === 'clients' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Clientes</h2>
            <Button 
              onClick={() => {
                setEditingClient(null);
                setClientForm({ name: '', email: '', phone: '', company: '', address: '' });
                setClientDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Cliente
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {clients.map(client => (
              <Card key={client.id} className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center justify-between">
                    <span>{client.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingClient(client);
                          setClientForm({
                            name: client.name,
                            email: client.email || '',
                            phone: client.phone || '',
                            company: client.company || '',
                            address: client.address || ''
                          });
                          setClientDialogOpen(true);
                        }}
                        className="h-8 px-2 text-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteClient(client.id)}
                        className="h-8 px-2 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 text-sm">
                    {client.email && <p className="text-slate-400">{client.email}</p>}
                    {client.phone && <p className="text-slate-400">{client.phone}</p>}
                    {client.company && <p className="text-slate-400">{client.company}</p>}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Projects Tab */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Proyectos</h2>
            <Button 
              onClick={() => {
                setEditingProject(null);
                setProjectForm({ 
                  name: '', 
                  description: '', 
                  client_id: '', 
                  budget: '', 
                  start_date: '', 
                  end_date: '',
                  assigned_users: []
                });
                setProjectDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Proyecto
            </Button>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {projects.map(project => (
              <Card key={project.id} className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center justify-between">
                    <span>{project.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingProject(project);
                          setProjectForm({
                            name: project.name,
                            description: project.description || '',
                            client_id: project.client_id || '',
                            budget: project.budget || '',
                            start_date: project.start_date ? project.start_date.split('T')[0] : '',
                            end_date: project.end_date ? project.end_date.split('T')[0] : '',
                            assigned_users: project.assigned_users || []
                          });
                          setProjectDialogOpen(true);
                        }}
                        className="h-8 px-2 text-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteProject(project.id)}
                        className="h-8 px-2 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {project.description && (
                      <p className="text-slate-400 text-sm">{project.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm">
                      {project.budget && (
                        <div className="flex items-center gap-2 text-green-400">
                          <DollarSign className="h-4 w-4" />
                          <span>${parseFloat(project.budget).toLocaleString()}</span>
                        </div>
                      )}
                      {project.start_date && (
                        <div className="flex items-center gap-2 text-blue-400">
                          <Clock className="h-4 w-4" />
                          <span>{new Date(project.start_date).toLocaleDateString()}</span>
                        </div>
                      )}
                    </div>
                    {project.assigned_users && project.assigned_users.length > 0 && (
                      <div>
                        <p className="text-xs text-slate-500 mb-1">Usuarios asignados:</p>
                        <div className="flex flex-wrap gap-1">
                          {project.assigned_users.map(userId => {
                            const user = users.find(u => u.id === userId);
                            return user ? (
                              <Badge key={userId} variant="secondary" className="text-xs">
                                {user.name}
                              </Badge>
                            ) : null;
                          })}
                        </div>
                      </div>
                    )}
                    {(!project.assigned_users || project.assigned_users.length === 0) && (
                      <div>
                        <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                          ⚠️ Sin usuarios asignados
                        </Badge>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">Usuarios</h2>
            <Button 
              onClick={async () => {
                setEditingUser(null);
                setUserForm({ name: '', email: '', password: '', role: 'TEAM_MEMBER', assigned_projects: [] });
                if (projects.length === 0) {
                  await loadProjects();
                }
                setUserDialogOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nuevo Usuario
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {users.map(user => (
              <Card key={user.id} className="border-slate-700 bg-slate-800/50">
                <CardHeader>
                  <CardTitle className="text-white text-lg flex items-center justify-between">
                    <span>{user.name}</span>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setEditingUser(user);
                          const userProjects = projects.filter(p => p.assigned_users && p.assigned_users.includes(user.id)).map(p => p.id);
                          setUserForm({
                            name: user.name,
                            email: user.email,
                            password: '',
                            role: user.role,
                            assigned_projects: userProjects
                          });
                          setUserDialogOpen(true);
                        }}
                        className="h-8 px-2 text-blue-400"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteUser(user.id)}
                        className="h-8 px-2 text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    <Badge className={
                      user.role === 'COMPANY_ADMIN' 
                        ? 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                        : user.role === 'TEAM_MEMBER'
                          ? 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                          : 'bg-slate-500/20 text-slate-300 border-slate-500/30'
                    }>
                      {user.role === 'COMPANY_ADMIN' ? 'Admin' : user.role === 'TEAM_MEMBER' ? 'Miembro' : 'Usuario'}
                    </Badge>
                    
                    {(user.role === 'TEAM_MEMBER' || user.role === 'USER') && (
                      <div className="mt-3">
                        <p className="text-xs text-slate-500 mb-1">Proyectos asignados:</p>
                        {projects.filter(p => p.assigned_users && p.assigned_users.includes(user.id)).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {projects.filter(p => p.assigned_users && p.assigned_users.includes(user.id)).map(project => (
                              <Badge key={project.id} variant="outline" className="text-xs">
                                {project.name}
                              </Badge>
                            ))}
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs text-orange-400 border-orange-400">
                            ⚠️ Sin proyectos asignados
                          </Badge>
                        )}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Client Dialog */}
      <Dialog open={clientDialogOpen} onOpenChange={setClientDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingClient ? 'Editar Cliente' : 'Nuevo Cliente'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={clientForm.name}
                onChange={(e) => setClientForm({ ...clientForm, name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <Label>Email</Label>
              <Input
                type="email"
                value={clientForm.email}
                onChange={(e) => setClientForm({ ...clientForm, email: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label>Teléfono</Label>
              <Input
                value={clientForm.phone}
                onChange={(e) => setClientForm({ ...clientForm, phone: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label>Empresa</Label>
              <Input
                value={clientForm.company}
                onChange={(e) => setClientForm({ ...clientForm, company: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
              />
            </div>
            <div>
              <Label>Dirección</Label>
              <Textarea
                value={clientForm.address}
                onChange={(e) => setClientForm({ ...clientForm, address: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                rows={2}
              />
            </div>
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setClientDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveClient} className="bg-blue-600 hover:bg-blue-700">
                {editingClient ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Project Dialog */}
      <Dialog open={projectDialogOpen} onOpenChange={setProjectDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre del Proyecto *</Label>
              <Input
                value={projectForm.name}
                onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={projectForm.description}
                onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Cliente</Label>
                <select
                  value={projectForm.client_id}
                  onChange={(e) => setProjectForm({ ...projectForm, client_id: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white"
                >
                  <option value="">Seleccionar cliente</option>
                  {clients.map(client => (
                    <option key={client.id} value={client.id}>{client.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <Label>Presupuesto (USD) - Solo visible para admin</Label>
                <Input
                  type="number"
                  value={projectForm.budget}
                  onChange={(e) => setProjectForm({ ...projectForm, budget: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Fecha de Inicio</Label>
                <Input
                  type="date"
                  value={projectForm.start_date}
                  onChange={(e) => setProjectForm({ ...projectForm, start_date: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
              <div>
                <Label>Fecha de Fin</Label>
                <Input
                  type="date"
                  value={projectForm.end_date}
                  onChange={(e) => setProjectForm({ ...projectForm, end_date: e.target.value })}
                  className="bg-slate-900 border-slate-700 text-white"
                />
              </div>
            </div>
            
            <div>
              <Label>Usuarios Asignados al Proyecto *</Label>
              <p className="text-xs text-slate-500 mb-2">Selecciona los miembros del equipo que tendrán acceso a este proyecto</p>
              <div className="bg-slate-900 border border-slate-700 rounded-md p-3 max-h-48 overflow-y-auto">
                {users.filter(u => u.role === 'TEAM_MEMBER' || u.role === 'USER').map(user => (
                  <label key={user.id} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-slate-800 px-2 rounded">
                    <input
                      type="checkbox"
                      checked={projectForm.assigned_users.includes(user.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setProjectForm({
                            ...projectForm,
                            assigned_users: [...projectForm.assigned_users, user.id]
                          });
                        } else {
                          setProjectForm({
                            ...projectForm,
                            assigned_users: projectForm.assigned_users.filter(id => id !== user.id)
                          });
                        }
                      }}
                      className="w-4 h-4"
                    />
                    <span className="text-white">{user.name}</span>
                    <Badge className="ml-auto text-xs">
                      {user.role === 'TEAM_MEMBER' ? 'Miembro' : 'Usuario'}
                    </Badge>
                  </label>
                ))}
                {users.filter(u => u.role === 'TEAM_MEMBER' || u.role === 'USER').length === 0 && (
                  <p className="text-slate-500 text-sm">No hay usuarios disponibles. Crea usuarios primero.</p>
                )}
              </div>
            </div>
            
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setProjectDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveProject} className="bg-blue-600 hover:bg-blue-700">
                {editingProject ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* User Dialog */}
      <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
        <DialogContent className="bg-slate-800 border-slate-700 text-white">
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Editar Usuario' : 'Nuevo Usuario'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={userForm.name}
                onChange={(e) => setUserForm({ ...userForm, name: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <Label>Email *</Label>
              <Input
                type="email"
                value={userForm.email}
                onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                required
              />
            </div>
            <div>
              <Label>Contraseña {editingUser && '(dejar vacío para no cambiar)'}</Label>
              <Input
                type="password"
                value={userForm.password}
                onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                className="bg-slate-900 border-slate-700 text-white"
                placeholder={editingUser ? 'Dejar vacío para mantener actual' : ''}
              />
            </div>
            <div>
              <Label>Rol *</Label>
              <select
                value={userForm.role}
                onChange={(e) => setUserForm({ ...userForm, role: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white"
              >
                <option value="TEAM_MEMBER">Miembro del Equipo</option>
                <option value="USER">Usuario</option>
                <option value="COMPANY_ADMIN">Administrador</option>
              </select>
              <p className="text-xs text-slate-500 mt-1">
                Miembro: Acceso a tareas. Usuario: Acceso a su proyecto. Admin: Acceso completo.
              </p>
            </div>
            
            {(userForm.role === 'TEAM_MEMBER' || userForm.role === 'USER') && (
              <div>
                <Label>Proyectos Asignados *</Label>
                <p className="text-xs text-slate-500 mb-2">Selecciona los proyectos a los que tendrá acceso este usuario</p>
                <div className="bg-slate-900 border border-slate-700 rounded-md p-3 max-h-48 overflow-y-auto">
                  {projects.map(project => (
                    <label key={project.id} className="flex items-center gap-2 py-2 cursor-pointer hover:bg-slate-800 px-2 rounded">
                      <input
                        type="checkbox"
                        checked={userForm.assigned_projects.includes(project.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setUserForm({
                              ...userForm,
                              assigned_projects: [...userForm.assigned_projects, project.id]
                            });
                          } else {
                            setUserForm({
                              ...userForm,
                              assigned_projects: userForm.assigned_projects.filter(id => id !== project.id)
                            });
                          }
                        }}
                        className="w-4 h-4"
                      />
                      <span className="text-white">{project.name}</span>
                    </label>
                  ))}
                  {projects.length === 0 && (
                    <p className="text-slate-500 text-sm">No hay proyectos disponibles. Crea proyectos primero.</p>
                  )}
                </div>
              </div>
            )}
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setUserDialogOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={handleSaveUser} className="bg-blue-600 hover:bg-blue-700">
                {editingUser ? 'Actualizar' : 'Crear'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPanel;
