'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/nuevo-libro.css'; // Reutilizamos los estilos del formulario

export default function EditarLibro() {
  const router = useRouter();
  const [libro, setLibro] = useState({
    codigo: '',
    titulo: '',
    autor: '',
    categoria: '',
    cantidad: ''
  });

  // En un caso real, aquí obtendríamos los datos del libro de la API
  // Por ahora usamos datos de ejemplo
  useEffect(() => {
    // Simulamos obtener los datos del libro
    const libroData = {
      codigo: 'AEP4001',
      titulo: 'Alicia en el país de las maravillas',
      autor: 'Autor 1',
      categoria: 'Ciencia Ficcion',
      cantidad: '15'
    };
    setLibro(libroData);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setLibro({
      ...libro,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Datos actualizados:', libro);
    // Aquí iría la llamada a la API para actualizar
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
                  value={libro.codigo}
                  className="form-control"
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="titulo">Título</label>
                <input
                  type="text"
                  id="titulo"
                  name="titulo"
                  value={libro.titulo}
                  className="form-control"
                  disabled
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="autor">Autor</label>
                <input
                  type="text"
                  id="autor"
                  name="autor"
                  value={libro.autor}
                  className="form-control"
                  disabled
                />
              </div>
              
              <div className="form-row">
                <div className="form-group half">
                  <label htmlFor="categoria">Categoría</label>
                  <input
                    type="text"
                    id="categoria"
                    name="categoria"
                    value={libro.categoria}
                    className="form-control"
                    disabled
                  />
                </div>
                
                <div className="form-group half">
                  <label htmlFor="cantidad">Cantidad</label>
                  <input
                    type="number"
                    id="cantidad"
                    name="cantidad"
                    value={libro.cantidad}
                    onChange={handleChange}
                    className="form-control-cant"
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