import axiosInstance from './axios';
import { API_ROUTES } from './apiRoutes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const handleError = (error, context) => {
    // Log the full error for debugging
    console.error(`Response error:`, error.response || error);
    
    // Get the most appropriate error message
    let errorMessage = 'Error en la operación. Por favor, intente de nuevo.';
    
    if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
    } else if (error.message) {
        errorMessage = error.message;
    }
    
    console.error(`Error ${context}:`, errorMessage);
    throw new Error(errorMessage);
};

const auth = {
    login: async (credentials) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.LOGIN, credentials);
            return response.data;
        } catch (error) {
            handleError(error, 'en login');
        }
    },
    logout: async () => {
        localStorage.removeItem('token');
    }
};

const books = {    getAll: async (params = { page: 0, size: 10 }) => {
        try {
            const queryParams = new URLSearchParams();
            
            // Add required pagination parameters
            queryParams.append('page', params.page);
            queryParams.append('size', params.size);
            
            // Add optional filters only if they have valid values
            if (params.title) queryParams.append('title', params.title);
            if (params.state) queryParams.append('state', params.state);
            if (typeof params.stockMin === 'number') queryParams.append('stockMin', params.stockMin);
            if (typeof params.stockMax === 'number') queryParams.append('stockMax', params.stockMax);
            if (params.idCategory) queryParams.append('idCategory', params.idCategory);
            if (params.idEditorial) queryParams.append('idEditorial', params.idEditorial);
            if (params.idAuthor) queryParams.append('idAuthor', params.idAuthor);
            
            const response = await axiosInstance.get(`${API_ROUTES.BOOKS}?${queryParams}`);
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo libros');
        }
    },
    getById: async (id) => {
        try {
            const response = await axiosInstance.get(API_ROUTES.BOOK_BY_ID(id));
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo libro');
        }
    },
    create: async (bookData) => {
        try {
            const response = await axiosInstance.post(API_ROUTES.BOOKS, bookData);
            return response.data;
        } catch (error) {
            handleError(error, 'creando libro');
        }
    },
    update: async (id, bookData) => {
        try {
            const response = await axiosInstance.put(API_ROUTES.BOOK_BY_ID(id), bookData);
            return response.data;
        } catch (error) {
            handleError(error, 'actualizando libro');
        }
    }
};

const loans = {    
    getAll: async (params = { page: 0, size: 10, state: null }) => {
        try {
            const queryParams = new URLSearchParams({
                page: params.page,
                size: params.size,
                ...(params.state && { state: params.state })
            }).toString();
            
            const response = await axiosInstance.get(`${API_ROUTES.LOANS}?${queryParams}`);
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo préstamos');
        }
    },
    
    create: async (loanData) => {
        try {
            // Validar que todos los campos requeridos estén presentes
            if (!loanData.carnet || !loanData.idBook || !loanData.returnDate) {
                throw new Error('Datos incompletos. Por favor complete todos los campos.');
            }

            // Validar formato de fecha (debe ser dd-MM-yyyy)
            const dateRegex = /^\d{2}-\d{2}-\d{4}$/;
            if (!dateRegex.test(loanData.returnDate)) {
                throw new Error('Formato de fecha inválido. Debe ser dd-MM-yyyy');
            }

            // Limpiar datos antes de enviar
            const cleanLoanData = {
                carnet: loanData.carnet,
                idBook: loanData.idBook,
                returnDate: loanData.returnDate,
                state: 'PRESTADO'  // Siempre enviar estado inicial como PRESTADO
            };

            const response = await axiosInstance.post(API_ROUTES.LOANS, cleanLoanData);
            return response.data;
        } catch (error) {
            handleError(error, 'creando préstamo');
        }
    },

    getById: async (id) => {
        try {
            const response = await axiosInstance.get(API_ROUTES.LOAN_BY_ID(id));
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo préstamo');
        }
    },    renew: async (id) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                throw new Error('No hay token de autenticación');
            }

            // Calcular nueva fecha de devolución (1 mes después de hoy)
            const today = new Date();
            const nextMonth = new Date(today.setMonth(today.getMonth() + 1));
            
            // Format date as dd-MM-yyyy
            const day = String(nextMonth.getDate()).padStart(2, '0');
            const month = String(nextMonth.getMonth() + 1).padStart(2, '0');
            const year = nextMonth.getFullYear();
            const formattedDate = `${day}-${month}-${year}`;

            const response = await axiosInstance.post(API_ROUTES.RENEW_LOAN(id), {
                state: 'PRESTADO', // Mantener el estado como prestado
                returnDate: formattedDate
            });
            
            return response.data;
        } catch (error) {
            handleError(error, 'renovando préstamo');
        }
    },

    delete: async (id) => {
        try {
            await axiosInstance.delete(API_ROUTES.LOAN_BY_ID(id));
        } catch (error) {
            handleError(error, 'eliminando préstamo');
        }
    },    generateReport: async () => {
        try {
            const response = await axiosInstance.get(API_ROUTES.GENERATE_REPORT, {
                responseType: 'blob',
                headers: {
                    'Accept': 'application/pdf'
                }
            });
            return response.data;
        } catch (error) {
            handleError(error, 'generando reporte PDF');
        }
    },

    getByState: async (state, params = { page: 0, size: 10 }) => {
        try {
            const queryParams = new URLSearchParams({
                page: params.page,
                size: params.size,
                state: state
            }).toString();
            
            const response = await axiosInstance.get(`${API_ROUTES.LOANS}?${queryParams}`);
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo préstamos por estado');
        }
    }
};

const students = {
    getAll: async (params = { page: 0, size: 10 }) => {
        try {
            const queryParams = new URLSearchParams({
                page: params.page,
                size: params.size
            }).toString();
            
            const response = await axiosInstance.get(`${API_ROUTES.STUDENTS}?${queryParams}`);
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo estudiantes');
        }
    },

    getById: async (carnet) => {
        try {
            const response = await axiosInstance.get(API_ROUTES.STUDENT_BY_ID(carnet));
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo estudiante');
        }
    }
};

const categories = {
    getAll: async (params = { page: 0, size: 100 }) => {
        try {
            const queryParams = new URLSearchParams({
                page: params.page,
                size: params.size
            }).toString();
            
            const response = await axiosInstance.get(`${API_ROUTES.CATEGORIES}?${queryParams}`);
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo categorías');
        }
    }
};

const editorials = {
    getAll: async (params = { page: 0, size: 100 }) => {
        try {
            const queryParams = new URLSearchParams({
                page: params.page,
                size: params.size
            }).toString();
            
            const response = await axiosInstance.get(`${API_ROUTES.EDITORIALS}?${queryParams}`);
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo editoriales');
        }
    }
};

const authors = {
    getAll: async (params = { page: 0, size: 100 }) => {
        try {
            const queryParams = new URLSearchParams({
                page: params.page,
                size: params.size
            }).toString();
            
            const response = await axiosInstance.get(`${API_ROUTES.AUTHORS}?${queryParams}`);
            return response.data;
        } catch (error) {
            handleError(error, 'obteniendo autores');
        }
    }
};

const apiService = {
    auth,
    books,
    loans,
    students,
    categories,
    editorials,
    authors
};

export default apiService;
