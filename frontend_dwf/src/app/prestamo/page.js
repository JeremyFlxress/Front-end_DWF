'use client';
import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

const Select = dynamic(() => import('react-select'), {
  ssr: false,
});

const studentOptions = [
  { value: 'FP24001', label: 'FP24001', nombre: 'Juan Pérez', email: 'juan@ejemplo.com' },
  { value: 'EST002', label: 'EST002', nombre: 'María García', email: 'maria@ejemplo.com' },
  { value: 'EST003', label: 'EST003', nombre: 'Carlos López', email: 'carlos@ejemplo.com' },
];

const bookOptions = [
  { value: '1', label: 'Don Quijote de la Mancha' },
  { value: '2', label: 'Cien años de soledad' },
  { value: '3', label: 'El principito' },
];

export default function PrestamoForm() {
  const [formData, setFormData] = useState({
    carnet: '',
    nombre: '',
    email: '',
    titulo: '',
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

  const handleStudentSelect = (selectedOption) => {
    setFormData({
      ...formData,
      carnet: selectedOption?.value || '',
      nombre: selectedOption?.nombre || '',
      email: selectedOption?.email || ''
    });
  };

  const handleBookSelect = (selectedOption) => {
    setFormData({
      ...formData,
      titulo: selectedOption?.label || ''
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos del formulario:', formData);
  };

  const filterStudents = (inputValue) => {
    return studentOptions.filter(student =>
      student.label.toLowerCase().includes(inputValue.toLowerCase())
    );
  };

  const filterOption = (option, inputValue) => {
    if (!inputValue) return false; // No mostrar opciones si no hay input
    return option.label.toLowerCase().includes(inputValue.toLowerCase());
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
                  <Select
                    id="carnet"
                    options={studentOptions}
                    onChange={handleStudentSelect}
                    placeholder="Buscar por carnet..."
                    noOptionsMessage={({inputValue}) => 
                      !inputValue ? "Escribe para buscar..." : "No hay coincidencias"
                    }
                    filterOption={filterOption}
                    isClearable
                    isSearchable
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="nombre">Nombre del estudiante</label>
                  <input
                    type="text"
                    id="nombre"
                    name="nombre"
                    value={formData.nombre}
                    readOnly
                    className="form-control"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    readOnly
                    className="form-control"
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="titulo">Título de libro</label>
                  <Select
                    id="titulo"
                    options={bookOptions}
                    onChange={handleBookSelect}
                    placeholder="Buscar libro..."
                    noOptionsMessage={({inputValue}) => 
                      !inputValue ? "Escribe para buscar..." : "No hay coincidencias"
                    }
                    filterOption={filterOption}
                    isClearable
                    isSearchable
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