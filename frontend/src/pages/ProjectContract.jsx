import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../lib/auth-multitenant';
import { getProjects } from '../lib/api-multitenant';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Badge } from '../components/ui/badge';
import ProjectSelector from '../components/ProjectSelector';
import { toast } from 'sonner';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Upload, 
  Calendar, 
  DollarSign, 
  Target,
  CheckCircle,
  XCircle,
  Loader2,
  MessageSquare,
  Send
} from 'lucide-react';

export default function ProjectContract() {
  const [project, setProject] = useState(null);
  const [contracts, setContracts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [selectedContract, setSelectedContract] = useState(null);
  const [question, setQuestion] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchData();
    
    // Listen for project changes
    const handleProjectChange = () => {
      fetchData();
    };
    
    window.addEventListener('projectChanged', handleProjectChange);
    
    return () => {
      window.removeEventListener('projectChanged', handleProjectChange);
    };
  }, []);

  const fetchData = async () => {
    try {
      const projectsRes = await getProjects();
      if (projectsRes.data.length > 0) {
        setProject(projectsRes.data[0]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      toast.error('Error al cargar datos');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      toast.error('Solo se permiten archivos PDF');
      return;
    }

    setUploading(true);
    try {
      await uploadContract('project-crm-amaru', file);
      toast.success('Contrato subido exitosamente');
      fetchData();
    } catch (error) {
      console.error('Error uploading:', error);
      toast.error('Error al subir el contrato');
    } finally {
      setUploading(false);
    }
  };

  const handleAnalyze = async () => {
    if (!selectedContract || !question.trim()) {
      toast.error('Selecciona un contrato y escribe una pregunta');
      return;
    }

    setAnalyzing(true);
    try {
      const response = await analyzeContract(selectedContract.id, question);
      setAnalysisResult(response.data);
    } catch (error) {
      console.error('Error analyzing:', error);
      toast.error('Error al analizar el contrato');
    } finally {
      setAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const exclusions = [
    "Desarrollo de aplicaciones móviles nativas",
    "Integración con sistemas legacy no documentados",
    "Soporte 24/7 post Go-Live",
    "Migración de datos desde sistemas externos",
    "Capacitación presencial fuera de Managua"
  ];

  const inclusions = [
    "CRM con módulos: Clientes, Pipeline, Actividades",
    "Sistema multi-tenant (hasta 5 empresas)",
    "Autenticación y roles de usuario",
    "Dashboard de métricas y reportes básicos",
    "2 rondas de cambios por fase",
    "Soporte técnico durante desarrollo",
    "Documentación de usuario",
    "Despliegue inicial en servidor cliente"
  ];

  return (
    <div className="space-y-6">
      {/* Project Selector for COMPANY_ADMIN */}
      <ProjectSelector />
      
      <div>
        <h1 className="text-3xl font-bold text-white">Contrato del Proyecto</h1>
        <p className="text-slate-400 mt-1">{project?.name}</p>
      </div>
      
      <input
        ref={fileInputRef}
        type="file"
        onChange={handleFileUpload}
        accept=".pdf"
        className="hidden"
      />
      
      <div className="flex gap-4">
        <Button
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="bg-blue-600 hover:bg-blue-700"
          data-testid="upload-contract-btn"
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Upload className="w-4 h-4 mr-2" />
          )}
          Subir Contrato PDF
        </Button>
      </div>

      {/* Project Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-slate-800/50 border-slate-700/50">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              Resumen del Contrato
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-4 rounded-xl bg-slate-700/30">
                <Calendar className="w-6 h-6 text-blue-400 mb-2" />
                <p className="text-sm text-slate-400">Período</p>
                <p className="text-lg font-semibold text-white">
                  {project?.start_date} - {project?.end_date}
                </p>
                <p className="text-xs text-slate-500 mt-1">4 semanas</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/30">
                <DollarSign className="w-6 h-6 text-emerald-400 mb-2" />
                <p className="text-sm text-slate-400">Monto USD</p>
                <p className="text-lg font-semibold text-white">
                  ${project?.total_usd?.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">T.C. C$ {project?.exchange_rate}</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/30">
                <DollarSign className="w-6 h-6 text-amber-400 mb-2" />
                <p className="text-sm text-slate-400">Monto C$</p>
                <p className="text-lg font-semibold text-white">
                  C$ {project?.total_cordobas?.toLocaleString()}
                </p>
                <p className="text-xs text-slate-500 mt-1">Córdobas</p>
              </div>
              <div className="p-4 rounded-xl bg-slate-700/30">
                <Target className="w-6 h-6 text-purple-400 mb-2" />
                <p className="text-sm text-slate-400">Esquema de Pago</p>
                <p className="text-lg font-semibold text-white">4 Hitos (25%)</p>
                <p className="text-xs text-slate-500 mt-1">C$ 47,606 c/u</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Scope */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-400" />
                Alcance MVP (Incluido)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {inclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50 h-full">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <XCircle className="w-5 h-5 text-red-400" />
                Exclusiones
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {exclusions.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <XCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                    <span className="text-slate-300 text-sm">{item}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Uploaded Contracts */}
      {contracts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-blue-400" />
                Contratos Subidos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {contracts.map((contract) => (
                  <div 
                    key={contract.id}
                    className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedContract?.id === contract.id 
                        ? 'bg-blue-600/20 border-blue-500/50' 
                        : 'bg-slate-700/30 border-slate-700 hover:border-slate-600'
                    }`}
                    onClick={() => setSelectedContract(contract)}
                    data-testid={`contract-item-${contract.id}`}
                  >
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-red-400" />
                      <div>
                        <p className="font-medium text-white">{contract.filename}</p>
                        <p className="text-sm text-slate-400">
                          Subido: {new Date(contract.uploaded_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                    <Badge className={selectedContract?.id === contract.id ? 'bg-blue-600' : 'bg-slate-600'}>
                      {selectedContract?.id === contract.id ? 'Seleccionado' : 'PDF'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* AI Analysis */}
      {contracts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <Card className="bg-slate-800/50 border-slate-700/50">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-400" />
                Analizar Contrato con IA
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-3">
                <Input
                  placeholder="Ej: ¿Cuáles son las fechas de entrega? ¿Qué penalidades hay?"
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  className="flex-1 bg-slate-900/50 border-slate-700"
                  data-testid="analyze-question-input"
                />
                <Button
                  onClick={handleAnalyze}
                  disabled={analyzing || !selectedContract}
                  className="bg-blue-600 hover:bg-blue-700"
                  data-testid="analyze-btn"
                >
                  {analyzing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
              {!selectedContract && (
                <p className="text-sm text-amber-400">Selecciona un contrato arriba para analizarlo</p>
              )}
              {analysisResult && (
                <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700">
                  <p className="text-sm text-slate-400 mb-2">Pregunta: {analysisResult.question}</p>
                  <div className="text-slate-200 whitespace-pre-wrap">
                    {analysisResult.analysis}
                  </div>
                  {analysisResult.extracted_preview && (
                    <details className="mt-4">
                      <summary className="text-sm text-slate-400 cursor-pointer hover:text-slate-300">
                        Ver texto extraído
                      </summary>
                      <pre className="mt-2 p-3 bg-slate-900/50 rounded text-xs text-slate-400 overflow-auto max-h-60">
                        {analysisResult.extracted_preview}
                      </pre>
                    </details>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
