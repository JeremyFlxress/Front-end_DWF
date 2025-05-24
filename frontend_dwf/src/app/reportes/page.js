'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import '../styles/reportes.css';
import '../styles/pagination.css';

const reportesData = {
  prestamosNuevos: 42,
  devolucionesATiempo: 35,
  devolucionesAtrasadas: 8
};

// Datos de ejemplo - estos vendrían de tu API
const loanData = [
  { id: 'P24001', libro: 'Cien años de soledad', estudiante: 'María López', fechaPrestamo: '12/05/2024', fechaDevolucion: '26/05/2024', estado: 'Activo' },
  { id: 'P24002', libro: 'El principito', estudiante: 'Juan Pérez', fechaPrestamo: '10/05/2024', fechaDevolucion: '24/05/2024', estado: 'Activo' },
  { id: 'P24003', libro: 'Don Quijote', estudiante: 'Ana García', fechaPrestamo: '05/05/2024', fechaDevolucion: '15/05/2024', estado: 'Atrasado' },
  { id: 'P24004', libro: 'Rayuela', estudiante: 'Carlos Rodríguez', fechaPrestamo: '01/05/2024', fechaDevolucion: '15/05/2024', estado: 'Entregado' },
  { id: 'P24005', libro: '1984', estudiante: 'Sofia Martínez', fechaPrestamo: '03/05/2024', fechaDevolucion: '17/05/2024', estado: 'Activo' }
];

export default function Reportes() {
  // Estados para paginación
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  
  // Estados para filtros
  const [tipoReporte, setTipoReporte] = useState('prestamos');
  const [periodo, setPeriodo] = useState('mes');
  const [mostrarDatos, setMostrarDatos] = useState(false);
  const [datosFiltrados, setDatosFiltrados] = useState([]);

  // Función para aplicar filtros
  const aplicarFiltros = () => {
    // Aquí irá la lógica para filtrar datos según el tipo de reporte y período
    // Cuando conectes con la API, aquí harías la llamada con los filtros correspondientes
    
    // Por ahora, simulamos el filtrado
    let datos = [...loanData];
    
    // Filtrar por tipo de reporte
    switch (tipoReporte) {
      case 'prestamos':
        datos = datos.filter(item => item.estado === 'Activo');
        break;
      case 'devoluciones':
        datos = datos.filter(item => item.estado === 'Entregado');
        break;
      case 'libros':
        // Aquí iría la lógica para mostrar los libros más prestados
        break;
      case 'estudiantes':
        // Aquí iría la lógica para mostrar estudiantes activos
        break;
    }

    // Aquí simularemos el filtrado por período
    // En la implementación real, esto se haría en el backend
    setDatosFiltrados(datos);
    setMostrarDatos(true);
    setCurrentPage(1); // Resetear a la primera página al aplicar filtros
  };

  // Calcular índices para paginación
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  // Obtener los datos de la página actual
  const currentData = datosFiltrados.slice(startIndex, endIndex);
  
  // Calcular el número total de páginas
  const totalPages = Math.ceil(datosFiltrados.length / pageSize);

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="dashboard-content">
          <h2 className="section-title">Reportes</h2>
          
          <div className="cards-container">
            <div className="dashboard-card">
              <h3 className="card-title">Préstamos nuevos</h3>
              <p className="card-value">{reportesData.prestamosNuevos}</p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="card-title">Devoluciones a tiempo</h3>
              <p className="card-value">{reportesData.devolucionesATiempo}</p>
            </div>
            
            <div className="dashboard-card">
              <h3 className="card-title">Devoluciones Atrasados</h3>
              <p className="card-value">{reportesData.devolucionesAtrasadas}</p>
            </div>
          </div>
          
          <div className="reportes-filters">
            <div className="filter-group">
              <label htmlFor="reporte-type">Tipo de reporte:</label>
              <select 
                id="reporte-type" 
                className="filter-select"
                value={tipoReporte}
                onChange={(e) => setTipoReporte(e.target.value)}
              >
                <option value="prestamos">Préstamos</option>
                <option value="devoluciones">Devoluciones</option>
                <option value="libros">Libros más prestados</option>
                <option value="estudiantes">Estudiantes activos</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="date-range">Período:</label>
              <select 
                id="date-range" 
                className="filter-select"
                value={periodo}
                onChange={(e) => setPeriodo(e.target.value)}
              >
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
                <option value="trimestre">Último trimestre</option>
                <option value="anio">Último año</option>
              </select>
            </div>
            
            <button 
              className="filter-button"
              onClick={aplicarFiltros}
            >
              Aplicar filtros
            </button>
          </div>
          
          {mostrarDatos && (
            <div className="activity-section">
              <h3 className="section-title">Detalle de préstamos</h3>
              
              <div className="activity-table-container">
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
                    {currentData.map((loan, index) => (
                      <tr key={index}>
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
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                    pageSize={pageSize}
                    onPageSizeChange={setPageSize}
                    totalItems={datosFiltrados.length}
                  />
                ) : (
                  <div className="no-data-message">
                    No se encontraron datos para los filtros seleccionados
                  </div>
                )}
              </div>
              
              <div className="reporte-summary">
                <h4>Resumen</h4>
                <p><strong>Total registros:</strong> {datosFiltrados.length}</p>
                {tipoReporte === 'prestamos' && (
                  <p><strong>Tasa de devolución a tiempo:</strong> {Math.round((reportesData.devolucionesATiempo / (reportesData.devolucionesATiempo + reportesData.devolucionesAtrasadas)) * 100)}%</p>
                )}
              </div>
              
              <div className="reporte-actions">
                <button className="action-button download-pdf">
                  Descargar PDF
                </button>
                <button className="action-button send-email">
                  Enviar por correo
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}