import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import { 
  FileText, 
  Upload, 
  Download, 
  Trash2, 
  Eye,
  Plus
} from 'lucide-react';

const ProjectDocumentation = ({ projectId }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [documentName, setDocumentName] = useState('');
  const [documentType, setDocumentType] = useState('design');

  const API_URL = process.env.REACT_APP_API_URL || 'https://pactum-saas-backend.onrender.com';
  const token = localStorage.getItem('pactum_token');

  useEffect(() => {
    if (projectId) {
      loadDocuments();
    }
  }, [projectId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/api/projects/${projectId}/documents`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!response.ok) throw new Error('Error al cargar documentos');
      const data = await response.json();
      setDocuments(data);
    } catch (error) {
      console.error('Error loading documents:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('El archivo es muy grande (máximo 10MB)');
      return;
    }

    setSelectedFile(file);
    if (!documentName) {
      setDocumentName(file.name.replace('.pdf', ''));
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !documentName.trim()) {
      toast.error('Selecciona un archivo y proporciona un nombre');
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('name', documentName.trim());
      formData.append('document_type', documentType);

      const response = await fetch(`${API_URL}/api/projects/${projectId}/documents`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) throw new Error('Error al subir documento');

      toast.success('Documento subido exitosamente');
      setDialogOpen(false);
      setSelectedFile(null);
      setDocumentName('');
      setDocumentType('design');
      await loadDocuments();
    } catch (error) {
      toast.error('Error al subir documento');
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (documentId) => {
    if (!window.confirm('¿Eliminar este documento?')) return;

    try {
      const response = await fetch(`${API_URL}/api/projects/${projectId}/documents/${documentId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!response.ok) throw new Error('Error al eliminar');

      toast.success('Documento eliminado');
      await loadDocuments();
    } catch (error) {
      toast.error('Error al eliminar documento');
      console.error(error);
    }
  };

  const handleView = (document) => {
    // Open PDF in new tab
    const newWindow = window.open();
    newWindow.document.write(`
      <html>
        <head>
          <title>${document.name}</title>
          <style>
            body { margin: 0; }
            iframe { width: 100vw; height: 100vh; border: none; }
          </style>
        </head>
        <body>
          <iframe src="${document.file_url}"></iframe>
        </body>
      </html>
    `);
  };

  const getDocumentTypeLabel = (type) => {
    const labels = {
      design: 'Diseño',
      technical: 'Técnico',
      contract: 'Contrato',
      other: 'Otro'
    };
    return labels[type] || type;
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      design: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      technical: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      contract: 'bg-green-500/20 text-green-300 border-green-500/30',
      other: 'bg-slate-500/20 text-slate-300 border-slate-500/30'
    };
    return colors[type] || colors.other;
  };

  const formatDate = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString('es-CL', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <Card className="border-slate-700 bg-slate-800/50">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documentación del Proyecto
          </CardTitle>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-blue-600 hover:bg-blue-700">
                <Plus className="h-4 w-4 mr-2" />
                Subir Documento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle>Subir Documento PDF</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Nombre del Documento</Label>
                  <Input
                    value={documentName}
                    onChange={(e) => setDocumentName(e.target.value)}
                    placeholder="Ej: Guía de Diseño v1.0"
                    className="bg-slate-900 border-slate-700 text-white"
                  />
                </div>

                <div>
                  <Label>Tipo de Documento</Label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-md text-white"
                  >
                    <option value="design">Diseño</option>
                    <option value="technical">Técnico</option>
                    <option value="contract">Contrato</option>
                    <option value="other">Otro</option>
                  </select>
                </div>

                <div>
                  <Label>Archivo PDF</Label>
                  <div className="mt-2">
                    <label className="flex items-center justify-center w-full px-4 py-6 border-2 border-dashed border-slate-700 rounded-lg cursor-pointer hover:border-blue-500 transition-colors">
                      <div className="text-center">
                        <Upload className="h-8 w-8 mx-auto mb-2 text-slate-400" />
                        <p className="text-sm text-slate-400">
                          {selectedFile ? selectedFile.name : 'Haz clic para seleccionar un PDF'}
                        </p>
                        {selectedFile && (
                          <p className="text-xs text-slate-500 mt-1">
                            {formatFileSize(selectedFile.size)}
                          </p>
                        )}
                      </div>
                      <input
                        type="file"
                        accept=".pdf"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                <div className="flex gap-2 justify-end">
                  <Button 
                    variant="outline" 
                    onClick={() => {
                      setDialogOpen(false);
                      setSelectedFile(null);
                      setDocumentName('');
                    }}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    onClick={handleUpload}
                    disabled={!selectedFile || !documentName.trim() || uploading}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {uploading ? 'Subiendo...' : 'Subir'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No hay documentos subidos</p>
            <p className="text-sm mt-2">Sube documentos de diseño, técnicos o contratos</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map(doc => (
              <div
                key={doc.id}
                className="bg-slate-900/50 border border-slate-700 rounded-lg p-4 hover:border-blue-500/50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-red-400 flex-shrink-0 mt-1" />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-white mb-1 truncate">
                        {doc.name}
                      </h4>
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge className={`text-xs ${getDocumentTypeColor(doc.document_type)}`}>
                          {getDocumentTypeLabel(doc.document_type)}
                        </Badge>
                        <span className="text-xs text-slate-500">
                          {formatFileSize(doc.size_bytes)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {formatDate(doc.uploaded_at)}
                        </span>
                      </div>
                      {doc.uploaded_by_name && (
                        <p className="text-xs text-slate-500 mt-1">
                          Subido por: {doc.uploaded_by_name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleView(doc)}
                      className="h-8 px-2 text-blue-400 hover:text-blue-300"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <a
                      href={doc.file_url}
                      download={`${doc.name}.pdf`}
                    >
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-8 px-2 text-green-400 hover:text-green-300"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                    </a>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDelete(doc.id)}
                      className="h-8 px-2 text-red-400 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectDocumentation;
