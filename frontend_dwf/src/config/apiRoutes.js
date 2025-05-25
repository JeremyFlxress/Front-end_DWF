export const API_ROUTES = {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',

    // Books
    BOOKS: '/api/books',
    BOOK_BY_ID: (id) => `/api/books/${id}`,
    BOOK_SEARCH: '/api/books/search',    // Book Loans
    LOANS: '/api/book-loans',
    LOAN_BY_ID: (id) => `/api/book-loans/${id}`,
    ACTIVE_LOANS: '/api/book-loans/active',
    RENEW_LOAN: (id) => `/api/book-loans/${id}/renew`,

    // Students
    STUDENTS: '/students',
    STUDENT_BY_ID: (id) => `/students/${id}`,
    STUDENT_LOANS: (id) => `/students/${id}/loans`,

    // Categories
    CATEGORIES: '/categories',
    CATEGORY_BY_ID: (id) => `/categories/${id}`,

    // Authors
    AUTHORS: '/authors',
    AUTHOR_BY_ID: (id) => `/authors/${id}`,

    // Editorials
    EDITORIALS: '/editorials',
    EDITORIAL_BY_ID: (id) => `/editorials/${id}`,

    // Reports
    LOAN_REPORTS: '/reports/loans',
    BOOK_REPORTS: '/reports/books',
    STUDENT_REPORTS: '/reports/students',
};
