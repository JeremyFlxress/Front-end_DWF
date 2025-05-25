'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import apiService from '@/config/apiService';
import '../styles/reportes.css';
import '../styles/pagination.css';

export default function Reportes() {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [datosFiltrados, setDatosFiltrados] = useState([]);
  const [estadisticas, setEstadisticas] = useState({
    prestamosNuevos: 0,
    devolucionesATiempo: 0,
    devolucionesAtrasadas: 0
  });

  // Función para cargar estadísticas generales
  const cargarEstadisticas = async () => {
    try {
      // Obtener todos los préstamos sin paginación
      const response = await apiService.loans.getAll({ page: 0, size: 1000000 });
      const allLoans = response._embedded?.bookLoans || [];
      
      // Calcular estadísticas totales
      setEstadisticas({
        prestamosNuevos: allLoans.filter(loan => loan.state === 'PRESTADO').length,
        devolucionesATiempo: allLoans.filter(loan => loan.state === 'ENTREGADO').length,
        devolucionesAtrasadas: allLoans.filter(loan => loan.state === 'VENCIDO').length
      });
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    }
  };

  // Función para cargar préstamos paginados
  const cargarPrestamos = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        size: pageSize
      };

      const response = await apiService.loans.getAll(params);
      const loansData = response._embedded?.bookLoans || [];
      setTotalItems(response.page?.totalElements || 0);

      // Transformar los datos para la tabla
      const datosTransformados = loansData.map(loan => ({
        id: loan.id,
        libro: loan.book.title,
        estudiante: loan.student.fullName,
        fechaPrestamo: loan.startDate,
        fechaDevolucion: loan.returnDate,
        estado: loan.state === 'PRESTADO' ? 'Activo' :
               loan.state === 'VENCIDO' ? 'Atrasado' :
               loan.state === 'ENTREGADO' ? 'Entregado' : loan.state
      }));

      setDatosFiltrados(datosTransformados);

    } catch (error) {
      console.error('Error al cargar datos:', error);
      setError('Error al cargar los datos. Por favor, intente de nuevo.');
      if (error.response?.status === 401) {
        router.push('/login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Función para descargar el reporte PDF
  const descargarReporte = async () => {
    try {
      setIsLoading(true);
      const pdfBlob = await apiService.loans.generateReport();
      
      // Crear una URL del blob y descargar
      const url = window.URL.createObjectURL(new Blob([pdfBlob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'reporte-prestamos.pdf');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error al descargar el reporte:', error);
      setError('Error al descargar el reporte. Por favor, intente de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  // Cargar préstamos paginados cuando cambie la página
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    cargarPrestamos();
  }, [currentPage, pageSize]);

  // Cargar estadísticas generales una sola vez
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    cargarEstadisticas();
  }, []); // Solo se ejecuta al montar el componente

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="dashboard-content">
          <h2 className="section-title">Reportes de Préstamos</h2>
          
          <div className="cards-container">
            <div className="dashboard-card">
              <h3 className="card-title">Préstamos Activos</h3>
              <p className="card-value">{estadisticas.prestamosNuevos}</p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="card-title">Devoluciones Completadas</h3>
              <p className="card-value">{estadisticas.devolucionesATiempo}</p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="card-title">Préstamos Atrasados</h3>
              <p className="card-value">{estadisticas.devolucionesAtrasadas}</p>
            </div>
          </div>
          
          <div className="activity-section">
            <div className="section-header">
              <h3 className="section-title">Registro General de Préstamos</h3>
              <button 
                className="action-button download-pdf"
                onClick={descargarReporte}
                disabled={isLoading}
              >
                {isLoading ? 'Generando PDF...' : 'Descargar Reporte PDF'}
              </button>
            </div>
            
            {error && <div className="error-message">{error}</div>}
            
            <div className="activity-table-container">
              {isLoading ? (
                <div className="loading">Cargando datos...</div>
              ) : (
                <>
                  <table className="activity-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Libro</th>
                        <th>Estudiante</th>
                        <th>Fecha préstamo</th>
                        <th>Fecha devolución</th>
                        <th>Estado</th>
                      </tr>
                    </thead>
                    <tbody>
                      {datosFiltrados.map((loan) => (
                        <tr key={loan.id}>
                          <td>{loan.id}</td>
                          <td>{loan.libro}</td>
                          <td>{loan.estudiante}</td>
                          <td>{loan.fechaPrestamo}</td>
                          <td>{loan.fechaDevolucion}</td>
                          <td>
                            <span className={`status-badge ${loan.estado.toLowerCase()}`}>
                              {loan.estado}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {datosFiltrados.length > 0 ? (
                    <Pagination
                      currentPage={currentPage + 1}
                      totalPages={Math.ceil(totalItems / pageSize)}
                      onPageChange={(page) => setCurrentPage(page - 1)}
                      pageSize={pageSize}
                      onPageSizeChange={setPageSize}
                      totalItems={totalItems}
                    />
                  ) : (
                    <div className="no-data-message">
                      No se encontraron préstamos registrados
                    </div>
                  )}
                </>
              )}
            </div>
            
            <div className="reporte-summary">
              <h4>Resumen</h4>
              <p><strong>Total registros:</strong> {totalItems}</p>
              <p>
                <strong>Tasa de devolución:</strong> 
                {estadisticas.devolucionesATiempo + estadisticas.devolucionesAtrasadas > 0 
                  ? Math.round((estadisticas.devolucionesATiempo / (estadisticas.devolucionesATiempo + estadisticas.devolucionesAtrasadas)) * 100)
                  : 0}%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}