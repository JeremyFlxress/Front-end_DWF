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
  const [selectedLibro, setSelectedLibro] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);

  // Mapeo de estados a texto para mostrar
  const estadosTexto = {
    'PRESTADO': 'Pendiente',
    'VENCIDO': 'Atrasado',
    'ENTREGADO': 'Entregado'
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
        size: pageSize
      };

      // Si no es TODOS, filtrar por estado específico
      if (filtroEstado !== 'TODOS') {
        params.state = filtroEstado;
      }

      const response = await apiService.loans.getAll(params);
      const loansData = response._embedded?.bookLoans || [];
      
      // Procesar los préstamos
      const librosFormateados = loansData.map(loan => {
        const fechaDevolucion = loan.returnDate;
        const [dia, mes, anio] = fechaDevolucion.split('-').map(Number);
        const fechaLimite = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0);

        // Verificar si está vencido
        let estado = loan.state;
        if (estado === 'PRESTADO' && hoy > fechaLimite) {
          estado = 'VENCIDO';
          // Actualizar en el backend silenciosamente
          apiService.loans.updateState(loan.id, 'VENCIDO')
            .catch(err => console.error('Error al actualizar estado a vencido:', err));
        }

        return {
          id: loan.id,
          titulo: loan.book.title,
          estudiante: loan.student.fullName,
          fechaPrestamo: loan.startDate,
          fechaDevolucion: loan.returnDate,
          estado: estado,
          estadoMostrado: estadosTexto[estado] || estado
        };
      });

      setLibros(librosFormateados);
      setTotalItems(response.page.totalElements || 0);

    } catch (error) {
      console.error('Error al cargar libros activos:', error);
      setError('Error al cargar los datos: ' + (error.message || 'Por favor, intente de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLibros();
  }, [currentPage, pageSize, filtroEstado]);

  const handleCambiarEstado = (libro) => {
    if (libro.estado === 'ENTREGADO') return;
    setSelectedLibro(libro);
    setShowConfirmDialog(true);
  };

  const handleConfirmarCambio = async () => {
    if (!selectedLibro) return;

    try {
      setIsUpdating(true);
      setError(null);
      
      await apiService.loans.updateState(selectedLibro.id, 'ENTREGADO');
      
      // Actualizar la lista localmente primero
      setLibros(prevLibros => 
        prevLibros.map(libro => 
          libro.id === selectedLibro.id
            ? {
                ...libro,
                estado: 'ENTREGADO',
                estadoMostrado: estadosTexto['ENTREGADO']
              }
            : libro
        )
      );
      
      // Recargar la lista para asegurar sincronización
      await fetchLibros();
      
      setShowConfirmDialog(false);
      setSelectedLibro(null);
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      setError('Error al cambiar el estado: ' + (error.message || 'Por favor, intente de nuevo.'));
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelarCambio = () => {
    setShowConfirmDialog(false);
    setSelectedLibro(null);
  };

  const handleExportar = () => {
    // TODO: Implementar exportación
    console.log('Exportando datos...');
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
                  <option value="ENTREGADO">Entregados</option>
                </select>
                
                <button className="btn-exportar" onClick={handleExportar}>
                  Exportar
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message">
                {error}
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

            <div className="table-container">
              <table className="tabla-libros">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Título</th>
                    <th>Estudiante</th>
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
            
            <Pagination
              currentPage={currentPage + 1}
              totalPages={Math.ceil(totalItems / pageSize)}
              onPageChange={(page) => setCurrentPage(page - 1)}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={totalItems}
            />
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
          background-color: #ffd700;
          color: #000;
        }

        .estado-button.vencido {
          background-color: #ff6b6b;
          color: white;
        }

        .estado-button.entregado {
          background-color: #4CAF50;
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

        tr.prestado {
          background-color: #fff9e6;
        }

        tr.vencido {
          background-color: #fff5f5;
        }

        tr.entregado {
          background-color: #f0fff4;
        }
      `}</style>
    </div>
  );
}