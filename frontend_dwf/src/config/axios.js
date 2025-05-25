import axios from 'axios';

// Obtener configuración del entorno o usar valores por defecto
const API_URL = 'http://localhost:8080';
const API_TIMEOUT = 30000;

// Crear una instancia de axios con la configuración base
const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    },
    timeout: API_TIMEOUT,
    withCredentials: false // Cambiado a false para evitar problemas de CORS
});

// Interceptor para manejar peticiones
axiosInstance.interceptors.request.use(
    (config) => {
        console.log('Realizando petición a:', config.baseURL + config.url);
        console.log('Método:', config.method?.toUpperCase());
        console.log('Headers:', config.headers);
        console.log('Data:', config.data);
        
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        console.error('Error en la petición:', error.message);
        return Promise.reject(error);
    }
);

// Interceptor para manejar respuestas
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Respuesta exitosa de:', response.config.url);
        console.log('Status:', response.status);
        console.log('Data:', response.data);
        return response;
    },    (error) => {
        if (error.response) {
            console.error('Error en la respuesta:', {
                url: error.config?.url,
                method: error.config?.method,
                status: error.response?.status,
                data: error.response?.data,
                message: error.response?.data?.message || error.message
            });

            // Manejar diferentes códigos de estado HTTP
            switch (error.response.status) {
                case 400:
                    return Promise.reject(new Error(error.response.data?.message || 'Datos inválidos. Por favor verifique la información.'));
                case 401:
                    localStorage.removeItem('token');
                    if (window.location.pathname !== '/login') {
                        window.location.href = '/login';
                    }
                    return Promise.reject(new Error('Sesión expirada. Por favor inicie sesión nuevamente.'));
                case 403:
                    return Promise.reject(new Error('No tiene permisos para realizar esta acción.'));
                case 404:
                    return Promise.reject(new Error('El recurso solicitado no existe.'));
                case 408:
                    return Promise.reject(new Error('La solicitud ha excedido el tiempo de espera. Por favor intente nuevamente.'));
                case 500:
                    return Promise.reject(new Error('Error interno del servidor. Por favor intente más tarde.'));
                default:
                    return Promise.reject(new Error('Ha ocurrido un error inesperado. Por favor intente más tarde.'));
            }        } else if (error.request) {
            // La solicitud fue hecha pero no se recibió respuesta
            if (error.code === 'ECONNABORTED') {
                console.error('Error de timeout:', error.message);
                return Promise.reject(new Error('La solicitud ha excedido el tiempo de espera. Por favor intente nuevamente.'));
            }
              if (error.message.includes('Network Error')) {
                console.error('Error de red:', error.message);
                const url = error.config?.url || '';
                return Promise.reject(new Error('No se puede establecer conexión con el servidor. ' +
                    'Por favor verifique que el servidor esté corriendo en el puerto 8080 y que su conexión a internet esté activa.'));
            }

            console.error('Error de solicitud:', error.message);
            return Promise.reject(new Error('Error de conexión. Por favor verifique que el servidor esté corriendo y que su conexión a internet esté activa.'));
        } else {
            // Algo sucedió en la configuración de la solicitud que provocó un error
            console.error('Error de configuración:', error.message);
            return Promise.reject(new Error('Error en la configuración de la solicitud. Por favor contacte al soporte técnico.'));
        }

        return Promise.reject(error);
    }
);

export default axiosInstance;
