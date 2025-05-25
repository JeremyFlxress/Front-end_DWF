import axios from 'axios';

// Environment configuration
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT, 10) || 30000;
const isDevelopment = process.env.NODE_ENV === 'development';

// Create axios instance with base configuration
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: API_TIMEOUT,
    withCredentials: false,
});

// Request interceptor
axiosInstance.interceptors.request.use(
    (config) => {
        if (isDevelopment) {
            console.log('Request:', {
                url: config.baseURL + config.url,
                method: config.method?.toUpperCase(),
                headers: config.headers,
                data: config.data
            });
        }
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Request error:', error.message);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        if (isDevelopment) {
            console.log('Response:', {
                url: response.config.url,
                status: response.status,
                data: response.data
            });
        }
        return response;
    },
    (error) => {
        const errorResponse = {
            url: error.config?.url,
            method: error.config?.method,
            status: error.response?.status,
            message: error.response?.data?.message || error.message
        };

        if (isDevelopment) {
            console.error('Response error:', errorResponse);
        }

        if (error.response) {
            // Server responded with a status code outside of 2xx range
            switch (error.response.status) {
                case 400:
                    return Promise.reject(new Error(error.response.data?.message || 'Datos inválidos. Por favor verifique la información.'));
                case 401:
                    localStorage.removeItem('token');
                    if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(new Error('Sesión expirada. Por favor inicie sesión nuevamente.'));
                case 403:
                    return Promise.reject(new Error('No tiene permisos para realizar esta acción.'));
                case 404:
                    return Promise.reject(new Error('El recurso solicitado no existe.'));
                case 408:
                case 'ECONNABORTED':
                    return Promise.reject(new Error('La solicitud ha excedido el tiempo de espera. Por favor intente nuevamente.'));
                case 500:
                    return Promise.reject(new Error('Error interno del servidor. Por favor intente más tarde.'));
                default:
                    return Promise.reject(new Error('Ha ocurrido un error inesperado. Por favor intente más tarde.'));
            }
        } else if (error.request) {
            // Request was made but no response received
            if (error.code === 'ECONNABORTED') {
                return Promise.reject(new Error('La solicitud ha excedido el tiempo de espera. Por favor intente nuevamente.'));
            }
            
            if (error.message.includes('Network Error')) {
                return Promise.reject(new Error(
                    'No se puede establecer conexión con el servidor. ' +
                    'Por favor verifique que el servidor esté corriendo en el puerto correcto y que su conexión a internet esté activa.'
                ));
            }

            return Promise.reject(new Error('Error de conexión. Por favor verifique su conexión a internet.'));
        }

        // Something happened in setting up the request that triggered an error
        return Promise.reject(new Error('Error en la configuración de la solicitud. Por favor contacte al soporte técnico.'));
    }
);

export default axiosInstance;
