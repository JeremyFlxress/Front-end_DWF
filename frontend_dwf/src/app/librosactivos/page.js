'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import apiService from '@/config/apiService';
import '../styles/pagination.css';

export default function LibrosActivos() {
  const router = useRouter();
  const [filtroEstado, setFiltroEstado] = useState('TODOS');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [libros, setLibros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedLibro, setSelectedLibro] = useState(null);  const [isUpdating, setIsUpdating] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  // Mapeo de estados a texto para mostrar (solo estados activos)
  const estadosTexto = {
    'PRESTADO': 'Pendiente',
    'VENCIDO': 'Atrasado'
  };

  const fetchLibros = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      setError(null);
      
      let params = {
        page: currentPage,
        size: pageSize,
      };

      if (filtroEstado !== 'TODOS') {
        params.state = filtroEstado;
      }

      const response = await apiService.loans.getAll(params);
      const loansData = response._embedded?.bookLoans || [];
      
      const librosFormateados = await Promise.all(loansData
        .filter(loan => loan.state !== 'ENTREGADO')
        .filter(loan => 
          !searchTerm || 
          loan.book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          loan.student.fullName.toLowerCase().includes(searchTerm.toLowerCase())
        )
        .map(async loan => {
          const fechaDevolucion = loan.returnDate;
          const [dia, mes, anio] = fechaDevolucion.split('-').map(Number);
          const fechaLimite = new Date(anio, mes - 1, dia);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);
          
          let estado = loan.state;
          
          if (estado === 'PRESTADO' && hoy > fechaLimite) {
            try {
              await apiService.loans.updateState(loan.id, 'VENCIDO');
              estado = 'VENCIDO';
            } catch (err) {
              console.error('Error al actualizar estado a vencido:', err);
            }
          }

          return {
            id: loan.id,
            titulo: loan.book.title,
            estudiante: loan.student.fullName,
            carnet: loan.student.carnet,
            fechaPrestamo: loan.startDate,
            fechaDevolucion: loan.returnDate,
            estado: estado,
            estadoMostrado: estadosTexto[estado] || estado
          };
        }));
      
      setLibros(librosFormateados);
      setTotalItems(response.page.totalElements || 0);

    } catch (error) {
      console.error('Error al cargar libros activos:', error);
      setError('Error al cargar los datos: ' + (error.message || 'Por favor, intente de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  };

  // Efecto para actualizar los estados de los préstamos cada minuto
  useEffect(() => {
    const interval = setInterval(fetchLibros, 60000); // Actualizar cada minuto
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    fetchLibros();
  }, [currentPage, pageSize, filtroEstado, searchTerm]);

  const handleCambiarEstado = (libro) => {
    if (libro.estado === 'ENTREGADO') return;
    setSelectedLibro(libro);
    setShowConfirmDialog(true);
  };  const handleConfirmarCambio = async () => {
    setIsUpdating(true);
    setError(null); // Clear any previous errors
    try {
      console.log('Attempting to update loan state for ID:', selectedLibro.id);
      const result = await apiService.loans.updateState(selectedLibro.id, 'ENTREGADO');
      console.log('Update successful, API response:', result);
      
      if (result) {
        // Update the local state only if the API call was successful
        setLibros(prevLibros => prevLibros.filter(libro => libro.id !== selectedLibro.id));
        setShowConfirmDialog(false);
        setSelectedLibro(null);
        setSuccessMessage('¡Libro marcado como entregado exitosamente!');
        setTimeout(() => setSuccessMessage(''), 3000);
        
        // Refresh the list to ensure we have the latest data
        fetchLibros();
      } else {
        throw new Error('No se recibió respuesta del servidor');
      }
    } catch (error) {
      console.error('Error updating loan state:', error);
      const errorMessage = error.message || 'Error al actualizar el estado del libro. Por favor, intente nuevamente.';
      setError(errorMessage);
      // Keep the dialog open on error
      setShowConfirmDialog(true);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelarCambio = () => {
    setShowConfirmDialog(false);
    setSelectedLibro(null);
  };

  const handleExportar = async () => {
    try {
      const pdfBlob = await apiService.loans.generateReport();
      
      // Crear una URL para el blob
      const url = window.URL.createObjectURL(pdfBlob);
      
      // Crear un elemento <a> temporal
      const link = document.createElement('a');
      link.href = url;
      link.download = `reporte-prestamos-${new Date().toLocaleDateString()}.pdf`;
      
      // Añadir al DOM y hacer clic
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al exportar:', error);
      setError('Error al generar el reporte: ' + (error.message || 'Por favor, intente de nuevo.'));
    }
  };

  const handleVerLibro = (libro) => {
    router.push(`/detalles?id=${libro.id}&estado=${libro.estado}`);
  };

  if (isLoading && !libros.length) return <div>Cargando...</div>;
  
  return (
    <div className="prestamo-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="libros-activos-container">
          <h2 className="section-title">Libros Activos</h2>
          <p className="section-description">Aquí se muestran los préstamos pendientes y atrasados</p>
          
          <div className="panel-container">
            <div className="filtros-container">
              <div className="filtros-grupo">
                <span className="filter-label">Estado:</span>
                <select 
                  className="select-estado"
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    setCurrentPage(0);
                  }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="PRESTADO">Pendientes</option>
                  <option value="VENCIDO">Atrasados</option>
                </select>

                <input
                  type="text"
                  placeholder="Buscar por título o estudiante..."
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(0);
                  }}
                  className="search-input"
                />
                
                <button 
                  className="btn-exportar" 
                  onClick={handleExportar}
                  disabled={isLoading}
                >
                  {isLoading ? 'Exportando...' : 'Exportar'}
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}

            {successMessage && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
                {successMessage}
              </div>
            )}

            {showConfirmDialog && selectedLibro && (
              <div className="modal-overlay">
                <div className="modal-content">
                  <h3>Confirmar entrega</h3>
                  <p>¿Está seguro que desea marcar como entregado el siguiente libro?</p>
                  <div className="libro-info">
                    <p><strong>Título:</strong> {selectedLibro.titulo}</p>
                    <p><strong>Estudiante:</strong> {selectedLibro.estudiante}</p>
                    <p><strong>Estado actual:</strong> {selectedLibro.estadoMostrado}</p>
                  </div>
                  <div className="modal-buttons">
                    <button 
                      className="btn-confirmar"
                      onClick={handleConfirmarCambio}
                      disabled={isUpdating}
                    >
                      {isUpdating ? 'Confirmando...' : 'Sí, confirmar entrega'}
                    </button>
                    <button 
                      className="btn-cancelar"
                      onClick={handleCancelarCambio}
                      disabled={isUpdating}
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
              </div>
            )}

            {libros.length > 0 ? (
              <div className="table-container">
                <table className="tabla-libros">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Título</th>
                      <th>Estudiante</th>
                      <th>Carnet</th>
                      <th>Fecha Préstamo</th>
                      <th>Fecha Devolución</th>
                      <th>Estado</th>
                      <th>Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {libros.map((libro) => (
                      <tr key={libro.id} className={libro.estado.toLowerCase()}>
                        <td>{libro.id}</td>
                        <td>{libro.titulo}</td>
                        <td>{libro.estudiante}</td>
                        <td>{libro.carnet}</td>
                        <td>{libro.fechaPrestamo}</td>
                        <td>{libro.fechaDevolucion}</td>
                        <td>
                          <div className="estado-container">
                            <button
                              className={`estado-button ${libro.estado.toLowerCase()}`}
                              onClick={() => handleCambiarEstado(libro)}
                              disabled={libro.estado === 'ENTREGADO' || isUpdating}
                            >
                              {libro.estadoMostrado}
                            </button>
                          </div>
                        </td>
                        <td className="col-acciones">
                          <button 
                            className="btn-ver"
                            onClick={() => handleVerLibro(libro)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center mt-4">No hay libros activos que mostrar.</p>
            )}
            
            {libros.length > 0 && (
              <Pagination
                currentPage={currentPage + 1}
                totalPages={Math.ceil(totalItems / pageSize)}
                onPageChange={(page) => setCurrentPage(page - 1)}
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={totalItems}
              />
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }

        .modal-content {
          background: white;
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
        }

        .libro-info {
          margin: 15px 0;
          padding: 10px;
          background: #f5f5f5;
          border-radius: 4px;
        }

        .libro-info p {
          margin: 5px 0;
        }

        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
          margin-top: 20px;
        }

        .btn-confirmar {
          background: #4CAF50;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-confirmar:hover:not(:disabled) {
          background: #45a049;
        }

        .btn-confirmar:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .btn-cancelar {
          background: #f44336;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-cancelar:hover:not(:disabled) {
          background: #da190b;
        }

        .btn-cancelar:disabled {
          background: #cccccc;
          cursor: not-allowed;
        }

        .estado-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
          min-width: 100px;
        }

        .estado-button.prestado {
          background-color: #4CAF50;
          color: white;
        }

        .estado-button.vencido {
          background-color: #ff6b6b;
          color: white;
        }

        .estado-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .error-message {
          background-color: #fee2e2;
          color: #dc2626;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          border: 1px solid #fecaca;
        }

        .success-message {
          background-color: #e1f5fe;
          color: #01579b;
          padding: 1rem;
          border-radius: 6px;
          margin-bottom: 1rem;
          font-size: 0.95rem;
          border: 1px solid #b3e5fc;
        }

        tr.prestado {
          background-color: #e8f5e9;
        }

        tr.vencido {
          background-color: #fff5f5;
        }

        .section-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 20px;
          margin-top: -10px;
        }

        .search-input {
          padding: 8px 12px;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin: 0 10px;
          width: 250px;
        }

        .search-input:focus {
          outline: none;
          border-color: #007bff;
          box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
        }
        
        .btn-exportar {
          background-color: #28a745;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-exportar:hover:not(:disabled) {
          background-color: #218838;
        }

        .btn-exportar:disabled {
          background-color: #6c757d;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}