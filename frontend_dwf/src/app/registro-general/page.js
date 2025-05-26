'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import Pagination from '../components/Pagination';
import apiService from '@/config/apiService';
import '../styles/registroGeneral.css';
import '../styles/pagination.css';

export default function RegistroGeneral() {
  const router = useRouter();
  const [busqueda, setBusqueda] = useState('');
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);
  const [registros, setRegistros] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRegistros = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPage,
        size: pageSize,
        state: ['ENTREGADO'] // Solo mostrar libros entregados
      };

      const response = await apiService.loans.getAll(params);
      const loansData = response._embedded?.bookLoans || [];
        const registrosFormateados = loansData.map(loan => ({
        id: loan.id,
        libro: loan.book.title,
        estudiante: loan.student.fullName,
        fechaPrestamo: loan.startDate,
        fechaDevolucion: loan.returnDate,
        estado: 'Entregado'
      }));

      setRegistros(registrosFormateados);
      setTotalItems(response.page.totalElements || 0);

    } catch (error) {
      console.error('Error al cargar registros:', error);
      setError('Error al cargar los datos: ' + (error.message || 'Por favor, intente de nuevo.'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistros();
  }, [currentPage, pageSize]);
  const handleSearch= (e) => {
    setBusqueda(e.target.value);
  };

  const handleExportar = () => {
    // TODO: Implementar exportación
    console.log('Exportando datos...');
  };

  // Filtrar registros según búsqueda
  const registrosFiltrados = busqueda 
    ? registros.filter(registro => 
        registro.libro.toLowerCase().includes(busqueda.toLowerCase()) || 
        registro.estudiante.toLowerCase().includes(busqueda.toLowerCase()) ||
        registro.id.toString().includes(busqueda.toLowerCase())
      )
    : registros;

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="app-container">
      <Sidebar />
      
      <div className="content-wrapper">
        <Header />
        
        <div className="registro-general-container">
          <h2 className="section-title">Registro general</h2>
          
          <div className="panel-container">
            <div className="filtros-container">
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Buscar por libro, estudiante o ID..."
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

            {error && (
              <div className="error-message" style={{ color: 'red', padding: '10px', margin: '10px 0' }}>
                {error}
              </div>
            )}
            
            <div className="table-container">
              <table className="tabla-registro">
                <thead>
                  <tr>                    <th>ID Prestamo</th>
                    <th>Libro</th>
                    <th>Estudiante</th>
                    <th>Fecha Préstamo</th>
                    <th>Fecha Devolución</th>
                    <th>Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {registrosFiltrados.map((registro) => (
                    <tr key={registro.id}>
                      <td>{registro.id}</td>
                      <td>{registro.libro}</td>
                      <td>{registro.estudiante}</td>
                      <td>{registro.fechaPrestamo}</td>                      <td>{registro.fechaDevolucion}</td>
                      <td>{registro.estado}</td>
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