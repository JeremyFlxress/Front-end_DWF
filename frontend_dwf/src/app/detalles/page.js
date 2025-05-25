'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import apiService from '@/config/apiService';
import '../styles/detalles.css';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prestamoData, setPrestamoData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrestamoDetails = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        const loanId = searchParams.get('id');
        if (!loanId) {
          setError('ID de préstamo no proporcionado');
          return;
        }

        const response = await apiService.loans.getById(loanId);
        
        setPrestamoData({
          id: response.id,
          carnet: response.student.carnet,
          nombre: response.student.fullName,
          codigo: response.book.id,
          titulo: response.book.title,
          email: response.student.email || 'No disponible',
          fechaPrestamo: response.startDate,
          fechaDevolucion: response.returnDate,
          estado: response.state === 'PRESTADO' ? 'Pendiente' :
                 response.state === 'VENCIDO' ? 'Atrasado' :
                 response.state === 'ENTREGADO' ? 'Entregado' : response.state
        });
        
      } catch (error) {
        console.error('Error al cargar detalles del préstamo:', error);
        setError('Error al cargar los datos. Por favor, intente de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPrestamoDetails();
  }, [router, searchParams]);  const handleRenovar = async () => {
    try {
      const loanId = searchParams.get('id');
      if (!loanId) {
        alert('ID de préstamo no encontrado');
        return;
      }

      if (!window.confirm('¿Está seguro que desea renovar este préstamo?')) {
        return;
      }

      const response = await apiService.loans.renew(loanId);
      
      if (response) {
        alert('Préstamo renovado exitosamente');
        // Actualizar los datos directamente con la respuesta de la renovación
        setPrestamoData({
          ...prestamoData,
          fechaDevolucion: response.returnDate,
          estado: response.state === 'PRESTADO' ? 'Pendiente' :
                 response.state === 'VENCIDO' ? 'Atrasado' :
                 response.state === 'ENTREGADO' ? 'Entregado' : response.state
        });
      }
    } catch (error) {
      console.error('Error al renovar préstamo:', error);
      alert(error.message || 'Error al renovar el préstamo. Por favor, intente de nuevo.');
    }
  };

  const handleEliminar = async () => {
    if (prestamoData?.estado === 'Entregado') {
      alert('No se puede eliminar un préstamo ya entregado');
      return;
    }

    if (window.confirm('¿Está seguro de que desea eliminar este préstamo?')) {
      try {
        const loanId = searchParams.get('id');
        if (!loanId) return;

        await apiService.loans.delete(loanId);
        router.push('/librosactivos');
      } catch (error) {
        console.error('Error al eliminar préstamo:', error);
        alert('Error al eliminar el préstamo. Por favor, intente de nuevo.');
      }
    }
  };

  const handleAplicar = () => {
    router.push('/librosactivos');
  };

  const handleCancelar = () => {
    router.push('/librosactivos');
  };

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'Entregado': return 'estado-entregado';
      case 'Pendiente': return 'estado-pendiente';
      case 'Atrasado': return 'estado-atrasado';
      default: return '';
    }
  };

  if (isLoading) return (
    <div className="detalles-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="detalles-content">
          <div>Cargando...</div>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="detalles-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        <div className="detalles-content">
          <div className="error-message">{error}</div>
        </div>
      </div>
    </div>
  );

  if (!prestamoData) return null;

  return (
    <div className="detalles-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="detalles-content">
          <h2 className="section-title">Detalles de Prestamo</h2>
          
          <div className="details-container">
            <div className="prestamo-details">
              <div className="detail-row">
                <span className="detail-label">Carnet Estudiante:</span>
                <span className="detail-value">{prestamoData.carnet}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Nombre Estudiante:</span>
                <span className="detail-value">{prestamoData.nombre}</span>
              </div>

              <div className="detail-row">
                <span className="detail-label">Código Libro:</span>
                <span className="detail-value">{prestamoData.codigo}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Título Libro:</span>
                <span className="detail-value">{prestamoData.titulo}</span>
              </div>
              
              <div className="detail-row">
                <span className="detail-label">Email:</span>
                <span className="detail-value">{prestamoData.email}</span>
              </div>
              
              <div className="detail-row dates-row">
                <div className="date-detail">
                  <span className="detail-label">Fecha Prestamo:</span>
                  <span className="detail-value">{prestamoData.fechaPrestamo}</span>
                </div>
                
                <div className="date-detail">
                  <span className="detail-label">Fecha Devolución:</span>
                  <span className="detail-value">{prestamoData.fechaDevolucion}</span>
                </div>
              </div>
              
              <div className="detail-row status-row">
                <span className="detail-label">Estado:</span>
                <div className="status-badge-container">
                  <span className={`status-badge ${getEstadoClass(prestamoData.estado)}`}>
                    {prestamoData.estado}
                  </span>
                </div>
              </div>

              <div className="action-buttons">
                {prestamoData.estado !== 'Entregado' && (
                  <button 
                    className="renovar-button"
                    onClick={handleRenovar}
                  >
                    Renovar
                  </button>
                )}
                <button 
                  className={`eliminar-button${prestamoData.estado === 'Entregado' ? '-disabled' : ''}`}
                  onClick={handleEliminar}
                  disabled={prestamoData.estado === 'Entregado'}
                  title={prestamoData.estado === 'Entregado' ? "No se puede eliminar un préstamo ya entregado" : ""}
                >
                  Eliminar
                </button>
              </div>
              
              <div className="bottom-buttons">
                <button 
                  className="aplicar-button"
                  onClick={handleAplicar} 
                >
                  Aplicar
                </button>
                <button 
                  className="cancelar-button"
                  onClick={handleCancelar} 
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}