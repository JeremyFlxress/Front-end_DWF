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
  const [error, setError] = useState(null);

  // Format date functions
  const formatDateForInput = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      // Expected format is dd-MM-yyyy
      const parts = dateStr.split('-');
      if (parts.length !== 3) return '';
      
      const [day, month, year] = parts.map(Number);
      
      // Validate parts
      if (!day || !month || !year) return '';
      if (day < 1 || day > 31) return '';
      if (month < 1 || month > 12) return '';
      if (year < 2000 || year > 2100) return '';
      
      // Convert to yyyy-MM-dd for input type="date"
      return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    } catch (error) {
      console.error('Error al formatear fecha para input:', error);
      return '';
    }
  };

  const formatDateForBackend = (dateStr) => {
    if (!dateStr) return '';
    
    try {
      // Input format is yyyy-MM-dd, convert to dd-MM-yyyy
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        console.error('Fecha inválida:', dateStr);
        return '';
      }
      
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      
      return `${day}-${month}-${year}`;
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return '';
    }
  };

  // Inicializar con la fecha actual en formato dd-MM-yyyy
  const today = new Date();
  const initialReturnDate = [
    String(today.getDate()).padStart(2, '0'),
    String(today.getMonth() + 1).padStart(2, '0'),
    today.getFullYear()
  ].join('-');

  const [formData, setFormData] = useState({
    carnet: '',
    idBook: '',
    returnDate: initialReturnDate
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
      // 1. Validaciones básicas
      if (!formData.carnet || !formData.idBook || !formData.returnDate) {
        throw new Error('Por favor complete todos los campos');
      }

      // 2. Validar estudiante
      const selectedStudent = students.find(student => student.value === formData.carnet);
      if (!selectedStudent) {
        throw new Error('El estudiante seleccionado no es válido');
      }

      // 3. Validar libro
      const bookId = parseInt(formData.idBook, 10);
      if (isNaN(bookId)) {
        throw new Error('El ID del libro debe ser un número válido');
      }
      const selectedBook = books.find(book => book.value === bookId);
      if (!selectedBook) {
        throw new Error('El libro seleccionado no es válido');
      }

      // 4. Validar y formatear fecha
      if (!formData.returnDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
        throw new Error('El formato de fecha debe ser dd-MM-yyyy');
      }

      const [day, month, year] = formData.returnDate.split('-').map(Number);
      const returnDate = new Date(year, month - 1, day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (isNaN(returnDate.getTime())) {
        throw new Error('La fecha proporcionada no es válida');
      }
      
      if (returnDate < today) {
        throw new Error('La fecha de devolución no puede ser anterior a hoy');
      }

      // 5. Preparar datos para el envío
      const loanData = {
        carnet: formData.carnet.trim(),
        idBook: bookId,
        returnDate: formData.returnDate
      };
      
      // Log para depuración
      console.log('Datos a enviar:', {
        carnet: typeof loanData.carnet + ': ' + loanData.carnet,
        idBook: typeof loanData.idBook + ': ' + loanData.idBook,
        returnDate: typeof loanData.returnDate + ': ' + loanData.returnDate,
        rawData: loanData
      });

      // 6. Crear préstamo
      const response = await apiService.loans.create(loanData);
      
      if (response?.id) {
        alert('Préstamo registrado exitosamente');
        router.push('/librosactivos');
      } else {
        throw new Error('No se pudo completar el registro del préstamo');
      }
    } catch (error) {
      console.error('Error en el registro del préstamo:', error);
      setError(error.message || 'Error al procesar el préstamo. Por favor verifique los datos e intente nuevamente.');
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
                <label htmlFor="returnDate">Fecha de Devolución:</label>
                <input
                  type="date"
                  id="returnDate"
                  name="returnDate"
                  value={formatDateForInput(formData.returnDate)}
                  onChange={(e) => {
                    const inputDate = e.target.value; // format: yyyy-MM-dd
                    if (!inputDate) return;

                    // Convert to backend format (dd-MM-yyyy)
                    const date = new Date(inputDate);
                    const day = String(date.getDate()).padStart(2, '0');
                    const month = String(date.getMonth() + 1).padStart(2, '0');
                    const year = date.getFullYear();
                    const backendDate = `${day}-${month}-${year}`;

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