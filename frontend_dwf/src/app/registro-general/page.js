'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function RegistroGeneral() {
  const [busqueda, setBusqueda] = useState('');
  
  // Datos de ejemplo - estos podrían venir de una API o props
  const registrosData = [
    { id: 'P24001', libro: 'Libro 1', estudiante: 'Estudiante 1', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado', semana: 'Semana 1' },
    { id: 'P24001', libro: 'Libro 2', estudiante: 'Estudiante 2', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Pendiente', semana: 'Semana 2' },
    { id: 'P24001', libro: 'Libro 3', estudiante: 'Estudiante 3', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Atrasado', semana: 'Semana 3' },
    { id: 'P24001', libro: 'Libro 4', estudiante: 'Estudiante 4', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado', semana: 'Semana 1' },
    { id: 'P24001', libro: 'Libro 5', estudiante: 'Estudiante 5', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado', semana: 'Semana 2' },
    { id: 'P24001', libro: 'Libro 6', estudiante: 'Estudiante 6', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Entregado', semana: 'Semana 3' },
    { id: 'P24001', libro: 'Libro 7', estudiante: 'Estudiante 7', fechaPrestamo: '10/05/2024', fechaDevolucion: '10/05/2024', estado: 'Pendiente', semana: 'Semana 1' },
  ];

  const handleExportar = () => {
    console.log('Exportando datos...');
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

  const handleSearch = (e) => {
    setBusqueda(e.target.value);
  };

  // Filtrar registros según búsqueda
  const registrosFiltrados = busqueda 
    ? registrosData.filter(registro => 
        registro.libro.toLowerCase().includes(busqueda.toLowerCase()) || 
        registro.estudiante.toLowerCase().includes(busqueda.toLowerCase()) ||
        registro.id.toLowerCase().includes(busqueda.toLowerCase())
      )
    : registrosData;

  return (
    <div className="app-container">
      <div className="sidebar-wrapper">
        <Sidebar />
      </div>
      
      <div className="content-wrapper">
        <Header />
        
        <div className="registro-general-container">
          <h2 className="section-title">Registro general</h2>
          
          <div className="panel-container">
            {/* Barra de búsqueda y exportar */}
            <div className="filtros-container">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar registro..."
                  className="input-busqueda"
                  value={busqueda}
                  onChange={handleSearch}
                />
              </div>
              
              <button 
                className="btn-exportar"
                onClick={handleExportar}
              >
                Exportar
                <span className="exportar-icon">⤓</span>
              </button>
            </div>
            
            {/* Tabla de registros */}
            <table className="tabla-registro">
              <thead>
                <tr>
                  <th>ID Prestamo</th>
                  <th>Libro</th>
                  <th>Estudiante</th>
                  <th>Fecha Préstamo</th>
                  <th>Fecha Devolución</th>
                  <th>Estado</th>
                  <th>Semana</th>
                </tr>
              </thead>
              <tbody>
                {registrosFiltrados.map((registro, index) => (
                  <tr key={index}>
                    <td>{registro.id}</td>
                    <td>{registro.libro}</td>
                    <td>{registro.estudiante}</td>
                    <td>{registro.fechaPrestamo}</td>
                    <td>{registro.fechaDevolucion}</td>
                    <td className={getEstadoClass(registro.estado)}>
                      {registro.estado}
                    </td>
                    <td>{registro.semana}</td>
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