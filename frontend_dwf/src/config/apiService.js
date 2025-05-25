import axiosInstance from './axios';
import { API_ROUTES } from './apiRoutes';

const auth = {
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.LOGIN, credentials);
            return response.data;
        } catch (error) {
            console.error('Error en login:', error.response?.data || error.message);
            throw error;
        }
    },
    logout: async () => {
        localStorage.removeItem('token');
    }
};

const books = {
    getAll: async () => {
        try {
            const response = await axiosInstance.get(API_ROUTES.BOOKS);
            return response.data;
        } catch (error) {
            if (error.message.includes('No se puede establecer conexión')) {
                throw error; // Re-throw el error de conexión original
            }
            const errorMessage = error.response?.data?.message || 'Error al obtener los libros. Por favor intente nuevamente.';
            console.error('Error obteniendo libros:', errorMessage);
            throw new Error(errorMessage);
        }
    },
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(API_ROUTES.BOOK_BY_ID(id));
            return response.data;
        } catch (error) {
            console.error('Error obteniendo libro:', error.response?.data || error.message);
            throw error;
        }
    }
};

const loans = {    getAll: async () => {
        try {
            const response = await axiosInstance.get(API_ROUTES.LOANS);
            return response.data;
        } catch (error) {
            const errorMessage = error.response?.data?.message || error.message;
            console.error('Error obteniendo préstamos:', errorMessage);
            throw new Error(errorMessage);
        }
    },
    getActive: async () => {
        try {
            const response = await axiosInstance.get(API_ROUTES.ACTIVE_LOANS);
            return response.data;
        } catch (error) {
            console.error('Error obteniendo préstamos activos:', error.response?.data || error.message);
            throw error;
        }
    },
    renew: async (id) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.RENEW_LOAN(id));
            return response.data;
        } catch (error) {
            console.error('Error renovando préstamo:', error.response?.data || error.message);
            throw error;
        }
    }
};

export const apiService = {
    auth,
    books,
    loans
};

export default apiService;
