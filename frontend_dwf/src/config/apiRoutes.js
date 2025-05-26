export const API_ROUTES = {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',

    // Books
    BOOKS: '/books',
    BOOK_BY_ID: (id) => `/books/${id}`,
    BOOK_SEARCH: '/books/search',    // Book Loans
    LOANS: '/book-loans',
    LOAN_BY_ID: (id) => `/book-loans/${id}`,
    ACTIVE_LOANS: '/book-loans/active',
    RENEW_LOAN: (id) => `/book-loans/${id}/renew`,
    GENERATE_REPORT: '/reports',

    // Students
    STUDENTS: '/students',
    STUDENT_BY_ID: (id) => `/students/${id}`,
    STUDENT_LOANS: (id) => `/students/${id}/loans`,    // Categories
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
