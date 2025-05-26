'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import DashboardCard from '../components/DashboardCard';
import ActivityTable from '../components/ActivityTable';
import Pagination from '../components/Pagination';
import apiService from '@/config/apiService';
import '../styles/pagination.css';

export default function Dashboard() {
  const router = useRouter();
  const [dashboardData, setDashboardData] = useState({
    librosTotal: 0,
    prestamosActivos: 0,
    prestamosAtrasados: 0
  });
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(5);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          router.push('/login');
          return;
        }

        setIsLoading(true);        // Obtener total de libros
        const booksResponse = await apiService.books.getAll({ page: 0, size: 1 });
        const totalBooks = booksResponse.page?.totalElements || 0;

        // Obtener todos los préstamos sin filtrar por estado
        const allLoansResponse = await apiService.loans.getAll({
          page: 0,
          size: 1000
        });

        const allLoans = allLoansResponse._embedded?.bookLoans || [];
        const today = new Date();
        let prestamosActivos = 0;
        let prestamosAtrasados = 0;        // Contar préstamos activos y atrasados del total
        allLoans.forEach(loan => {
          // Solo contar préstamos que no estén ENTREGADOS
          if (loan.state !== 'ENTREGADO') {
            const returnDate = new Date(loan.returnDate);
            if (returnDate < today) {
              prestamosAtrasados++;
            } else {
              prestamosActivos++;
            }
          }
        });

        // Obtener préstamos para la tabla con paginación
        const recentLoansResponse = await apiService.loans.getAll({
          page: currentPage,
          size: pageSize
        });

        const recentLoansData = recentLoansResponse._embedded?.bookLoans || [];
        
        const formattedActivities = recentLoansData.map(loan => {
          const startDate = new Date(loan.startDate);
          const returnDate = new Date(loan.returnDate);
          let estadoActual = loan.state;
            // Actualizar estado visual basado en la fecha si está PRESTADO
          if (loan.state === 'PRESTADO') {
            if (returnDate < today) {
              estadoActual = 'VENCIDO';
            }
          }
          
          const dateOptions = { 
            year: 'numeric', 
            month: '2-digit', 
            day: '2-digit'
          };
          
          return {
            id: loan.id,
            libro: loan.book.title,
            estudiante: loan.student.fullName,
            fechaPrestamo: startDate.toLocaleDateString('es-ES', dateOptions),
            fechaDevolucion: returnDate.toLocaleDateString('es-ES', dateOptions),
            estado: estadoActual
          };
        });

        setDashboardData({
          librosTotal: totalBooks,
          prestamosActivos: prestamosActivos,
          prestamosAtrasados: prestamosAtrasados
        });

        setRecentActivities(formattedActivities);
        setTotalItems(recentLoansResponse.page?.totalElements || 0);

      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        if (error.response?.status === 401) {
          router.push('/login');
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [router, currentPage, pageSize]);

  return (
    <div className="dashboard-container">
      <Sidebar />
      
      <div className="main-content">
        <Header />
        
        <div className="dashboard-content">
          <h2 className="section-title">Panel Principal</h2>
          
          {isLoading ? (
            <div>Cargando...</div>
          ) : (
            <>
              <div className="cards-container">
                <DashboardCard title="Libros Totales" value={dashboardData.librosTotal} />
                <DashboardCard title="Préstamos Pedientes" value={dashboardData.prestamosActivos} />
                <DashboardCard title="Préstamos Atrasados" value={dashboardData.prestamosAtrasados} />
              </div>
              
              <div className="activity-section">
                <h2 className="section-title">Actividad reciente</h2>
                <ActivityTable activities={recentActivities} />
              </div>
              
              <Pagination
                currentPage={currentPage + 1} // Convert to 1-based for display
                totalPages={Math.ceil(totalItems / pageSize)}
                onPageChange={(page) => setCurrentPage(page - 1)} // Convert back to 0-based
                pageSize={pageSize}
                onPageSizeChange={setPageSize}
                totalItems={totalItems}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}