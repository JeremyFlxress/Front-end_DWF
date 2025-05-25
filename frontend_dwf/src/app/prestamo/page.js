'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import apiService from '@/config/apiService';
import '../styles/prestamos.css';

const Select = dynamic(() => import('react-select'), {
  ssr: false,
});

export default function PrestamoForm() {
  const router = useRouter();
  const [students, setStudents] = useState([]);
  const [books, setBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);  // Format date functions
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    // Handle both backend format (dd-MM-yyyy) and ISO format (yyyy-MM-dd)
    const parts = dateStr.includes('-') ? dateStr.split('-') : [];
    if (parts.length !== 3) return '';
    
    // If it's already in yyyy-MM-dd format, return as is
    if (parts[0].length === 4) return dateStr;
    
    // Convert from dd-MM-yyyy to yyyy-MM-dd
    const [day, month, year] = parts;
    return `${year}-${month}-${day}`;
  };

  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return '';
    // Convert from yyyy-MM-dd to dd-MM-yyyy
    const [year, month, day] = dateStr.split('-');
    if (!year || !month || !day) return '';
    return `${day}-${month}-${year}`;
  };  const [formData, setFormData] = useState({
    carnet: '',
    idBook: '',
    returnDate: formatDateForBackend(new Date().toISOString().split('T')[0])
  });

  useEffect(() => {
    const fetchData = async () => {      try {
        // Verificar token
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        setIsLoading(true);
        setError(null);

        // Cargar estudiantes y libros
        console.log('Fetching books and students...');
        const [booksResponse, studentsResponse] = await Promise.all([
          apiService.books.getAll({ page: 0, size: 100 }),
          apiService.students.getAll({ page: 0, size: 100 })
        ]);// Verificar que tenemos datos en las respuestas
        const booksData = booksResponse._embedded?.books || [];
        const studentsData = studentsResponse._embedded?.students || [];

        if (!booksData.length || !studentsData.length) {
          console.error('No se encontraron libros o estudiantes:', { booksResponse, studentsResponse });
          throw new Error('No hay libros o estudiantes disponibles');
        }

        // Transformar datos para React Select
        const booksOptions = booksData
          .filter(book => book.state === 'DISPONIBLE')
          .map(book => ({
            value: book.id,
            label: `${book.title} (Disponible)`
          }));

        const studentsOptions = studentsData.map(student => ({
          value: student.carnet,
          label: `${student.fullName} (${student.carnet})`
        }));

        console.log('Books options:', booksOptions);
        console.log('Students options:', studentsOptions);

        setBooks(booksOptions);
        setStudents(studentsOptions);
        setIsLoading(false);      } catch (error) {
        console.error('Error cargando datos:', error);
        if (error.response?.status === 401) {
          router.push('/login');
          return;
        }
        setError(error.message || 'Error cargando los datos. Por favor intente de nuevo.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [router]);

  const customStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: '38px',
      width: '100%',
      borderRadius: '4px',
      borderColor: '#ced4da',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#80bdff'
      }
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#007bff' : state.isFocused ? '#f8f9fa' : 'white',
      color: state.isSelected ? 'white' : '#212529',
      '&:hover': {
        backgroundColor: state.isSelected ? '#007bff' : '#f8f9fa'
      }
    })
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    try {
      // Basic validations
      if (!formData.carnet || !formData.idBook || !formData.returnDate) {
        setError('Por favor complete todos los campos');
        return;
      }

      // Validate return date format
      const dateFormatRegex = /^\d{2}-\d{2}-\d{4}$/;
      if (!dateFormatRegex.test(formData.returnDate)) {
        setError('El formato de la fecha debe ser dd-MM-yyyy');
        return;
      }

      // Convert dd-MM-yyyy to Date object for validation
      const [day, month, year] = formData.returnDate.split('-').map(Number);
      const returnDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (returnDate < today) {
        setError('La fecha de devolución no puede ser anterior a hoy');
        return;
      }

      // Validate selected book availability
      const selectedBook = books.find(book => book.value === formData.idBook);
      if (!selectedBook) {
        setError('El libro seleccionado no está disponible');
        return;
      }

      // Validate student exists
      const selectedStudent = students.find(student => student.value === formData.carnet);
      if (!selectedStudent) {
        setError('El estudiante seleccionado no es válido');
        return;
      }

      // Format data for submission
const loanData = {
  carnet: formData.carnet,
  idBook: parseInt(formData.idBook, 10),
  returnDate: formData.returnDate
};


      console.log('Sending loan data:', loanData);

      // Create loan
      const response = await apiService.loans.create(loanData);
      console.log('Loan creation response:', response);

      if (response?.id) {
        alert('Préstamo registrado exitosamente');
        router.push('/librosactivos');
      } else {
        throw new Error('La respuesta del servidor no incluye el ID del préstamo');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage = error.response?.data?.message || 
                         error.message || 
                         'Error al procesar el préstamo. Verifique los datos e intente nuevamente.';
      setError(errorMessage);
    }
  };

  if (isLoading) return <div>Cargando...</div>;

  return (
    <div className="prestamo-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="prestamo-content">
          <h2 className="section-title">Registro de Prestamo</h2>
          
          <div className="form-container">
            <form onSubmit={handleSubmit} className="prestamo-form">
              {error && <div className="error-message">{error}</div>}
              
              <div className="form-group">
                <label htmlFor="carnet">Estudiante:</label>
                <Select
                  id="carnet"
                  name="carnet"
                  value={students.find(option => option.value === formData.carnet)}
                  onChange={(selectedOption) => {
                    setFormData(prev => ({
                      ...prev,
                      carnet: selectedOption?.value || ''
                    }));
                  }}
                  options={students}
                  placeholder="Buscar estudiante por nombre o carnet..."
                  isClearable
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={customStyles}
                  noOptionsMessage={({inputValue}) => 
                    inputValue ? "No se encontraron estudiantes" : "Escriba para buscar..."}
                />
              </div>

              <div className="form-group">
                <label htmlFor="idBook">Libro:</label>
                <Select
                  id="idBook"
                  name="idBook"
                  value={books.find(option => option.value === formData.idBook)}
                  onChange={(selectedOption) => {
                    setFormData(prev => ({
                      ...prev,
                      idBook: selectedOption?.value || ''
                    }));
                  }}
                  options={books}
                  placeholder="Buscar libro por título..."
                  isClearable
                  isSearchable
                  className="react-select-container"
                  classNamePrefix="react-select"
                  styles={customStyles}
                  noOptionsMessage={({inputValue}) => 
                    inputValue ? "No se encontraron libros" : "Escriba para buscar..."}
                />
              </div>              <div className="form-group">
                <label htmlFor="returnDate">Fecha de Devolución:</label>                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={formData.returnDate ? formatDateForInput(formData.returnDate) : ''}
                  onChange={(e) => {
                    const backendDate = formatDateForBackend(e.target.value);
                    setFormData(prev => ({
                      ...prev,
                      returnDate: backendDate
                    }));
                  }}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="submit-button">
                  Registrar Préstamo
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}