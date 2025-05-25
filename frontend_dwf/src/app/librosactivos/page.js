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

  useEffect(() => {
    const fetchLibros = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        setIsLoading(true);

        // Obtener préstamos según el filtro
        const params = {
          page: currentPage,
          size: pageSize,
          state: filtroEstado === 'TODOS' ? null : filtroEstado
        };

        const response = await apiService.loans.getAll(params);
        const loansData = response._embedded?.bookLoans || [];
        
        // Transformar datos para la tabla
        const librosFormateados = loansData.map(loan => ({
          id: loan.id,
          titulo: loan.book.title,
          estudiante: loan.student.fullName,
          fechaPrestamo: loan.startDate,
          fechaDevolucion: loan.returnDate,
          estado: loan.state === 'PRESTADO' ? 'Pendiente' :
                 loan.state === 'VENCIDO' ? 'Atrasado' :
                 loan.state === 'ENTREGADO' ? 'Entregado' : loan.state
        }));

        setLibros(librosFormateados);
        setTotalItems(response.page.totalElements || 0);

      } catch (error) {
        console.error('Error al cargar libros activos:', error);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibros();
  }, [router, currentPage, pageSize, filtroEstado]);

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
                    setCurrentPage(0); // Resetear a la primera página al filtrar
                  }}
                >
                  <option value="TODOS">Todos</option>
                  <option value="ENTREGADO">Entregado</option>
                  <option value="PRESTADO">Pendiente</option>
                  <option value="VENCIDO">Atrasado</option>
                </select>
                
                <button className="btn-exportar" onClick={handleExportar}>
                  Exportar
                </button>
              </div>
            </div>

            {error && <div className="error-message">{error}</div>}

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
                        <span className={`estado-badge ${libro.estado.toLowerCase()}`}>
                          {libro.estado}
                        </span>
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
    </div>
  );
}