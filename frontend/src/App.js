import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { Toaster } from './components/ui/sonner';

// Pages
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import ProjectContract from './pages/ProjectContract';
import ProjectPhases from './pages/ProjectPhases';
import ProjectPayments from './pages/ProjectPayments';
import ProjectTasks from './pages/ProjectTasks';
import CRMClients from './pages/CRMClients';
import CRMPipeline from './pages/CRMPipeline';
import CRMActivities from './pages/CRMActivities';
import Admin from './pages/Admin';
import ActivityLog from './pages/ActivityLog';
import DashboardLayout from './components/DashboardLayout';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="proyecto/contrato" element={<ProjectContract />} />
        <Route path="proyecto/fases" element={<ProjectPhases />} />
        <Route path="proyecto/pagos" element={<ProjectPayments />} />
        <Route path="proyecto/tareas" element={<ProjectTasks />} />
        <Route path="crm/clientes" element={<CRMClients />} />
        <Route path="crm/pipeline" element={<CRMPipeline />} />
        <Route path="crm/actividades" element={<CRMActivities />} />
        <Route path="admin" element={<Admin />} />
        <Route path="actividad" element={<ActivityLog />} />
      </Route>
      
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
        <Toaster position="top-right" richColors />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
