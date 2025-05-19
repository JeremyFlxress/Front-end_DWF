'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function LibrosActivos() {
  const [filtroEstado, setFiltroEstado] = useState('Atrasados');
  const [filtroMes, setFiltroMes] = useState('Marzo');
  const router = useRouter();
  
  // Datos de ejemplo - estos podrían venir de una API o props
  const librosData = [
    { id: 'P24001', titulo: 'Libro 1', estudiante: 'Estudiante 1', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
    { id: 'P24002', titulo: 'Libro 2', estudiante: 'Estudiante 2', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Pendiente' },
    { id: 'P24003', titulo: 'Libro 3', estudiante: 'Estudiante 3', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Atrasado' },
    { id: 'P24004', titulo: 'Libro 4', estudiante: 'Estudiante 4', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
    { id: 'P24005', titulo: 'Libro 5', estudiante: 'Estudiante 5', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
    { id: 'P24006', titulo: 'Libro 6', estudiante: 'Estudiante 6', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado' },
    { id: 'P24007', titulo: 'Libro 7', estudiante: 'Estudiante 7', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Pendiente' },
  ];

  const handleExportar = () => {
    console.log('Exportando datos...');
  };

  const handleVerLibro = (id) => {
    router.push(`/detalles`);
  };

  // Función para determinar la clase de estado
  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'Entregado': return 'estado-entregado';
      case 'Pendiente': return 'estado-pendiente';
      case 'Atrasado': return 'estado-atrasado';
      default: return '';
    }
  };

  return (
    <div className="prestamo-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="libros-activos-container">
          <h2 className="section-title">Libros Activos</h2>
          
          <div className="panel-container">
            {/* Filtros superiores */}
            <div className="filtros-container">
              <div className="filtros-grupo">
                <span className="filter-label">Estado:</span>
                <button 
                  className="btn-filtro-atrasados"
                  onClick={() => setFiltroEstado('Atrasados')}
                >
                  Atrasados
                </button>
                
                <span className="filter-label">Fecha:</span>
                <select 
                  className="select-mes"
                  value={filtroMes}
                  onChange={(e) => setFiltroMes(e.target.value)}
                >
                  <option>Enero</option>  
                  <option>Febrero</option>
                  <option>Marzo</option>
                  <option>Abril</option>
                  <option>Mayo</option>
                  <option>Junio</option>
                  <option>Julio</option>
                  <option>Agosto</option>
                  <option>Septiembre</option>
                  <option>Octubre</option>
                  <option>Noviembre</option>
                  <option>Diciembre</option>
                </select>
              </div>
              
              <button 
                className="btn-exportar"
                onClick={handleExportar}
              >
                Exportar
                <span className="exportar-icon">⤓</span>
              </button>
            </div>
            
            {/* Tabla de libros */}
            <table className="tabla-libros">
              <thead>
                <tr>
                  <th>ID Prestamo</th>
                  <th>Libro</th>
                  <th>Estudiante</th>
                  <th>Fecha Préstamo</th>
                  <th>Fecha Devolución</th>
                  <th>Estado</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {librosData.map((libro, index) => (
                  <tr key={index}>
                    <td>{libro.id}</td>
                    <td>{libro.titulo}</td>
                    <td>{libro.estudiante}</td>
                    <td>{libro.fechaPrestamo}</td>
                    <td>{libro.fechaDevolucion}</td>
                    <td className={getEstadoClass(libro.estado)}>
                      {libro.estado}
                    </td>
                    <td className="col-acciones">
                      <button 
                        className="btn-ver"
                        onClick={() => handleVerLibro(libro.id)}
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}