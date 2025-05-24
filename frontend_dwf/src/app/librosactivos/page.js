'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import '../styles/pagination.css';

export default function LibrosActivos() {
  const [filtroEstado, setFiltroEstado] = useState('General');
  const [filtroMes, setFiltroMes] = useState('Marzo');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
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

  const handleVerLibro = (libro) => {
    router.push(`/detalles?id=${libro.id}&estado=${libro.estado}`);
  };


  // Filtrar los libros según el estado seleccionado
  const librosFiltrados = librosData.filter(libro => {
    if (filtroEstado === 'General') {
      return true;
    }
    return libro.estado === filtroEstado;
  });

  // Calcular índices para paginación
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  
  // Obtener los libros de la página current
  const currentBooks = librosFiltrados.slice(startIndex, endIndex);
  
  // Calcular el número total de páginas
  const totalPages = Math.ceil(librosFiltrados.length / pageSize);

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
                <select 
                  className="select-estado"
                  value={filtroEstado}
                  onChange={(e) => {
                    setFiltroEstado(e.target.value);
                    setCurrentPage(1); // Resetear a la primera página al filtrar
                  }}
                >
                  <option value="General">Todos</option>
                  <option value="Entregado">Entregado</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
                
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
                {currentBooks.map((libro, index) => (
                  <tr key={index}>
                    <td>{libro.id}</td>
                    <td>{libro.titulo}</td>
                    <td>{libro.estudiante}</td>
                    <td>{libro.fechaPrestamo}</td>
                    <td>{libro.fechaDevolucion}</td>                    
                      <td>{libro.estado}</td>
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

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={setCurrentPage}
              pageSize={pageSize}
              onPageSizeChange={setPageSize}
              totalItems={librosFiltrados.length}
            />
          </div>
        </div>
      </div>
    </div>
  );
}