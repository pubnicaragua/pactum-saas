import { useState, useEffect } from 'react';
import { getClients, createClient, updateClient, deleteClient, getContacts, createContact, deleteContact } from '../lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '../components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../components/ui/table';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  Users, 
  Plus, 
  Search,
  Mail,
  Phone,
  Building,
  Trash2,
  Edit,
  UserPlus,
  Tag
} from 'lucide-react';

export default function CRMClients() {
  const [clients, setClients] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [selectedClient, setSelectedClient] = useState(null);
  const [isContactOpen, setIsContactOpen] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    address: '',
    tags: [],
    notes: ''
  });
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    phone: '',
    position: ''
  });
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    if (selectedClient) {
      fetchContacts(selectedClient.id);
    }
  }, [selectedClient]);

  const fetchClients = async () => {
    try {
      const response = await getClients();
      setClients(response.data);
    } catch (error) {
      console.error('Error loading clients:', error);
      toast.error('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  const fetchContacts = async (clientId) => {
    try {
      const response = await getContacts(clientId);
      setContacts(response.data);
    } catch (error) {
      console.error('Error loading contacts:', error);
    }
  };

  const handleCreate = async () => {
    if (!formData.name.trim()) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await createClient(formData);
      toast.success('Cliente creado');
      setIsCreateOpen(false);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error creating client:', error);
      toast.error('Error al crear cliente');
    }
  };

  const handleUpdate = async () => {
    if (!editClient) return;

    try {
      await updateClient(editClient.id, formData);
      toast.success('Cliente actualizado');
      setEditClient(null);
      resetForm();
      fetchClients();
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Error al actualizar');
    }
  };

  const handleDelete = async (clientId) => {
    if (!window.confirm('¿Eliminar este cliente y sus contactos?')) return;

    try {
      await deleteClient(clientId);
      toast.success('Cliente eliminado');
      fetchClients();
      if (selectedClient?.id === clientId) {
        setSelectedClient(null);
        setContacts([]);
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast.error('Error al eliminar');
    }
  };

  const handleCreateContact = async () => {
    if (!contactForm.name.trim() || !selectedClient) {
      toast.error('El nombre es requerido');
      return;
    }

    try {
      await createContact({ ...contactForm, client_id: selectedClient.id });
      toast.success('Contacto agregado');
      setIsContactOpen(false);
      setContactForm({ name: '', email: '', phone: '', position: '' });
      fetchContacts(selectedClient.id);
    } catch (error) {
      console.error('Error creating contact:', error);
      toast.error('Error al crear contacto');
    }
  };

  const handleDeleteContact = async (contactId) => {
    try {
      await deleteContact(contactId);
      toast.success('Contacto eliminado');
      fetchContacts(selectedClient.id);
    } catch (error) {
      console.error('Error deleting contact:', error);
      toast.error('Error al eliminar');
    }
  };

  const openEditDialog = (client) => {
    setEditClient(client);
    setFormData({
      name: client.name,
      email: client.email || '',
      phone: client.phone || '',
      company: client.company || '',
      address: client.address || '',
      tags: client.tags || [],
      notes: client.notes || ''
    });
  };

  const resetForm = () => {
    setFormData({ name: '', email: '', phone: '', company: '', address: '', tags: [], notes: '' });
    setTagInput('');
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const removeTag = (tag) => {
    setFormData({ ...formData, tags: formData.tags.filter(t => t !== tag) });
  };

  const filteredClients = clients.filter(client =>
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="crm-clients">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Clientes</h1>
          <p className="text-slate-400 mt-1">{clients.length} clientes registrados</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <Input
              placeholder="Buscar clientes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64 bg-slate-800/50 border-slate-700"
              data-testid="search-clients"
            />
          </div>
          <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700" data-testid="create-client-btn">
                <Plus className="w-4 h-4 mr-2" />
                Nuevo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
              <DialogHeader>
                <DialogTitle className="text-white">Nuevo Cliente</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm text-slate-400">Nombre *</label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="mt-1 bg-slate-800/50 border-slate-700"
                    data-testid="client-name-input"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-slate-400">Email</label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="mt-1 bg-slate-800/50 border-slate-700"
                    />
                  </div>
                  <div>
                    <label className="text-sm text-slate-400">Teléfono</label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      className="mt-1 bg-slate-800/50 border-slate-700"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Empresa</label>
                  <Input
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="mt-1 bg-slate-800/50 border-slate-700"
                  />
                </div>
                <div>
                  <label className="text-sm text-slate-400">Etiquetas</label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={tagInput}
                      onChange={(e) => setTagInput(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      placeholder="Agregar etiqueta..."
                      className="bg-slate-800/50 border-slate-700"
                    />
                    <Button type="button" onClick={addTag} variant="outline" className="border-slate-700">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map(tag => (
                      <Badge key={tag} className="bg-blue-500/20 text-blue-400 cursor-pointer" onClick={() => removeTag(tag)}>
                        {tag} ×
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm text-slate-400">Notas</label>
                  <Textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="mt-1 bg-slate-800/50 border-slate-700"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700" data-testid="save-client-btn">
                  Crear Cliente
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editClient} onOpenChange={(open) => !open && setEditClient(null)}>
        <DialogContent className="bg-slate-900 border-slate-700 max-w-lg">
          <DialogHeader>
            <DialogTitle className="text-white">Editar Cliente</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-slate-400">Nombre *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Email</label>
                <Input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className="mt-1 bg-slate-800/50 border-slate-700"
                />
              </div>
              <div>
                <label className="text-sm text-slate-400">Teléfono</label>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="mt-1 bg-slate-800/50 border-slate-700"
                />
              </div>
            </div>
            <div>
              <label className="text-sm text-slate-400">Empresa</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({...formData, company: e.target.value})}
                className="mt-1 bg-slate-800/50 border-slate-700"
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate} className="bg-blue-600 hover:bg-blue-700">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Clients List */}
        <div className="lg:col-span-2">
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-blue-400" />
                Lista de Clientes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-700 hover:bg-transparent">
                      <TableHead className="text-slate-400">Cliente</TableHead>
                      <TableHead className="text-slate-400">Contacto</TableHead>
                      <TableHead className="text-slate-400">Etiquetas</TableHead>
                      <TableHead className="text-slate-400">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredClients.map((client) => (
                      <TableRow 
                        key={client.id} 
                        className={`border-slate-700 hover:bg-slate-700/30 cursor-pointer ${selectedClient?.id === client.id ? 'bg-blue-500/10' : ''}`}
                        onClick={() => setSelectedClient(client)}
                        data-testid={`client-row-${client.id}`}
                      >
                        <TableCell>
                          <div>
                            <p className="font-medium text-white">{client.name}</p>
                            {client.company && (
                              <p className="text-sm text-slate-400 flex items-center gap-1">
                                <Building className="w-3 h-3" />
                                {client.company}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            {client.email && (
                              <p className="text-sm text-slate-300 flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                {client.email}
                              </p>
                            )}
                            {client.phone && (
                              <p className="text-sm text-slate-400 flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {client.phone}
                              </p>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-1">
                            {client.tags?.map(tag => (
                              <Badge key={tag} variant="outline" className="border-slate-600 text-slate-400 text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-1">
                            <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); openEditDialog(client); }}>
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="sm" className="text-red-400" onClick={(e) => { e.stopPropagation(); handleDelete(client.id); }}>
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Contacts Panel */}
        <div>
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-blue-400" />
                  Contactos
                </span>
                {selectedClient && (
                  <Dialog open={isContactOpen} onOpenChange={setIsContactOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" className="bg-blue-600 hover:bg-blue-700" data-testid="add-contact-btn">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="bg-slate-900 border-slate-700">
                      <DialogHeader>
                        <DialogTitle className="text-white">Nuevo Contacto</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4">
                        <div>
                          <label className="text-sm text-slate-400">Nombre *</label>
                          <Input
                            value={contactForm.name}
                            onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                            className="mt-1 bg-slate-800/50 border-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Email</label>
                          <Input
                            type="email"
                            value={contactForm.email}
                            onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                            className="mt-1 bg-slate-800/50 border-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Teléfono</label>
                          <Input
                            value={contactForm.phone}
                            onChange={(e) => setContactForm({...contactForm, phone: e.target.value})}
                            className="mt-1 bg-slate-800/50 border-slate-700"
                          />
                        </div>
                        <div>
                          <label className="text-sm text-slate-400">Cargo</label>
                          <Input
                            value={contactForm.position}
                            onChange={(e) => setContactForm({...contactForm, position: e.target.value})}
                            className="mt-1 bg-slate-800/50 border-slate-700"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button onClick={handleCreateContact} className="bg-blue-600 hover:bg-blue-700">
                          Agregar Contacto
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedClient ? (
                <p className="text-center text-slate-500 py-8">Selecciona un cliente para ver sus contactos</p>
              ) : contacts.length === 0 ? (
                <p className="text-center text-slate-500 py-8">Sin contactos registrados</p>
              ) : (
                <div className="space-y-3">
                  {contacts.map(contact => (
                    <div key={contact.id} className="p-3 rounded-lg bg-slate-700/30 border border-slate-700">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-medium text-white">{contact.name}</p>
                          {contact.position && <p className="text-xs text-slate-400">{contact.position}</p>}
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-400 h-6 w-6 p-0" onClick={() => handleDeleteContact(contact.id)}>
                          <Trash2 className="w-3 h-3" />
                        </Button>
                      </div>
                      <div className="mt-2 space-y-1">
                        {contact.email && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {contact.email}
                          </p>
                        )}
                        {contact.phone && (
                          <p className="text-xs text-slate-400 flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {contact.phone}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
