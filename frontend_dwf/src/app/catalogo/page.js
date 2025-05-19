'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/catalogo.css';

export default function Catalogo() {
  const router = useRouter();
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  
  // Datos de ejemplo
  const [librosData, setLibrosData] = useState([
    { codigo: 'AEP4001', titulo: 'Alicia en el país de las maravillas', autor: 'Autor 1', cantidad: 15, categoria: 'Ciencia Ficcion', disponibilidad: 'Disponible' },
    { codigo: 'P24002', titulo: 'Libro 2', autor: 'Autor 2', cantidad: 15, categoria: 'Infantil', disponibilidad: 'No Disponible' },
    { codigo: 'P24003', titulo: 'Libro 3', autor: 'Autor 3', cantidad: 24, categoria: 'Novela', disponibilidad: 'Disponible' },
  ]);

  const handleNuevoLibro = () => {
    router.push('/nuevo-libro');
  };

  const handleEdit = (codigo) => {
    router.push('/editar-libro');
  };

  const handleChangeStatus = (libro) => {
    setSelectedBook(libro);
    setShowConfirmDialog(true);
  };

  const confirmStatusChange = () => {
    if (selectedBook) {
      setLibrosData(librosData.map(libro => 
        libro.codigo === selectedBook.codigo
          ? { 
              ...libro, 
              disponibilidad: libro.disponibilidad === 'Disponible' ? 'No Disponible' : 'Disponible'
            }
          : libro
      ));
    }
    setShowConfirmDialog(false);
    setSelectedBook(null);
  };

  return (
    <div className="prestamo-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="catalogo-container">
          <h2 className="section-title">Catálogo de Libros</h2>
          
          <div className="panel-container">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Buscar libro"
                className="search-input"
              />              <button 
                className="btn-nuevo-libro"
                onClick={handleNuevoLibro}
              >
                <span className="plus-icon">+</span> Nuevo Libro
              </button>
            </div>
            
            <table className="tabla-catalogo">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Título</th>
                  <th>Autor</th>
                  <th>Cantidad</th>
                  <th>Categoría</th>
                  <th>Disponibilidad</th>
                  <th>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {librosData.map((libro) => (
                  <tr key={libro.codigo}>
                    <td>{libro.codigo}</td>
                    <td>{libro.titulo}</td>
                    <td>{libro.autor}</td>
                    <td>{libro.cantidad}</td>
                    <td>{libro.categoria}</td>
                    <td>
                      <span className={`estado-${libro.disponibilidad.toLowerCase().replace(' ', '-')}`}>
                        {libro.disponibilidad}
                      </span>
                    </td>
                    <td className="acciones">
                      <button 
                        className="btn-editar"
                        onClick={() => handleEdit(libro.codigo)}
                        title="Editar cantidad"
                      >
                        ✎
                      </button>
                      <button 
                        className={`btn-toggle-status ${libro.disponibilidad === 'Disponible' ? 'disponible' : 'no-disponible'}`}
                        onClick={() => handleChangeStatus(libro)}
                        title={`Cambiar a ${libro.disponibilidad === 'Disponible' ? 'No Disponible' : 'Disponible'}`}
                      >
                        {libro.disponibilidad === 'Disponible' ? '✓' : '×'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Diálogo de confirmación */}
        {showConfirmDialog && (
          <div className="dialog-overlay">
            <div className="dialog-content">
              <div className="dialog-header">
                <h3>Confirmar cambio de estado</h3>
              </div>
              <div className="dialog-body">
                <p>
                  ¿Está seguro que quiere cambiar el estado del libro &quot;{selectedBook?.titulo}&quot; a 
                  {selectedBook?.disponibilidad === 'Disponible' ? ' No Disponible' : ' Disponible'}?
                </p>
              </div>
              <div className="dialog-buttons">
                <button 
                  className="btn-confirmar"
                  onClick={confirmStatusChange}
                >
                  Aceptar
                </button>
                <button 
                  className="btn-cancelar"
                  onClick={() => {
                    setShowConfirmDialog(false);
                    setSelectedBook(null);
                  }}
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}