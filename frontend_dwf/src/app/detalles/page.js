'use client';
import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/detalles.css';

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [prestamoData, setPrestamoData] = useState({
    carnet: 'GM240279',
    nombre: 'Juan Ricardo Gamez Malandro',
    codigo: 'NS2925',
    titulo: '1001 noches',
    email: 'juanricar90@gmail.com',
    fechaPrestamo: '10/05/2025',
    fechaDevolucion: '25/05/2025',
    estado: searchParams.get('estado') || 'Pendiente'
  });

  const handleRenovar = () => {
    router.push('/RenovarPrestamo');
  };

  const handleEditar = () => {
    router.push('/RenovarPrestamo');
  };

  const handleEliminar = () => {
    // Aquí iría la lógica para eliminar el préstamo
    router.push('/librosactivos');
  };

  const handleAplicar = () => {
    router.push('/librosactivos');
  };

  const handleCancelar = () => {
    router.push('/librosactivos');
  };

  const puedeEliminar = prestamoData.estado !== 'Entregado';

  const getEstadoClass = (estado) => {
    switch(estado) {
      case 'Entregado': return 'estado-entregado';
      case 'Pendiente': return 'estado-pendiente';
      case 'Atrasado': return 'estado-atrasado';
      default: return '';
    }
  };

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
                  className="editar-button"
                  onClick={handleEditar}
                >
                  Renovar
                </button>
                {puedeEliminar ? (
                  <button 
                    className="eliminar-button"
                    onClick={handleEliminar}
                  >
                    Eliminar
                  </button>
                ) : (
                  <button 
                    className="eliminar-button-disabled"
                    title="No se puede eliminar un préstamo ya entregado"
                    disabled
                  >
                    Eliminar
                  </button>
                )}
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