'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import apiService from '@/config/apiService';
import '../styles/nuevo-libro.css';

export default function EditarLibro() {
  const router = useRouter();
  const [libro, setLibro] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchLibro = async () => {
      try {
        const searchParams = new URLSearchParams(window.location.search);
        const id = searchParams.get('id');
        
        if (!id) {
          router.push('/catalogo');
          return;
        }

        const response = await apiService.books.getById(id);
        setLibro(response);
      } catch (error) {
        console.error('Error al cargar libro:', error);
        setError('Error al cargar los datos del libro');
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchLibro();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSaving(true);
      setError(null);

      // Only update stock, but send all required fields
      const updateData = {
        title: libro.title,
        stock: parseInt(libro.stock, 10),
        publishedDate: libro.publishedDate,
        state: libro.state,
        idCategory: libro.category?.id,
        idEditorial: libro.editorial?.id,
        idAuthors: libro.authors?.map(author => author.id) || []
      };

      await apiService.books.update(libro.id, updateData);
      router.push('/catalogo');
    } catch (error) {
      console.error('Error al actualizar libro:', error);
      setError('Error al actualizar el libro. Por favor, intente de nuevo.');
    } finally {
      setIsSaving(false);
    }
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
          <h2 className="section-title">Editar Libro</h2>
          
          <div className="form-container">
            {error && <div className="error-message">{error}</div>}
            
            {isLoading ? (
              <div className="loading">Cargando...</div>
            ) : libro ? (
              <form onSubmit={handleSubmit} className="nuevo-libro-form">
                <div className="form-group">
                  <label htmlFor="id">Código</label>
                  <input
                    type="text"
                    id="id"
                    value={libro.id}
                    className="form-control"
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="title">Título</label>
                  <input
                    type="text"
                    id="title"
                    value={libro.title}
                    className="form-control"
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="authors">Autores</label>
                  <input
                    type="text"
                    id="authors"
                    value={libro.authors?.map(author => author.nameAuthor || author.name).join(', ') || 'No hay autores'}
                    className="form-control"
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Categoría</label>
                  <input
                    type="text"
                    id="category"
                    value={libro.category ? (libro.category.nameCategory || libro.category.name) : 'Sin categoría'}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="editorial">Editorial</label>
                  <input
                    type="text"
                    id="editorial"
                    value={libro.editorial ? (libro.editorial.nameEditorial || libro.editorial.name) : 'Sin editorial'}
                    className="form-control"
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="publishedDate">Año de Publicación</label>
                  <input
                    type="number"
                    id="publishedDate"
                    value={libro.publishedDate}
                    className="form-control"
                    disabled
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="state">Estado</label>
                  <input
                    type="text"
                    id="state"
                    value={libro.state === 'DISPONIBLE' ? 'Disponible' : 'No Disponible'}
                    className="form-control"
                    disabled
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="stock">Stock <span className="required">*</span></label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={libro.stock}
                    onChange={(e) => setLibro({ ...libro, stock: e.target.value })}
                    className="form-control"
                    min="0"
                    required
                  />
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-guardar"
                    disabled={isSaving}
                  >
                    {isSaving ? 'Guardando...' : 'Guardar'}
                  </button>
                  <button 
                    type="button" 
                    className="btn-cancel"
                    onClick={handleCancel}
                    disabled={isSaving}
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            ) : (
              <div className="error-message">No se encontró el libro</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}