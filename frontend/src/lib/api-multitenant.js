import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pactum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('pactum_token');
      localStorage.removeItem('pactum_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Public
export const registerCompany = (data) => 
  api.post('/public/register-company', data);

// Auth
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const getMe = () => 
  api.get('/auth/me');

// Super Admin - Companies
export const getAllCompanies = () => 
  api.get('/admin/companies');

export const getCompanyDetails = (id) => 
  api.get(`/admin/companies/${id}`);

export const updateCompany = (id, data) => 
  api.put(`/admin/companies/${id}`, data);

export const assignModules = (companyId, moduleIds) => 
  api.post(`/admin/companies/${companyId}/modules`, moduleIds);

export const updateSubscription = (companyId, data) => 
  api.post(`/admin/companies/${companyId}/subscription`, data);

export const getGlobalMetrics = () => 
  api.get('/admin/metrics');

// Clients
export const getClients = () => 
  api.get('/clients');

export const createClient = (data) => 
  api.post('/clients', data);

export const getClient = (id) => 
  api.get(`/clients/${id}`);

export const updateClient = (id, data) => 
  api.put(`/clients/${id}`, data);

export const deleteClient = (id) => 
  api.delete(`/clients/${id}`);

// Activities
export const getActivities = (params = {}) => 
  api.get('/activities', { params });

export const createActivity = (data) => 
  api.post('/activities', data);

export const getActivity = (id) => 
  api.get(`/activities/${id}`);

export const updateActivity = (id, data) => 
  api.put(`/activities/${id}`, data);

export const deleteActivity = (id) => 
  api.delete(`/activities/${id}`);

// Company Users
export const getCompanyUsers = () => 
  api.get('/company/users');

export const createCompanyUser = (data) => 
  api.post('/company/users', data);

// Modules
export const getAvailableModules = () => 
  api.get('/modules');

// Dashboard
export const getDashboardStats = () => 
  api.get('/dashboard/stats');

// Activity Logs
export const getActivityLogs = (entityType, limit = 100) => 
  api.get('/activity-logs', { params: { entity_type: entityType, limit } });

// Seed
export const seedInitialData = () => 
  api.post('/seed/init');

export default api;
