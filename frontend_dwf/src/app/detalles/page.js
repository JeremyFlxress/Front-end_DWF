'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/detalles.css';

export default function Page() {
  const router = useRouter();
  
  const prestamoData = {
    carnet: 'GM240279',
    nombre: 'Juan Ricardo Gamez Malandro',
    codigo: 'NS2925',
    titulo: '1001 noches',
    email: 'juanricar90@gmail.com',
    fechaPrestamo: '10/05/2025',
    fechaDevolucion: '25/05/2025',
    estado: 'Entregado'
  };

  const handleRenovar = () => {
    router.push('/RenovarPrestamo');
  };

  const handleAplicar = () => {
    router.push('/librosactivos');
  };

  const handleCancelar = () => {
    router.push('/librosactivos');
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
                  <span className="detail-label">fecha Prestamo:</span>
                  <span className="detail-value">{prestamoData.fechaPrestamo}</span>
                </div>
                
                <div className="date-detail">
                  <span className="detail-label">fecha Devolución:</span>
                  <span className="detail-value">{prestamoData.fechaDevolucion}</span>
                </div>
              </div>
              
              <div className="detail-row status-row">
                <span className="detail-label">Estado:</span>
                <div className="status-badge-container">
                  <span className={`status-badge ${prestamoData.estado.toLowerCase()}`}>
                    {prestamoData.estado}
                  </span>
                </div>
              </div>
              
              <div className="action-buttons">
                <button 
                  className="renovar-button"
                  onClick={handleRenovar}
                >
                  Renovar
                </button>
                <button className="eliminar-button">Eliminar</button>
              </div>
            </div>
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
  );
}