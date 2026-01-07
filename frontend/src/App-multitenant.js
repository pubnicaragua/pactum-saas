import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-multitenant';
import { Toaster } from './components/ui/sonner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login-multitenant';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import ProjectView from './pages/ProjectView';
import ProjectDashboard from './pages/ProjectDashboard';
import TaskList from './pages/TaskList';
import TaskBoard from './pages/TaskBoard';
import ProjectPayments from './pages/ProjectPayments';
import ProjectPhases from './pages/ProjectPhases';
import ProjectContract from './pages/ProjectContract';
import ClientsManagement from './pages/ClientsManagement';
import ActivitiesManagement from './pages/ActivitiesManagement';
import InversionesJessy from './pages/InversionesJessy';
import ContractsPactum from './pages/ContractsPactum';
import FinancialDashboard from './pages/FinancialDashboard';
import ReassignmentHistory from './pages/ReassignmentHistory';
import AdminPanel from './pages/AdminPanel';
import TeamMemberDashboard from './pages/TeamMemberDashboard';
import DashboardLayout from './components/DashboardLayout-multitenant';

const ProtectedRoute = ({ children, requiredRole = null }) => {
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

  if (requiredRole && user.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return children;
};

function AppRoutes() {
  const { user } = useAuth();
  
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={user ? <Navigate to="/dashboard" replace /> : <Login />} />
      
      <Route path="/" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route path="dashboard" element={
          user?.role === 'SUPER_ADMIN' 
            ? <SuperAdminDashboard /> 
            : user?.role === 'USER' 
              ? <ProjectView />
              : user?.role === 'TEAM_MEMBER'
                ? <TeamMemberDashboard />
                : <CompanyDashboard />
        } />
        
        <Route path="proyecto" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ProjectView />}
          </ProtectedRoute>
        } />
        
        <Route path="dashboard-proyecto" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ProjectDashboard />}
          </ProtectedRoute>
        } />
        
        <Route path="tareas" element={
          <ProtectedRoute>
            <TaskList />
          </ProtectedRoute>
        } />
        
        <Route path="kanban" element={
          <ProtectedRoute>
            <TaskBoard />
          </ProtectedRoute>
        } />
        
        <Route path="fases" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ProjectPhases />}
          </ProtectedRoute>
        } />
        
        <Route path="pagos" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ProjectPayments />}
          </ProtectedRoute>
        } />
        
        <Route path="contrato" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ProjectContract />}
          </ProtectedRoute>
        } />
        
        <Route path="actividades-proyecto" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ActivitiesManagement />}
          </ProtectedRoute>
        } />
        
        <Route path="clientes" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ClientsManagement />}
          </ProtectedRoute>
        } />
        
        <Route path="actividades" element={
          <ProtectedRoute>
            {user?.role === 'TEAM_MEMBER' ? <Navigate to="/tareas" replace /> : <ActivitiesManagement />}
          </ProtectedRoute>
        } />
        
        <Route path="financiero" element={
          <ProtectedRoute>
            {user?.email === 'admin@pactum.com' ? <FinancialDashboard /> : <Navigate to="/dashboard" replace />}
          </ProtectedRoute>
        } />
        
        <Route path="reasignaciones" element={
          <ProtectedRoute>
            <ReassignmentHistory />
          </ProtectedRoute>
        } />
        
        <Route path="admin" element={
          <ProtectedRoute>
            <AdminPanel />
          </ProtectedRoute>
        } />
      </Route>
      
      {/* Public routes */}
      <Route path="/inversiones-jessy" element={<InversionesJessy />} />
      <Route path="/contracts-pactum" element={<ContractsPactum />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />
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
