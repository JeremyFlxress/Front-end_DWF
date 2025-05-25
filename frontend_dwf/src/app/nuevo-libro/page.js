'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import apiService from '@/config/apiService';
import '../styles/nuevo-libro.css';

const Select = dynamic(() => import('react-select'), {
  ssr: false,
});

export default function NuevoLibro() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    stock: '',
    publishedDate: new Date().getFullYear().toString(),
    state: 'DISPONIBLE',
    idCategory: '',
    idEditorial: '',
    idAuthors: []
  });

  const [categories, setCategories] = useState([]);
  const [editorials, setEditorials] = useState([]);
  const [authors, setAuthors] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        setIsLoading(true);
        setError(null);

        // Fetch categories, editorials and authors in parallel
        const [categoriesRes, editorialsRes, authorsRes] = await Promise.all([
          apiService.categories.getAll(),
          apiService.editorials.getAll(),
          apiService.authors.getAll()
        ]);

        setCategories(categoriesRes._embedded?.categories || []);
        setEditorials(editorialsRes._embedded?.editorials || []);
        setAuthors(authorsRes._embedded?.authors || []);

      } catch (error) {
        console.error('Error cargando datos:', error);
        setError('Error cargando datos necesarios. Por favor, intente de nuevo.');
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Validate required fields
      if (!formData.title || !formData.stock || !formData.publishedDate || !formData.idCategory || !formData.idEditorial || formData.idAuthors.length === 0) {
        setError('Por favor complete todos los campos obligatorios');
        return;
      }

      // Validate publishedDate range
      const publishedYear = parseInt(formData.publishedDate, 10);
      if (publishedYear < 1800 || publishedYear > new Date().getFullYear()) {
        setError('El año de publicación debe estar entre 1800 y el año actual');
        return;
      }

      // Convert stock and publishedDate to numbers
      const bookData = {
        ...formData,
        stock: parseInt(formData.stock, 10),
        publishedDate: publishedYear
      };

      // Create book
      await apiService.books.create(bookData);
      
      // Show success message and redirect
      alert('Libro creado exitosamente');
      router.push('/catalogo');
      
    } catch (error) {
      console.error('Error al crear libro:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear el libro. Por favor, intente de nuevo.';
      setError(errorMessage);
    }
  };

  if (isLoading) {
    return (
      <div className="prestamo-container">
        <Sidebar />
        <div className="main-content">
          <Header />
          <div className="loading">Cargando...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="prestamo-container">
      <Sidebar />
      <div className="main-content">
        <Header />
        
        <div className="nuevo-libro-container">
          <h2 className="section-title">Nuevo Libro</h2>
          
          <div className="form-container">
            <form onSubmit={handleSubmit} className="nuevo-libro-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="title">Título: <span className="required">*</span></label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    title: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="stock">Stock: <span className="required">*</span></label>
                <input
                  type="number"
                  id="stock"
                  name="stock"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    stock: e.target.value
                  }))}
                  required
                />
              </div>              <div className="form-group">
                <label htmlFor="publishedDate">Año de Publicación: <span className="required">*</span></label>
                <input
                  type="number"
                  id="publishedDate"
                  name="publishedDate"
                  min="1800"
                  max={new Date().getFullYear()}
                  value={formData.publishedDate}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    publishedDate: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="idCategory">Categoría: <span className="required">*</span></label>
                <Select
                  id="idCategory"
                  name="idCategory"
                  value={categories.find(cat => cat.id === formData.idCategory)
                    ? { value: formData.idCategory, label: categories.find(cat => cat.id === formData.idCategory).name }
                    : null}
                  onChange={(selected) => setFormData(prev => ({
                    ...prev,
                    idCategory: selected?.value
                  }))}
                  options={categories.map(cat => ({
                    value: cat.id,
                    label: cat.name
                  }))}
                  placeholder="Seleccione una categoría"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="idEditorial">Editorial: <span className="required">*</span></label>
                <Select
                  id="idEditorial"
                  name="idEditorial"
                  value={editorials.find(ed => ed.id === formData.idEditorial)
                    ? { value: formData.idEditorial, label: editorials.find(ed => ed.id === formData.idEditorial).name }
                    : null}
                  onChange={(selected) => setFormData(prev => ({
                    ...prev,
                    idEditorial: selected?.value
                  }))}
                  options={editorials.map(ed => ({
                    value: ed.id,
                    label: ed.name
                  }))}
                  placeholder="Seleccione una editorial"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="idAuthors">Autores: <span className="required">*</span></label>
                <Select
                  isMulti
                  id="idAuthors"
                  name="idAuthors"
                  value={formData.idAuthors.map(authorId => {
                    const author = authors.find(a => a.id === authorId);
                    return author ? { value: author.id, label: author.name } : null;
                  })}
                  onChange={(selected) => setFormData(prev => ({
                    ...prev,
                    idAuthors: selected ? selected.map(option => option.value) : []
                  }))}
                  options={authors.map(author => ({
                    value: author.id,
                    label: author.name
                  }))}
                  placeholder="Seleccione uno o más autores"
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  Crear Libro
                </button>
                <button 
                  type="button" 
                  className="btn-cancel"
                  onClick={() => router.push('/catalogo')}
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