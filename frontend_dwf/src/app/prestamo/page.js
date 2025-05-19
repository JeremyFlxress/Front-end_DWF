'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';


export default function PrestamoForm() {
  const [formData, setFormData] = useState({
    carnet: '',
    nombre: '',
    codigo: '',
    titulo: '',
    email: '',
    fechaPrestamo: '',
    fechaDevolucion: ''
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
    // Aquí iría la lógica para enviar los datos del formulario
    console.log('Datos del formulario:', formData);
  };

  const handleSearch = () => {
    // Aquí iría la lógica para buscar el libro por código
    console.log('Buscando libro con código:', formData.codigo);
  };

  return (
    <div className="prestamo-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="prestamo-content">
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
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del estudiante</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    className="form-control"
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
                      onChange={handleChange}
                      className="form-control"
                    />
                    <button 
                      type="button" 
                      className="search-button"
                      onClick={handleSearch}
                    >
                      Buscar
                    </button>
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="titulo">Titulo de libro</label>
                  <input
                    type="text"
                    id="titulo"
                    name="titulo"
                    value={formData.titulo}
                    onChange={handleChange}
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
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-dates">
                  <div className="form-group date-group">
                    <label htmlFor="fechaPrestamo">Fecha de Prestamo</label>
                    <input
                      type="text"
                      id="fechaPrestamo"
                      name="fechaPrestamo"
                      placeholder="dd/mm/aaaa"
                      value={formData.fechaPrestamo}
                      onChange={handleChange}
                      className="form-control"
                    />
                  </div>
                  
                  <div className="form-group date-group">
                    <label htmlFor="fechaDevolucion">Fecha de Devolucion</label>
                    <input
                      type="text"
                      id="fechaDevolucion"
                      name="fechaDevolucion"
                      placeholder="dd/mm/aaaa"
                      value={formData.fechaDevolucion}
                      onChange={handleChange}
                      className="form-control-cant"
                    />
                  </div>
                </div>
                
                <div className="form-buttons">
                  <button type="submit" className="submit-button">
                    Registrar prestamo
                  </button>
                  <button type="button" className="cancel-button">
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