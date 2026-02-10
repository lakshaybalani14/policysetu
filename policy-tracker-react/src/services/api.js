import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy in vite.config.js forwards to http://localhost:5000
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add JWT token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle errors
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response && error.response.status === 401) {
            // Token expired or invalid
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            // Ideally redirect to login, but we can handle that via state
        }
        return Promise.reject(error);
    }
);

export const authService = {
    login: async (credentials) => {
        const response = await api.post('/auth/login', credentials);
        return response.data;
    },
    register: async (userData) => {
        const response = await api.post('/auth/register', userData);
        return response.data;
    },
    getCurrentUser: async () => {
        const response = await api.get('/auth/me');
        return response.data;
    },
};

export const policyService = {
    getAll: async () => {
        const response = await api.get('/policies');
        return response.data;
    },
    getById: async (id) => {
        const response = await api.get(`/policies/${id}`);
        return response.data;
    },
};

export const applicationService = {
    getAll: async (userId) => {
        const response = await api.get('/applications', { params: { userId } });
        return response.data;
    },
    create: async (applicationData) => {
        const response = await api.post('/applications', applicationData);
        return response.data;
    },
    updateStatus: async (id, statusData) => {
        const response = await api.patch(`/applications/${id}/status`, statusData);
        return response.data;
    },
};

export const paymentService = {
    getAll: async () => {
        const response = await api.get('/payments');
        return response.data;
    },
};

export default api;
