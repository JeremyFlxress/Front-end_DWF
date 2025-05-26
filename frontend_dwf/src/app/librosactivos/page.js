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

  // Mapeo de estados a texto para mostrar
  const estadosTexto = {
    'PRESTADO': 'Pendiente',
    'VENCIDO': 'Atrasado',
    'ENTREGADO': 'Entregado'
  };

  // Función para determinar el siguiente estado
  const obtenerSiguienteEstado = (estadoActual) => {
    // Solo permitir cambiar a ENTREGADO
    if (estadoActual === 'PRESTADO' || estadoActual === 'VENCIDO') {
      return 'ENTREGADO';
    }
    return estadoActual;
  };

  const fetchLibros = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      setError(null);      let params = {
        page: currentPage,
        size: pageSize
      };

      // Si no es TODOS, filtrar por estado específico
      if (filtroEstado !== 'TODOS') {
        params.state = [filtroEstado];
      }      const response = await apiService.loans.getAll(params);
      const loansData = response._embedded?.bookLoans || [];
      
      // Procesar los préstamos y actualizar estados automáticamente
      let librosFormateados = loansData
        .filter(loan => loan.state !== 'ENTREGADO') // Excluir libros entregados
        .map(loan => {
          const fechaDevolucion = loan.returnDate;
          const [dia, mes, anio] = fechaDevolucion.split('-').map(Number);
          const fechaLimite = new Date(anio, mes - 1, dia);
          const hoy = new Date();
          hoy.setHours(0, 0, 0, 0);

          // Actualizar automáticamente a vencido si corresponde
          let estado = loan.state;
          if (estado === 'PRESTADO' && hoy > fechaLimite) {
            estado = 'VENCIDO';
            // Actualizar en el backend
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
            estadoMostrado: estadosTexto[estado] || estado          };
      });

      // Si no hay suficientes elementos para llenar la página, ajustar el tamaño de página
      if (librosFormateados.length < pageSize) {
        const updatedParams = {
          ...params,
          size: pageSize * 2 // Solicitar más elementos para compensar los filtrados
        };
        
        // Hacer otra solicitud para obtener más elementos
        const additionalResponse = await apiService.loans.getAll(updatedParams);
        const additionalLoansData = additionalResponse._embedded?.bookLoans || [];
        
        const additionalFormattedBooks = additionalLoansData
          .filter(loan => loan.state !== 'ENTREGADO')
          .map(loan => {
            const fechaDevolucion = loan.returnDate;
            const [dia, mes, anio] = fechaDevolucion.split('-').map(Number);
            const fechaLimite = new Date(anio, mes - 1, dia);
            const hoy = new Date();
            hoy.setHours(0, 0, 0, 0);

            let estado = loan.state;
            if (estado === 'PRESTADO' && hoy > fechaLimite) {
              estado = 'VENCIDO';
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
        
        // Combinar los resultados y tomar solo los primeros pageSize elementos
        librosFormateados = [...new Set([...librosFormateados, ...additionalFormattedBooks])]
          .slice(0, pageSize);
      }

      // Asegurar que nunca se muestren más elementos que el pageSize
      librosFormateados = librosFormateados.slice(0, pageSize);

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
  }, [router, currentPage, pageSize, filtroEstado]);

  const handleCambiarEstado = async (libro) => {
    // Mostrar diálogo de confirmación
    setSelectedLibro(libro);
    setShowConfirmDialog(true);
  };

  const handleConfirmarCambio = async () => {
    if (!selectedLibro) return;

    try {
      setIsLoading(true);
      setError(null);
      
      const nuevoEstado = 'ENTREGADO';
      
      // Primera confirmación ya realizada (al hacer clic en el botón)
      // Segunda confirmación a través del diálogo modal
      await apiService.loans.updateState(selectedLibro.id, nuevoEstado);
      
      // Recargar la lista después de una actualización exitosa
      await fetchLibros();
      
      // Limpiar el estado del diálogo
      setShowConfirmDialog(false);
      setSelectedLibro(null);
    } catch (error) {
      console.error('Error al cambiar el estado:', error);
      setError('Error al cambiar el estado: ' + (error.message || 'Por favor, intente de nuevo.'));
    } finally {
      setIsLoading(false);
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

  if (isLoading) return <div>Cargando...</div>;
  
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
                >                  <option value="TODOS">Todos</option>
                  <option value="PRESTADO">Pendientes</option>
                  <option value="VENCIDO">Atrasados</option>
                </select>
                
                <button className="btn-exportar" onClick={handleExportar}>
                  Exportar
                </button>
              </div>
            </div>

            {error && (
              <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px 0' }}>
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
                  >
                    Sí, confirmar entrega
                  </button>
                  <button 
                    className="btn-cancelar"
                    onClick={handleCancelarCambio}
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
                    <tr key={libro.id}>
                      <td>{libro.id}</td>
                      <td>{libro.titulo}</td>
                      <td>{libro.estudiante}</td>
                      <td>{libro.fechaPrestamo}</td>
                      <td>{libro.fechaDevolucion}</td>
                      <td>
                        <div className="estado-container">
                          <button
                            className={`estado-button ${libro.estadoMostrado.toLowerCase()}`}
                            onClick={() => handleCambiarEstado(libro)}
                            disabled={libro.estado === 'ENTREGADO'}
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
        }

        .btn-confirmar:hover {
          background: #45a049;
        }

        .btn-cancelar {
          background: #f44336;
          color: white;
          padding: 8px 16px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }

        .btn-cancelar:hover {
          background: #da190b;
        }

        .estado-button {
          padding: 6px 12px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background-color 0.2s;
        }

        .estado-button:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
      `}</style>
    </div>
  );
}