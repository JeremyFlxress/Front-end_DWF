'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import apiService from '@/config/apiService';
import '../styles/catalogo.css';
import '../styles/pagination.css';

export default function Catalogo() {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalItems, setTotalItems] = useState(0);
  const [libros, setLibros] = useState([]);

  // Add debounce effect for search term
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setCurrentPage(0); // Reset to first page when search term changes
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [searchTerm]);

  // Fetch books from backend
  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        setIsLoading(true);
        setError(null);
        
        const queryParams = {
          page: currentPage,
          size: pageSize,
        };
        
        if (debouncedSearchTerm.trim()) {
          queryParams.title = debouncedSearchTerm.trim();
        }

        const response = await apiService.books.getAll(queryParams);
        const booksData = response._embedded?.books || [];
        setLibros(booksData);
        setTotalItems(response.page.totalElements || 0);
      } catch (error) {
        console.error('Error al cargar libros:', error);
        setError('Error al cargar los libros. Por favor, intente de nuevo.');
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBooks();
  }, [router, currentPage, pageSize, debouncedSearchTerm]);

  const handleNuevoLibro = () => {
    router.push('/nuevo-libro');
  };

  const handleEdit = (id) => {
    router.push(`/editar-libro?id=${id}`);
  };

  const handleChangeStatus = (libro) => {
    setSelectedBook(libro);
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = async () => {
    if (selectedBook) {
      try {
        setError(null);
        
        const updatedBook = {
          ...selectedBook,
          state: selectedBook.state === 'DISPONIBLE' ? 'NO_DISPONIBLE' : 'DISPONIBLE'
        };

        await apiService.books.update(selectedBook.id, updatedBook);
        
        setLibros(libros.map(libro => 
          libro.id === selectedBook.id ? updatedBook : libro
        ));

        setShowConfirmDialog(false);
        setSelectedBook(null);
      } catch (error) {
        console.error('Error al actualizar estado:', error);
        setError('Error al actualizar el estado del libro. Por favor, intente de nuevo.');
      }
    }
  };

  return (
    <div className="prestamo-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="catalogo-container">
          <h2 className="section-title">Catálogo de Libros</h2>
          
          {error && <div className="error-message">{error}</div>}
          
          <div className="panel-container">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Buscar libro por título"
                className="search-input"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
              />
              <button 
                className="btn-nuevo-libro"
                onClick={handleNuevoLibro}
              >
                <span className="plus-icon">+</span> Nuevo Libro
              </button>
            </div>
            
            {isLoading ? (
              <div className="loading">Cargando...</div>
            ) : (
              <>
                <table className="tabla-catalogo">
                  <thead>
                    <tr>
                      <th>Código</th>
                      <th>Título</th>
                      <th>Autores</th>
                      <th>Stock</th>
                      <th>Categoría</th>
                      <th>Disponibilidad</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {libros.map((libro) => (
                      <tr key={libro.id}>
                        <td>{libro.id}</td>
                        <td>{libro.title}</td>
                        <td>{libro.authors?.map(author => author.name).join(', ')}</td>
                        <td>{libro.stock}</td>
                        <td>{libro.category?.name}</td>
                        <td>
                          <span className={`estado-${libro.state.toLowerCase()}`}>
                            {libro.state === 'DISPONIBLE' ? 'Disponible' : 'No Disponible'}
                          </span>
                        </td>
                        <td className="acciones">
                          <button 
                            className="btn-editar"
                            onClick={() => handleEdit(libro.id)}
                            title="Editar libro"
                          >
                            ✎
                          </button>
                          <button 
                            className={`btn-toggle-status ${libro.state === 'DISPONIBLE' ? 'disponible' : 'no-disponible'}`}
                            onClick={() => handleChangeStatus(libro)}
                            title={`Cambiar a ${libro.state === 'DISPONIBLE' ? 'No Disponible' : 'Disponible'}`}
                          >
                            {libro.state === 'DISPONIBLE' ? '✓' : '×'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <Pagination
                  currentPage={currentPage + 1}
                  totalPages={Math.ceil(totalItems / pageSize)}
                  onPageChange={(page) => setCurrentPage(page - 1)}
                  pageSize={pageSize}
                  onPageSizeChange={setPageSize}
                  totalItems={totalItems}
                />
              </>
            )}
          </div>
        </div>

        {showConfirmDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content">
              <div className="dialog-header">
                <h3>Confirmar cambio de estado</h3>
              </div>
              <div className="dialog-body">
                <p>
                  ¿Está seguro que quiere cambiar el estado del libro &quot;{selectedBook?.title}&quot; a 
                  {selectedBook?.state === 'DISPONIBLE' ? ' No Disponible' : ' Disponible'}?
                </p>
              </div>
              <div className="dialog-buttons">
                <button 
                  className="btn-confirmar"
                  onClick={confirmStatusChange}
                >
                  Aceptar
                </button>
                <button 
                  className="btn-cancelar"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedBook(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}