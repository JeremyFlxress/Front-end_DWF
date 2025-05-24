'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation'; 
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

export default function Page() {
  const router = useRouter();  const [formData, setFormData] = useState({
    carnet: 'GM240279',
    nombre: 'Juan Ricarcdo Gamez Malandro',
    codigo: 'NS2925',
    titulo: '1001 noches',
    email: 'juanricar90@gmail.com',
    fechaPrestamo: '2025-05-10',
    fechaDevolucion: '2025-05-25'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos guardados:', formData);
    router.push('/librosactivos');
  };

  const handleCancel = () => {
    router.push('/librosactivos');
  };

  return (
    <div className="renovar-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="renovar-content">
          <h2 className="section-title">Registro de Prestamo</h2>
          
          <div className="form-container">
            <h3 className="form-title">Formulario de Prestamo</h3>
            
            <div className="form-content">
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label htmlFor="carnet">Carnet de estudiante</label>
                  <input
                    type="text"
                    id="carnet"
                    name="carnet"
                    value={formData.carnet}
                    className="form-control"
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del estudiante</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    className="form-control"
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="codigo">Codigo de libro</label>
                  <div className="search-container">
                    <input
                      type="text"
                      id="codigo"
                      name="codigo"
                      value={formData.codigo}
                      className="form-control"
                      readOnly
                    />
                    <button 
                      type="button" 
                      className="search-button"
                      disabled
                    >
                      Buscar
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="titulo">Título de libro</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    className="form-control"
                    readOnly
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    className="form-control"
                    readOnly
                  />
                </div>
                
                <div className="form-dates">
                  <div className="form-group date-group">                    <label htmlFor="fechaPrestamo">Fecha de Prestamo</label>
                    <input
                      type="date"
                      id="fechaPrestamo"
                      name="fechaPrestamo"
                      value={formData.fechaPrestamo}
                      min={new Date().toISOString().split('T')[0]}
                      onChange={handleChange}
                      className="form-control date-input"
                      readOnly
                    />
                  </div>
                  
                  <div className="form-group date-group">
                    <label htmlFor="fechaDevolucion">Fecha de Devolucion</label>
                    <input
                      type="date"
                      id="fechaDevolucion"
                      name="fechaDevolucion"
                      value={formData.fechaDevolucion}
                      min={formData.fechaPrestamo}
                      onChange={handleChange}
                      className="form-control-edit date-input-edit"
                    />
                  </div>
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="apply-button">
                    Aplicar
                  </button>
                  <button 
                    type="button" 
                    className="cancel-button"
                    onClick={handleCancel} 
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}