import axiosInstance from './axios';
import { API_ROUTES } from './apiRoutes';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

const handleError = (error, context) => {
    console.error(`Error details for ${context}:`, error);
    
    // Get the most appropriate error message
    let errorMessage;
    
    if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
    } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
    } else if (error.message) {
        errorMessage = error.message;
    } else {
        errorMessage = `Error ${context}. Por favor intente más tarde.`;
    }
    
    // Log the error for debugging
    console.error(`Error ${context}:`, errorMessage);
    
    // Throw a new error with the message
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
        try {            const queryParams = new URLSearchParams();
            
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
            
            // Explicitly request authors and category data
            queryParams.append('projection', 'withAuthorsAndCategory');
            
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
    },      create: async (loanData) => {
        try {
            console.log('Datos recibidos en create:', loanData);

            // 1. Validar que todos los campos requeridos estén presentes
            if (!loanData.carnet?.trim()) {
                throw new Error('El carnet del estudiante es requerido');
            }
            if (!loanData.idBook || isNaN(Number(loanData.idBook))) {
                throw new Error('El ID del libro es requerido y debe ser un número válido');
            }
            if (!loanData.returnDate) {
                throw new Error('La fecha de devolución es requerida');
            }

            // 2. Validar formato de fecha (debe ser dd-MM-yyyy)
            const dateRegex = /^(0[1-9]|[12][0-9]|3[01])-(0[1-9]|1[0-2])-\d{4}$/;
            if (!dateRegex.test(loanData.returnDate)) {
                console.error('Fecha inválida:', loanData.returnDate);
                throw new Error('El formato de fecha debe ser dd-MM-yyyy');
            }

            // 3. Validar que la fecha sea válida y futura
            const [day, month, year] = loanData.returnDate.split('-').map(Number);
            const returnDate = new Date(year, month - 1, day);
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            if (isNaN(returnDate.getTime())) {
                throw new Error('La fecha proporcionada no es válida');
            }

            if (returnDate < today) {
                throw new Error('La fecha de devolución no puede ser anterior a hoy');
            }

            // 4. Verificar disponibilidad del libro
            const bookResponse = await axiosInstance.get(`/books/${loanData.idBook}`);
            const book = bookResponse.data;

            if (book.state !== 'DISPONIBLE') {
                throw new Error(`El libro "${book.title}" no está disponible para préstamo`);
            }

            if (!book.stock || book.stock <= 0) {
                throw new Error(`El libro "${book.title}" no tiene ejemplares disponibles`);
            }

            // 5. Preparar datos para el envío
            const cleanLoanData = {
                carnet: String(loanData.carnet).trim(),
                idBook: Number(loanData.idBook),
                returnDate: loanData.returnDate,
                state: 'PRESTADO'
            };

            console.log('Enviando al backend:', cleanLoanData);
            
            try {
                const response = await axiosInstance.post(API_ROUTES.LOANS, cleanLoanData);
                return response.data;
            } catch (error) {
                if (error.response?.data?.message?.includes('ya tiene un préstamo activo')) {
                    throw new Error('El estudiante ya tiene un préstamo activo. No puede realizar otro préstamo hasta devolver el actual.');
                }
                if (error.response?.status === 400) {
                    const errorMessage = error.response?.data?.message || 'Error en los datos del préstamo';
                    throw new Error(errorMessage);
                }
                throw error;
            }
        } catch (error) {
            console.error('Error completo:', error);
            if (error.message) {
                throw error;
            }
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
    },

    updateState: async (id, newState) => {
        try {
            // Validate the state
            const validStates = ['PRESTADO', 'VENCIDO', 'ENTREGADO'];
            if (!validStates.includes(newState)) {
                throw new Error('Estado inválido');
            }

            const response = await axiosInstance.patch(API_ROUTES.LOAN_BY_ID(id), {
                state: newState
            });
            
            return response.data;
        } catch (error) {
            handleError(error, 'actualizando estado del préstamo');
        }
    },

    checkActiveLoans: async (carnet) => {
        try {
            if (!carnet) {
                throw new Error('El carnet del estudiante es requerido');
            }

            const queryParams = new URLSearchParams({
                carnet: carnet,
                state: 'PRESTADO',
                page: 0,
                size: 1
            }).toString();
            
            const response = await axiosInstance.get(`${API_ROUTES.LOANS}?${queryParams}`);
            const hasActiveLoans = response.data?._embedded?.bookLoans?.length > 0;
            
            if (hasActiveLoans) {
                const activeLoan = response.data._embedded.bookLoans[0];
                return {
                    hasActiveLoans: true,
                    loanDetails: {
                        bookTitle: activeLoan.book.title,
                        returnDate: activeLoan.returnDate
                    }
                };
            }
            
            return {
                hasActiveLoans: false,
                loanDetails: null
            };
        } catch (error) {
            console.error('Error verificando préstamos activos:', error);
            throw new Error('Error al verificar préstamos activos del estudiante');
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
    create: async (studentData) => {
        try {
            // Validaciones básicas
            if (!studentData.carnet?.trim()) {
                throw new Error('El carnet es requerido');
            }
            if (!studentData.fullName?.trim()) {
                throw new Error('El nombre completo es requerido');
            }
            if (!studentData.email?.trim()) {
                throw new Error('El correo electrónico es requerido');
            }

            // Validar formato de carnet
            const carnetRegex = /^[A-Z]+[0-9]{2,}$/;
            if (!carnetRegex.test(studentData.carnet)) {
                throw new Error('El carnet debe comenzar con letras mayúsculas seguidas de números');
            }

            // Validar email
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(studentData.email)) {
                throw new Error('El correo electrónico no es válido');
            }

            const cleanStudentData = {
                carnet: studentData.carnet.trim().toUpperCase(),
                fullName: studentData.fullName.trim(),
                email: studentData.email.trim().toLowerCase()
            };

            const response = await axiosInstance.post(API_ROUTES.STUDENTS, cleanStudentData);
            return response.data;
        } catch (error) {
            if (error.response?.status === 409) {
                throw new Error('Ya existe un estudiante con este carnet');
            }
            handleError(error, 'creando estudiante');
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
