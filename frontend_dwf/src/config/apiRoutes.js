export const API_ROUTES = {
    // Auth
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',

    // Books
    BOOKS: '/api/books',
    BOOK_BY_ID: (id) => `/api/books/${id}`,
    BOOK_SEARCH: '/api/books/search',
      // Book Loans
    LOANS: '/api/book-loans',
    LOAN_BY_ID: (id) => `/api/book-loans/${id}`,
    ACTIVE_LOANS: '/api/book-loans/active',
    RENEW_LOAN: (id) => `/api/book-loans/${id}/renew`,
    GENERATE_REPORT: '/api/reports',

    // Students
    STUDENTS: '/api/students',
    STUDENT_BY_ID: (id) => `/api/students/${id}`,
    STUDENT_LOANS: (id) => `/api/students/${id}/loans`,

    // Categories
    CATEGORIES: '/api/categories',
    CATEGORY_BY_ID: (id) => `/api/categories/${id}`,

    // Authors
    AUTHORS: '/api/authors',
    AUTHOR_BY_ID: (id) => `/api/authors/${id}`,

    // Editorials
    EDITORIALS: '/api/editorials',
    EDITORIAL_BY_ID: (id) => `/api/editorials/${id}`,

    // Reports
    LOAN_REPORTS: '/api/reports/loans',
    BOOK_REPORTS: '/api/reports/books',
    STUDENT_REPORTS: '/api/reports/students',
};
