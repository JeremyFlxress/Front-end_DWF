'use client';
import React from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/reportes.css'; 

const reportesData = {
  prestamosNuevos: 42,
  devolucionesATiempo: 35,
  devolucionesAtrasadas: 8
};

const loanData = [
  { id: 'P24001', libro: 'Cien años de soledad', estudiante: 'María López', fechaPrestamo: '12/05/2024', fechaDevolucion: '26/05/2024', estado: 'Activo' },
  { id: 'P24002', libro: 'El principito', estudiante: 'Juan Pérez', fechaPrestamo: '10/05/2024', fechaDevolucion: '24/05/2024', estado: 'Activo' },
  { id: 'P24003', libro: 'Don Quijote', estudiante: 'Ana García', fechaPrestamo: '05/05/2024', fechaDevolucion: '15/05/2024', estado: 'Atrasado' },
  { id: 'P24004', libro: 'Rayuela', estudiante: 'Carlos Rodríguez', fechaPrestamo: '01/05/2024', fechaDevolucion: '15/05/2024', estado: 'Entregado' },
  { id: 'P24005', libro: '1984', estudiante: 'Sofia Martínez', fechaPrestamo: '03/05/2024', fechaDevolucion: '17/05/2024', estado: 'Activo' }
];

export default function Reportes() {
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
                defaultValue="prestamos"
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
                defaultValue="mes"
              >
                <option value="semana">Última semana</option>
                <option value="mes">Último mes</option>
                <option value="trimestre">Último trimestre</option>
                <option value="anio">Último año</option>
              </select>
            </div>
            
            <button className="filter-button">Aplicar filtros</button>
          </div>
          
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
                  {loanData.map((loan, index) => (
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
            </div>
            
            <div className="reporte-summary">
              <h4>Resumen</h4>
              <p><strong>Total préstamos:</strong> {reportesData.prestamosNuevos + reportesData.devolucionesATiempo + reportesData.devolucionesAtrasadas}</p>
              <p><strong>Tasa de devolución a tiempo:</strong> {Math.round((reportesData.devolucionesATiempo / (reportesData.devolucionesATiempo + reportesData.devolucionesAtrasadas)) * 100)}%</p>
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
        </div>
      </div>
    </div>
  );
}