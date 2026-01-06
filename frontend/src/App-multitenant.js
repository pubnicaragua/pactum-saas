import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth-multitenant';
import { Toaster } from './components/ui/sonner';

// Pages
import Landing from './pages/Landing';
import Login from './pages/Login-multitenant';
import SuperAdminDashboard from './pages/SuperAdminDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import ClientsManagement from './pages/ClientsManagement';
import ActivitiesManagement from './pages/ActivitiesManagement';
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
          user?.role === 'SUPER_ADMIN' ? <SuperAdminDashboard /> : <CompanyDashboard />
        } />
        
        <Route path="clientes" element={
          <ProtectedRoute>
            <ClientsManagement />
          </ProtectedRoute>
        } />
        
        <Route path="actividades" element={
          <ProtectedRoute>
            <ActivitiesManagement />
          </ProtectedRoute>
        } />
      </Route>
      
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
