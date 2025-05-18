'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import '../styles/catalogo.css';

export default function Catalogo() {
  const router = useRouter();
  
  // Sample data - this would come from an API in production
  const librosData = [
    { codigo: 'P24001', titulo: 'Libro 1', autor: 'Autor 1', cantidad: 2, categoria: 'Novela', disponibilidad: 'Disponible' },
    { codigo: 'P24001', titulo: 'Libro 2', autor: 'Autor 2', cantidad: 15, categoria: 'Infantil', disponibilidad: 'Disponible' },
    { codigo: 'P24001', titulo: 'Libro 3', autor: 'Autor 3', cantidad: 24, categoria: 'Novela', disponibilidad: 'Disponible' },
    { codigo: 'P24001', titulo: 'Libro 4', autor: 'Autor 4', cantidad: 23, categoria: 'Clasico', disponibilidad: 'Disponible' },
    { codigo: 'P24001', titulo: 'Libro 5', autor: 'Autor 5', cantidad: 12, categoria: 'Historia', disponibilidad: 'Disponible' },
    { codigo: 'P24001', titulo: 'Libro 6', autor: 'Autor 6', cantidad: 4, categoria: 'Literatura', disponibilidad: 'Disponible' },
    { codigo: 'P24001', titulo: 'Libro 7', autor: 'Autor 7', cantidad: 65, categoria: 'Clasico', disponibilidad: 'Disponible' },
  ];

  const handleNuevoLibro = () => {
    router.push('/nuevo-libro');
  };

  const handleEdit = (codigo) => {
    console.log(`Editar libro con código: ${codigo}`);
  };

  const handleDelete = (codigo) => {
    console.log(`Eliminar libro con código: ${codigo}`);
  };

  return (
    <div className="prestamo-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="catalogo-container">
          <h2 className="section-title">Catalogo de Libros</h2>
          
          <div className="panel-container">
            <div className="search-container">
              <input 
                type="text" 
                placeholder="Buscar libro"
                className="search-input"
              />
              <button 
                className="btn-nuevo-libro"
                onClick={handleNuevoLibro}
              >
                + Nuevo Libro
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
                {librosData.map((libro, index) => (
                  <tr key={index}>
                    <td>{libro.codigo}</td>
                    <td>{libro.titulo}</td>
                    <td>{libro.autor}</td>
                    <td>{libro.cantidad}</td>
                    <td>{libro.categoria}</td>
                    <td>
                      <span className="estado-disponible">
                        {libro.disponibilidad}
                      </span>
                    </td>
                    <td className="acciones">
                      <button 
                        className="btn-editar"
                        onClick={() => handleEdit(libro.codigo)}
                      >
                        ✎
                      </button>
                      <button 
                        className="btn-eliminar"
                        onClick={() => handleDelete(libro.codigo)}
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}