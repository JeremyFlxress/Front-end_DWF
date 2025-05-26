'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import apiService from '@/config/apiService';
import '../styles/nuevo-estudiante.css';

export default function NuevoEstudiante() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    carnet: '',
    fullName: '',
    email: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      // Validaciones
      if (!formData.carnet || !formData.fullName || !formData.email) {
        throw new Error('Todos los campos son requeridos');
      }

      // Validar formato de carnet (puedes ajustar la expresión regular según tus necesidades)
      const carnetRegex = /^[A-Z]+[0-9]{2,}$/;
      if (!carnetRegex.test(formData.carnet)) {
        throw new Error('El carnet debe comenzar con letras mayúsculas seguidas de números');
      }

      // Validar email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        throw new Error('El correo electrónico no es válido');
      }

      // Enviar datos al backend
      await apiService.students.create(formData);
      
      // Mostrar mensaje de éxito y redireccionar
      alert('Estudiante registrado exitosamente');
      router.push('/prestamo'); // Redirigir a la página de préstamos
    } catch (error) {
      setError(error.message || 'Error al registrar el estudiante');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="nuevo-estudiante-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="nuevo-estudiante-content">
          <h2 className="section-title">Registrar Nuevo Estudiante</h2>
          
          <div className="form-container">
            <form onSubmit={handleSubmit} className="nuevo-estudiante-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="carnet">Carnet:</label>
                <input
                  type="text"
                  id="carnet"
                  value={formData.carnet}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    carnet: e.target.value.toUpperCase()
                  }))}
                  placeholder="Ej: ABCD123"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="fullName">Nombre Completo:</label>
                <input
                  type="text"
                  id="fullName"
                  value={formData.fullName}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    fullName: e.target.value
                  }))}
                  placeholder="Nombre completo del estudiante"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Correo Electrónico:</label>
                <input
                  type="email"
                  id="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: e.target.value.toLowerCase()
                  }))}
                  placeholder="correo@ejemplo.com"
                  className="form-control"
                  required
                />
              </div>

              <div className="form-actions">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => router.push('/prestamo')}
                  disabled={isLoading}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isLoading}
                >
                  {isLoading ? 'Registrando...' : 'Registrar Estudiante'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
} 