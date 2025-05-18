'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/nuevo-libro.css';

export default function NuevoLibro() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    codigo: '',
    editorial: '',
    titulo: '',
    autor: '',
    categoria: '',
    cantidad: ''
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
    console.log('Datos del libro:', formData);
    // Aquí iría la lógica para guardar el libro
    router.push('/catalogo');
  };

  const handleCancel = () => {
    router.push('/catalogo');
  };

  return (
    <div className="prestamo-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="nuevo-libro-container">
          <h2 className="section-title">Registro de Libros</h2>
          
          <div className="form-container">
            <h3 className="form-subtitle">Formulario de Registro</h3>
            
            <form onSubmit={handleSubmit} className="nuevo-libro-form">
              <div className="form-group">
                <label htmlFor="codigo">Código</label>
                <input
                  type="text"
                  id="codigo"
                  name="codigo"
                  value={formData.codigo}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="editorial">Editorial</label>
                <input
                  type="text"
                  id="editorial"
                  name="editorial"
                  value={formData.editorial}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="titulo">Título</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={formData.titulo}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="autor">Autor</label>
                <input
                  type="text"
                  id="autor"
                  name="autor"
                  value={formData.autor}
                  onChange={handleChange}
                  className="form-control"
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="categoria">Categoría</label>
                  <input
                    type="text"
                    id="categoria"
                    name="categoria"
                    value={formData.categoria}
                    onChange={handleChange}
                    className="form-control"
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="cantidad">Cantidad</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    value={formData.cantidad}
                    onChange={handleChange}
                    className="form-control"
                    min="0"
                  />
                </div>
              </div>
              
              <div className="form-buttons">
                <button type="submit" className="btn-guardar">
                  Guardar
                </button>
                <button 
                  type="button" 
                  className="btn-cancelar"
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
  );
}