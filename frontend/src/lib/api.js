import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API_BASE = `${BACKEND_URL}/api`;

// Create axios instance with auth interceptor
const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('pactum_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors
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

// Auth
export const login = (email, password) => 
  api.post('/auth/login', { email, password });

export const register = (data) => 
  api.post('/auth/register', data);

export const getMe = () => 
  api.get('/auth/me');

// Projects
export const getProjects = () => 
  api.get('/projects');

export const getProject = (id) => 
  api.get(`/projects/${id}`);

export const updateProject = (id, data) => 
  api.put(`/projects/${id}`, data);

// Phases
export const getPhases = (projectId) => 
  api.get('/phases', { params: { project_id: projectId } });

export const getPhase = (id) => 
  api.get(`/phases/${id}`);

export const updatePhase = (id, data) => 
  api.put(`/phases/${id}`, data);

export const approvePhase = (id) => 
  api.post(`/phases/${id}/approve`);

export const addPhaseComment = (id, text) => 
  api.post(`/phases/${id}/comments`, { text });

// Payments
export const getPayments = (projectId) => 
  api.get('/payments', { params: { project_id: projectId } });

export const updatePayment = (id, data) => 
  api.put(`/payments/${id}`, data);

// Tasks
export const getTasks = (projectId, week) => 
  api.get('/tasks', { params: { project_id: projectId, week } });

export const createTask = (data) => 
  api.post('/tasks', data);

export const updateTask = (id, data) => 
  api.put(`/tasks/${id}`, data);

export const deleteTask = (id) => 
  api.delete(`/tasks/${id}`);

export const addTaskComment = (id, text) => 
  api.post(`/tasks/${id}/comments`, { text });

// CRM - Clients
export const getClients = () => 
  api.get('/clients');

export const createClient = (data) => 
  api.post('/clients', data);

export const updateClient = (id, data) => 
  api.put(`/clients/${id}`, data);

export const deleteClient = (id) => 
  api.delete(`/clients/${id}`);

// CRM - Contacts
export const getContacts = (clientId) => 
  api.get('/contacts', { params: { client_id: clientId } });

export const createContact = (data) => 
  api.post('/contacts', data);

export const updateContact = (id, data) => 
  api.put(`/contacts/${id}`, data);

export const deleteContact = (id) => 
  api.delete(`/contacts/${id}`);

// CRM - Opportunities
export const getOpportunities = () => 
  api.get('/opportunities');

export const createOpportunity = (data) => 
  api.post('/opportunities', data);

export const updateOpportunity = (id, data) => 
  api.put(`/opportunities/${id}`, data);

export const deleteOpportunity = (id) => 
  api.delete(`/opportunities/${id}`);

// CRM - Activities
export const getActivities = () => 
  api.get('/activities');

export const createActivity = (data) => 
  api.post('/activities', data);

export const updateActivity = (id, data) => 
  api.put(`/activities/${id}`, data);

export const deleteActivity = (id) => 
  api.delete(`/activities/${id}`);

// Activity Logs
export const getActivityLogs = (entityType, limit = 100) => 
  api.get('/activity-logs', { params: { entity_type: entityType, limit } });

// Contracts
export const getContracts = (projectId) => 
  api.get('/contracts', { params: { project_id: projectId } });

export const getContract = (id) => 
  api.get(`/contracts/${id}`);

export const uploadContract = (projectId, file) => {
  const formData = new FormData();
  formData.append('project_id', projectId);
  formData.append('file', file);
  return api.post('/contracts/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const analyzeContract = (id, question) => 
  api.post(`/contracts/${id}/analyze`, { question });

// Dashboard
export const getDashboardStats = () => 
  api.get('/dashboard/stats');

// Admin
export const getUsers = () => 
  api.get('/users');

export const resetDemoData = () => 
  api.post('/seed/reset');

export const exportData = () => 
  api.get('/export');

export default api;
